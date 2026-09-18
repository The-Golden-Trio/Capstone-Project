/**
 * Nền vũ trụ: tinh vân (mặt trong một cầu rất lớn), hai lớp sao nhấp nháy và
 * một lớp bụi lơ lửng giữa các hành tinh để camera xoay có parallax.
 *
 * Toàn bộ là `Points` + shader; số sao cố định theo seed nên lần nào mở cũng
 * đúng bầu trời đó.
 */
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard } from '@react-three/drei';
import { GLOW_FRAG, GLOW_VERT, SKY_FRAG, SKY_VERT, STARS_FRAG, STARS_VERT } from './shaders';

/** PRNG có seed — trùng với script build để cùng một "seed" ra cùng kết quả. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_TINTS = ['#ffffff', '#dfe8ff', '#ffe9c7', '#c8f5ff', '#ffd6e8', '#f0d79a'];

interface StarLayerProps {
  count: number;
  seed: number;
  /** Bán kính vỏ cầu [min, max]; sao ở xa hơn hành tinh nhiều. */
  shell: [number, number];
  size: [number, number];
  opacity: number;
  /** 1 = nhỏ dần theo khoảng cách (bụi gần), 0 = cỡ cố định (sao xa). */
  attenuate: number;
  /** Ép vào một đĩa dẹt thay vì vỏ cầu (cho bụi giữa các hành tinh). */
  disk?: boolean;
  drift?: number;
}

function StarLayer({ count, seed, shell, size, opacity, attenuate, disk = false, drift = 0 }: StarLayerProps) {
  const ref = useRef<THREE.Points>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  const geometry = useMemo(() => {
    const r = rng(seed);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const ph = new Float32Array(count);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      if (disk) {
        const rad = shell[0] + Math.sqrt(r()) * (shell[1] - shell[0]);
        const a = r() * Math.PI * 2;
        pos[i * 3] = Math.cos(a) * rad;
        pos[i * 3 + 1] = (r() - 0.5) * Math.min(110, shell[1] * 0.5);
        pos[i * 3 + 2] = Math.sin(a) * rad;
      } else {
        const rad = shell[0] + r() * (shell[1] - shell[0]);
        const theta = r() * Math.PI * 2;
        const phi = Math.acos(2 * r() - 1);
        pos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = rad * Math.cos(phi);
      }
      c.set(STAR_TINTS[Math.floor(r() * STAR_TINTS.length)]).multiplyScalar(0.6 + r() * 0.4);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      sz[i] = size[0] + Math.pow(r(), 2.2) * (size[1] - size[0]);
      ph[i] = r() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
    return g;
  }, [count, seed, shell, size, disk]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: dpr },
      uAttenuate: { value: attenuate },
      uOpacity: { value: opacity },
    }),
    [dpr, attenuate, opacity],
  );

  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    if (ref.current && drift) ref.current.rotation.y += dt * drift;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={STARS_VERT}
        fragmentShader={STARS_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function NebulaSky() {
  const uniforms = useMemo(() => ({ uIntensity: { value: 0.5 }, uTime: { value: 0 } }), []);
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh scale={2200} renderOrder={-10}>
      <sphereGeometry args={[1, 48, 32]} />
      <shaderMaterial
        vertexShader={SKY_VERT}
        fragmentShader={SKY_FRAG}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Lõi thiên hà ở gốc toạ độ: quầng sáng vàng nhạt rất loãng + một đám sao dày
 * — neo bố cục, để 7 hệ mặt trời trông như đang quay quanh một tâm chung.
 */
function GalacticCore() {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color('#e8c98a') }, uIntensity: { value: 0.11 } }),
    [],
  );
  return (
    <group>
      <Billboard>
        <mesh>
          <planeGeometry args={[440, 440]} />
          <shaderMaterial
            vertexShader={GLOW_VERT}
            fragmentShader={GLOW_FRAG}
            uniforms={uniforms}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
      <StarLayer count={900} seed={53} shell={[4, 120]} size={[2, 6]} opacity={0.55} attenuate={1} disk drift={0.01} />
    </group>
  );
}

export function Background() {
  return (
    <>
      <NebulaSky />
      <GalacticCore />
      {/* sao xa: nhiều, nhỏ, cỡ cố định — nhấp nháy nhẹ */}
      <StarLayer count={4200} seed={11} shell={[1200, 1800]} size={[1.1, 2.6]} opacity={0.85} attenuate={0} />
      {/* sao sáng: ít, to hơn, có sắc — điểm nhấn */}
      <StarLayer count={260} seed={23} shell={[1150, 1700]} size={[3, 5.5]} opacity={1} attenuate={0} />
      {/* bụi giữa các hệ: to, mờ, trôi chậm — tạo chiều sâu khi xoay */}
      <StarLayer count={900} seed={37} shell={[30, 560]} size={[4, 11]} opacity={0.3} attenuate={1} disk drift={0.005} />
    </>
  );
}
