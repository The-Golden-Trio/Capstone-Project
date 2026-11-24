import { useMemo, type ReactNode } from 'react';
import {
  ChevronRight,
  Flag,
  Hourglass,
  Info,
  Send,
  Target,
  Users,
} from 'lucide-react';
import { cn } from '@datn/ui';
import type { SceneView } from '../../../api/types';
import { castCharacters } from '../../../lib/toon';
import { ActionButton, ActionList, useTapGuard } from '../ActionPanel';
import { iconOf } from '../desktop/Desktop';
import { Avatar } from '../stage/Avatar';
import { WORKBENCH_TABS, placeOf } from './model';
import { FinalPromiseList, PromiseList, openPromises } from './promises';

type Action = SceneView['actions'][number];

interface PanelProps {
  scene: SceneView;
  /** Lý do chưa làm việc được lúc này (đang trò chuyện, đang nghe…). */
  blocked: string | null;
  busy: boolean;
  onPick: (action: Action) => void;
}

/** Vì sao các việc đang tạm khoá; null khi đang ở pha xử lý. */
export function blockedReason(scene: SceneView, locked: boolean) {
  if (scene.ended) return 'Ca làm đã khép lại.';
  if (locked) return 'Nghe hết lời nhân vật rồi mới làm việc khác.';
  switch (scene.mode) {
    case 'phase':
      return null;
    case 'conversation':
      return 'Đang trò chuyện. Kết thúc cuộc trò chuyện để làm việc khác.';
    case 'review':
      return 'Đang nhìn lại ca với người hỏi.';
    default:
      return 'Trả lời tình huống đang mở trước đã.';
  }
}

const actionsIn = (scene: SceneView, place: ReturnType<typeof placeOf>) =>
  scene.actions.filter((a) => placeOf(a.kind) === place);

export function WorkPanel({
  scene,
  goal,
  blocked,
  busy,
  onPick,
}: PanelProps & { goal: string }) {
  const promises = openPromises(scene);
  const work = actionsIn(scene, 'work');
  const goalSection = (
    <Section title="Mục tiêu">
      <p className="flex gap-2 rounded-xl border-2 border-toon-ink bg-[#ffe4a3] px-3 py-2 text-sm font-semibold leading-relaxed text-toon-ink">
        <Target
          size={15}
          strokeWidth={2.6}
          aria-hidden
          className="mt-0.5 shrink-0"
        />
        {goal}
      </p>
    </Section>
  );
  if (scene.ended)
    return (
      <div className="flex flex-col gap-5 p-4">
        {goalSection}
        <EndedNote>
          Ca làm đã khép lại. Bước tiếp theo là kể vài cảm nhận: bấm Tiếp tục ở
          dưới màn cảnh.
        </EndedNote>
        {scene.notebook.promises.length > 0 && (
          <Section title="Lời đã hứa">
            <FinalPromiseList scene={scene} />
          </Section>
        )}
      </div>
    );
  return (
    <div className="flex flex-col gap-5 p-4">
      {goalSection}
      <Section title="Đã hẹn">
        {promises.length ? (
          <PromiseList scene={scene} />
        ) : (
          <Empty>Bạn chưa hẹn ai. Lời hứa chưa giữ sẽ hiện ở đây.</Empty>
        )}
      </Section>
      {scene.suspended && (
        <p className="flex items-center gap-2 rounded-xl border-2 border-toon-ink bg-[#ffe4a3] px-3 py-1.5 text-sm font-bold text-toon-ink">
          <Hourglass
            size={14}
            strokeWidth={2.6}
            aria-hidden
            className="shrink-0"
          />
          Đang dở: {scene.suspended.label} (còn {scene.suspended.remaining}{' '}
          lượt)
        </p>
      )}
      <Section title="Làm việc">
        <Blocked reason={blocked} />
        {work.length ? (
          <ActionList
            label="Việc làm được"
            actions={work}
            minutesPerPoint={scene.clock.minutesPerPoint}
            disabled={busy || !!blocked}
            onPick={onPick}
          />
        ) : (
          <Empty>
            Ca này chưa có việc nào ngoài trò chuyện và đọc tài liệu.
          </Empty>
        )}
      </Section>
    </div>
  );
}

