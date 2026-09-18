/**
 * Màn chơi phải ra chất game — và đây là những chỗ dễ vỡ nhất khi sửa giao diện:
 *
 *   • màu của một nghề phải khớp với màu hành tinh của chính nghề đó;
 *   • chín nghề phải ra chín màu khác nhau — cách chia theo hash trước đây dồn
 *     ba nghề vào cùng một màu, trong đó Front-end và UI/UX lại là hai nghề nằm
 *     cạnh nhau trên bản đồ và có đường nối giữa chúng;
 *   • những trường dữ liệu vốn bị bỏ phí (stakes, pressure, kỹ năng, vai diễn)
 *     phải thật sự hiện ra màn hình;
 *   • và không thay đổi giao diện nào được đụng tới luật chơi.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import {
  defaultTextGrader,
  mulberry32,
  startRun,
  type EngineDeps,
} from '@datn/game-core';
import { describe, expect, it } from 'vitest';
import { FOLLOWUP_LINES } from '@datn/game-core';
import { fixtureIndex } from '@datn/game-core/testing';
import { Crest } from '../game/Crest';
import { RoleTheme } from '../game/RoleTheme';
import { crest } from '../../domain/crest';
import { planetLook } from '../../domain/planet';
import { roleTheme } from '../../domain/roleTheme';
import { CastRail } from './CastRail';
import { ObjectiveStrip } from './ObjectiveStrip';
import { SceneHeader } from './SceneHeader';
import { SkillChips } from './SkillChips';
import { StakesBar } from './StakesBar';
import { ChoiceActivity } from './activities/ChoiceActivity';

const game = fixtureIndex();

const entry = game.findScenarioByKey('SWE_BACKEND_L3_S_INCIDENT');
if (!entry) throw new Error('thiếu kịch bản để kiểm');
const scenario = entry.scenario;

const PLAYABLE_ROLES = [
  'SWE_FRONTEND',
  'SWE_BACKEND',
  'SWE_MOBILE',
  'SWE_GAME',
  'SWE_UIUX',
  'SWE_EMBEDDED',
  'SWE_ARCH_SOL',
  'SWE_TECHLEAD',
  'SWE_EM',
];

describe('màu theo nghề', () => {
  it('cùng nghề luôn ra cùng màu', () => {
    expect(roleTheme('SWE_BACKEND')).toEqual(roleTheme('SWE_BACKEND'));
  });

  it('hành tinh và màn hình dùng chung một màu', () => {
    // Trước đây hai chỗ giữ hai bảng màu riêng, không gì bắt chúng phải khớp.
    const theme = roleTheme('SWE_BACKEND');
    const planet = planetLook('SWE_BACKEND');
    expect(planet.glow).toBe(theme.accent);
    expect(planet.core).toBe(theme.core);
  });

  it('chín nghề ra chín màu khác nhau', () => {
    const accents = PLAYABLE_ROLES.map((code) => roleTheme(code).accent);
    expect(new Set(accents).size).toBe(PLAYABLE_ROLES.length);
  });

  it('đặt biến CSS lên nhánh con', () => {
    const { container } = render(
      <RoleTheme roleCode="SWE_BACKEND">
        <span>x</span>
      </RoleTheme>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--accent')).toBe(
      roleTheme('SWE_BACKEND').accent,
    );
  });
});

describe('huy hiệu nhân vật', () => {
  it('mỗi NPC một khuôn mặt khác nhau', () => {
    const ids = scenario.cast.map((c) => c.npc_id);
    const looks = ids.map((id) => JSON.stringify(crest(id)));
    expect(new Set(looks).size).toBe(ids.length);
  });

  it('cùng id thì lần nào cũng cùng khuôn mặt', () => {
    expect(crest('an')).toEqual(crest('an'));
  });

  it('vẽ ra SVG thật', () => {
    const { container } = render(<Crest seed="an" size={40} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(2);
  });
});

describe('cảnh hiện ra dữ liệu trước đây bị bỏ phí', () => {
  it('nói bạn đang là ai trong cảnh này', () => {
    render(<SceneHeader scenario={scenario} />);
    expect(screen.getByText(scenario.scenario_title)).toBeTruthy();
    expect(screen.getByText(scenario.job.title_vn ?? '')).toBeTruthy();
  });

  it('hiện thứ sẽ mất nếu không xong', () => {
    render(<StakesBar scenario={scenario} />);
    expect(screen.getByText(scenario.context.stakes ?? '')).toBeTruthy();
    expect(screen.getByText(scenario.context.time_pressure ?? '')).toBeTruthy();
  });

  it('cho biết từng người cần gì ở bạn', () => {
    render(<CastRail scenario={scenario} />);
    const first = scenario.cast[0];
    const name = first.role_in_scene.split(',')[0].trim();
    expect(screen.getByText(name)).toBeTruthy();

    // Động cơ giấu sau một cú bấm, để cảnh không bị chữ lấn hết.
    expect(screen.queryByText(first.pressure)).toBeNull();
    fireEvent.click(screen.getByText(name));
    expect(screen.getByText(first.pressure)).toBeTruthy();
  });

  it('tách kỹ năng cứng và kỹ năng mềm bằng màu', () => {
    const { container } = render(<SkillChips scenario={scenario} />);
    for (const skill of scenario.context.skills_hard) {
      expect(screen.getByText(skill)).toBeTruthy();
    }
    for (const skill of scenario.context.skills_soft) {
      expect(screen.getByText(skill)).toBeTruthy();
    }
    expect(container.querySelectorAll('.text-skill-hard').length).toBe(
      scenario.context.skills_hard.length,
    );
    expect(container.querySelectorAll('.text-skill-soft').length).toBe(
      scenario.context.skills_soft.length,
    );
  });

  it('nói việc phải làm, không nói tên kiểu dữ liệu', () => {
    const { container } = render(
      <ObjectiveStrip type="PRIORITIZING" total={4} current={1} />,
    );
    expect(screen.getByText('Chọn việc làm trước')).toBeTruthy();
    expect(screen.queryByText(/prioritizing/i)).toBeNull();
    expect(container.querySelectorAll('.scene-step').length).toBe(4);
    expect(container.querySelectorAll('.scene-step.done').length).toBe(1);
  });
});

/** Engine nhận kịch bản từ ngoài, nên test cũng phải đưa vào. */
function depsFor(
  scenarioKey: string,
  rng: () => number,
  now: () => number,
): EngineDeps {
  const entry = game.findScenarioByKey(scenarioKey);
  if (!entry) throw new Error(`thiếu kịch bản ${scenarioKey}`);
  return {
    scenario: entry.scenario,
    followupLine: (activityId) =>
      FOLLOWUP_LINES[`${scenarioKey}:${activityId}`],
    grader: defaultTextGrader,
    rng,
    now,
  };
}

