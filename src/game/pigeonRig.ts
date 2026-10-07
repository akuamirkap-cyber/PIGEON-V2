import * as THREE from "three";
import { buildVoxelGeometry, clamp, voxelMaterial, type Part } from "./voxel";
import { getShibuyaAnimalGeo, getShibuyaAnimalPlayerScale } from "./shibuyaPacks";
import { getBuddyGeometry, getBuddyScaleFactor, VOXEL_BOARD_IDS } from "./buddiesSkins";
import { useUI } from "./store";
import { charBodyParts, charHeadParts, charLegParts, charTailParts, charWingParts, deckParts, truckParts, wheelParts, HIP_Y, LEG_Z, TAIL_ROOT, type Skin, type DeckId, SKINS } from "./skins";

/** Shared placement constants for the pigeon-on-board rig (used by the Player and the 3D thumbnails). */
export const RIG = {
  /** overall visual scale of pigeon + board (reduced 30% to 0.5635) */
  rootScale: 0.5635,
  /** board group height: deck top ends up at boardY + 0.06 (deck + grip tape) */
  boardY: 0.2,
  /** pigeon origin = deck top plane (its feet rest at local y = 0) */
  pigeonY: 0.25,
  /** distance from the pigeon origin (deck top) down to the street */
  deckToRoad: 0.25,
  pigeonScale: 1.08, // merpati dikecilkan 10% (1.2 -> 1.08)
  headPos: [0.22, 1.00, 0] as [number, number, number],
  /** head default yaw: 0 = menghadap lurus ke depan (dulu -0.32 menoleh ke kanan) */
  headRotY: 0,
  wingRPos: [-0.05, 0.72, 0.3] as [number, number, number],
  wingLPos: [-0.05, 0.72, -0.3] as [number, number, number],
  hipY: HIP_Y,
  legZ: LEG_Z,
  /** kingpin positions of the front (+x) and rear (-x) trucks, in board space */
  truckX: 0.55,
  truckY: -0.065,
  /** wheel offsets relative to a truck pivot */
  wheelZ: 0.33,
  wheelDrop: -0.045,
  wheelPos: [
    [0.55, -0.11, 0.33],
    [0.55, -0.11, -0.33],
    [-0.55, -0.11, 0.33],
    [-0.55, -0.11, -0.33],
  ] as [number, number, number][],
};

/* ---------- Two-bone bird leg (thigh + shin + foot) driven by a sole target ---------- */

export const LEG_T = 0.23; // thigh length (upper part hides inside the body)
export const LEG_S = 0.28; // shin length

export function legThighParts(k: Skin): Part[] {
  return charLegParts(k, "thigh", LEG_T, LEG_S);
}
export function legShinParts(k: Skin): Part[] {
  return charLegParts(k, "shin", LEG_T, LEG_S);
}
/** Foot: origin at the SOLE, toes toward +x (cakar burung atau telapak kucing). */
export function legFootParts(k: Skin): Part[] {
  return charLegParts(k, "foot", LEG_T, LEG_S);
}

/**
 * Leg chain: root (at the hip) → abduction (x) → swing (z) → thigh → knee (z) → shin → foot (kept flat).
 * `solve()` places the sole exactly at a target relative to the hip, folding the leg like a perched bird
 * when the target is close and straightening it when the foot reaches for the street.
 */
export class LegRig {
  readonly root = new THREE.Group();
  private readonly hipA = new THREE.Group();
  private readonly hipS = new THREE.Group();
  private readonly knee = new THREE.Group();
  private readonly foot = new THREE.Group();
  private readonly geos: THREE.BufferGeometry[];

  constructor(skin: Skin, material: THREE.Material = voxelMaterial, castShadow = true) {
    const thigh = buildVoxelGeometry(legThighParts(skin));
    const shin = buildVoxelGeometry(legShinParts(skin));
    const footG = buildVoxelGeometry(legFootParts(skin));
    this.geos = [thigh, shin, footG];
    const mk = (g: THREE.BufferGeometry) => {
      const m = new THREE.Mesh(g, material);
      m.castShadow = castShadow;
      return m;
    };
    this.root.name = "leg-root";
    this.foot.name = "leg-foot";
    this.root.add(this.hipA);
    this.hipA.add(this.hipS);
    this.hipS.add(mk(thigh));
    this.knee.position.y = -LEG_T;
    this.hipS.add(this.knee);
    this.knee.add(mk(shin));
    this.foot.position.y = -LEG_S;
    this.foot.rotation.order = "ZXY";
    this.knee.add(this.foot);
    this.foot.add(mk(footG));
    this.solve(0.02, -HIP_Y, 0);
  }

