/**
 * Một hành tinh nghề nghiệp: thân (shader noise), khí quyển, vành đai, vệ tinh,
 * vòng chọn và nhãn tên. Toàn bộ hình khối sinh lúc chạy.
 *
 * Mọi trạng thái nhìn thấy (đang đứng / kề / được chọn / rê chuột) đều chuyển
 * mượt trong `useFrame` thay vì nhảy phắt — hành tinh là vật thể, không phải nút.
 */
import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { colorOf, groupOf, shortPlanetName, type GalaxyNode } from '../galaxy';
import { useGalaxyUiStore } from '../galaxyStore';
import { planetUniforms } from './planetLook';
import { ATMO_FRAG, ATMO_VERT, PLANET_FRAG, PLANET_VERT, RING_FRAG, RING_VERT } from './shaders';

export type PlanetStatus = 'current' | 'adjacent' | 'far';

interface PlanetProps {
  node: GalaxyNode;
  status: PlanetStatus;
  /** Chỉ có nghĩa khi `status === 'adjacent'`: đủ điều kiện bay tới chưa. */
  unlocked: boolean;
  /** Chưa dựng màn chơi — hành tinh vẫn bay tới được nhưng nhìn "hoang" hơn. */
  playable: boolean;
}

const _world = new THREE.Vector3();
const GOLD = new THREE.Color('#d4b06a');
const GOOD = new THREE.Color('#74c69d');
const SIGNAL = new THREE.Color('#e07a6b');
const WHITE = new THREE.Color('#ffffff');

/** Tốc độ tiến về giá trị đích mỗi giây — dùng chung cho mọi chuyển mượt. */
const damp = (from: number, to: number, dt: number, speed = 6) =>
  THREE.MathUtils.damp(from, to, speed, dt);

