/**
 * Bản đồ ngân hà — route `/jobs`.
 *
 * Trang này ghép ba thứ: cảnh 3D (`GalaxyCanvas`), lớp HUD HTML đè lên, và
 * luật mở khoá (`unlock.ts`). Mọi phép tính "bay được không" làm ở đây một
 * lần rồi phát xuống cho cả cảnh lẫn HUD, để hai bên không bao giờ nói khác nhau.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useContentStore } from '../store/contentStore';
import { useProgressStore } from '../store/progressStore';
import { GalaxyCanvas } from './scene/GalaxyCanvas';
import {
  galaxyData,
  edgeBetween,
  findPlanet,
  neighborsOf,
  shortPlanetName,
  shortestPath,
} from './galaxy';
import { FLIGHT_MS, useGalaxyStore, useGalaxyUiStore } from './galaxyStore';
import { computeUnlock, ownedSkillSet, type UnlockState } from './unlock';
import { CockpitHud } from './ui/CockpitHud';
import { EntryTest } from './ui/EntryTest';
import { GalaxyLegend } from './ui/GalaxyLegend';
import { NearbyDock } from './ui/NearbyDock';
import { PlanetPanel } from './ui/PlanetPanel';

const TOAST_MS = 3600;

/**
 * Cổng chờ dữ liệu ngân hà.
 *
 * 100 KB toạ độ hành tinh nay nằm trong database và tải riêng — chỉ trang này
 * cần chúng, nên không bắt mọi màn khác trả giá. `GalaxyScene` bên dưới đọc
 * `galaxyData()` ngay từ dòng đầu, nên phải chắc chắn dữ liệu đã về mới dựng
 * nó.
 */
export function GalaxyPage() {
  const ready = useContentStore((s) => s.galaxyReady);
  const error = useContentStore((s) => s.galaxyError);
  const loadGalaxy = useContentStore((s) => s.loadGalaxy);

  useEffect(() => {
    void loadGalaxy();
  }, [loadGalaxy]);

  if (error) {
    return (
      <div className="grid h-full place-items-center px-6 text-center">
        <div>
          <p className="m-0 mb-3 text-[14px] text-ink-2">{error}</p>
          <button
            type="button"
            onClick={() => void loadGalaxy()}
            className="rounded-[9px] border border-line bg-surf px-4 py-2 text-[13px] text-ink"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="grid h-full place-items-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          Đang mở bản đồ ngân hà…
        </p>
      </div>
    );
  }

  return <GalaxyScene />;
}

