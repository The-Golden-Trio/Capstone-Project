/**
 * Cảnh văn phòng có hai thứ dễ hỏng âm thầm khi sửa bản đồ: NPC đi xuyên bàn
 * (lộ trình viết tay lệch một ô) và một hoạt động không có bước sân khấu (kịch
 * bản thêm activity mà quên đạo diễn). Cả hai đều không nổ lúc build, chỉ lộ
 * ra khi chơi tới đúng chỗ — nên kiểm ở đây.
 */
import { describe, expect, it } from 'vitest';
import { findScenarioByKey } from '@datn/game-core';
import { CHARACTERS, SPRITE_H, SPRITE_W, frameFor } from './sprites';
import { OFFICE_STAGES, type Placement } from './stage';
import {
  FEET_H,
  TILE,
  isSolidTile,
  moveWithCollision,
  parseWorld,
  routeThrough,
  stepAlongRoute,
  tileCenter,
  withinReach,
  type Point,
  type Tile,
} from './world';

/** Các ô mà một đoạn thẳng (ngang hoặc dọc) giữa hai mốc đi qua. */
function tilesBetween(a: Tile, b: Tile): Tile[] {
  if (a.col !== b.col && a.row !== b.row) {
    throw new Error(`Đoạn (${a.col},${a.row})→(${b.col},${b.row}) không thẳng hàng`);
  }
  const out: Tile[] = [];
  const dc = Math.sign(b.col - a.col);
  const dr = Math.sign(b.row - a.row);
  let { col, row } = a;
  while (col !== b.col || row !== b.row) {
    col += dc;
    row += dr;
    out.push({ col, row });
  }
  return out;
}

describe('sprite', () => {
  it('mọi khung của mọi nhân vật đều đúng 12×18', () => {
    for (const character of Object.values(CHARACTERS)) {
      for (const facing of ['down', 'up', 'left', 'right'] as const) {
        for (const walking of [false, true]) {
          const { frame } = frameFor(character.sheet, facing, walking, 8);
          expect(frame).toHaveLength(SPRITE_H);
          for (const row of frame) expect(row).toHaveLength(SPRITE_W);
        }
      }
    }
  });

  it('đi thì luân phiên hai khung, đứng thì một khung', () => {
    const { sheet } = CHARACTERS.player;
    expect(frameFor(sheet, 'down', true, 0).frame).not.toEqual(
      frameFor(sheet, 'down', true, 8).frame,
    );
    expect(frameFor(sheet, 'down', false, 0).frame).toEqual(
      frameFor(sheet, 'down', false, 8).frame,
    );
    expect(frameFor(sheet, 'left', false, 0).mirror).toBe(true);
  });
});

describe('thế giới', () => {
  const world = parseWorld(OFFICE_STAGES.SWE_BACKEND_L1_S_EXEC.map);

  it('bản đồ L1 dựng được, viền ngoài là tường', () => {
    expect(world.cols).toBe(22);
    expect(world.rows).toBe(14);
    for (let col = 0; col < world.cols; col++) {
      expect(isSolidTile(world, col, 0)).toBe(true);
    }
    for (let row = 0; row < world.rows; row++) {
      expect(isSolidTile(world, 0, row)).toBe(true);
      expect(isSolidTile(world, world.cols - 1, row)).toBe(true);
    }
  });

  it('không cho đi xuyên bàn, nhưng trượt được dọc theo nó', () => {
    // Từ ghế (3,12) đi lên: nhích được trong ô ghế, nhưng chân không bao giờ
    // lọt vào ô bàn (3,11) phía trên.
    const start = tileCenter({ col: 3, row: 12 });
    let pos = start;
    for (let i = 0; i < 20; i++) pos = moveWithCollision(world, pos, 0, -6);
    expect(pos.y).toBeLessThan(start.y);
    expect(pos.y - FEET_H).toBeGreaterThanOrEqual(12 * TILE);

    // Đã kẹt ở mép bàn: đi chéo lên-phải thì trượt sang phải, không lên.
    const diagonal = moveWithCollision(world, pos, 6, -6);
    expect(diagonal.x).toBeGreaterThan(pos.x);
    expect(diagonal.y).toBe(pos.y);
  });

  it('đi hết lộ trình thì báo tới nơi đúng một lần', () => {
    let walker = {
      pos: tileCenter({ col: 5, row: 7 }),
      facing: 'down' as const,
      route: routeThrough([{ col: 5, row: 9 }, { col: 7, row: 9 }]),
    };
    let arrivals = 0;
    for (let i = 0; i < 400 && walker.route.length > 0; i++) {
      const step = stepAlongRoute(walker, 3);
      walker = step.walker;
      if (step.arrived) arrivals += 1;
    }
    expect(arrivals).toBe(1);
    expect(walker.pos).toEqual(tileCenter({ col: 7, row: 9 }));
    expect(walker.facing).toBe('right');
  });

  it('withinReach: một ô rưỡi thì chạm, ba ô thì không', () => {
    const a: Point = { x: 0, y: 0 };
    expect(withinReach(a, { x: TILE * 1.2, y: 0 })).toBe(true);
    expect(withinReach(a, { x: TILE * 3, y: 0 })).toBe(false);
  });
});

describe('sân khấu L1', () => {
  const stage = OFFICE_STAGES.SWE_BACKEND_L1_S_EXEC;
  const world = parseWorld(stage.map);
  const scenario = findScenarioByKey('SWE_BACKEND_L1_S_EXEC')?.scenario;

  it('mỗi hoạt động của kịch bản có đúng một bước', () => {
    if (!scenario) throw new Error('thiếu kịch bản L1');
    for (const activity of scenario.activities) {
      expect(stage.steps[activity.activity_id], activity.activity_id).toBeDefined();
    }
  });

  it('điểm sinh và chỗ đứng ban đầu của NPC đều đi được', () => {
    expect(isSolidTile(world, stage.spawn.col, stage.spawn.row)).toBe(false);
    for (const placement of Object.values(stage.cast)) {
      expect(isSolidTile(world, placement.at.col, placement.at.row)).toBe(false);
    }
  });

  it('mọi trigger trỏ tới spot có thật', () => {
    for (const step of Object.values(stage.steps)) {
      if (step.trigger.kind === 'use' || step.trigger.kind === 'reach') {
        expect(stage.spots[step.trigger.spot]).toBeDefined();
      }
    }
  });

  it('không lộ trình nào của NPC đi xuyên vật cản', () => {
    /** Vị trí hiện tại của từng NPC, cập nhật theo thứ tự các bước. */
    const at: Record<string, Tile> = {
      an: stage.cast.an.at,
      ha: stage.cast.ha.at,
    };
    const check = (who: string, placement: Placement) => {
      const stops = [at[who], ...(placement.via ?? []), placement.at];
      for (let i = 1; i < stops.length; i++) {
        for (const tile of tilesBetween(stops[i - 1], stops[i])) {
          expect(
            isSolidTile(world, tile.col, tile.row),
            `${who} xuyên (${tile.col},${tile.row}) trên đường tới (${placement.at.col},${placement.at.row})`,
          ).toBe(false);
        }
      }
      at[who] = placement.at;
    };

    for (const id of Object.keys(stage.steps).sort()) {
      const step = stage.steps[id];
      for (const [who, placement] of Object.entries(step.moves)) {
        if (placement) check(who, placement);
      }
      if (step.trigger.kind === 'reach') {
        check(step.trigger.then.npc, step.trigger.then.to);
      }
    }
  });
});