describe('lựa chọn là thẻ hành động', () => {
  it('mỗi lựa chọn là một thẻ bấm được, có phím tắt', () => {
    const deps = depsFor('SWE_BACKEND_L3_S_INCIDENT', mulberry32(1), Date.now);
    const run = startRun('SWE_BACKEND_L3_S_INCIDENT', deps);
    const activity = scenario.activities.find(
      (a) => a.activity_id === run.activityId,
    );
    if (!activity || activity.type !== 'CHOICE') return;

    const picked: number[] = [];
    const { container } = render(
      <ChoiceActivity activity={activity} onPick={(i) => picked.push(i)} />,
    );

    const cards = container.querySelectorAll('.action-card');
    expect(cards.length).toBe(activity.options?.length);
    expect(container.querySelectorAll('.keycap').length).toBe(
      activity.options?.length,
    );

    fireEvent.click(cards[1]);
    expect(picked).toEqual([1]);
  });
});

describe('giao diện không đụng tới luật chơi', () => {
  it('cùng hạt giống vẫn cho cùng trạng thái mở màn', () => {
    const make = () =>
      startRun(
        'SWE_BACKEND_L1_S_EXEC',
        depsFor('SWE_BACKEND_L1_S_EXEC', mulberry32(42), () => 1000),
      );
    expect(make()).toEqual(make());
  });
});