export function Planet({ node, status, unlocked, playable }: PlanetProps) {
  const group = groupOf(node);
  const { look } = node;
  const radius = look.radius;

  const selected = useGalaxyUiStore((s) => s.selected === node.roleCode);
  const hovered = useGalaxyUiStore((s) => s.hovered === node.roleCode);
  const select = useGalaxyUiStore((s) => s.select);
  const hover = useGalaxyUiStore((s) => s.hover);

  const scaleRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  const planetMat = useRef<THREE.ShaderMaterial>(null);
  const atmoMat = useRef<THREE.ShaderMaterial>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const spec = useMemo(() => planetUniforms(look.kind, group.color), [look.kind, group.color]);
  const sun = useMemo(() => new THREE.Vector3(...group.sun), [group.sun]);

  const uniforms = useMemo(
    () => ({
      uColorDeep: { value: spec.deep },
      uColorLand: { value: spec.land },
      uColorBand: { value: spec.band },
      uColorIce: { value: spec.ice },
      uRimColor: { value: spec.rim },
      uLightPos: { value: sun },
      uSeed: { value: look.seed },
      uBands: { value: spec.bands },
      uBandFreq: { value: spec.bandFreq },
      uLand: { value: spec.land_ },
      uIce: { value: spec.ice_ },
      uLava: { value: spec.lava },
      uCity: { value: spec.city },
      uSpec: { value: spec.spec },
      uAmbient: { value: 0.16 },
      uBright: { value: 1 },
      uTime: { value: 0 },
    }),
    [spec, sun, look.seed],
  );

  const atmoUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(group.color) },
      uCoef: { value: 0.42 },
      uPower: { value: 3.0 },
      uOpacity: { value: spec.atmosphere },
    }),
    [group.color, spec.atmosphere],
  );

  const ringUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(group.color).lerp(WHITE, 0.45) },
      uInner: { value: radius * 1.45 },
      uOuter: { value: radius * 2.35 },
      uSeed: { value: look.seed },
      uOpacity: { value: 0.85 },
    }),
    [group.color, radius, look.seed],
  );

  // vòng sáng quanh hành tinh: vàng khi đang đứng, xanh/đỏ khi kề (đủ/chưa đủ), trắng khi chọn
  const haloColor = useMemo(() => {
    if (status === 'current') return GOLD;
    if (selected) return WHITE;
    if (status === 'adjacent') return unlocked ? GOOD : SIGNAL;
    return WHITE;
  }, [status, selected, unlocked]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (spinRef.current) spinRef.current.rotation.y += look.spin * dt;

    if (planetMat.current) {
      const u = planetMat.current.uniforms;
      u.uTime.value = t;
      const wantBright = status === 'far' && !hovered && !selected ? (playable ? 0.6 : 0.5) : 1;
      u.uBright.value = damp(u.uBright.value as number, wantBright, dt, 4);
    }
    if (atmoMat.current) {
      const u = atmoMat.current.uniforms;
      const want = status === 'far' && !hovered && !selected ? spec.atmosphere * 0.45 : spec.atmosphere;
      u.uOpacity.value = damp(u.uOpacity.value as number, want, dt, 4);
    }
    if (scaleRef.current) {
      const want = status === 'current' ? 1.28 : hovered || selected ? 1.14 : 1;
      const s = damp(scaleRef.current.scale.x, want, dt, 8);
      scaleRef.current.scale.setScalar(s);
    }
    if (haloRef.current && haloMat.current) {
      const visible = status === 'current' || status === 'adjacent' || selected || hovered;
      const pulse = status === 'current' ? 0.75 + 0.25 * Math.sin(t * 2.2) : selected ? 0.9 : 0.55;
      haloMat.current.opacity = damp(haloMat.current.opacity, visible ? pulse : 0, dt, 6);
      haloMat.current.color.copy(haloColor).multiplyScalar(status === 'current' ? 1.6 : selected ? 1.15 : 1.05);
      haloRef.current.rotation.z += dt * (status === 'current' ? 0.5 : 0.2);
      haloRef.current.visible = haloMat.current.opacity > 0.01;
    }
    if (labelRef.current) {
      const dist = state.camera.position.distanceTo(_world.set(...node.position));
      const focus = status === 'current' || hovered || selected;
      // toàn cảnh (camera rất xa): chỉ giữ nhãn hệ mặt trời + hành tinh đang đứng/chọn,
      // 22 tên nghề chồng lên nhau chỉ thành một đám chữ
      const farAway = dist > 520 && !focus;
      const want = farAway ? 0 : status === 'far' && !focus ? 0.5 : 1;
      const cur = Number(labelRef.current.style.opacity || 1);
      labelRef.current.style.opacity = damp(cur, want, dt, 5).toFixed(3);
      // camera càng lùi xa nhãn càng nhỏ (có sàn)
      const scale = THREE.MathUtils.clamp(120 / dist, 0.5, 1.05);
      labelRef.current.style.transform = `scale(${scale.toFixed(3)})`;
      labelRef.current.dataset.far = scale < 0.7 ? 'true' : 'false';
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hover(node.roleCode);
    document.body.style.cursor = 'pointer';
  };
  const onOut = () => {
    hover(null);
    document.body.style.cursor = '';
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    select(node.roleCode);
  };

  const name = shortPlanetName(node);
  const color = colorOf(node);

  return (
    <group position={node.position}>
      <group ref={scaleRef}>
        <group rotation-z={look.tilt}>
          <mesh ref={spinRef} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
            <sphereGeometry args={[radius, 64, 64]} />
            <shaderMaterial
              ref={planetMat}
              vertexShader={PLANET_VERT}
              fragmentShader={PLANET_FRAG}
              uniforms={uniforms}
            />
          </mesh>
          {look.ring && (
            <mesh rotation-x={Math.PI / 2 + 0.28}>
              <ringGeometry args={[radius * 1.45, radius * 2.35, 128, 1]} />
              <shaderMaterial
                vertexShader={RING_VERT}
                fragmentShader={RING_FRAG}
                uniforms={ringUniforms}
                transparent
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>

        {/* khí quyển: mặt sau của cầu lớn hơn, cộng màu → viền sáng mềm */}
        <mesh scale={1.17}>
          <sphereGeometry args={[radius, 48, 48]} />
          <shaderMaterial
            ref={atmoMat}
            vertexShader={ATMO_VERT}
            fragmentShader={ATMO_FRAG}
            uniforms={atmoUniforms}
            transparent
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {Array.from({ length: look.moons }, (_, i) => (
          <Moon key={i} index={i} planetRadius={radius} seed={look.seed} color={color} />
        ))}

        {/* vòng trạng thái: nằm ngang, hơi nghiêng, quay chậm */}
        <mesh ref={haloRef} rotation-x={Math.PI / 2 + 0.35} visible={false}>
          <ringGeometry args={[radius * 1.95, radius * 2.12, 96, 1]} />
          <meshBasicMaterial
            ref={haloMat}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      <Html
        position={[0, radius * 1.28 + 5.5, 0]}
        center
        zIndexRange={[5, 0]}
        pointerEvents="none"
      >
        <div ref={labelRef} className="galaxy-label" data-status={status}>
          <span className="galaxy-label__name">{name}</span>
          <span className="galaxy-label__tag" style={{ color }}>
            {group.short} · {node.bands}
            {!playable && ' · chưa mở'}
          </span>
        </div>
      </Html>
    </group>
  );
}

/* ── Vệ tinh ─────────────────────────────────────────────────────────── */

function Moon({
  index,
  planetRadius,
  seed,
  color,
}: {
  index: number;
  planetRadius: number;
  seed: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const orbit = useMemo(() => {
    const r = planetRadius * (1.9 + index * 0.75);
    return {
      r,
      speed: (0.45 - index * 0.12) * (seed % 2 < 1 ? 1 : -1),
      phase: seed * 0.7 + index * 2.1,
      tilt: 0.25 + ((seed * 13 + index * 7) % 10) / 25,
      size: planetRadius * (0.16 + ((seed * 3 + index) % 7) / 60),
    };
  }, [planetRadius, seed, index]);
  const tint = useMemo(() => new THREE.Color('#a9b2c4').lerp(new THREE.Color(color), 0.25), [color]);

  useFrame((state) => {
    if (!ref.current) return;
    const a = state.clock.elapsedTime * orbit.speed + orbit.phase;
    ref.current.position.set(
      Math.cos(a) * orbit.r,
      Math.sin(a) * orbit.r * Math.sin(orbit.tilt),
      Math.sin(a) * orbit.r * Math.cos(orbit.tilt),
    );
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[orbit.size, 20, 20]} />
      <meshStandardMaterial color={tint} roughness={0.95} metalness={0} />
    </mesh>
  );
}
