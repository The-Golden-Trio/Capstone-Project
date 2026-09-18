import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { PROPS, PX, renderSprite, tileCanvas } from './pixel';
import { CHARACTERS, frameFor, SPRITE_H, SPRITE_W } from './sprites';
import type { NpcId, Placement, Stage } from './stage';
import {
  TILE,
  faceToward,
  moveWithCollision,
  routeThrough,
  stepAlongRoute,
  tileCenter,
  withinReach,
  type Facing,
  type Point,
  type Walker,
  type World,
} from './world';

/** Pixel thế giới mỗi giây. Người chơi nhanh hơn NPC một chút để không phải đợi. */
const PLAYER_SPEED = 150;
const NPC_SPEED = 120;
/** Người chơi không chen vào chỗ NPC đang đứng — gần hơn mức này thì dừng. */
const NPC_RADIUS = 20;

export type Dir = 'up' | 'down' | 'left' | 'right';

/** Thứ người chơi có thể tương tác lúc này. */
export type Target =
  | { kind: 'npc'; id: NpcId; prompt: string }
  | { kind: 'spot'; id: string; prompt: string }
  | null;

/** Lệnh từ kịch bản xuống cảnh — NPC đi đâu, quay mặt về đâu, phím ảo. */
export interface OfficeHandle {
  moveNpc: (id: NpcId, placement: Placement) => void;
  faceNpcToPlayer: (id: NpcId) => void;
  press: (dir: Dir) => void;
  release: (dir: Dir) => void;
  interact: () => void;
}

interface OfficeCanvasProps {
  world: World;
  stage: Stage;
  /** Nhận phím không — tắt khi đang hội thoại hay làm hoạt động. */
  active: boolean;
  target: Target;
  /** `reach`: tới gần là kích; `press`: phải bấm E. */
  targetMode: 'press' | 'reach';
  onTrigger: () => void;
  onNpcArrive: (id: NpcId) => void;
  className?: string;
}

interface Sim {
  player: { pos: Point; facing: Facing; walking: boolean };
  npcs: Record<NpcId, Walker & { walking: boolean }>;
  keys: Set<Dir>;
  tick: number;
  last: number;
  /** Đã kích `reach` cho target hiện tại chưa — tránh bắn liên tục. */
  reachFired: boolean;
}

const DIR_OF: Record<string, Dir> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
};

const INTERACT_KEYS = new Set(['e', 'E', 'Enter', ' ']);

/** Đang gõ vào ô nhập thì phím thuộc về ô đó, không phải cảnh. */
function typingSomewhere(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    (el as HTMLElement).isContentEditable
  );
}

/**
 * Cảnh văn phòng: vòng lặp game, bàn phím, và vẽ.
 *
 * Trạng thái mô phỏng nằm trong ref, không phải React state — vị trí đổi 60
 * lần mỗi giây, render lại cây React theo nhịp đó là vô nghĩa. React chỉ biết
 * tới những gì đổi theo nhịp kịch bản: đang tương tác được với ai, có nhận
 * phím không.
 */
