import * as THREE from "three";
import {
  SKINS as BUDDIES_SKINS,
  B,
  type Skin as BuddySkin,
  Broom,
  Ufo,
  SurferBoard,
  MagicCarpet,
  KintonCloud,
  GiantLeaf,
  FlyingSword,
  PizzaSlice,
  Sushi,
  Banana,
  IceCream,
  Drone,
} from "../buddies/characters";
import { buildVoxelGeometry, type Part, voxelMaterial } from "./voxel";
import type { Skin } from "./skins";
import type { FriendArmPose } from "./shibuyaPacks";

/** Cache of merged BufferGeometries for Voxel Buddies characters */
const buddyGeoCache = new Map<string, THREE.BufferGeometry>();

/** Extract all voxel box parts from a Voxel Buddies React component tree */
export function extractBuddyParts(Comp: React.FC): Part[] {
  const parts: Part[] = [];

  function traverse(el: unknown, parentMat: THREE.Matrix4) {
    if (!el) return;
    if (Array.isArray(el)) {
      for (const child of el) traverse(child, parentMat);
      return;
    }
    const element = el as {
      type?: unknown;
      props?: {
        p?: [number, number, number];
        s?: [number, number, number];
        c?: string;
        r?: [number, number, number];
        position?: [number, number, number];
        rotation?: [number, number, number];
        scale?: number | [number, number, number];
        children?: unknown;
      };
    };

    if (typeof element.type === "function") {
      if (element.type === B || (element.type as { name?: string }).name === "B") {
        const { p = [0, 0, 0], s = [1, 1, 1], c = "#ffffff", r } = element.props || {};
        const local = new THREE.Matrix4();
        const rotEuler = r ? new THREE.Euler(r[0], r[1], r[2]) : new THREE.Euler(0, 0, 0);
        local.makeRotationFromEuler(rotEuler);
        local.setPosition(p[0], p[1], p[2]);

        const m = parentMat.clone().multiply(local);
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        m.decompose(pos, quat, scale);
        const finalEuler = new THREE.Euler().setFromQuaternion(quat);

        parts.push({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          w: s[0] * scale.x,
          h: s[1] * scale.y,
          d: s[2] * scale.z,
          rx: finalEuler.x,
          ry: finalEuler.y,
          rz: finalEuler.z,
          color: c,
        });
        return;
      }
      try {
        const fn = element.type as (props: unknown) => unknown;
        const rendered = fn(element.props || {});
        traverse(rendered, parentMat);
      } catch {
        // Safe fallback for edge cases
      }
      return;
    }

    if (element.type === Symbol.for("react.fragment") || element.type === Symbol.for("react.transitional.element")) {
      if (element.props?.children) {
        traverse(element.props.children, parentMat);
      }
      return;
    }

    const localMat = parentMat.clone();
    if (element.props) {
      const p = element.props.position || element.props.p;
      const r = element.props.rotation || element.props.r;
      const s = element.props.scale !== undefined ? element.props.scale : 1;
      const local = new THREE.Matrix4();
      const rot = r ? (Array.isArray(r) ? new THREE.Euler(r[0], r[1], r[2]) : r) : new THREE.Euler(0, 0, 0);
      local.makeRotationFromEuler(rot);
      if (p) local.setPosition(p[0], p[1], p[2]);
      if (typeof s === "number") local.scale(new THREE.Vector3(s, s, s));
      else if (Array.isArray(s)) local.scale(new THREE.Vector3(s[0], s[1], s[2]));
      localMat.multiply(local);

      if (element.props.children) {
        traverse(element.props.children, localMat);
      }
    }
  }

  try {
    (globalThis as unknown as { __EXTRACTING_BUDDY_PARTS?: boolean }).__EXTRACTING_BUDDY_PARTS = true;
    const root = Comp({});
    traverse(root, new THREE.Matrix4());
  } catch {
    // ignore
  } finally {
    (globalThis as unknown as { __EXTRACTING_BUDDY_PARTS?: boolean }).__EXTRACTING_BUDDY_PARTS = false;
  }

  return parts;
}

