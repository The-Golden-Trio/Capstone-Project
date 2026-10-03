/**
 * Tàu của phi hành gia. Lúc rảnh thì lượn quanh hành tinh đang đứng; nhận
 * lệnh bay thì đi dọc cung đường (`routeCurve`) tới hành tinh mới, tới nơi
 * gọi `arrive()` — chính cảnh 3D chốt thời điểm "đã hạ cánh", không phải nút.
 *
 * Thân tàu ghép từ vài khối cơ bản, không có model tải ngoài.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { findPlanet } from '../galaxy';
import { useGalaxyStore, useGalaxyUiStore } from '../galaxyStore';
import { routeCurve } from './routeCurve';
import { shipWorldPos } from './sceneRefs';
import { GLOW_FRAG, GLOW_VERT } from './shaders';

const ENGINE = new THREE.Color('#8fd3ff');
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const _pos = new THREE.Vector3();
const _tan = new THREE.Vector3();
const _look = new THREE.Vector3();

export function Ship() {
  const ref = useRef<THREE.Group>(null);
  const engineMat = useRef<THREE.ShaderMaterial>(null);
  const engineRef = useRef<THREE.Group>(null);
  const angle = useRef(0);
  const settled = useRef(false);

  const engineUniforms = useMemo(() => ({ uColor: { value: ENGINE }, uIntensity: { value: 1 } }), []);

  useFrame((state, dt) => {
    const ship = ref.current;
    if (!ship) return;
    const { flight, arrive } = useGalaxyUiStore.getState();
    const current = useGalaxyStore.getState().currentRoleCode;
    const t = state.clock.elapsedTime;

    if (flight) {
      const curve = routeCurve(flight.from, flight.to);
      const raw = Math.min(1, (performance.now() - flight.startedAt) / flight.durationMs);
      const e = easeInOut(raw);
      curve.getPointAt(e, _pos);
      curve.getTangentAt(e, _tan);
      ship.position.copy(_pos);
      ship.lookAt(_look.copy(_pos).add(_tan));
      // nghiêng cánh theo độ cong, cho giống bay thật hơn là trượt trên ray
      ship.rotateZ(Math.sin(e * Math.PI) * 0.35);
      const thrust = 1 + Math.sin(raw * Math.PI) * 2.2;
      if (engineRef.current) engineRef.current.scale.setScalar(thrust);
      if (engineMat.current) engineMat.current.uniforms.uIntensity.value = 0.8 + thrust * 0.6;
      settled.current = false;
      if (raw >= 1) arrive();
    } else {
      const planet = findPlanet(current);
      if (!planet) return;
      const r = planet.look.radius * 1.28 * 1.75;
      angle.current += dt * 0.55;
      const a = angle.current;
      _pos.set(
        planet.position[0] + Math.cos(a) * r,
        planet.position[1] + Math.sin(a * 0.9) * 1.6 + 2.5,
        planet.position[2] + Math.sin(a) * r,
      );
      // vừa hạ cánh xong thì trượt mềm vào quỹ đạo thay vì nhảy cóc
      if (settled.current) ship.position.copy(_pos);
      else {
        ship.position.lerp(_pos, 1 - Math.exp(-dt * 4));
        if (ship.position.distanceTo(_pos) < 0.3) settled.current = true;
      }
      _tan.set(-Math.sin(a), 0, Math.cos(a));
      ship.lookAt(_look.copy(ship.position).add(_tan));
      ship.rotateZ(0.28);
      if (engineRef.current) engineRef.current.scale.setScalar(1 + 0.12 * Math.sin(t * 9));
      if (engineMat.current) engineMat.current.uniforms.uIntensity.value = 1;
    }
    shipWorldPos.copy(ship.position);
  });

  return (
    <Trail width={2.2} length={7} color="#8fd3ff" attenuation={(w) => w * w} decay={2}>
      <group ref={ref} scale={1.15}>
        {/* thân: hình nón nhọn, mũi hướng +Z (lookAt của Object3D quay +Z về đích) */}
        <group rotation-x={Math.PI / 2}>
          <mesh>
            <coneGeometry args={[1.05, 3.8, 6]} />
            <meshStandardMaterial color="#e8ecf5" metalness={0.65} roughness={0.32} />
          </mesh>
        </group>
        {/* cánh */}
        <mesh position={[0, -0.15, -0.55]}>
          <boxGeometry args={[4.4, 0.14, 1.5]} />
          <meshStandardMaterial color="#d4b06a" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* buồng lái phát sáng */}
        <mesh position={[0, 0.5, 0.45]}>
          <sphereGeometry args={[0.42, 14, 14]} />
          <meshBasicMaterial color="#9fe0ff" toneMapped={false} />
        </mesh>
        {/* lửa động cơ */}
        <group ref={engineRef} position={[0, 0, -2.3]}>
          <Billboard>
            <mesh>
              <planeGeometry args={[3.2, 3.2]} />
              <shaderMaterial
                ref={engineMat}
                vertexShader={GLOW_VERT}
                fragmentShader={GLOW_FRAG}
                uniforms={engineUniforms}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </Billboard>
        </group>
        <pointLight color={ENGINE} intensity={90} distance={30} decay={2} />
      </group>
    </Trail>
  );
}
