/**
 * Điều khiển camera: OrbitControls cho người dùng kéo/cuộn, cộng một lớp
 * "đạo diễn" tween camera khi mở trang (bay từ xa vào), khi chọn hành tinh,
 * khi bấm "Về vị trí" và khi tàu đang bay (camera bám theo tàu).
 *
 * Tween không khoá controls: người dùng kéo một cái là đạo diễn nhường quyền
 * ngay (kể cả giữa intro). Chỉ lúc tàu đang bay mới khoá, vì camera phải bám
 * tàu. Rảnh quá 7 giây thì tự xoay chậm cho có sự sống.
 */
import { useEffect, useRef, type ComponentRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { findPlanet, type GalaxyNode } from '../galaxy';
import { useGalaxyStore, useGalaxyUiStore } from '../galaxyStore';
import { shipWorldPos } from './sceneRefs';

type OrbitControlsImpl = ComponentRef<typeof OrbitControls>;

const IDLE_MS = 7000;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface Tween {
  fromPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toPos: THREE.Vector3;
  toTarget: THREE.Vector3;
  start: number;
  duration: number;
}

const _dir = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _tgt = new THREE.Vector3();

/** Góc nhìn "đứng ngoài rìa ngân hà nhìn vào" cho một hành tinh. */
function planetView(node: GalaxyNode): { pos: THREE.Vector3; target: THREE.Vector3 } {
  const target = new THREE.Vector3(...node.position);
  const out = new THREE.Vector3(node.position[0], 0, node.position[2]);
  if (out.lengthSq() < 1) out.set(0, 0, 1);
  out.normalize();
  const pos = target.clone().addScaledVector(out, 118).add(new THREE.Vector3(0, 42, 0));
  return { pos, target };
}

/** Toàn cảnh: nhìn cả dải ngân hà từ trên chếch xuống. */
const OVERVIEW = {
  pos: new THREE.Vector3(60, 270, 400),
  target: new THREE.Vector3(0, -10, 0),
};

export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const tween = useRef<Tween | null>(null);
  const lastInteraction = useRef(performance.now());
  const wasFlying = useRef(false);

  const current = useGalaxyStore((s) => s.currentRoleCode);
  const selected = useGalaxyUiStore((s) => s.selected);
  const homeRequest = useGalaxyUiStore((s) => s.homeRequest);
  const overviewRequest = useGalaxyUiStore((s) => s.overviewRequest);

  const flyTo = (pos: THREE.Vector3, target: THREE.Vector3, duration: number) => {
    const c = controls.current;
    if (!c) return;
    tween.current = {
      fromPos: camera.position.clone(),
      fromTarget: c.target.clone(),
      toPos: pos,
      toTarget: target,
      start: performance.now(),
      duration,
    };
  };

  // mở trang: đặt camera tít ngoài xa rồi lướt vào hành tinh đang đứng
  useEffect(() => {
    const node = findPlanet(current);
    const c = controls.current;
    if (!node || !c) return;
    const view = planetView(node);
    camera.position.copy(view.target).add(new THREE.Vector3(120, 260, 640));
    c.target.copy(view.target);
    c.update();
    flyTo(view.pos, view.target, 3400);
    // chỉ chạy lúc mount — đổi hành tinh sau đó do nhánh "hạ cánh" bên dưới lo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // chọn hành tinh: giữ nguyên góc nhìn, dời tâm sang hành tinh đó, kéo lại gần vừa phải
  useEffect(() => {
    const node = findPlanet(selected);
    const c = controls.current;
    if (!node || !c) return;
    if (useGalaxyUiStore.getState().flight) return;
    const target = new THREE.Vector3(...node.position);
    _dir.copy(camera.position).sub(c.target);
    const dist = THREE.MathUtils.clamp(_dir.length(), 85, 170);
    _dir.normalize();
    if (_dir.y < 0.25) _dir.y = 0.25; // đừng nhìn từ dưới lên
    const pos = target.clone().addScaledVector(_dir.normalize(), dist);
    flyTo(pos, target, 1100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // "Về vị trí"
  useEffect(() => {
    if (homeRequest === 0) return;
    const node = findPlanet(current);
    if (!node) return;
    const view = planetView(node);
    flyTo(view.pos, view.target, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeRequest]);

  // "Toàn cảnh"
  useEffect(() => {
    if (overviewRequest === 0) return;
    flyTo(OVERVIEW.pos.clone(), OVERVIEW.target.clone(), 1800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overviewRequest]);

  useFrame(() => {
    const c = controls.current;
    if (!c) return;
    const now = performance.now();
    const { flight } = useGalaxyUiStore.getState();

    if (flight) {
      // bám theo tàu: tâm = tàu, camera lùi ra sau chếch lên, mượt bằng lerp
      wasFlying.current = true;
      tween.current = null;
      c.enabled = false;
      _dir.copy(camera.position).sub(c.target);
      if (_dir.lengthSq() < 1) _dir.set(0, 0.5, 1);
      _dir.normalize();
      _dir.y = Math.max(_dir.y, 0.35);
      _pos.copy(shipWorldPos).addScaledVector(_dir.normalize(), 60);
      _tgt.copy(shipWorldPos);
      camera.position.lerp(_pos, 0.045);
      c.target.lerp(_tgt, 0.09);
      c.update();
      return;
    }

    if (wasFlying.current) {
      // vừa hạ cánh: lướt về góc nhìn chuẩn của hành tinh mới
      wasFlying.current = false;
      const node = findPlanet(useGalaxyStore.getState().currentRoleCode);
      if (node) {
        const view = planetView(node);
        flyTo(view.pos, view.target, 1700);
      }
    }

    const tw = tween.current;
    if (tw) {
      const t = Math.min(1, (now - tw.start) / tw.duration);
      const e = easeInOut(t);
      camera.position.lerpVectors(tw.fromPos, tw.toPos, e);
      c.target.lerpVectors(tw.fromTarget, tw.toTarget, e);
      c.update();
      if (t >= 1) {
        tween.current = null;
        lastInteraction.current = now;
      }
      return;
    }

    c.enabled = true;

    c.autoRotate = now - lastInteraction.current > IDLE_MS && !useGalaxyUiStore.getState().selected;
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      enablePan={false}
      minDistance={28}
      maxDistance={900}
      rotateSpeed={0.55}
      zoomSpeed={0.8}
      autoRotateSpeed={0.22}
      maxPolarAngle={Math.PI * 0.62}
      onStart={() => {
        // người dùng chạm vào là đạo diễn nhường quyền ngay, kể cả giữa intro
        lastInteraction.current = performance.now();
        tween.current = null;
      }}
      onEnd={() => {
        lastInteraction.current = performance.now();
      }}
    />
  );
}
