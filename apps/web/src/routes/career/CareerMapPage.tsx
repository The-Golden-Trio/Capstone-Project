import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  eventsForRole,
  findRole,
  findScenario,
  shortRoleName,
} from '@datn/game-core';
import { profileApi } from '../../api/endpoints';
import type { RoleProgress } from '../../api/schemas';
import { RoleTheme } from '../../components/game/RoleTheme';
import { Note } from '../../components/ui/Note';
import { useT } from '../../i18n/useT';
import { useJourneyStore } from '../../store/journeyStore';
import { useProfileStore } from '../../store/profileStore';
import { IslandsView } from './IslandsView';
import { LevelPanel } from './LevelPanel';
import { PaperMap } from './PaperMap';
import { QuestBox } from './QuestBox';
import {
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_OVERVIEW,
  clampZoom,
  type Anchor,
} from './mapGeometry';

/** Ba cảnh của màn này. */
type Stage = 'sea' | 'sailing' | 'paper';

/** Thời gian con tàu cập bờ trước khi mở bản đồ giấy. */
const SAILING_MS = 1400;

/**
 * Hành trình trong một nghề.
 *
 * Ba lớp, mỗi lớp một chất liệu khác nhau để người chơi biết mình vừa đi vào
 * đâu: mặt biển có các hòn đảo (mỗi đảo là một cấp bậc), rồi cảnh phóng vào
 * đảo, rồi tờ bản đồ giấy của chính hòn đảo đó với các địa điểm nhận nhiệm vụ.
 *
 * Quãng nghỉ giữa "phóng vào" và "mở bản đồ" là cố ý: đổi bối cảnh đột ngột
 * thì người chơi mất dấu, còn có nhịp chờ thì hiểu ngay mình vừa cập bến một
 * hòn đảo cụ thể.
 */