/** Get or build cached BufferGeometry for a Voxel Buddies character */
export function getBuddyGeometry(buddyId: string): THREE.BufferGeometry {
  const cached = buddyGeoCache.get(buddyId);
  if (cached) return cached;

  const buddy = BUDDIES_SKINS.find((s) => s.id === buddyId);
  if (!buddy) return new THREE.BufferGeometry();

  const parts = extractBuddyParts(buddy.Comp);
  const geo = buildVoxelGeometry(parts);
  buddyGeoCache.set(buddyId, geo);
  return geo;
}

/**
 * 12 Papan skate unik Voxel Buddies (dari Sapu Terbang s.d. Drone Quadcopter).
 * Dimasukkan ke pilihan papan skateboard (DECKS), bukan skin karakter.
 */
export const VOXEL_BOARD_IDS = new Set<string>([
  "broom",
  "ufo",
  "surfboard",
  "carpet",
  "kinton",
  "leaf",
  "sword",
  "pizza",
  "sushi",
  "banana",
  "icecream",
  "drone",
]);

const BOARD_COMPS: Record<string, React.FC> = {
  broom: Broom,
  ufo: Ufo,
  surfboard: SurferBoard,
  carpet: MagicCarpet,
  kinton: KintonCloud,
  leaf: GiantLeaf,
  sword: FlyingSword,
  pizza: PizzaSlice,
  sushi: Sushi,
  banana: Banana,
  icecream: IceCream,
  drone: Drone,
};

const boardPartsCache = new Map<string, Part[]>();

/**
 * Mendapatkan Part[] 3D voxel untuk 12 papan skateboard Voxel Buddies.
 * Dirotasi dan diskalakan agar pas di kaki rider di atas rel skateboard.
 */
export function getBuddyBoardParts(deckId: string): Part[] {
  const cached = boardPartsCache.get(deckId);
  if (cached) return cached;
  const Comp = BOARD_COMPS[deckId];
  if (!Comp) return [];
  const rawParts = extractBuddyParts(Comp);
  if (rawParts.length === 0) return [];

  let minX = 1e9, maxX = -1e9;
  let minY = 1e9, maxY = -1e9;
  let minZ = 1e9, maxZ = -1e9;
  for (const p of rawParts) {
    minX = Math.min(minX, p.x - p.w / 2);
    maxX = Math.max(maxX, p.x + p.w / 2);
    minY = Math.min(minY, p.y - p.h / 2);
    maxY = Math.max(maxY, p.y + p.h / 2);
    minZ = Math.min(minZ, p.z - p.d / 2);
    maxZ = Math.max(maxZ, p.z + p.d / 2);
  }
  const rawLen = Math.max(0.1, maxZ - minZ);
  const rawW = Math.max(0.1, maxX - minX);
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;

  // Cari titik permukaan pijakan di area tengah tempat kaki berpijak
  let centerMaxY = -1e9;
  for (const p of rawParts) {
    if (Math.abs(p.z - cz) <= Math.max(0.8, rawLen * 0.3)) {
      centerMaxY = Math.max(centerMaxY, p.y + p.h / 2);
    }
  }
  const cy = deckId === "broom" ? (centerMaxY > -1e8 ? centerMaxY : maxY - 0.7) : (centerMaxY > -1e8 ? centerMaxY : maxY);

  // Skateboard standard deck length di Pigeon SK8 adalah ~1.8 - 2.0
  const S = Math.min(2.1 / Math.max(rawLen, rawW), 0.52);

  // Di characters.tsx sumbu panjang adalah Z. Di rel skateboard sumbu panjang adalah X (+x maju).
  // Ketinggian board surface diset ke +0.048 agar pas mepet di telapak kaki (RIG.pigeonY - RIG.boardY = 0.05):
  const footContactY = deckId === "broom" ? 0.065 : 0.048;
  const normalized: Part[] = rawParts.map((p) => {
    const rx = p.z - cz;
    const ry = p.y - cy;
    const rz = -(p.x - cx);
    return {
      x: rx * S,
      y: ry * S + footContactY,
      z: rz * S,
      w: p.d * S,
      h: p.h * S,
      d: p.w * S,
      color: p.color,
    };
  });

  boardPartsCache.set(deckId, normalized);
  return normalized;
}