function GalaxyScene() {
  const currentCode = useGalaxyStore((s) => s.currentRoleCode);
  const passport = useGalaxyStore((s) => s.passport);
  const grantSkills = useGalaxyStore((s) => s.grantSkills);
  const summary = useProgressStore((s) => s.summary);

  const selectedCode = useGalaxyUiStore((s) => s.selected);
  const select = useGalaxyUiStore((s) => s.select);
  const takeOff = useGalaxyUiStore((s) => s.takeOff);
  const goOverview = useGalaxyUiStore((s) => s.goOverview);
  const flight = useGalaxyUiStore((s) => s.flight);

  const [testing, setTesting] = useState(false);
  // /jobs?view=overview mở thẳng góc nhìn toàn ngân hà (tiện demo/chia sẻ)
  const [searchParams] = useSearchParams();
  const wantOverview = searchParams.get('view') === 'overview';
  useEffect(() => {
    if (wantOverview) goOverview();
  }, [wantOverview, goOverview]);
  const [toast, setToast] = useState<string | null>(null);

  // store đã lọc mã lạ lúc nạp, nhưng vẫn phòng hờ: không bao giờ để trang trắng vì thiếu hành tinh
  const current = findPlanet(currentCode) ?? galaxyData().nodes[0];

  /* ── kỹ năng người chơi đang có: máy chủ đã chấm + visa từ bài kiểm tra ── */
  const owned = useMemo(() => {
    const fromServer = (summary?.skills ?? [])
      .filter((s) => s.points > 0 || s.plus2 > 0)
      .map((s) => s.skill);
    return ownedSkillSet(fromServer, passport);
  }, [summary, passport]);

  const neighbors = useMemo(() => neighborsOf(current.roleCode), [current.roleCode]);

  const unlockByCode = useMemo(
    () =>
      new Map<string, UnlockState>(
        neighbors.map((n) => [n.node.roleCode, computeUnlock(n.node, owned, n.edge)]),
      ),
    [neighbors, owned],
  );

  const unlockedSet = useMemo(
    () => new Set([...unlockByCode].filter(([, u]) => u.unlocked).map(([code]) => code)),
    [unlockByCode],
  );

  /* ── hành tinh đang chọn ── */
  const selected = findPlanet(selectedCode);
  const selectedEdge = selected ? edgeBetween(current.roleCode, selected.roleCode) : undefined;
  const selectedUnlock = useMemo(
    () =>
      selected
        ? unlockByCode.get(selected.roleCode) ?? computeUnlock(selected, owned, selectedEdge)
        : null,
    [selected, unlockByCode, owned, selectedEdge],
  );
  const selectedPath = useMemo(
    () => (selected ? shortestPath(current.roleCode, selected.roleCode) : []),
    [selected, current.roleCode],
  );

  /* ── hạ cánh → toast ── */
  const lastCurrent = useRef(currentCode);
  useEffect(() => {
    if (lastCurrent.current !== currentCode) {
      setToast(`🚀 Đã hạ cánh tại ${shortPlanetName(current)}`);
      lastCurrent.current = currentCode;
    }
  }, [currentCode, current]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(t);
  }, [toast]);

  // Esc đóng panel (khi không có modal — modal tự bắt Esc của nó)
  const testingRef = useRef(testing);
  testingRef.current = testing;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !testingRef.current) select(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [select]);

  // Rời trang thì bỏ chọn để lần sau vào sạch — tách riêng, chỉ chạy lúc unmount
  useEffect(
    () => () => {
      select(null);
      document.body.style.cursor = '';
    },
    [select],
  );

  const handleFly = useCallback(() => {
    if (!selected || !selectedEdge || !selectedUnlock?.unlocked) return;
    takeOff(current.roleCode, selected.roleCode);
  }, [selected, selectedEdge, selectedUnlock, takeOff, current.roleCode]);

  const handlePass = useCallback(
    (skills: string[]) => {
      if (!selected) return;
      grantSkills(selected.roleCode, skills);
      setTesting(false);
      setToast(`🛂 Đã cấp visa vào ${shortPlanetName(selected)}`);
    },
    [selected, grantSkills],
  );

  const flightTarget = flight ? findPlanet(flight.to) : undefined;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05081a]">
      <GalaxyCanvas current={current.roleCode} unlocked={unlockedSet} />

      {/* lớp HUD: mọi thứ mặc định không bắt chuột, chỉ từng khối tự bật lại.
          Cột trái (chú giải) và cột phải (buồng lái + panel) độc lập chiều cao,
          để panel không bị chú giải dài đè ngắn lại. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-4 max-[900px]:p-2.5">
        <div className="flex min-h-0 flex-1 items-start justify-between gap-3">
          <GalaxyLegend />
          <div className="flex h-full min-h-0 flex-col items-end gap-3 max-[900px]:flex-1">
            <CockpitHud current={current} fuel={summary?.totalPoints ?? 0} ownedCount={owned.size} />
            {selected && selectedUnlock && !flight && (
              <PlanetPanel
                node={selected}
                current={current}
                edge={selectedEdge}
                unlock={selectedUnlock}
                path={selectedPath}
                onFly={handleFly}
                onTest={() => setTesting(true)}
                onClose={() => select(null)}
              />
            )}
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <NearbyDock neighbors={neighbors} unlockByCode={unlockByCode} />
          <p className="m-0 hidden shrink-0 font-mono text-[10px] text-muted min-[900px]:block">
            Kéo để xoay · Cuộn để zoom · Bấm hành tinh · Esc đóng
          </p>
        </div>
      </div>

      {/* đang bay */}
      {flight && flightTarget && (
        <div className="galaxy-glass galaxy-rise pointer-events-none absolute left-1/2 top-5 z-20 w-[320px] -translate-x-1/2 rounded-[11px] px-4 py-3 text-center">
          <p className="m-0 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">Đang bay tới</p>
          <p className="m-0 mt-0.5 font-display text-[16px] font-semibold">{shortPlanetName(flightTarget)}</p>
          <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-[2px] bg-line-2">
            <div className="galaxy-flight-bar" style={{ '--flight-ms': `${FLIGHT_MS}ms` } as CSSProperties} />
          </div>
        </div>
      )}

      {toast && !flight && (
        <div
          role="status"
          className="galaxy-glass toast-pop pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2 rounded-full px-4 py-2 text-[13px] font-medium text-gold-2"
        >
          {toast}
        </div>
      )}

      {testing && selected && selectedUnlock && (
        <EntryTest
          node={selected}
          missing={selectedUnlock.missing}
          onPass={handlePass}
          onClose={() => setTesting(false)}
        />
      )}
    </div>
  );
}
