/**
 * Đường bay giữa các hành tinh.
 *
 * Quy ước nhìn (khớp với chú giải 2D cũ của app):
 *   PROGRESSES_TO — nét liền vàng, có mũi tên, đi lên thành nghề kia
 *   SIMILAR       — nét đứt xanh, nghề tương tự, không có chiều
 * Cạnh chạm hành tinh đang đứng thì đổi màu theo điều kiện: xanh lá (bay
 * được, vạch chạy) hay đỏ san hô (còn thiếu kỹ năng, vạch đứng yên).
 */
import { useMemo, useRef, type ComponentRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { GALAXY, type GalaxyEdge } from '../galaxy';
import { useGalaxyUiStore } from '../galaxyStore';
import { routeCurve } from './routeCurve';

type LineRef = ComponentRef<typeof Line>;

const COLOR = {
  progress: new THREE.Color('#d4b06a'),
  similar: new THREE.Color('#6f93c9'),
  unlocked: new THREE.Color('#74c69d'),
  locked: new THREE.Color('#e07a6b'),
  flight: new THREE.Color('#ffffff'),
};

interface RouteStyle {
  color: THREE.Color;
  opacity: number;
  width: number;
  /** Tốc độ vạch/mũi tên chạy dọc cạnh (0 = đứng yên). Âm = chạy ngược. */
  flow: number;
}

export interface RoutesProps {
  current: string;
  /** Hành tinh kề đã đủ điều kiện bay tới. */
  unlocked: ReadonlySet<string>;
}

const damp = THREE.MathUtils.damp;
const _tmp = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

function Route({ edge, current, unlocked }: { edge: GalaxyEdge; current: string; unlocked: ReadonlySet<string> }) {
  const lineRef = useRef<LineRef>(null);
  const arrowRef = useRef<THREE.Mesh>(null);
  const arrowMat = useRef<THREE.MeshBasicMaterial>(null);
  const arrowT = useRef(0.55);

  const curve = useMemo(() => routeCurve(edge.from, edge.to), [edge.from, edge.to]);
  const points = useMemo(() => curve.getPoints(48), [curve]);
  const isProgress = edge.type === 'PROGRESSES_TO';

  useFrame((_, dt) => {
    // đọc thẳng từ store trong vòng lặp để không re-render 64 cạnh mỗi lần rê chuột
    const { selected, hovered, flight } = useGalaxyUiStore.getState();
    const other = edge.from === current ? edge.to : edge.from;
    const touchesCurrent = edge.from === current || edge.to === current;
    const touchesFocus =
      (selected !== null && (edge.from === selected || edge.to === selected)) ||
      (hovered !== null && (edge.from === hovered || edge.to === hovered));
    const inFlight =
      flight !== null &&
      ((edge.from === flight.from && edge.to === flight.to) || (edge.from === flight.to && edge.to === flight.from));

    let style: RouteStyle;
    if (inFlight) {
      style = { color: COLOR.flight, opacity: 1, width: 2.8, flow: edge.from === flight.from ? 3 : -3 };
    } else if (touchesCurrent) {
      const ok = unlocked.has(other);
      style = {
        color: ok ? COLOR.unlocked : COLOR.locked,
        opacity: ok ? 0.95 : 0.62,
        width: (ok ? 2.2 : 1.7) + (touchesFocus ? 0.6 : 0),
        flow: ok ? (edge.from === current ? 1.2 : -1.2) : 0,
      };
    } else if (touchesFocus) {
      style = { color: isProgress ? COLOR.progress : COLOR.similar, opacity: 0.8, width: 1.7, flow: 0.5 };
    } else {
      style = { color: isProgress ? COLOR.progress : COLOR.similar, opacity: isProgress ? 0.2 : 0.14, width: 1, flow: 0 };
    }

    const line = lineRef.current;
    if (line) {
      const m = line.material;
      m.opacity = damp(m.opacity, style.opacity, 6, dt);
      m.linewidth = damp(m.linewidth, style.width, 6, dt);
      m.color.lerp(style.color, 1 - Math.exp(-dt * 6));
      if (!isProgress) m.uniforms.dashOffset.value -= dt * style.flow * 4;
    }

    if (arrowRef.current && arrowMat.current) {
      // mũi tên trượt dọc cạnh khi cạnh "nóng", còn không thì đứng ở giữa
      const speed = style.flow;
      if (speed !== 0) arrowT.current = (arrowT.current + dt * Math.abs(speed) * 0.18) % 1;
      else arrowT.current = damp(arrowT.current, 0.55, 3, dt);
      const t = arrowT.current;
      curve.getPointAt(t, arrowRef.current.position);
      curve.getTangentAt(t, _tmp);
      if (speed < 0) _tmp.negate();
      arrowRef.current.quaternion.setFromUnitVectors(_up, _tmp);
      arrowMat.current.opacity = damp(arrowMat.current.opacity, style.opacity, 6, dt);
      arrowMat.current.color.lerp(style.color, 1 - Math.exp(-dt * 6));
    }
  });

  return (
    <group>
      <Line
        ref={lineRef}
        points={points}
        color="#6f93c9"
        lineWidth={1}
        dashed={!isProgress}
        dashSize={2.4}
        gapSize={2.2}
        transparent
        opacity={0.15}
        depthWrite={false}
        toneMapped={false}
      />
      {isProgress && (
        <mesh ref={arrowRef}>
          <coneGeometry args={[1.25, 3.4, 10]} />
          <meshBasicMaterial ref={arrowMat} color="#d4b06a" transparent opacity={0.2} toneMapped={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export function Routes({ current, unlocked }: RoutesProps) {
  return (
    <group>
      {GALAXY.edges.map((edge) => (
        <Route key={edge.id} edge={edge} current={current} unlocked={unlocked} />
      ))}
    </group>
  );
}