export const OfficeCanvas = forwardRef<OfficeHandle, OfficeCanvasProps>(
  function OfficeCanvas(
    { world, stage, active, target, targetMode, onTrigger, onNpcArrive, className },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const groundRef = useRef<HTMLCanvasElement | null>(null);

    const sim = useRef<Sim>({
      player: {
        pos: tileCenter(stage.spawn),
        facing: stage.spawnFacing,
        walking: false,
      },
      npcs: {
        an: { pos: tileCenter(stage.cast.an.at), facing: stage.cast.an.facing, route: [], walking: false },
        ha: { pos: tileCenter(stage.cast.ha.at), facing: stage.cast.ha.facing, route: [], walking: false },
      },
      keys: new Set(),
      tick: 0,
      last: 0,
      reachFired: false,
    });

    // Callback và props đổi theo nhịp React; vòng lặp đọc bản mới nhất qua ref.
    const latest = useRef({ active, target, targetMode, onTrigger, onNpcArrive });
    latest.current = { active, target, targetMode, onTrigger, onNpcArrive };

    // Đổi target thì cho phép kích `reach` lại từ đầu.
    useEffect(() => {
      sim.current.reachFired = false;
    }, [target]);

    // Mất quyền nhận phím thì thả hết, kẻo nhân vật đi mãi vào tường.
    useEffect(() => {
      if (!active) sim.current.keys.clear();
    }, [active]);

    /* ── Điểm của target: đầu NPC hay điểm trên sàn ── */
    const targetPoint = (s: Sim, t: Target): Point | null => {
      if (!t) return null;
      if (t.kind === 'npc') return s.npcs[t.id].pos;
      const spot = stage.spots[t.id];
      return spot ? tileCenter(spot.at) : null;
    };

    const tryInteract = () => {
      const { active: on, target: t, targetMode: mode, onTrigger: fire } = latest.current;
      if (!on || !t || mode !== 'press') return;
      const point = targetPoint(sim.current, t);
      if (point && withinReach(sim.current.player.pos, point)) fire();
    };

    /** Hướng NPC quay về khi đi hết lộ trình. */
    const finalFacing = useRef<Record<NpcId, Facing>>({ an: 'down', ha: 'down' });

    useImperativeHandle(ref, () => ({
      moveNpc: (id, placement) => {
        const npc = sim.current.npcs[id];
        npc.route = routeThrough([...(placement.via ?? []), placement.at]);
        // Tới nơi rồi thì quay đúng hướng; lưu tạm ở facing cuối lộ trình.
        npc.walking = npc.route.length > 0;
        finalFacing.current[id] = placement.facing;
        if (!npc.walking) npc.facing = placement.facing;
      },
      faceNpcToPlayer: (id) => {
        const npc = sim.current.npcs[id];
        npc.facing = faceToward(npc.pos, sim.current.player.pos);
      },
      press: (dir) => {
        if (latest.current.active) sim.current.keys.add(dir);
      },
      release: (dir) => sim.current.keys.delete(dir),
      interact: tryInteract,
    }));

    /* ── Bàn phím ── */
    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (!latest.current.active || typingSomewhere()) return;
        const dir = DIR_OF[e.key];
        if (dir) {
          sim.current.keys.add(dir);
          e.preventDefault();
          return;
        }
        if (INTERACT_KEYS.has(e.key) && !e.repeat) {
          e.preventDefault();
          tryInteract();
        }
      };
      const up = (e: KeyboardEvent) => {
        const dir = DIR_OF[e.key];
        if (dir) sim.current.keys.delete(dir);
      };
      window.addEventListener('keydown', down);
      window.addEventListener('keyup', up);
      return () => {
        window.removeEventListener('keydown', down);
        window.removeEventListener('keyup', up);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Móc gỡ lỗi, chỉ ở dev: đọc vị trí từ console hay script kiểm thử ── */
    useEffect(() => {
      if (!import.meta.env.DEV) return;
      const w = window as unknown as { __office?: unknown };
      w.__office = {
        player: () => ({ ...sim.current.player.pos }),
        npc: (id: NpcId) => ({ ...sim.current.npcs[id].pos }),
      };
      return () => {
        delete w.__office;
      };
    }, []);

    /* ── Nền tĩnh: vẽ một lần ── */
    const ground = useMemo(() => {
      const canvas = document.createElement('canvas');
      canvas.width = world.width;
      canvas.height = world.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return canvas;
      ctx.imageSmoothingEnabled = false;
      for (let row = 0; row < world.rows; row++) {
        for (let col = 0; col < world.cols; col++) {
          const kind = world.tiles[row][col];
          // Vật cao vẽ ở lớp sau; ở đây chỉ trải sàn dưới nó.
          const groundKind = PROPS.has(kind) ? (kind === 'table' ? 'carpet' : 'floor') : kind;
          ctx.drawImage(tileCanvas(groundKind, col, row), col * TILE, row * TILE);
        }
      }
      // Nhãn khu vực, mờ, như sơn trên sàn.
      ctx.font = 'bold 9px ui-monospace, "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.textBaseline = 'top';
      for (const label of stage.labels) {
        ctx.fillText(label.text, label.at.col * TILE + 4, label.at.row * TILE + 4);
      }
      return canvas;
    }, [world, stage]);
    groundRef.current = ground;

    /* ── Vòng lặp ── */
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      ctx.imageSmoothingEnabled = false;

      let raf = 0;

      const update = (dt: number) => {
        const s = sim.current;
        const { active: on, target: t, targetMode: mode } = latest.current;

        // Người chơi.
        let dx = 0;
        let dy = 0;
        if (on) {
          if (s.keys.has('left')) dx -= 1;
          if (s.keys.has('right')) dx += 1;
          if (s.keys.has('up')) dy -= 1;
          if (s.keys.has('down')) dy += 1;
        }
        const moving = dx !== 0 || dy !== 0;
        if (moving) {
          const norm = Math.hypot(dx, dy);
          const step = PLAYER_SPEED * dt;
          const bumpsNpc = (p: Point) =>
            (['an', 'ha'] as const).some(
              (id) => Math.hypot(p.x - s.npcs[id].pos.x, p.y - s.npcs[id].pos.y) < NPC_RADIUS,
            );
          // Từng trục một, như với tường: chạm người thì trượt dọc theo họ.
          const tryX = moveWithCollision(world, s.player.pos, (dx / norm) * step, 0);
          if (!bumpsNpc(tryX)) s.player.pos = tryX;
          const tryY = moveWithCollision(world, s.player.pos, 0, (dy / norm) * step);
          if (!bumpsNpc(tryY)) s.player.pos = tryY;
          s.player.facing =
            Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        }
        s.player.walking = moving;

        // NPC theo lộ trình.
        for (const id of ['an', 'ha'] as const) {
          const npc = s.npcs[id];
          if (npc.route.length === 0) continue;
          const { walker, arrived } = stepAlongRoute(npc, NPC_SPEED * dt);
          npc.pos = walker.pos;
          npc.facing = walker.facing;
          npc.route = walker.route;
          if (arrived) {
            npc.walking = false;
            npc.facing = finalFacing.current[id];
            latest.current.onNpcArrive(id);
          }
        }

        // Tới gần điểm `reach` thì tự kích, một lần cho mỗi target.
        if (on && t && mode === 'reach' && !s.reachFired) {
          const point = targetPoint(s, t);
          if (point && withinReach(s.player.pos, point)) {
            s.reachFired = true;
            latest.current.onTrigger();
          }
        }

        s.tick += 1;
      };

      const drawCharacter = (
        who: keyof typeof CHARACTERS,
        pos: Point,
        facing: Facing,
        walking: boolean,
      ) => {
        const character = CHARACTERS[who];
        const { frame, mirror } = frameFor(character.sheet, facing, walking, sim.current.tick);
        const sprite = renderSprite(character.id, frame, character.palette, mirror);
        // Bóng dưới chân, để nhân vật "đứng" trên sàn thay vì trôi.
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y - 1, 9, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(
          sprite,
          Math.round(pos.x - (SPRITE_W * PX) / 2),
          Math.round(pos.y - SPRITE_H * PX),
        );
      };

      const drawTag = (text: string, x: number, y: number, accent: boolean) => {
        ctx.font = 'bold 8px ui-monospace, "JetBrains Mono", monospace';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        const w = ctx.measureText(text).width + 8;
        ctx.fillStyle = accent ? 'rgba(212, 175, 55, 0.92)' : 'rgba(10, 16, 38, 0.82)';
        ctx.fillRect(Math.round(x - w / 2), Math.round(y - 6), Math.round(w), 12);
        ctx.fillStyle = accent ? '#0a1026' : '#e8ecf3';
        ctx.fillText(text, Math.round(x), Math.round(y));
      };

      const drawPrompt = (point: Point, npcHeight: boolean) => {
        const y =
          point.y - (npcHeight ? SPRITE_H * PX + 12 : 22) + Math.sin(sim.current.tick / 8) * 1.5;
        ctx.fillStyle = '#e8ecf3';
        ctx.fillRect(Math.round(point.x - 7), Math.round(y - 7), 14, 14);
        ctx.fillStyle = '#0a1026';
        ctx.font = 'bold 9px ui-monospace, "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E', Math.round(point.x), Math.round(y + 0.5));
      };

      const render = () => {
        const s = sim.current;
        ctx.clearRect(0, 0, world.width, world.height);
        if (groundRef.current) ctx.drawImage(groundRef.current, 0, 0);

        // Lớp có chiều sâu: vật cao + nhân vật, vẽ theo chân từ trên xuống.
        const layer: Array<{ y: number; draw: () => void }> = [];
        for (let row = 0; row < world.rows; row++) {
          for (let col = 0; col < world.cols; col++) {
            const kind = world.tiles[row][col];
            if (!PROPS.has(kind)) continue;
            layer.push({
              y: (row + 1) * TILE,
              draw: () => ctx.drawImage(tileCanvas(kind, col, row), col * TILE, row * TILE),
            });
          }
        }
        for (const id of ['an', 'ha'] as const) {
          const npc = s.npcs[id];
          layer.push({
            y: npc.pos.y,
            draw: () => drawCharacter(id, npc.pos, npc.facing, npc.route.length > 0),
          });
        }
        layer.push({
          y: s.player.pos.y,
          draw: () => drawCharacter('player', s.player.pos, s.player.facing, s.player.walking),
        });
        layer.sort((a, b) => a.y - b.y);
        for (const item of layer) item.draw();

        // Bảng tên nổi trên đầu.
        for (const id of ['an', 'ha'] as const) {
          const npc = s.npcs[id];
          drawTag(CHARACTERS[id].label, npc.pos.x, npc.pos.y - SPRITE_H * PX - 8, false);
        }
        drawTag('BẠN', s.player.pos.x, s.player.pos.y - SPRITE_H * PX - 8, true);

        // Gợi ý bấm E khi đứng cạnh thứ tương tác được.
        const { active: on, target: t, targetMode: mode } = latest.current;
        if (on && t && mode === 'press') {
          const point = targetPoint(s, t);
          if (point && withinReach(s.player.pos, point)) drawPrompt(point, t.kind === 'npc');
        }
      };

      const loop = (time: number) => {
        const s = sim.current;
        const dt = s.last ? Math.min((time - s.last) / 1000, 0.05) : 0;
        s.last = time;
        update(dt);
        render();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }, [world, stage]);

    return (
      <canvas
        ref={canvasRef}
        width={world.width}
        height={world.height}
        className={className}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          imageRendering: 'pixelated',
        }}
        aria-label="Cảnh văn phòng — dùng phím mũi tên hoặc WASD để đi, E để tương tác"
      />
    );
  },
);