/**
 * 10 Hewan pilihan dengan proporsi golden ratio mengikuti lebar Monkey:
 * Shiba Inu, Panda, Tanuki, Maneki Neko, Baby Polar Bear, Baby Beaver,
 * Baby Teddy Bear, Red Panda, Rubah Fennec, Capybara.
 */
export const GOLDEN_RATIO_BUDDIES = new Set<string>([
  "shiba",
  "panda",
  "tanuki",
  "manekineko",
  "polarbear",
  "beaver",
  "teddy",
  "redpanda",
  "fennec",
  "capybara",
]);

/** Mendapatkan faktor skala proporsional untuk Voxel Buddy */
export function getBuddyScaleFactor(buddyId: string): number {
  if (buddyId === "manekineko") return 0.76;
  if (buddyId === "fennec") return 0.78;
  const buddy = BUDDIES_SKINS.find((s) => s.id === buddyId);
  if (!buddy) return 0.88;
  if (GOLDEN_RATIO_BUDDIES.has(buddyId)) {
    const parts = extractBuddyParts(buddy.Comp);
    let minX = 1e9, maxX = -1e9;
    for (const p of parts) {
      minX = Math.min(minX, p.x - p.w / 2);
      maxX = Math.max(maxX, p.x + p.w / 2);
    }
    const rawW = Math.max(0.1, maxX - minX);
    return 0.932 / (rawW * 0.24);
  }
  return 0.88;
}

export interface BuddyRig {
  group: THREE.Group;
  characterGroup: THREE.Group;
  bodyGroup: THREE.Group;
  armLPivot: THREE.Group;
  armRPivot: THREE.Group;
  legLPivot: THREE.Group;
  legRPivot: THREE.Group;
  scaleFactor: number;
  isGoldenRatio: boolean;
  setPush: (progress: number, roadY: number) => void;
  setArmPose: (left: FriendArmPose | null, right: FriendArmPose | null, k: number) => void;
  dispose: () => void;
}

/**
 * Membangun Rig animasi untuk Voxel Buddies seperti sistem milik Monkey:
 * - Kaki kanan/kiri bergerak mengayuh (kick/push) pas ngayuh SHIFT
 * - Tangan kanan/kiri berayun pas mengayuh & membentang seimbang pas loncat / freestyle
 * - Menggunakan bagian tubuh asli masing-masing hewan (cakar/telapak/lengan sendiri)
 */
