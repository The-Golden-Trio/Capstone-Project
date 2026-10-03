/**
 * Đường bay giữa hai hành tinh: một cung Bézier bậc hai hơi vồng lên và lệch
 * sang một bên, để hai cạnh gần nhau không đè lên nhau thành một vệt.
 *
 * Cả đường vẽ (Routes) lẫn tàu (Ship) dùng đúng một cung này, nên tàu bay
 * đúng trên vạch — tính một lần rồi cache theo cặp đầu–cuối.
 */
import * as THREE from 'three';
import { findPlanet } from '../galaxy';

const UP = new THREE.Vector3(0, 1, 0);
const cache = new Map<string, THREE.QuadraticBezierCurve3>();

const hash = (s: string): number => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
};

/** Cung bay từ `from` tới `to`, đã cắt bớt hai đầu để không đâm vào thân hành tinh. */
export function routeCurve(from: string, to: string): THREE.QuadraticBezierCurve3 {
  const key = `${from}→${to}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const a = findPlanet(from);
  const b = findPlanet(to);
  if (!a || !b) throw new Error(`Không có đường bay ${from} → ${to}`);

  const pa = new THREE.Vector3(...a.position);
  const pb = new THREE.Vector3(...b.position);
  const dir = pb.clone().sub(pa);
  const len = dir.length();
  dir.normalize();

  // cắt hai đầu theo bán kính hành tinh (+ chút đệm cho khí quyển)
  const start = pa.clone().addScaledVector(dir, a.look.radius * 1.3 + 2.5);
  const end = pb.clone().addScaledVector(dir, -(b.look.radius * 1.3 + 2.5));

  // điểm điều khiển: giữa đường, nâng lên + lệch ngang. Chiều lệch cố định theo
  // cặp (không phụ thuộc hướng đi) để A→B và B→A là cùng một cung.
  const side = new THREE.Vector3().crossVectors(dir, UP);
  if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
  side.normalize();
  const pairKey = [from, to].sort().join('|');
  const sign = hash(pairKey) % 2 === 0 ? 1 : -1;
  const ctrl = start
    .clone()
    .lerp(end, 0.5)
    .addScaledVector(UP, 7 + len * 0.1)
    .addScaledVector(side, sign * len * 0.07);

  const curve = new THREE.QuadraticBezierCurve3(start, ctrl, end);
  cache.set(key, curve);
  return curve;
}
