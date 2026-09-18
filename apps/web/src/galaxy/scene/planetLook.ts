/**
 * Từ `look.kind` + màu hệ sao → bộ tham số cho shader hành tinh.
 *
 * Mỗi kiểu là một "khí hậu": terra có biển và đèn thành phố, lava có vết nứt
 * phát sáng, gas toàn dải mây… Màu gốc của kiểu được pha với màu hệ sao để
 * hành tinh cùng hệ nhìn ra họ hàng nhưng vẫn không giống hệt nhau.
 */
import { Color } from 'three';
import type { PlanetKind } from '../galaxy';

interface KindPreset {
  deep: string;
  land: string;
  band: string;
  ice: string;
  bands: number;
  bandFreq: number;
  land_: number;
  ice_: number;
  lava: number;
  city: number;
  spec: number;
  /** Bao nhiêu phần màu hệ sao pha vào (0 = giữ nguyên màu kiểu). */
  tint: number;
  atmosphere: number;
}

const PRESETS: Record<PlanetKind, KindPreset> = {
  terra: {
    deep: '#153f8f', land: '#4f8a3a', band: '#c9d7e8', ice: '#eef6ff',
    bands: 0.12, bandFreq: 2, land_: 0.52, ice_: 0.4, lava: 0, city: 1, spec: 1, tint: 0.35, atmosphere: 0.95,
  },
  ice: {
    deep: '#7fb6e6', land: '#e9f5ff', band: '#b9daf5', ice: '#ffffff',
    bands: 0.2, bandFreq: 2, land_: 0.45, ice_: 0.85, lava: 0, city: 0, spec: 0.7, tint: 0.3, atmosphere: 0.7,
  },
  desert: {
    deep: '#8a4a2a', land: '#e0a466', band: '#f2c58f', ice: '#f7e9d2',
    bands: 0.3, bandFreq: 4, land_: 0.5, ice_: 0.12, lava: 0, city: 0.35, spec: 0.15, tint: 0.4, atmosphere: 0.55,
  },
  lava: {
    deep: '#170b0e', land: '#3a1c22', band: '#4a2028', ice: '#2b1418',
    bands: 0.15, bandFreq: 3, land_: 0.5, ice_: 0, lava: 1, city: 0, spec: 0.25, tint: 0.35, atmosphere: 0.8,
  },
  cloud: {
    deep: '#2b8ca6', land: '#e2f5fb', band: '#9fdbe9', ice: '#ffffff',
    bands: 0.55, bandFreq: 3, land_: 0.55, ice_: 0.2, lava: 0, city: 0, spec: 0.5, tint: 0.45, atmosphere: 1.1,
  },
  gas: {
    deep: '#3b2a6e', land: '#6a4fb3', band: '#d7c8ff', ice: '#c7b8ff',
    bands: 1, bandFreq: 6, land_: 0.92, ice_: 0, lava: 0, city: 0, spec: 0.2, tint: 0.5, atmosphere: 1,
  },
  pastel: {
    deep: '#8a4b78', land: '#e7a8cf', band: '#ffe0f0', ice: '#fff0f7',
    bands: 0.7, bandFreq: 3, land_: 0.9, ice_: 0, lava: 0, city: 0, spec: 0.3, tint: 0.5, atmosphere: 0.9,
  },
};

export interface PlanetUniformSpec {
  deep: Color;
  land: Color;
  band: Color;
  ice: Color;
  rim: Color;
  bands: number;
  bandFreq: number;
  land_: number;
  ice_: number;
  lava: number;
  city: number;
  spec: number;
  atmosphere: number;
}

const tinted = (hex: string, group: Color, amount: number): Color =>
  new Color(hex).lerp(group, amount);

export function planetUniforms(kind: PlanetKind, groupHex: string): PlanetUniformSpec {
  const p = PRESETS[kind];
  const group = new Color(groupHex);
  return {
    deep: tinted(p.deep, group.clone().multiplyScalar(0.55), p.tint),
    land: tinted(p.land, group, p.tint * 0.8),
    band: tinted(p.band, group, p.tint),
    ice: new Color(p.ice),
    rim: group.clone().lerp(new Color('#ffffff'), 0.25),
    bands: p.bands,
    bandFreq: p.bandFreq,
    land_: p.land_,
    ice_: p.ice_,
    lava: p.lava,
    city: p.city,
    spec: p.spec,
    atmosphere: p.atmosphere,
  };
}