export function CareerMapPage() {
  const { roleCode = '', band: openBand = null } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const setLocation = useJourneyStore((s) => s.setLocation);
  const doneEventIds = useProfileStore((s) => s.doneEventIds);

  const [progress, setProgress] = useState<RoleProgress | null>(null);
  // Vào thẳng bằng đường dẫn thì hòn đảo trong URL cũng là hòn đang chọn.
  const [selectedBand, setSelectedBand] = useState<string | null>(openBand);
  const [stage, setStage] = useState<Stage>('sea');
  /** Ký hiệu đang mở, kèm chỗ đứng của nó để neo hộp câu hỏi bên cạnh. */
  const [openMark, setOpenMark] = useState<{ id: string; anchor: Anchor } | null>(
    null,
  );
  const [panelOpen, setPanelOpen] = useState(true);
  const [zoom, setZoom] = useState(ZOOM_OVERVIEW);
  const [error, setError] = useState<string | null>(null);

  const firstLoad = useRef(true);
  const role = findRole(roleCode);

  useEffect(() => {
    if (!role) return;
    let alive = true;
    profileApi
      .role(role.role_code)
      .then((next) => {
        if (!alive) return;
        setProgress(next);
        const current =
          next.bands.find((b) => b.unlocked && !b.completed) ?? next.bands[0];
        setSelectedBand((prev) => prev ?? current?.band ?? null);
        if (current) setLocation(role.role_code, current.band);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Không tải được bản đồ'),
      );
    return () => {
      alive = false;
    };
  }, [role, setLocation]);

  /**
   * Cảnh nào đang diễn là do đường dẫn quyết định.
   *
   * Hòn đảo đang mở nằm ngay trong URL (`/jobs/BACKEND/L1`) nên nút lùi của
   * trình duyệt, việc tải lại trang và việc gửi đường dẫn cho người khác đều
   * đúng — trước đây mở đảo nào chỉ có state trong trang biết.
   *
   * Vào thẳng bằng đường dẫn thì mở luôn bản đồ: nhịp chờ cập bến chỉ có
   * nghĩa khi người chơi vừa thấy hòn đảo ấy ngoài biển.
   */
  useEffect(() => {
    setOpenMark(null);

    if (!openBand) {
      setStage('sea');
      setZoom(ZOOM_OVERVIEW);
      return;
    }

    if (firstLoad.current) {
      setStage('paper');
      return;
    }

    setStage('sailing');
    const id = window.setTimeout(() => setStage('paper'), SAILING_MS);
    return () => window.clearTimeout(id);
  }, [openBand]);

  useEffect(() => {
    firstLoad.current = false;
  }, []);

  const bands = useMemo(() => progress?.bands ?? [], [progress]);
  const islandPath = (band: string) => `/jobs/${roleCode}/${band}`;
  const currentBand = bands.find((b) => b.unlocked && !b.completed)?.band ?? null;
  const selected = bands.find((b) => b.band === selectedBand) ?? null;
  const opened = bands.find((b) => b.band === openBand) ?? null;

  /** Các nhiệm vụ của hòn đảo đang mở. */
  const points = useMemo(() => {
    if (!role || !openBand) return [];
    const entry = findScenario(role.role_code, openBand);
    const main = entry
      ? [
          {
            id: `scenario:${entry.key}`,
            label: entry.scenario.scenario_title,
            kind: 'main' as const,
            done: bands.find((b) => b.band === openBand)?.completed ?? false,
          },
        ]
      : [];
    const sides = eventsForRole(role).map((event) => ({
      id: `event:${event.event_id}`,
      label: event.title,
      kind: 'side' as const,
      done: doneEventIds.includes(event.event_id),
    }));
    return [...main, ...sides];
  }, [role, openBand, bands, doneEventIds]);

  if (!role) return <Navigate to="/jobs" replace />;
  // Gõ thẳng đường dẫn không được đi vòng qua cửa ghi danh: cấp bậc không có
  // hoặc chưa ghi danh thì trả về mặt biển, nơi có bảng thông tin và nút vào
  // học. (Máy chủ vẫn chặn độc lập; đây chỉ là cho khỏi lạc.)
  if (progress && openBand && !opened?.enrolled) {
    return <Navigate to={`/jobs/${roleCode}`} replace />;
  }

  const pickIsland = (band: string) => {
    setSelectedBand(band);
    setPanelOpen(true);
    const target = bands.find((b) => b.band === band);
    if (target?.enrolled) navigate(islandPath(band));
  };

  const backToSea = () => navigate(`/jobs/${roleCode}`);

  return (
    <RoleTheme roleCode={role.role_code} className="absolute inset-0 overflow-hidden">
      {/* ── Mặt biển ── */}
      <div className={stage === 'paper' ? 'stage-dimmed' : 'stage-shown'}>
        <IslandsView
          roleCode={role.role_code}
          bands={bands}
          selectedBand={selectedBand}
          currentBand={currentBand}
          zoomingBand={stage === 'sailing' ? openBand : null}
          zoom={zoom}
          onPickIsland={pickIsland}
        />
      </div>

      {/* ── Bản đồ giấy của hòn đảo ── */}
      {stage === 'paper' && opened && (
        <div className="paper-stage">
          <PaperMap
            roleCode={role.role_code}
            band={opened.band}
            bandLabel={opened.label}
            points={points}
            openId={openMark?.id ?? null}
            onPick={(id, anchor) => setOpenMark({ id, anchor })}
          />

          {openMark && (
            <QuestBox
              key={openMark.id}
              roleCode={role.role_code}
              band={opened.band}
              markId={openMark.id}
              anchor={openMark.anchor}
              onClose={() => setOpenMark(null)}
            />
          )}
        </div>
      )}

      {/* ── Thanh nổi ── */}
      <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/jobs')}
          className="map-chip"
        >
          <span aria-hidden="true">←</span> {t('nav.backToMap')}
        </button>

        <span className="map-chip is-plain font-display font-semibold">
          {shortRoleName(role)}
        </span>

        {stage !== 'sea' && (
          <button type="button" onClick={backToSea} className="map-chip is-accent">
            <span role="img" aria-label="Mỏ neo">
              ⚓
            </span>{' '}
            Ra khơi lại
          </button>
        )}
      </div>

      {error && (
        <div className="absolute left-4 top-16 z-20 w-[min(380px,calc(100%-32px))]">
          <Note tone="warn">{error}</Note>
        </div>
      )}

      {/* Nút phóng chỉ có nghĩa ở mặt biển; trên giấy thì tờ bản đồ vừa khung. */}
      {stage === 'sea' && (
        <div className="map-zoom">
          <button
            type="button"
            onClick={() => setZoom((z) => clampZoom(z * 1.3))}
            disabled={zoom >= ZOOM_MAX}
            aria-label="Phóng to"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => clampZoom(z / 1.3))}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Thu nhỏ"
          >
            −
          </button>
        </div>
      )}

      {/* ── Bảng thông tin cấp bậc, chỉ ở mặt biển ── */}
      {stage === 'sea' && selected && progress && panelOpen && (
        <div className="map-overlay right-4 top-4">
          <LevelPanel
            role={role}
            band={selected}
            progress={progress}
            onEnrolled={(next) => {
              setProgress(next);
              navigate(islandPath(selected.band));
            }}
            onClose={() => setPanelOpen(false)}
          />
        </div>
      )}

      {stage === 'sea' && selected && !panelOpen && (
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="map-chip absolute right-4 top-4 z-20"
        >
          Xem thông tin {selected.band}
        </button>
      )}
    </RoleTheme>
  );
}