export function buildBuddyRig(buddyId: string): BuddyRig {
  const buddy = BUDDIES_SKINS.find((s) => s.id === buddyId);
  const parts = buddy ? extractBuddyParts(buddy.Comp) : [];

  let minX = 1e9, maxX = -1e9;
  let minY = 1e9, maxY = -1e9;
  let minZ = 1e9, maxZ = -1e9;
  for (const p of parts) {
    minX = Math.min(minX, p.x - p.w / 2);
    maxX = Math.max(maxX, p.x + p.w / 2);
    minY = Math.min(minY, p.y - p.h / 2);
    maxY = Math.max(maxY, p.y + p.h / 2);
    minZ = Math.min(minZ, p.z - p.d / 2);
    maxZ = Math.max(maxZ, p.z + p.d / 2);
  }
  const rawW = Math.max(0.1, maxX - minX);
  const rawH = Math.max(0.1, maxY - minY);

  const armLParts: Part[] = []; // camera-side arm (local x < -0.22)
  const armRParts: Part[] = []; // far-side arm (local x > 0.22)
  const legLParts: Part[] = []; // camera-side pushing leg (local x < -0.15)
  const legRParts: Part[] = []; // far-side planted leg (local x > 0.15)
  const bodyParts: Part[] = [];

  for (const p of parts) {
    const isLow = p.y < minY + rawH * 0.26;
    const isArmY = p.y >= minY + rawH * 0.18 && p.y <= minY + rawH * 0.58;
    const isFarSideR = p.x > rawW * 0.24;
    const isFarSideL = p.x < -rawW * 0.24;

    if (isLow && p.x < -0.15) {
      legLParts.push(p); // camera side pushing leg
    } else if (isLow && p.x > 0.15) {
      legRParts.push(p); // far side planted leg
    } else if (isArmY && isFarSideL) {
      armLParts.push(p); // camera side arm
    } else if (isArmY && isFarSideR) {
      armRParts.push(p); // far side arm
    } else {
      bodyParts.push(p);
    }
  }

  function jointPivot(list: Part[], defaultX: number, defaultY: number, isShoulder = false): [number, number, number] {
    if (list.length === 0) return [defaultX, defaultY, 0];
    let cx = 0, cz = 0;
    let maxYPart = -1e9;
    for (const p of list) {
      cx += p.x;
      cz += p.z;
      maxYPart = Math.max(maxYPart, p.y + p.h / 2);
    }
    const py = isShoulder ? maxYPart - 0.12 : maxYPart - 0.06;
    return [cx / list.length, py, cz / list.length];
  }

  const shoulderLPos = jointPivot(armLParts, -rawW * 0.38, minY + rawH * 0.52, true);
  const shoulderRPos = jointPivot(armRParts, rawW * 0.38, minY + rawH * 0.52, true);
  const hipLPos = jointPivot(legLParts, -rawW * 0.2, minY + rawH * 0.22, false);
  const hipRPos = jointPivot(legRParts, rawW * 0.2, minY + rawH * 0.22, false);

  function relativeParts(list: Part[], pivot: [number, number, number]): Part[] {
    return list.map((p) => ({
      ...p,
      x: p.x - pivot[0],
      y: p.y - pivot[1],
      z: p.z - pivot[2],
    }));
  }

  const geos: THREE.BufferGeometry[] = [];
  function makeMesh(list: Part[], pivotPos?: [number, number, number]) {
    const rel = pivotPos ? relativeParts(list, pivotPos) : list;
    const geo = buildVoxelGeometry(rel);
    geos.push(geo);
    const mesh = new THREE.Mesh(geo, voxelMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  const root = new THREE.Group();
  root.name = `buddy-rig-${buddyId}`;

  const characterGroup = new THREE.Group();
  characterGroup.position.set(0, -minY, 0);

  const bodyGroup = new THREE.Group();
  bodyGroup.name = "buddy-body";
  if (bodyParts.length > 0) bodyGroup.add(makeMesh(bodyParts));

  const armLPivot = new THREE.Group();
  armLPivot.name = "buddy-armL-push";
  armLPivot.position.set(...shoulderLPos);
  if (armLParts.length > 0) armLPivot.add(makeMesh(armLParts, shoulderLPos));

  const armRPivot = new THREE.Group();
  armRPivot.name = "buddy-armR-plant";
  armRPivot.position.set(...shoulderRPos);
  if (armRParts.length > 0) armRPivot.add(makeMesh(armRParts, shoulderRPos));

  const legLPivot = new THREE.Group();
  legLPivot.name = "buddy-legL-push";
  legLPivot.position.set(...hipLPos);
  if (legLParts.length > 0) legLPivot.add(makeMesh(legLParts, hipLPos));

  const legRPivot = new THREE.Group();
  legRPivot.name = "buddy-legR-plant";
  legRPivot.position.set(...hipRPos);
  if (legRParts.length > 0) legRPivot.add(makeMesh(legRParts, hipRPos));

  characterGroup.add(bodyGroup, armLPivot, armRPivot, legLPivot, legRPivot);
  characterGroup.rotation.y = Math.PI / 2;
  root.add(characterGroup);

  const isGoldenRatio = GOLDEN_RATIO_BUDDIES.has(buddyId);
  // Monkey width di atas skateboard adalah ~0.932 unit.
  // Hewan golden ratio lebarnya mengikuti lebar Monkey, tingginya menyesuaikan ukuran natural.
  // Buddies lainnya tetap default 0.88.
  let scaleFactor = isGoldenRatio ? (0.932 / (rawW * 0.24)) : 0.88;
  if (buddyId === "manekineko") {
    // Ukuran Maneki Neko disamakan persis dengan ukuran Monkey (tidak lagi kebesaran)
    scaleFactor = 0.76;
  } else if (buddyId === "fennec") {
    // Baby Fennec dibuat seukuran tupai tapi lebih besar 20% dari tupai
    scaleFactor = 0.78;
  }

  const initialHipLY = hipLPos[1];
  const armCur: Record<"L" | "R", [number, number, number]> = { L: [0, 0, 0], R: [0, 0, 0] };

  const setPush = (progress: number, roadY: number) => {
    let contact = 0;
    if (progress >= 0 && progress < 0.24) contact = progress < 0.12 ? 0 : (progress - 0.12) / 0.12;
    else if (progress >= 0.24 && progress < 0.62) contact = 1;
    else if (progress >= 0.62 && progress < 0.82) contact = 1 - (progress - 0.62) / 0.2;
    const intensity = Math.max(0, Math.min(1, contact));

    if (progress >= 0) {
      // Kaki mengayuh turun menyentuh aspal dan menendang ke belakang
      legLPivot.position.y = initialHipLY + (roadY * 0.70 * intensity) / Math.max(0.1, scaleFactor * 0.24);
      legLPivot.rotation.x = 0.55 * intensity;
      legRPivot.rotation.x = -0.10 * intensity;
      // Ayunan tangan ritmis seirama kayuhan kaki
      const swing = 0.45 * Math.sin(Math.PI * Math.min(1, progress));
      armLPivot.rotation.x = -swing * 0.9;
      armRPivot.rotation.x = swing * 0.7;
    } else {
      legLPivot.position.y = initialHipLY;
      legLPivot.rotation.x = 0;
      legRPivot.rotation.x = 0;
      armLPivot.rotation.x = 0;
      armRPivot.rotation.x = 0;
    }
  };

  const setArmPose = (left: FriendArmPose | null, right: FriendArmPose | null, k: number) => {
    const kk = Math.max(0, Math.min(1, k));
    (["L", "R"] as const).forEach((side, i) => {
      const pivot = side === "L" ? armLPivot : armRPivot;
      const pose = i === 0 ? left : right;
      const cur = armCur[side];
      const tx = pose?.rx ?? 0;
      const ty = pose?.ry ?? 0;
      const tz = pose?.rz ?? 0;
      cur[0] += (tx - cur[0]) * kk;
      cur[1] += (ty - cur[1]) * kk;
      cur[2] += (tz - cur[2]) * kk;
      pivot.rotation.set(cur[0], cur[1], cur[2]);
    });
  };

  const dispose = () => {
    for (const g of geos) g.dispose();
  };

  return {
    group: root,
    characterGroup,
    bodyGroup,
    armLPivot,
    armRPivot,
    legLPivot,
    legRPivot,
    scaleFactor,
    isGoldenRatio,
    setPush,
    setArmPose,
    dispose,
  };
}

/** Preload all buddy geometries to avoid hitches */
export function preloadAllBuddyGeometries() {
  for (const s of BUDDIES_SKINS) {
    if (s.id !== "pigeon") {
      getBuddyGeometry(s.id);
    }
  }
}

/**
 * Filter out 'pigeon' dan 12 papan skate (broom s.d. drone)
 * karena papan skate masuk ke pilihan skateboard, bukan karakter.
 */
export const BUDDIES_FOR_PIGEON: BuddySkin[] = BUDDIES_SKINS.filter(
  (s) => s.id !== "pigeon" && !s.float && !VOXEL_BOARD_IDS.has(s.id)
);

/**
 * Build playable Skin definitions for Voxel Buddies characters.
 */
export const BUDDY_SKIN_OPTIONS: Skin[] = BUDDIES_FOR_PIGEON.map((b) => {
  return {
    id: `buddy-${b.id}`,
    name: b.name,
    tagline: b.desc,
    cost: 0,
    kind: "buddy" as const,
    buddyId: b.id,
    badgeLabel: "VOXEL BUDDIES",
    emoji: b.emoji,
    body: b.color,
    belly: b.bg[0] || b.color,
    head: b.color,
    neck1: b.bg[1] || b.color,
    neck2: b.color,
    wing: b.color,
    wingTip: b.bg[1] || "#111111",
    tail: b.color,
    tailTip: b.bg[1] || "#111111",
    beak: b.color,
    cere: b.color,
    feet: b.color,
    deck: b.bg[0] || "#2ec4b6",
    wheels: "#1c1e22",
  };
});
