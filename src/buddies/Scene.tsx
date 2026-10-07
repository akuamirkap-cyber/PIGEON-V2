import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { SKINS } from "./characters";
import { EFFECTS } from "./effects";

/* Crossy Road style grass platform (checker tiles) */
function Platform() {
  const tiles: React.ReactNode[] = [];
  const n = 4;
  const size = 2.2;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const even = (i + j) % 2 === 0;
      tiles.push(
        <mesh
          key={`${i}-${j}`}
          position={[(i - n / 2 + 0.5) * size, -0.55, (j - n / 2 + 0.5) * size]}
          receiveShadow
        >
          <boxGeometry args={[size, 1.1, size]} />
          <meshStandardMaterial
            color={even ? "#8FD14F" : "#7CC243"}
            roughness={0.95}
          />
        </mesh>
      );
    }
  }
  return (
    <group>
      {tiles}
      {/* dirt base */}
      <mesh position={[0, -1.45, 0]} receiveShadow>
        <boxGeometry args={[n * size, 0.7, n * size]} />
        <meshStandardMaterial color="#9A6B3F" roughness={1} />
      </mesh>
    </group>
  );
}

/* Character with idle hop + squash */
function Character({ skinIndex, scale = 0.88 }: { skinIndex: number; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  const { Comp } = SKINS[skinIndex];

  const isFloat = !!SKINS[skinIndex].float;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;
    if (isFloat) {
      // hovering object: smooth bob + gentle tilt
      ref.current.position.y = (1.2 + Math.sin(t * 1.6) * 0.35) * scale;
      ref.current.scale.set(scale, scale, scale);
      ref.current.rotation.z = Math.sin(t * 1.1) * 0.08;
      ref.current.rotation.x = Math.sin(t * 0.9 + 1) * 0.06;
      ref.current.rotation.y = Math.sin(t * 0.5) * 0.15;
    } else {
      // character: idle hop with squash & stretch
      const hop = Math.abs(Math.sin(t * 3.2));
      ref.current.position.y = hop * 0.35 * scale;
      const squash = 1 + Math.sin(t * 3.2 * 2) * 0.03;
      ref.current.scale.set((1 / squash) * scale, squash * scale, (1 / squash) * scale);
      ref.current.rotation.z = 0;
      ref.current.rotation.x = 0;
      ref.current.rotation.y = Math.sin(t * 0.6) * 0.12;
    }
  });

  return (
    <group ref={ref} key={skinIndex}>
      <Comp />
    </group>
  );
}

export default function Scene({
  skinIndex,
  effectId,
  scale = 0.88,
}: {
  skinIndex: number;
  effectId: string | null;
  scale?: number;
}) {
  const effect = EFFECTS.find((e) => e.id === effectId);
  return (
    <Canvas
      shadows
      camera={{ position: [7, 6, 9], fov: 38 }}
      gl={{ antialias: true }}
      className="!touch-none"
    >
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-6, 6, -6]} intensity={0.35} color="#bcd9ff" />

      <Suspense fallback={null}>
        <Character skinIndex={skinIndex} scale={scale} />
        {effect && <effect.Comp key={effect.id} />}
        <Platform />
        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.35}
          scale={10 * Math.max(0.6, Math.min(1.6, scale))}
          blur={2.2}
          far={4 * Math.max(0.6, Math.min(1.6, scale))}
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.2}
        minDistance={5}
        maxDistance={22}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 2.2 * Math.max(0.5, Math.min(1.4, scale)), 0]}
      />
    </Canvas>
  );
}
