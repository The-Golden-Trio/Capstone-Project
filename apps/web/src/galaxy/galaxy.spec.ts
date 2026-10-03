import { describe, expect, it } from 'vitest';
import { edgeBetween, isPlayable, neighborsOf, playPath, shortestPath, findPlanet } from './galaxy';
import { fixtureIndex } from '@datn/game-core/testing';
import { useContentStore } from '../store/contentStore';
import { loadGalaxyFixture } from './galaxy.fixture';

loadGalaxyFixture();
// `isPlayable` hỏi bảng tra nghề, mà bảng ấy nay tới từ máy chủ — trong app
// thật thì `RequireAuth` nạp trước khi vẽ, ở đây thì đặt thẳng vào store.
useContentStore.setState({ index: fixtureIndex(), version: 1 });

describe('neighborsOf', () => {
  it('xếp gần trước xa sau, không lặp', () => {
    const near = neighborsOf('SWE_FRONTEND');
    expect(near.length).toBeGreaterThan(0);
    for (let i = 1; i < near.length; i++)
      expect(near[i].edge.distance).toBeGreaterThanOrEqual(near[i - 1].edge.distance);
    expect(new Set(near.map((n) => n.node.roleCode)).size).toBe(near.length);
  });

  it('đánh dấu đúng chiều thăng tiến', () => {
    const toLead = neighborsOf('SWE_FRONTEND').find((n) => n.node.roleCode === 'SWE_TECHLEAD');
    expect(toLead?.isPromotion).toBe(true);
    const back = neighborsOf('SWE_TECHLEAD').find((n) => n.node.roleCode === 'SWE_FRONTEND');
    expect(back?.isPromotion).toBe(false);
  });
});

describe('edgeBetween', () => {
  it('không phụ thuộc chiều', () => {
    expect(edgeBetween('SWE_FRONTEND', 'SWE_UIUX')).toBe(edgeBetween('SWE_UIUX', 'SWE_FRONTEND'));
    expect(edgeBetween('SWE_FRONTEND', 'SWE_FRONTEND')).toBeUndefined();
  });
});

describe('shortestPath', () => {
  it('kề nhau thì hai chặng, chính mình thì một', () => {
    expect(shortestPath('SWE_FRONTEND', 'SWE_FRONTEND')).toEqual(['SWE_FRONTEND']);
    expect(shortestPath('SWE_FRONTEND', 'SWE_UIUX')).toEqual(['SWE_FRONTEND', 'SWE_UIUX']);
  });

  it('mọi chặng liên tiếp đều là cạnh thật', () => {
    const path = shortestPath('SWE_FRONTEND', 'INFRA_HELPDESK');
    expect(path.length).toBeGreaterThan(2);
    for (let i = 1; i < path.length; i++) expect(edgeBetween(path[i - 1], path[i])).toBeDefined();
  });
});

describe('chơi được', () => {
  it('nghề trong game-core có đường vào màn chơi, nghề ngoài thì không', () => {
    expect(isPlayable('SWE_FRONTEND')).toBe(true);
    // Dẫn tới lộ trình của nghề, không nhảy thẳng vào cấp bậc mở đầu: người
    // chơi phải thấy con đường trước rồi mới chọn chặng để vào học.
    expect(playPath(findPlanet('SWE_FRONTEND')!)).toBe('/jobs/SWE_FRONTEND');
    expect(isPlayable('PROD_BA')).toBe(false);
    expect(playPath(findPlanet('PROD_BA')!)).toBeNull();
  });
});
