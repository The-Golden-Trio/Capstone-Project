/**
 * Cảnh 3D của bản đồ ngân hà. Đây là ranh giới React ↔ three: bên ngoài là
 * trang HTML bình thường (panel, HUD), bên trong là vật thể.
 *
 * Trang truyền vào những gì đã tính (đang đứng đâu, hành tinh nào bay được);
 * cảnh chỉ vẽ và báo lại tương tác qua `useGalaxyUiStore`.
 */
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { GALAXY, edgeBetween, isPlayable } from '../galaxy';
import { useGalaxyUiStore } from '../galaxyStore';
import { Background } from './Background';
import { CameraRig } from './CameraRig';
import { Planet, type PlanetStatus } from './Planet';
import { Routes } from './Routes';
import { Ship } from './Ship';
import { Sun } from './Sun';

interface GalaxyCanvasProps {
  current: string;
  /** Hành tinh kề đủ điều kiện bay tới. */
  unlocked: ReadonlySet<string>;
}

const BG = '#05081a';

export function GalaxyCanvas({ current, unlocked }: GalaxyCanvasProps) {
  const select = useGalaxyUiStore((s) => s.select);

  const statusOf = (roleCode: string): PlanetStatus => {
    if (roleCode === current) return 'current';
    return edgeBetween(current, roleCode) ? 'adjacent' : 'far';
  };

  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 50, near: 0.5, far: 6000, position: [160, 340, 820] }}
      onPointerMissed={() => select(null)}
      onCreated={({ gl }) => gl.setClearColor(BG)}
      style={{ background: BG }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <Background />
        {GALAXY.groups.map((group) => (
          <Sun key={group.short} group={group} />
        ))}
        <Routes current={current} unlocked={unlocked} />
        {GALAXY.nodes.map((node) => (
          <Planet
            key={node.roleCode}
            node={node}
            status={statusOf(node.roleCode)}
            unlocked={unlocked.has(node.roleCode)}
            playable={isPlayable(node.roleCode)}
          />
        ))}
        <Ship />
        <CameraRig />
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={1.05} luminanceThreshold={0.58} luminanceSmoothing={0.3} radius={0.72} />
          <Vignette eskil={false} offset={0.18} darkness={0.72} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
