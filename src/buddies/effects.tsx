import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ============ util: deterministic pseudo-random per index ============ */
function rnd(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ================= SAKURA PETALS ================= */
export function SakuraTrail() {
  const group = useRef<THREE.Group>(null);
  const N = 26;
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      const speed = 0.55 + rnd(i, 1) * 0.5;
      const life = ((t * speed + rnd(i, 2) * 10) % 1.6) / 1.6; // 0..1
      const side = rnd(i, 3) * 2 - 1;
      child.position.set(
        side * (0.4 + life * 2.2) + Math.sin(t * 2 + i) * 0.3,
        0.6 + life * 2.6 + Math.sin(t * 3 + i * 2) * 0.25,
        -1.2 - life * 4.5
      );
      child.rotation.set(t * 2 + i, t * 1.5 + i * 0.7, t * 2.5 + i * 1.3);
      const s = 1 - life * 0.65;
      child.scale.setScalar(s);
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: N }, (_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.3, 0.06, 0.22]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#FFC9DC" : i % 3 === 1 ? "#F9A8C5" : "#FADCE8"}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ================= SMOKE PUFFS ================= */
export function SmokeTrail() {
  const group = useRef<THREE.Group>(null);
  const N = 18;
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      const life = ((t * 0.7 + rnd(i, 5) * 10) % 1.8) / 1.8;
      const side = rnd(i, 6) * 2 - 1;
      child.position.set(
        side * (0.3 + life * 1.3),
        0.5 + life * 3.2,
        -1.0 - life * 4.0
      );
      child.rotation.set(i, t * 0.8 + i, i * 2);
      const s = 0.4 + life * 1.5;
      child.scale.setScalar(s);
      const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.opacity = 0.55 * (1 - life);
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: N }, (_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#D8D8D8" : "#B8B8B8"}
            transparent
            opacity={0.5}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ================= NYAN RAINBOW ================= */
const RAINBOW = ["#FF3B3B", "#FF9F2E", "#FFE433", "#4DE24D", "#3FA9F5", "#9B5AFF"];
export function RainbowTrail() {
  const group = useRef<THREE.Group>(null);
  const SEG = 10;
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((seg, s) => {
      // each segment is a group of 6 bars; wave like nyan cat
      seg.position.y = 2.0 + Math.sin(t * 6 - s * 0.9) * 0.22;
      seg.position.z = -1.6 - s * 0.85;
      const fade = 1 - s / SEG;
      seg.scale.set(fade * 0.65 + 0.5, 1, 1);
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: SEG }, (_, s) => (
        <group key={s}>
          {RAINBOW.map((c, i) => (
            <mesh key={c} position={[0, (2.5 - i) * 0.3, 0]}>
              <boxGeometry args={[1.5, 0.3, 0.85]} />
              <meshStandardMaterial
                color={c}
                emissive={c}
                emissiveIntensity={0.35}
                roughness={0.7}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ================= WATER RIVER FLOW (pita mengalir tipis) ================= */
const WATER_COLORS = ["#C9EFFF", "#7FD4FF", "#3FA9F5"];
export function WaterTrail() {
  const group = useRef<THREE.Group>(null);
  const foam = useRef<THREE.Group>(null);
  const SEG = 12;
  const FOAM = 14;
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.children.forEach((seg, s) => {
        // mengalir bergelombang seperti sungai (lebih kalem dari rainbow)
        seg.position.y = 0.55 + Math.sin(t * 4 - s * 0.8) * 0.14;
        seg.position.x = Math.sin(t * 2.2 - s * 0.55) * 0.3;
        seg.position.z = -1.4 - s * 0.8;
        const fade = 1 - s / SEG;
        seg.scale.set(fade * 0.5 + 0.55, 1, 1);
      });
    }
    if (foam.current) {
      foam.current.children.forEach((child, i) => {
        // buih mengalir ke belakang mengikuti arus
        const speed = 0.9 + rnd(i, 15) * 0.5;
        const life = ((t * speed + rnd(i, 16) * 10) % 1.4) / 1.4;
        const z = -1.4 - life * 9.0;
        const s = -z / 0.8 - 1.75; // posisi segmen untuk ikuti gelombang
        child.position.set(
          Math.sin(t * 2.2 - s * 0.55) * 0.3 + (rnd(i, 17) * 2 - 1) * 0.45,
          0.88 + Math.sin(t * 4 - s * 0.8) * 0.14,
          z
        );
        child.scale.setScalar((1 - life) * 0.8 + 0.3);
        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = 0.85 * (1 - life * 0.7);
      });
    }
  });
  return (
    <group>
      <group ref={group}>
        {Array.from({ length: SEG }, (_, s) => (
          <group key={s}>
            {/* 3 lapis air tipis */}
            {WATER_COLORS.map((c, i) => (
              <mesh key={c} position={[0, (1 - i) * 0.18, 0]}>
                <boxGeometry args={[1.3, 0.18, 0.8]} />
                <meshStandardMaterial
                  color={c}
                  transparent
                  opacity={0.75}
                  roughness={0.15}
                  emissive="#5AC8FF"
                  emissiveIntensity={0.2}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      {/* buih putih mengalir ke belakang di permukaan */}
      <group ref={foam}>
        {Array.from({ length: FOAM }, (_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.3, 0.12, 0.35]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ================= GHOST RIDER FIRE (jalur di bawah) ================= */
export function FireTrail() {
  const group = useRef<THREE.Group>(null);
  const N = 24;
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      const life = ((t * 1.1 + rnd(i, 11) * 10) % 1.5) / 1.5;
      const side = (rnd(i, 12) * 2 - 1) * 0.55;
      // api menjalar di tanah ke belakang, lidah api naik & mengecil
      const flick = Math.sin(t * 14 + i * 3) * 0.12;
      child.position.set(
        side + flick,
        0.18 + life * 1.4 * (0.4 + rnd(i, 13) * 0.6),
        -0.8 - life * 5.0
      );
      child.rotation.y = t * 4 + i;
      const s = (1 - life) * (0.7 + rnd(i, 14) * 0.5) + 0.15;
      child.scale.set(s, s * (1.3 + flick), s);
      const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.opacity = 0.9 * (1 - life * 0.75);
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: N }, (_, i) => {
        const c =
          i % 4 === 0 ? "#FFE43A" : i % 4 === 1 ? "#FF9D1E" : i % 4 === 2 ? "#FF5A1E" : "#E8341C";
        return (
          <mesh key={i}>
            <boxGeometry args={[0.5, 0.7, 0.5]} />
            <meshStandardMaterial
              color={c}
              emissive={c}
              emissiveIntensity={0.9}
              transparent
              opacity={0.85}
              roughness={0.6}
            />
          </mesh>
        );
      })}
      {/* bara jalur di tanah */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={`ember-${i}`} position={[((i % 3) - 1) * 0.5, 0.06, -1.0 - i * 0.65]}>
          <boxGeometry args={[0.6, 0.1, 0.55]} />
          <meshStandardMaterial
            color="#FF6B1E"
            emissive="#FF4500"
            emissiveIntensity={1.2}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ================= Registry ================= */
export type EffectDef = {
  id: string;
  name: string;
  emoji: string;
  Comp: React.FC;
};

export const EFFECTS: EffectDef[] = [
  { id: "sakura", name: "Sakura", emoji: "🌸", Comp: SakuraTrail },
  { id: "smoke", name: "Asap", emoji: "💨", Comp: SmokeTrail },
  { id: "rainbow", name: "Rainbow", emoji: "🌈", Comp: RainbowTrail },
  { id: "water", name: "Water", emoji: "💧", Comp: WaterTrail },
  { id: "fire", name: "Api Rider", emoji: "🔥", Comp: FireTrail },
];