export function PeoplePanel({ scene, blocked, busy, onPick }: PanelProps) {
  const looks = useMemo(() => castCharacters(scene.cast), [scene.cast]);
  const off = busy || !!blocked;
  const guarded = useTapGuard(off);
  const contacts = scene.ended ? [] : actionsIn(scene, 'people');
  const slots = new Set(scene.cast.map((c) => c.slot));
  const talk = (slot: string) =>
    contacts.filter((a) => a.kind === 'talk' && a.target === slot);
  const channels = contacts.filter((a) => a.kind === 'message');
  const groups = contacts.filter((a) => a.kind === 'meeting');
  const others = contacts.filter(
    (a) => a.kind === 'talk' && !slots.has(a.target ?? ''),
  );
  const button = (a: Action) => (
    <ActionButton
      key={a.key}
      action={a}
      compact
      showReason
      guarded={guarded}
      minutesPerPoint={scene.clock.minutesPerPoint}
      disabled={off}
      onPick={onPick}
    />
  );
  const group = (title: string, icon: ReactNode, list: Action[]) =>
    list.length > 0 && (
      <Section title={title} icon={icon}>
        <div className="grid gap-2">{list.map(button)}</div>
      </Section>
    );

  if (!scene.cast.length && !contacts.length)
    return (
      <div className="p-4">
        <Empty>
          {scene.ended
            ? 'Ca này không có ai khác ngoài bạn.'
            : 'Ca này chưa có ai để liên lạc.'}
        </Empty>
      </div>
    );

  return (
    <div className="flex flex-col gap-5 p-4">
      <Blocked reason={scene.ended ? null : blocked} className="-mb-3" />
      {scene.cast.length > 0 && (
        <Section title="Người trong ca">
          <ul aria-label="Người trong ca" className="grid gap-2.5">
            {scene.cast.map((person) => {
              const look = looks.get(person.slot);
              const mine = talk(person.slot);
              return (
                <li
                  key={person.slot}
                  data-person={person.slot}
                  className="rounded-2xl border-[2.5px] border-toon-ink bg-toon-paper p-2.5 shadow-toon-sm"
                >
                  <div className="flex items-center gap-3">
                    {look && (
                      <Avatar src={look.src} color={look.color} size={44} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-toon text-base font-extrabold capitalize leading-tight text-toon-ink">
                        {person.name}
                      </p>
                      <p className="text-xs font-semibold leading-snug text-toon-ink-soft">
                        {person.relation}
                      </p>
                    </div>
                    {person.status && (
                      <span className="shrink-0 self-start rounded-full border-2 border-toon-ink bg-[#ffe4a3] px-2 py-0.5 text-xs font-bold text-toon-ink">
                        {person.status}
                      </span>
                    )}
                  </div>
                  {mine.length > 0 && (
                    <div className="mt-2.5 grid gap-2">{mine.map(button)}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}
      {group(
        'Kênh',
        <Send size={13} strokeWidth={2.6} aria-hidden />,
        channels,
      )}
      {group(
        'Cả nhóm',
        <Users size={13} strokeWidth={2.6} aria-hidden />,
        groups,
      )}
      {group('Khác', null, others)}
    </div>
  );
}

const DOC_TYPE_LABEL: Record<string, string> = {
  code: 'Code',
  wiki: 'Wiki',
  table: 'Bảng số liệu',
  dashboard: 'Bảng theo dõi',
  terminal: 'Terminal',
  file: 'Tệp',
  patch: 'Bản vá',
  mail: 'Thư',
  note: 'Ghi chú',
  channel: 'Kênh trao đổi',
};

const DOCS_COLOR =
  WORKBENCH_TABS.find((tab) => tab.key === 'docs')?.color ?? '#a8dbb9';

export function DocsPanel({
  scene,
  blocked,
  busy,
  onPick,
  onOpen,
}: PanelProps & { onOpen: (id: string) => void }) {
  const opened = new Set(scene.documents.map((d) => d.id));
  const unopened = scene.ended
    ? []
    : actionsIn(scene, 'docs').filter(
        (a) => !a.target || !opened.has(a.target),
      );
  if (!scene.documents.length && !unopened.length)
    return (
      <div className="p-4">
        <Empty>
          {scene.ended
            ? 'Bạn không mở tài liệu nào trong ca này.'
            : 'Ca này chưa có tài liệu nào để mở.'}
        </Empty>
      </div>
    );
  return (
    <div className="flex flex-col gap-5 p-4">
      <Section title="Đã mở" hint="xem lại không tốn lượt">
        {scene.documents.length > 0 ? (
          <ul aria-label="Tài liệu đã mở" className="grid gap-2">
            {scene.documents.map((doc) => {
              const Icon = iconOf(doc.view?.type);
              const type = DOC_TYPE_LABEL[doc.view?.type ?? ''];
              const typeId = `doc-type-${doc.id}`;
              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    data-document-id={doc.id}
                    aria-describedby={type ? typeId : undefined}
                    onClick={() => onOpen(doc.id)}
                    className="flex min-h-14 w-full items-center gap-3 rounded-2xl border-[2.5px] border-toon-ink bg-toon-paper px-2.5 py-2 text-left font-toon-body text-[15px] font-bold leading-snug text-toon-ink shadow-toon-sm transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-toon focus-visible:outline-none focus-visible:shadow-toon-focus"
                  >
                    <span
                      aria-hidden
                      className="grid size-9 shrink-0 place-items-center rounded-xl border-[2.5px] border-toon-ink"
                      style={{ backgroundColor: DOCS_COLOR }}
                    >
                      <Icon size={17} strokeWidth={2.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block">{doc.title}</span>
                      {type && (
                        <span
                          id={typeId}
                          aria-hidden
                          className="block text-xs font-semibold text-toon-ink-soft"
                        >
                          {type}
                        </span>
                      )}
                    </span>
                    <ChevronRight
                      size={16}
                      strokeWidth={2.6}
                      aria-hidden
                      className="shrink-0"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>Bạn chưa mở tài liệu nào. Tài liệu đã mở sẽ nằm ở đây.</Empty>
        )}
      </Section>
      {unopened.length > 0 && (
        <Section title="Chưa mở" hint="mở tốn lượt">
          <Blocked reason={blocked} />
          <ActionList
            label="Tài liệu chưa mở"
            actions={unopened}
            minutesPerPoint={scene.clock.minutesPerPoint}
            disabled={busy || !!blocked}
            onPick={onPick}
          />
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  icon,
  children,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-baseline gap-1.5 font-toon text-sm font-extrabold text-toon-ink-soft">
        {icon && <span className="self-center">{icon}</span>}
        {title}
        {hint && (
          <span className="font-toon-body text-xs font-semibold">· {hint}</span>
        )}
      </h3>
      {children}
    </section>
  );
}

function EndedNote({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="flex gap-2 rounded-xl border-2 border-toon-ink bg-toon-paper px-3 py-2 text-sm font-semibold leading-relaxed text-toon-ink"
    >
      <Flag
        size={15}
        strokeWidth={2.6}
        aria-hidden
        className="mt-0.5 shrink-0"
      />
      {children}
    </p>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border-2 border-dashed border-toon-ink/40 px-3 py-3 text-center text-sm font-semibold text-toon-ink-soft">
      {children}
    </p>
  );
}

function Blocked({
  reason,
  className,
}: {
  reason: string | null;
  className?: string;
}) {
  if (!reason) return null;
  return (
    <p
      className={cn(
        'mb-2 flex gap-2 rounded-xl border-2 border-dashed border-toon-ink/50 px-3 py-1.5 text-sm font-semibold text-toon-ink-soft',
        className,
      )}
    >
      <Info
        size={15}
        strokeWidth={2.6}
        aria-hidden
        className="mt-0.5 shrink-0"
      />
      {reason}
    </p>
  );
}
