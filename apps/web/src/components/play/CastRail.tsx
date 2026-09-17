import { useState } from 'react';
import type { Scenario } from '@datn/game-core';
import { Crest } from '../game/Crest';
import { cx } from '../../lib/cx';

/**
 * Những người có mặt trong cảnh.
 *
 * Trước đây NPC chỉ xuất hiện khi họ nói, dưới dạng bốn chữ cái trong một ô
 * tròn xám — ai cũng giống ai và không ai có động cơ gì. Bộ dữ liệu thì đã có
 * sẵn `role_in_scene` (họ là ai) và `pressure` (họ đang cần gì ở bạn), tức là
 * đủ chất liệu để họ thành nhân vật.
 */
export function CastRail({
  scenario,
  speakingNpcId,
}: {
  scenario: Scenario;
  /** NPC đang nói thì huy hiệu sáng lên. */
  speakingNpcId?: string | null;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mb-4">
      <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.11em] text-muted">
        Có mặt trong cảnh
      </p>

      <div className="flex flex-wrap gap-2">
        {scenario.cast.map((member) => {
          const open = openId === member.npc_id;
          const name = member.role_in_scene.split(',')[0].trim();

          return (
            <div key={member.npc_id} className="min-w-[210px] flex-1">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : member.npc_id)}
                aria-expanded={open}
                className={cx(
                  'action-card flex w-full items-center gap-2.5 rounded-[10px] border bg-surf px-3 py-2.5 text-left',
                  speakingNpcId === member.npc_id
                    ? 'border-[var(--accent)]'
                    : 'border-line-2',
                )}
              >
                <Crest
                  seed={member.npc_id}
                  size={34}
                  active={speakingNpcId === member.npc_id}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink">
                    {name}
                  </span>
                  <span className="block truncate font-mono text-[10px] text-muted">
                    {open ? 'đang cần gì ở bạn ↓' : 'xem họ cần gì'}
                  </span>
                </span>
              </button>

              {open && (
                <div className="reveal mt-1.5 rounded-[9px] border border-line-2 bg-panel px-3 py-2.5">
                  <p className="m-0 mb-1.5 text-[12.5px] leading-relaxed text-ink-2">
                    {member.pressure}
                  </p>
                  {member.voice && (
                    <p className="m-0 font-mono text-[10.5px] leading-relaxed text-muted">
                      Cách nói: {member.voice}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
