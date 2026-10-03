/**
 * Một hệ mặt trời (nhóm nghề): mặt trời phát sáng ở tâm, các vòng quỹ đạo
 * mờ quanh nó, và nhãn tên hệ.
 *
 * Hành tinh dùng shader riêng và tự lấy vị trí mặt trời của hệ mình để tính
 * sáng/tối; `pointLight` ở đây chỉ để chiếu vệ tinh và tàu (vật liệu chuẩn).
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { orbitPoints, type GalaxyGroup } from '../galaxy';
import { GLOW_FRAG, GLOW_VERT } from './shaders';

const SUN_RADIUS = 8;

export function Sun({ group }: { group: GalaxyGroup }) {
  const glowMat = useRef<THREE.ShaderMaterial>(null);
  const color = useMemo(() => new THREE.Color(group.color), [group.color]);
  const uniforms = useMemo(
    () => ({ uColor: { value: color }, uIntensity: { value: 1 } }),
    [color],
  );

  useFrame((state) => {
    if (!glowMat.current) return;
    const t = state.clock.elapsedTime;
    glowMat.current.uniforms.uIntensity.value = 0.92 + 0.08 * Math.sin(t * 0.9 + group.sun[0]);
  });

  const rings = useMemo(() => group.orbits.map((r) => orbitPoints(group, r)), [group]);

  return (
    <group>
      {/* vòng quỹ đạo: mảnh, mờ, màu hệ — đủ để thấy "hành tinh nằm trên vòng nào" */}
      {rings.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={group.color}
          lineWidth={1}
          transparent
          opacity={0.16}
          depthWrite={false}
          toneMapped={false}
        />
      ))}
    <group position={group.sun}>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS, 40, 40]} />
        <meshBasicMaterial color={color.clone().lerp(new THREE.Color('#ffffff'), 0.55).multiplyScalar(1.9)} toneMapped={false} />
      </mesh>
      <Billboard>
        <mesh>
          <planeGeometry args={[SUN_RADIUS * 7.5, SUN_RADIUS * 7.5]} />
          <shaderMaterial
            ref={glowMat}
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
      <pointLight color={color} intensity={2600} distance={260} decay={2} />

      <Html position={[0, -SUN_RADIUS - 9, 0]} center zIndexRange={[4, 0]} pointerEvents="none">
        <div className="galaxy-sun-label" style={{ color: group.color }}>
          Hệ mặt trời {group.label}
        </div>
      </Html>
    </group>
    </group>
  );
}