  /** Sole target relative to the hip (pigeon axes: +x forward, +y up, +z toward the pushing side). */
  solve(fx: number, fy: number, fz: number) {
    const r = Math.max(1e-4, Math.hypot(fy, fz));
    const phi = -Math.atan2(fz, -fy); // abduction about x (positive z target = leg swings out to +z)
    let D = Math.hypot(fx, r);
    const maxD = LEG_T + LEG_S - 0.004;
    if (D > maxD) D = maxD;
    const theta = Math.atan2(fx, r); // swing toward the target (+ = forward)
    const beta = Math.acos(clamp((LEG_T * LEG_T + D * D - LEG_S * LEG_S) / (2 * LEG_T * D), -1, 1));
    const kappa = Math.acos(clamp((LEG_T * LEG_T + LEG_S * LEG_S - D * D) / (2 * LEG_T * LEG_S), -1, 1));
    const thighAngle = theta - beta; // hock points backward like a bird
    const kneeAngle = Math.PI - kappa;
    this.hipA.rotation.x = phi;
    this.hipS.rotation.z = thighAngle;
    this.knee.rotation.z = kneeAngle;
    // keep the sole flat: undo the chain rotation (order ZXY => Rz * Rx)
    this.foot.rotation.set(-phi, 0, -(thighAngle + kneeAngle));
  }

  dispose() {
    this.geos.forEach((g) => g.dispose());
  }
}

/** Plain three.js assembly of a skin (character only when includeBoard is false). */
export function buildPigeonGroup(
  skin: Skin,
  deckOverride: DeckId = "default",
  wheelColor: string = "auto",
  includeBoard: boolean = false,
): { group: THREE.Group; dispose: () => void } {
  const geos: THREE.BufferGeometry[] = [];
  const legs: LegRig[] = [];

  const group = new THREE.Group();
  const scaled = new THREE.Group();
  scaled.scale.setScalar(RIG.rootScale);
  group.add(scaled);

  if (includeBoard) {
    const isWheelless = deckOverride === "hoverboard" || VOXEL_BOARD_IDS.has(deckOverride);
    const deckAdj = useUI.getState?.().deckAdjustments?.[deckOverride] || { scaleX: 1, scaleY: 1, scaleZ: 1, offsetY: 0 };
    const floatClearance = isWheelless ? 0.22 : 0;
    const deckGeo = buildVoxelGeometry(deckParts(skin, deckOverride));
    geos.push(deckGeo);

    const board = new THREE.Group();
    board.position.y = RIG.boardY + floatClearance + (deckAdj.offsetY || 0);
    board.scale.set(deckAdj.scaleX || 1, deckAdj.scaleY || 1, deckAdj.scaleZ || 1);
    board.add(new THREE.Mesh(deckGeo, voxelMaterial));

    if (!isWheelless) {
      const wheelGeo = buildVoxelGeometry(wheelParts(skin, deckOverride, wheelColor));
      const truckGeo = buildVoxelGeometry(truckParts());
      geos.push(wheelGeo, truckGeo);

      for (const sx of [1, -1]) {
        const tr = new THREE.Group();
        tr.position.set(sx * RIG.truckX, RIG.truckY, 0);
        tr.add(new THREE.Mesh(truckGeo, voxelMaterial));
        for (const z of [RIG.wheelZ, -RIG.wheelZ]) {
          const m = new THREE.Mesh(wheelGeo, voxelMaterial);
          m.position.set(0, RIG.wheelDrop, z);
          tr.add(m);
        }
        board.add(tr);
      }
    }
    scaled.add(board);
  }

  const pigeon = new THREE.Group();
  pigeon.scale.setScalar(RIG.pigeonScale);

  if (skin.kind === "littleJapanFriend" && skin.friend) {
    // Keep the exact Shibuya Blocks animal geometry intact. It is cached by the
    // source pack and therefore deliberately not disposed with this thumbnail.
    const friend = new THREE.Mesh(getShibuyaAnimalGeo(skin.friend), voxelMaterial);
    friend.scale.setScalar(getShibuyaAnimalPlayerScale(skin.friend));
    pigeon.add(friend);
  } else if (skin.kind === "buddy" && skin.buddyId) {
    const buddyGeo = getBuddyGeometry(skin.buddyId);
    const buddy = new THREE.Mesh(buddyGeo, voxelMaterial);
    buddy.rotation.y = Math.PI / 2;
    const bs = useUI.getState?.().buddyScale || 1.0;
    const sf = getBuddyScaleFactor(skin.buddyId);
    buddy.scale.setScalar(0.24 * sf * bs);
    pigeon.add(buddy);
  } else {
    const bodyGeo = buildVoxelGeometry(charBodyParts(skin));
    const headGeo = buildVoxelGeometry(charHeadParts(skin));
    const wingRGeo = buildVoxelGeometry(charWingParts(skin, 1));
    const wingLGeo = buildVoxelGeometry(charWingParts(skin, -1));
    const tailGeo = buildVoxelGeometry(charTailParts(skin));
    geos.push(bodyGeo, headGeo, wingRGeo, wingLGeo, tailGeo);

    pigeon.add(new THREE.Mesh(bodyGeo, voxelMaterial));
    const h = new THREE.Mesh(headGeo, voxelMaterial);
    h.position.set(...RIG.headPos);
    h.rotation.y = RIG.headRotY;
    pigeon.add(h);
    const wr = new THREE.Mesh(wingRGeo, voxelMaterial);
    wr.position.set(...RIG.wingRPos);
    pigeon.add(wr);
    const wl = new THREE.Mesh(wingLGeo, voxelMaterial);
    wl.position.set(...RIG.wingLPos);
    pigeon.add(wl);
    const tl = new THREE.Mesh(tailGeo, voxelMaterial);
    tl.position.set(...TAIL_ROOT);
    pigeon.add(tl);
    legs.push(new LegRig(skin, voxelMaterial, false), new LegRig(skin, voxelMaterial, false));
    legs[0].root.position.set(0, HIP_Y, LEG_Z);
    legs[1].root.position.set(0, HIP_Y, -LEG_Z);
    legs.forEach((l) => pigeon.add(l.root));
  }

  // When board is excluded (character showcase & thumbnails), center character at origin (0, 0, 0)
  if (!includeBoard) {
    pigeon.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(pigeon);
    const center = new THREE.Vector3();
    box.getCenter(center);
    pigeon.position.sub(center);
  } else {
    pigeon.position.y = RIG.pigeonY;
  }

  scaled.add(pigeon);

  return {
    group,
    dispose: () => {
      geos.forEach((g) => g.dispose());
      legs.forEach((l) => l.dispose());
    },
  };
}

  /** Plain three.js assembly of a skateboard deck (isolated from rider, centered for 3D showcase/thumbs). */
  export function buildBoardGroup(
    deckId: DeckId = "default",
    wheelColor: string = "auto",
    skin?: Skin,
  ): { group: THREE.Group; dispose: () => void } {
    const dummySkin = skin ?? SKINS[0];
    const isWheelless = deckId === "hoverboard" || VOXEL_BOARD_IDS.has(deckId);
    const deckGeo = buildVoxelGeometry(deckParts(dummySkin, deckId));
    const geos: THREE.BufferGeometry[] = [deckGeo];

    const group = new THREE.Group();
    const board = new THREE.Group();
    board.add(new THREE.Mesh(deckGeo, voxelMaterial));

    if (!isWheelless) {
      const wheelGeo = buildVoxelGeometry(wheelParts(dummySkin, deckId, wheelColor));
      const truckGeo = buildVoxelGeometry(truckParts());
      geos.push(wheelGeo, truckGeo);

      for (const sx of [1, -1]) {
        const tr = new THREE.Group();
        tr.position.set(sx * RIG.truckX, RIG.truckY, 0);
        tr.add(new THREE.Mesh(truckGeo, voxelMaterial));
        for (const z of [RIG.wheelZ, -RIG.wheelZ]) {
          const m = new THREE.Mesh(wheelGeo, voxelMaterial);
          m.position.set(0, RIG.wheelDrop, z);
          tr.add(m);
        }
        board.add(tr);
      }
    }

    // Apply deck adjustment scale if configured
    const deckAdj = useUI.getState?.().deckAdjustments?.[deckId];
    if (deckAdj) {
      const s = deckAdj.scale ?? 1;
      board.scale.set((deckAdj.scaleX || 1) * s, (deckAdj.scaleY || 1) * s, (deckAdj.scaleZ || 1) * s);
    }

    // Center board geometry at origin (0, 0, 0) for perfect turntable rotation
    board.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(board);
    const center = new THREE.Vector3();
    box.getCenter(center);
    board.position.sub(center);

    group.add(board);

    return {
      group,
      dispose: () => {
        geos.forEach((g) => g.dispose());
      },
    };
  }

