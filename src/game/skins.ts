import type { Part } from "./voxel";
import type { ShibuyaAnimalId } from "./shibuyaPacks";
import {
  catArmParts,
  catBodyParts,
  catHeadParts,
  catLegParts,
  catTailParts,
  crowBodyParts,
  crowHeadParts,
  crowTailParts,
  crowWingParts,
  flamingoBodyParts,
  flamingoHeadParts,
  flamingoLegParts,
  flamingoTailParts,
  flamingoWingParts,
  type CharPalette,
} from "./chars";

export type HatKind = "cap" | "crown" | "mohawk" | "headband" | "beanie" | "visor" | "tophat" | "mailcap" | "harajuku" | "beret" | "apehood";
export type AccessoryKind = "none" | "mailbag" | "hoodie";
export type DeckKind = "standard" | "baguette" | "hoverboard" | "broom" | "silver";
/** Spesies karakter yang bisa dimainkan. `undefined` di Skin berarti merpati. */
export type CharKind = "pigeon" | "cat" | "flamingo" | "crow" | "duck" | "panda" | "dino" | "frog" | "shiba" | "littleJapanFriend" | "buddy";

export type DeckId =
  | "default"
  | "baguette"
  | "hoverboard"
  | "broom"
  | "ufo"
  | "surfboard"
  | "carpet"
  | "kinton"
  | "leaf"
  | "sword"
  | "pizza"
  | "sushi"
  | "banana"
  | "icecream"
  | "drone";

export interface DeckOption {
  id: DeckId;
  name: string;
  tagline: string;
  badge: string;
  emoji: string;
  cost: number;
}

export const DECKS: DeckOption[] = [
  {
    id: "default",
    name: "Classic Street Deck",
    tagline: "Papan skateboard griptape pro (warna mengikuti karakter)",
    badge: "STANDARD",
    emoji: "🛹",
    cost: 0,
  },
  {
    id: "baguette",
    name: "Skateboard Roti Baguette",
    tagline: "Papan roti baguette Prancis gurih renyah + roda mentega",
    badge: "FREE / GRATIS",
    emoji: "🥖",
    cost: 0,
  },
  {
    id: "hoverboard",
    name: "Hoverboard Neon",
    tagline: "Papan melayang futuristik tanpa roda, dengan efek anti-gravitasi",
    badge: "FREE / GRATIS",
    emoji: "⚡",
    cost: 0,
  },
  {
    id: "broom",
    name: "Sapu Terbang",
    tagline: "Sapu sihir terbang dengan percikan ajaib berkilau",
    badge: "VOXEL BOARD",
    emoji: "🧹",
    cost: 0,
  },
  {
    id: "ufo",
    name: "UFO Mini",
    tagline: "Piring terbang futuristik melayang tanpa roda dengan dek energi & sinar traktor",
    badge: "SKATE TANPA RODA",
    emoji: "🛸",
    cost: 0,
  },
  {
    id: "surfboard",
    name: "Papan Silver Surfer",
    tagline: "Papan selancar kosmik serba chrome dengan jejak energi",
    badge: "VOXEL BOARD",
    emoji: "🏄",
    cost: 0,
  },
  {
    id: "carpet",
    name: "Karpet Terbang",
    tagline: "Karpet ajaib ungu-emas dari Agrabah meluncur di udara",
    badge: "VOXEL BOARD",
    emoji: "🪄",
    cost: 0,
  },
  {
    id: "kinton",
    name: "Awan Kinton",
    tagline: "Awan kuning empuk milik Goku meluncur cepat",
    badge: "VOXEL BOARD",
    emoji: "☁️",
    cost: 0,
  },
  {
    id: "leaf",
    name: "Daun Raksasa",
    tagline: "Daun hijau lebar kendaraan para peri hutan berembun sejuk",
    badge: "VOXEL BOARD",
    emoji: "🍃",
    cost: 0,
  },
  {
    id: "sword",
    name: "Keris Terbang",
    tagline: "Bilah keris wuxia berkelok dengan aura energi biru mistis",
    badge: "VOXEL BOARD",
    emoji: "⚔️",
    cost: 0,
  },
  {
    id: "pizza",
    name: "Pizza Slice",
    tagline: "Potongan pizza pepperoni dengan keju meleleh di pinggir",
    badge: "VOXEL BOARD",
    emoji: "🍕",
    cost: 0,
  },
  {
    id: "sushi",
    name: "Sushi Salmon",
    tagline: "Nigiri salmon segar dengan ikat nori dan wasabi",
    badge: "VOXEL BOARD",
    emoji: "🍣",
    cost: 0,
  },
  {
    id: "banana",
    name: "Pisang Kupas",
    tagline: "Papan seluncur pisang terkupas dengan potassium power",
    badge: "VOXEL BOARD",
    emoji: "🍌",
    cost: 0,
  },
  {
    id: "icecream",
    name: "Es Krim Leleh",
    tagline: "Es krim stik stroberi digigit manis plus sprinkles",
    badge: "VOXEL BOARD",
    emoji: "🍦",
    cost: 0,
  },
  {
    id: "drone",
    name: "Drone Quadcopter",
    tagline: "Drone putih sporty dengan 4 baling-baling berputar kencang, kursi merah mini & lampu LED",
    badge: "SPORT DRONE",
    emoji: "🚁",
    cost: 0,
  },
];

export interface Skin {
  id: string;
  name: string;
  tagline: string;
  cost: number;
  body: string;
  belly: string;
  head: string;
  neck1: string;
  neck2: string;
  wing: string;
  wingTip: string;
  tail: string;
  tailTip: string;
  beak: string;
  cere: string;
  feet: string;
  deck: string;
  wheels: string;
  hat?: HatKind;
  hatColor?: string;
  hatColor2?: string;
  accessory?: AccessoryKind;
  deckType?: DeckKind;
  /** spesies karakter (default: merpati) */
  kind?: CharKind;
  /** Little Japan Friends source model from Shibuya Blocks, used as a full playable mesh. */
  friend?: ShibuyaAnimalId;
  /** Voxel Buddies skin identifier */
  buddyId?: string;
  /** Label badge to distinguish from old skins */
  badgeLabel?: string;
  emoji?: string;
}

const ORANGE = "#ff8c42";

/**
 * The four retained Little Japan Friends are real playable skins, not
 * recoloured pigeon stand-ins. Their mesh is resolved from the Shibuya Blocks
 * source in Player and pigeonRig; the palette fields keep the legacy
 * character/deck code type-safe. The removed source animals remain available
 * to the Shibuya Blocks asset catalog, but are not Pigeon game skins.
 */
const littleJapanFriendSkin = (friend: ShibuyaAnimalId, name: string, tagline: string, body: string, deck: string): Skin => ({
  id: `friend-${friend}`,
  name,
  tagline,
  cost: 0,
  kind: "littleJapanFriend",
  friend,
  body,
  belly: body,
  head: body,
  neck1: body,
  neck2: body,
  wing: body,
  wingTip: body,
  tail: body,
  tailTip: body,
  beak: body,
  cere: body,
  feet: body,
  deck,
  wheels: "#1c1e22",
});

const LITTLE_JAPAN_FRIEND_SKINS: Skin[] = [
  littleJapanFriendSkin("monkey", "Monkey", "Little Japan Friend · source Shibuya Blocks", "#ac9b89", "#d69989"),
];

import { BUDDY_SKIN_OPTIONS, VOXEL_BOARD_IDS, getBuddyBoardParts } from "./buddiesSkins";

export const SKINS: Skin[] = [
  {
    id: "classic", name: "Classic Coo", tagline: "The original street bird", cost: 0,
    body: "#C9C4BE", belly: "#A8A29B", head: "#F2EEEA", neck1: "#6BC4B4", neck2: "#6BC4B4",
    wing: "#C9C4BE", wingTip: "#6E6862", tail: "#A8A29B", tailTip: "#6E6862", beak: "#F08A8A", cere: "#E8A0A8", feet: ORANGE,
    deck: "#2ec4b6", wheels: "#fff1d6",
  },
  {
    id: "pinky", name: "Pink Pigeon", tagline: "Rare & fabulous", cost: 80,
    body: "#f4a3c4", belly: "#ffc6dd", head: "#f28fb8", neck1: "#f9c74f", neck2: "#f3722c",
    wing: "#c77d92", wingTip: "#8a4b60", tail: "#c77d92", tailTip: "#8a4b60", beak: "#d64d7a", cere: "#ffffff", feet: ORANGE,
    deck: "#9b5de5", wheels: "#fff1d6",
  },
  {
    // FLAMINGO — badan kecil + leher panjang, paruh melengkung dengan ujung hitam
    id: "flamingo", name: "Flamingo", tagline: "Flamingo pink berleher panjang (Free)", cost: 0, kind: "flamingo",
    body: "#ff9ec4", belly: "#ffd3e4", head: "#ff9ec4", neck1: "#ff86b6", neck2: "#ffd3e4",
    wing: "#ff8fb8", wingTip: "#e2619a", tail: "#ff8fb8", tailTip: "#e2619a", beak: "#f7d8c4", cere: "#ffe0ef", feet: "#ff9f45",
    deck: "#ff70a6", wheels: "#1c1e22",
  },
  ...LITTLE_JAPAN_FRIEND_SKINS,
  ...BUDDY_SKIN_OPTIONS,
];

export function getSkin(id: string): Skin {
  return SKINS.find((s) => s.id === id || s.buddyId === id) ?? SKINS[0];
}

/* ---------- Dispatcher model per spesies (merpati / kucing / flamingo / gagak) ---------- */

/** Semua karakter bisa berbagi palet warna yang sama; modelnya beda per spesies. */
const pal = (k: Skin): CharPalette => k;

function cuteAnimalBody(k: Skin): Part[] {
  // Compact upright animal body: one clear torso, rounded belly, and a short neck.
  // Avoids the stacked-box look of the first pass.
  return [
    { x: -0.02, y: 0.38, z: 0, w: 0.76, h: 0.42, d: 0.62, color: k.body },
    { x: 0.28, y: 0.43, z: 0, w: 0.20, h: 0.30, d: 0.48, color: k.belly },
    { x: 0.22, y: 0.72, z: 0, w: 0.25, h: 0.20, d: 0.32, color: k.neck1 },
  ];
}
function cuteAnimalHead(k: Skin): Part[] {
  const isPanda = k.kind === "panda";
  const isDino = k.kind === "dino";
  const isFrog = k.kind === "frog";
  const eye = isPanda ? "#111318" : "#20242c";
  return [
    { x: 0, y: 0, z: 0, w: 0.58, h: 0.48, d: 0.58, color: k.head },
    { x: 0.28, y: -0.10, z: 0, w: isDino ? 0.4 : 0.26, h: 0.18, d: 0.32, color: k.belly },
    { x: 0.4, y: -0.06, z: 0, w: 0.1, h: 0.07, d: 0.18, color: k.beak },
    { x: 0.16, y: 0.12, z: 0.2, w: 0.1, h: isFrog ? 0.19 : 0.13, d: 0.12, color: "#ffffff" },
    { x: 0.16, y: 0.12, z: -0.2, w: 0.1, h: isFrog ? 0.19 : 0.13, d: 0.12, color: "#ffffff" },
    { x: 0.2, y: 0.12, z: 0.205, w: 0.055, h: 0.08, d: 0.06, color: eye },
    { x: 0.2, y: 0.12, z: -0.205, w: 0.055, h: 0.08, d: 0.06, color: eye },
    ...(isPanda ? [
      { x: -0.18, y: 0.24, z: 0.20, w: 0.16, h: 0.16, d: 0.14, color: "#20242c" },
      { x: -0.18, y: 0.24, z: -0.20, w: 0.16, h: 0.16, d: 0.14, color: "#20242c" },
      { x: 0.18, y: 0.12, z: 0.18, w: 0.14, h: 0.18, d: 0.025, color: "#20242c" },
      { x: 0.18, y: 0.12, z: -0.18, w: 0.14, h: 0.18, d: 0.025, color: "#20242c" },
    ] : []),
    ...(isDino ? [
      { x: -0.16, y: 0.28, z: 0, w: 0.12, h: 0.16, d: 0.14, color: k.wingTip },
      { x: -0.02, y: 0.31, z: 0, w: 0.12, h: 0.19, d: 0.14, color: k.wingTip },
      { x: 0.12, y: 0.28, z: 0, w: 0.12, h: 0.16, d: 0.14, color: k.wingTip },
    ] : []),
    ...(k.kind === "shiba" ? [
      { x: -0.16, y: 0.29, z: 0.2, w: 0.2, h: 0.2, d: 0.18, color: k.head },
      { x: -0.16, y: 0.29, z: -0.2, w: 0.2, h: 0.2, d: 0.18, color: k.head },
    ] : []),
  ];
}
function cuteAnimalWing(k: Skin, side: 1 | -1): Part[] {
  return [
    { x: -0.05, y: -0.16, z: 0.34 * side, w: 0.34, h: 0.34, d: 0.18, color: k.wing },
    { x: 0.12, y: -0.35, z: 0.34 * side, w: 0.22, h: 0.18, d: 0.2, color: k.wingTip },
  ];
}
function cuteAnimalTail(k: Skin): Part[] {
  return [
    { x: -0.4, y: 0.48, z: 0, w: 0.38, h: 0.28, d: 0.28, color: k.tail },
    { x: -0.56, y: 0.68, z: 0, w: 0.25, h: 0.25, d: 0.22, rz: -0.5, color: k.tailTip },
  ];
}

/** Part badan (termasuk leher). Untuk kucing/… dipakai model khusus dari chars.ts. */
export function charBodyParts(k: Skin): Part[] {
  switch (k.kind) {
    case "cat":
      return catBodyParts(pal(k));
    case "flamingo":
      return flamingoBodyParts(pal(k));
    case "crow":
      return crowBodyParts(pal(k));
    case "duck":
    case "panda":
    case "dino":
    case "frog":
    case "shiba":
      return cuteAnimalBody(k);
    default:
      return pigeonBodyParts(k);
  }
}

/** Part kepala (+ paruh/moncong/telinga). Origin = sendi kepala (0.32, 1.04, 0). */
export function charHeadParts(k: Skin): Part[] {
  switch (k.kind) {
    case "cat":
      return catHeadParts(pal(k));
    case "flamingo":
      return flamingoHeadParts(pal(k));
    case "crow":
      return crowHeadParts(pal(k));
    case "duck": case "panda": case "dino": case "frog": case "shiba":
      return cuteAnimalHead(k);
    default:
      return pigeonHeadParts(k);
  }
}

/** Part sayap: burung = sayap, kucing = lengan depan dengan telapak. */
export function charWingParts(k: Skin, side: 1 | -1): Part[] {
  switch (k.kind) {
    case "cat":
      return catArmParts(pal(k), side);
    case "flamingo":
      return flamingoWingParts(pal(k), side);
    case "crow":
      return crowWingParts(pal(k), side);
    case "duck": case "panda": case "dino": case "frog": case "shiba":
      return cuteAnimalWing(k, side);
    default:
      return wingParts(k, side);
  }
}

/** Part ekor. Origin = TAIL_ROOT. */
export function charTailParts(k: Skin): Part[] {
  switch (k.kind) {
    case "cat":
      return catTailParts(pal(k));
    case "flamingo":
      return flamingoTailParts(pal(k));
    case "crow":
      return crowTailParts(pal(k));
    case "duck":
    case "panda":
    case "dino":
    case "frog":
    case "shiba":
      return cuteAnimalTail(k);
    default:
      return pigeonTailParts(k);
  }
}

/** Kaki merpati/burung: paha + betis + cakar (dipakai rig kaki 2-tulang). */
function pigeonLegParts(k: Skin, seg: "thigh" | "shin" | "foot", thighLen: number, shinLen: number): Part[] {
  if (seg === "thigh") {
    return [
      { x: 0, y: 0, z: 0, w: 0.13, h: 0.13, d: 0.13, color: k.feet }, // penutup pinggul (di dalam badan)
      { x: 0, y: -thighLen / 2, z: 0, w: 0.1, h: thighLen, d: 0.1, color: k.feet },
    ];
  }
  if (seg === "shin") {
    return [
      { x: 0, y: 0, z: 0, w: 0.12, h: 0.12, d: 0.12, color: k.feet }, // sendi lutut
      { x: 0, y: -shinLen / 2, z: 0, w: 0.08, h: shinLen, d: 0.08, color: k.feet },
    ];
  }
  // Cakar: origin di TELAPAK, jari ke +x
  return [
    { x: 0, y: 0.05, z: 0, w: 0.1, h: 0.1, d: 0.1, color: k.feet },
    { x: 0.03, y: 0.025, z: 0, w: 0.26, h: 0.05, d: 0.13, color: k.feet },
    { x: 0.17, y: 0.02, z: 0.045, w: 0.07, h: 0.04, d: 0.045, color: k.feet },
    { x: 0.17, y: 0.02, z: -0.045, w: 0.07, h: 0.04, d: 0.045, color: k.feet },
    { x: 0.18, y: 0.02, z: 0, w: 0.08, h: 0.04, d: 0.04, color: k.feet },
    { x: -0.12, y: 0.02, z: 0, w: 0.06, h: 0.04, d: 0.05, color: k.feet },
  ];
}

/** Part kaki (rig kaki 2-tulang yang sama): burung = cakar, kucing = telapak kaki. */
export function charLegParts(k: Skin, seg: "thigh" | "shin" | "foot", thighLen: number, shinLen: number): Part[] {
  switch (k.kind) {
    case "cat":
      return catLegParts(pal(k), seg, thighLen, shinLen);
    case "flamingo":
      return flamingoLegParts(pal(k), seg, thighLen, shinLen);
    default:
      return pigeonLegParts(k, seg, thighLen, shinLen);
  }
}

/* ---------- Voxel model builders ---------- */

/** Hip pivot (pigeon-local, above the deck top) where the legs attach — inside the lower bower body. */
export const HIP_Y = 0.3;
export const LEG_Z = 0.16;

export function pigeonBodyParts(k: Skin): Part[] {
  const parts: Part[] = [
    // BADAN abu-abu kotak besar dari Voxel Buddies Pigeon
    { x: 0.04, y: 0.58, z: 0, w: 0.74, h: 0.48, d: 0.60, color: k.body },
    // gradasi bawah badan lebih gelap dari Voxel Buddies Pigeon (menempel pas di atas pinggul kaki HIP_Y = 0.3)
    { x: 0.04, y: 0.36, z: 0, w: 0.75, h: 0.12, d: 0.61, color: k.belly ?? k.tail },
    // LEHER teal (cincin leher antara badan & kepala dari Voxel Buddies Pigeon, berdiri jelas di atas badan)
    { x: 0.22, y: 0.90, z: 0, w: 0.40, h: 0.20, d: 0.40, color: k.neck1 },
  ];

  if (k.accessory === "mailbag") {
    // Tas surat selempang kulit khas kurir pos + amplop surat mengintip & cap pos merah
    // Pouch tas di samping pinggul (+z)
    parts.push({ x: -0.05, y: 0.44, z: 0.33, w: 0.44, h: 0.34, d: 0.15, color: "#874d26" });
    // Penutup tas (flap) & gesper kuningan emas
    parts.push({ x: -0.05, y: 0.57, z: 0.34, w: 0.46, h: 0.12, d: 0.16, color: "#6a3917" });
    parts.push({ x: -0.05, y: 0.50, z: 0.415, w: 0.1, h: 0.1, d: 0.04, color: "#ffd60a" });
    parts.push({ x: -0.05, y: 0.57, z: 0.42, w: 0.14, h: 0.05, d: 0.02, color: "#ffd60a" });
    // Surat / amplop putih mengintip keluar
    parts.push({ x: -0.08, y: 0.65, z: 0.33, w: 0.24, h: 0.18, d: 0.05, rz: 0.18, color: "#ffffff" });
    parts.push({ x: -0.05, y: 0.71, z: 0.358, w: 0.07, h: 0.07, d: 0.02, color: "#e63946" }); // prangko merah
    parts.push({ x: -0.11, y: 0.61, z: 0.358, w: 0.14, h: 0.03, d: 0.02, color: "#2563eb" }); // garis airmail biru
    parts.push({ x: 0.06, y: 0.63, z: 0.34, w: 0.2, h: 0.16, d: 0.04, rz: -0.15, color: "#f5f5f5" });
    // Tali selempang kulit melintang di dada
    parts.push({ x: 0.12, y: 0.65, z: 0.08, w: 0.14, h: 0.52, d: 0.62, rx: 0.38, rz: 0.25, color: "#592f13" });
  } else if (k.accessory === "hoodie") {
    // Oversized street hoodie: saku kanguru di perut, tali hoodie putih (drawstrings) & tudung di belakang
    const hoodieColor = k.hatColor ?? "#8b5cf6";
    // Saku kanguru di perut depan
    parts.push({ x: 0.38, y: 0.40, z: 0, w: 0.22, h: 0.24, d: 0.44, color: hoodieColor });
    parts.push({ x: 0.39, y: 0.45, z: 0.21, w: 0.16, h: 0.04, d: 0.05, color: "#ffffff" });
    parts.push({ x: 0.39, y: 0.45, z: -0.21, w: 0.16, h: 0.04, d: 0.05, color: "#ffffff" });
    // Tali hoodie menggantung di dada
    parts.push({ x: 0.37, y: 0.72, z: 0.08, w: 0.04, h: 0.24, d: 0.04, color: "#ffffff" });
    parts.push({ x: 0.37, y: 0.59, z: 0.08, w: 0.06, h: 0.06, d: 0.06, color: "#ffd60a" });
    parts.push({ x: 0.37, y: 0.72, z: -0.08, w: 0.04, h: 0.24, d: 0.04, color: "#ffffff" });
    parts.push({ x: 0.37, y: 0.59, z: -0.08, w: 0.06, h: 0.06, d: 0.06, color: "#ffd60a" });
    // Lipatan tudung (hood) di belakang leher
    parts.push({ x: -0.10, y: 0.78, z: 0, w: 0.38, h: 0.22, d: 0.58, color: hoodieColor });
    parts.push({ x: -0.12, y: 0.85, z: 0, w: 0.30, h: 0.12, d: 0.50, color: "#6d28d9" });
  }

  return parts;
}

/** Tail feathers. Origin at the tail root (pigeon-local TAIL_ROOT); extends toward -x. */
export const TAIL_ROOT: [number, number, number] = [-0.34, 0.55, 0];
export function pigeonTailParts(k: Skin): Part[] {
  // EKOR: ekor abu gelap ke belakang dari Voxel Buddies Pigeon
  return [
    { x: -0.08, y: -0.02, z: 0, w: 0.22, h: 0.20, d: 0.36, color: k.tail },
    { x: -0.22, y: 0.02, z: 0, w: 0.18, h: 0.14, d: 0.28, color: k.tailTip },
  ];
}

function hatParts(k: Skin): Part[] {
  const c = k.hatColor ?? "#e63946";
  const c2 = k.hatColor2 ?? "#ffffff";
  switch (k.hat) {
    case "cap":
      return [
        { x: 0, y: 0.25, z: 0, w: 0.46, h: 0.13, d: 0.44, color: c },
        { x: -0.33, y: 0.215, z: 0, w: 0.24, h: 0.05, d: 0.4, color: c },
        { x: 0, y: 0.33, z: 0, w: 0.08, h: 0.05, d: 0.08, color: "#ffffff" },
      ];
    case "mailcap":
      // Topi kurir pos resmi (peaked service cap) dengan lidah pet hitam mengkilap & lencana pos emas
      return [
        { x: 0, y: 0.25, z: 0, w: 0.48, h: 0.14, d: 0.46, color: c },
        { x: 0, y: 0.18, z: 0, w: 0.49, h: 0.04, d: 0.47, color: c2 },
        { x: 0.27, y: 0.16, z: 0, w: 0.22, h: 0.04, d: 0.42, color: "#111111" },
        { x: 0.24, y: 0.25, z: 0, w: 0.04, h: 0.09, d: 0.12, color: c2 },
      ];
    case "apehood":
      // KUPLUK KERA ala BATHING APE: hood loreng hijau menyatu, MONYET krem di jidat,
      // telinga kera mungil, motif camo tan/olive, resleting penuh khas shark hoodie
      return [
        // Tengkuk & mahkota hood loreng menutupi kepala
        { x: -0.02, y: 0.2, z: 0, w: 0.5, h: 0.26, d: 0.48, color: c },
        { x: -0.05, y: 0.05, z: 0, w: 0.46, h: 0.14, d: 0.5, color: c }, // sisi hood
        // patch camo tone lain (loreng blok kotak khas BAPE camo)
        { x: -0.1, y: 0.24, z: 0.18, w: 0.22, h: 0.14, d: 0.1, color: c2 },
        { x: 0.08, y: 0.3, z: -0.14, w: 0.18, h: 0.1, d: 0.14, color: c2 },
        { x: -0.14, y: 0.14, z: -0.2, w: 0.16, h: 0.1, d: 0.08, color: c2 },
        // WAJAH APE ikonik di jidat: panel muka krem + dua mata gelap
        { x: 0.1, y: 0.22, z: 0, w: 0.3, h: 0.2, d: 0.34, color: "#e8d7b0" },
        { x: 0.18, y: 0.24, z: 0.09, w: 0.08, h: 0.07, d: 0.07, color: "#231a12" },
        { x: 0.18, y: 0.24, z: -0.09, w: 0.08, h: 0.07, d: 0.07, color: "#231a12" },
        // TELINGA KERA mencuat kiri-kanan
        { x: -0.05, y: 0.1, z: 0.27, w: 0.14, h: 0.14, d: 0.08, color: c },
        { x: -0.04, y: 0.1, z: 0.285, w: 0.07, h: 0.07, d: 0.04, color: "#e8d7b0" },
        { x: -0.05, y: 0.1, z: -0.27, w: 0.14, h: 0.14, d: 0.08, color: c },
        { x: -0.04, y: 0.1, z: -0.285, w: 0.07, h: 0.07, d: 0.04, color: "#e8d7b0" },
        // Track resleting emas di tengah (zip hood)
        { x: 0.16, y: 0.12, z: 0, w: 0.12, h: 0.16, d: 0.035, color: "#d9b23c" },
      ];
    case "harajuku":
      // Beanie streetwear dengan tag neon + kacamata hitam slick (shades) dengan kilau putih
      return [
        // Beanie Harajuku
        { x: 0, y: 0.26, z: 0, w: 0.48, h: 0.18, d: 0.46, color: c },
        { x: 0, y: 0.21, z: 0, w: 0.50, h: 0.07, d: 0.48, color: "#111111" },
        { x: 0.22, y: 0.22, z: 0, w: 0.04, h: 0.05, d: 0.14, color: "#2dd4bf" },
        // Kacamata Hitam (Sunglasses) keren di depan mata
        { x: 0.21, y: 0.06, z: 0, w: 0.06, h: 0.09, d: 0.46, color: "#111111" },
        { x: 0.22, y: 0.05, z: 0.14, w: 0.05, h: 0.14, d: 0.17, color: "#15171e" },
        { x: 0.22, y: 0.05, z: -0.14, w: 0.05, h: 0.14, d: 0.17, color: "#15171e" },
        // Kilau pantulan diagonal putih pada kacamata
        { x: 0.24, y: 0.08, z: 0.14, w: 0.02, h: 0.05, d: 0.08, rz: 0.25, color: "#ffffff" },
        { x: 0.24, y: 0.08, z: -0.14, w: 0.02, h: 0.05, d: 0.08, rz: 0.25, color: "#ffffff" },
      ];
    case "beret":
      // Topi baret khas baker / pelukis Prancis
      return [
        { x: -0.05, y: 0.27, z: 0.05, w: 0.54, h: 0.12, d: 0.52, rx: 0.15, rz: -0.15, color: c },
        { x: -0.05, y: 0.35, z: 0.05, w: 0.32, h: 0.08, d: 0.32, color: c },
        { x: -0.05, y: 0.41, z: 0.05, w: 0.04, h: 0.06, d: 0.04, color: c },
      ];
    case "crown":
      return [
        { x: 0, y: 0.25, z: 0, w: 0.36, h: 0.12, d: 0.36, color: c },
        { x: 0.14, y: 0.37, z: 0.14, w: 0.08, h: 0.12, d: 0.08, color: c },
        { x: -0.14, y: 0.37, z: 0.14, w: 0.08, h: 0.12, d: 0.08, color: c },
        { x: 0.14, y: 0.37, z: -0.14, w: 0.08, h: 0.12, d: 0.08, color: c },
        { x: -0.14, y: 0.37, z: -0.14, w: 0.08, h: 0.12, d: 0.08, color: c },
        { x: 0, y: 0.4, z: 0, w: 0.08, h: 0.18, d: 0.08, color: c },
        { x: 0.19, y: 0.25, z: 0, w: 0.03, h: 0.07, d: 0.07, color: c2 },
      ];
    case "mohawk": {
      const parts: Part[] = [];
      const hs = [0.2, 0.28, 0.34, 0.28, 0.2];
      for (let i = 0; i < 5; i++) parts.push({ x: -0.16 + i * 0.08, y: 0.19 + hs[i] / 2, z: 0, w: 0.08, h: hs[i], d: 0.1, color: c });
      return parts;
    }
    case "headband":
      return [
        { x: 0, y: 0.14, z: 0, w: 0.45, h: 0.08, d: 0.43, color: c },
        { x: -0.32, y: 0.12, z: 0.06, w: 0.24, h: 0.04, d: 0.05, color: c },
        { x: -0.34, y: 0.07, z: -0.03, w: 0.28, h: 0.04, d: 0.05, color: c },
      ];
    case "beanie":
      return [
        { x: 0, y: 0.26, z: 0, w: 0.46, h: 0.16, d: 0.44, color: c },
        { x: 0, y: 0.2, z: 0, w: 0.47, h: 0.06, d: 0.45, color: c2 },
        { x: 0, y: 0.4, z: 0, w: 0.16, h: 0.16, d: 0.16, color: c2 },
      ];
    case "visor":
      return [
        { x: 0.17, y: 0.05, z: 0, w: 0.1, h: 0.15, d: 0.5, color: "#1a1d24" },
        { x: 0.225, y: 0.05, z: 0, w: 0.01, h: 0.04, d: 0.46, color: c },
      ];
    case "tophat":
      return [
        { x: 0, y: 0.42, z: 0, w: 0.32, h: 0.44, d: 0.32, color: "#1a1d24" },
        { x: 0.215, y: 0.215, z: 0, w: 0.5, h: 0.05, d: 0.48, color: "#1a1d24" },
        { x: 0, y: 0.27, z: 0, w: 0.33, h: 0.06, d: 0.33, color: c },
      ];
    default:
      return [];
  }
}

export function pigeonHeadParts(k: Skin): Part[] {
  return [
    // KEPALA putih kotak dari Voxel Buddies Pigeon (nempel persis di atas cincin leher tanpa celah)
    { x: 0, y: 0.22, z: 0, w: 0.42, h: 0.44, d: 0.42, color: k.head },
    // MATA: patch mata putih di kedua sisi kepala dari Voxel Buddies Pigeon (100% gaya Mallard / Pigeon)
    { x: 0.06, y: 0.22, z: 0.215, w: 0.22, h: 0.22, d: 0.04, color: "#ffffff" },
    { x: 0.06, y: 0.22, z: -0.215, w: 0.22, h: 0.22, d: 0.04, color: "#ffffff" },
    // MATA: pupil hitam kotak di tengah patch dari Voxel Buddies Pigeon
    { x: 0.06, y: 0.22, z: 0.235, w: 0.09, h: 0.09, d: 0.02, color: "#1d1d1f" },
    { x: 0.06, y: 0.22, z: -0.235, w: 0.09, h: 0.09, d: 0.02, color: "#1d1d1f" },
    // PARUH: paruh pink 2 tingkat menonjol di depan dari Voxel Buddies Pigeon
    // tingkat atas (paruh utama)
    { x: 0.32, y: 0.19, z: 0, w: 0.24, h: 0.12, d: 0.20, color: k.beak },
    // tingkat bawah (paruh bawah)
    { x: 0.26, y: 0.11, z: 0, w: 0.14, h: 0.06, d: 0.14, color: k.cere ?? k.beak },
    ...hatParts(k),
  ];
}

export function wingParts(k: Skin, side: 1 | -1): Part[] {
  // SAYAP / TANGAN: sayap di sisi + patch warna teal + ujung gelap bertingkat dari Voxel Buddies Pigeon
  const z = 0.04 * side;
  return [
    // Sayap utama samping
    { x: -0.04, y: -0.06, z, w: 0.44, h: 0.38, d: 0.09, color: k.wing },
    // Patch aksen warna di sayap (teal)
    { x: -0.12, y: -0.04, z: z + 0.015 * side, w: 0.22, h: 0.26, d: 0.09, color: k.neck1 },
    // Ujung gelap bertingkat ke belakang (dark)
    { x: -0.32, y: -0.08, z, w: 0.18, h: 0.30, d: 0.09, color: k.wingTip },
    { x: -0.41, y: 0.02, z, w: 0.16, h: 0.18, d: 0.09, color: k.tailTip ?? k.wingTip },
  ];
}

/** Skateboard berbentuk roti Baguette asli Prancis dengan guratan renyah & mentega */
export function baguetteDeckParts(): Part[] {
  const crust = "#c68038";
  const crustDark = "#9e5f24";
  const crustHigh = "#d99042";
  const crumb = "#fef6e2";
  const crumbWhite = "#ffffff";
  const scoreEdge = "#7a4216";

  const parts: Part[] = [
    // Baseplates penyangga trucks
    { x: 0.55, y: -0.05, z: 0, w: 0.2, h: 0.03, d: 0.3, color: "#a9afb8" },
    { x: -0.55, y: -0.05, z: 0, w: 0.2, h: 0.03, d: 0.3, color: "#a9afb8" },

    // Bodi utama roti baguette
    { x: 0, y: 0.02, z: 0, w: 1.76, h: 0.12, d: 0.54, color: crust },
    { x: 0, y: -0.02, z: 0, w: 1.72, h: 0.06, d: 0.48, color: crustDark },
    { x: 0, y: 0.08, z: 0, w: 1.68, h: 0.04, d: 0.50, color: crustHigh },

    // Ujung depan (nose) melancip khas baguette
    { x: 0.94, y: 0.02, z: 0, w: 0.18, h: 0.10, d: 0.44, color: crust },
    { x: 1.04, y: 0.01, z: 0, w: 0.14, h: 0.07, d: 0.30, color: crustDark },

    // Ujung belakang (tail) melancip khas baguette
    { x: -0.94, y: 0.02, z: 0, w: 0.18, h: 0.10, d: 0.44, color: crust },
    { x: -1.04, y: 0.01, z: 0, w: 0.14, h: 0.07, d: 0.30, color: crustDark },

    // Mentega leleh di ujung depan (butter pat)
    { x: 0.78, y: 0.11, z: 0.06, w: 0.14, h: 0.06, d: 0.14, color: "#ffe066" },
    { x: 0.78, y: 0.13, z: 0.06, w: 0.08, h: 0.03, d: 0.08, color: "#fff3b0" },
  ];

  // 5 Guratan sayatan diagonal (baker's scores) memperlihatkan remah roti putih lembut
  const slashes = [-0.6, -0.3, 0.0, 0.3, 0.6];
  for (const sx of slashes) {
    parts.push({ x: sx, y: 0.105, z: 0, w: 0.12, h: 0.025, d: 0.44, ry: 0.35, color: crumb });
    parts.push({ x: sx, y: 0.106, z: 0, w: 0.06, h: 0.027, d: 0.36, ry: 0.35, color: crumbWhite });
    parts.push({ x: sx + 0.04, y: 0.102, z: 0, w: 0.03, h: 0.022, d: 0.42, ry: 0.35, color: scoreEdge });
  }

  // Taburan tepung halus (flour dust) di atas roti
  parts.push({ x: -0.15, y: 0.102, z: 0.14, w: 0.09, h: 0.01, d: 0.09, color: "#faf5ea" });
  parts.push({ x: 0.42, y: 0.102, z: -0.14, w: 0.09, h: 0.01, d: 0.09, color: "#faf5ea" });

  return parts;
}

export function specialDeckParts(_kind: "hoverboard"): Part[] {
  // Hoverboard: layered anti-gravity deck, cyan rails, purple underside engines.
  return [
    { x: 0, y: 0.015, z: 0, w: 1.58, h: 0.10, d: 0.56, color: "#182641" },
    { x: 0.82, y: 0.025, z: 0, w: 0.22, h: 0.075, d: 0.40, color: "#2b4269" },
    { x: -0.82, y: 0.025, z: 0, w: 0.22, h: 0.075, d: 0.40, color: "#2b4269" },
    { x: 0, y: 0.082, z: 0, w: 1.35, h: 0.03, d: 0.42, color: "#63f3ff" },
    { x: 0, y: -0.075, z: 0, w: 1.12, h: 0.05, d: 0.26, color: "#243b6b" },
    { x: 0.56, y: -0.12, z: 0, w: 0.25, h: 0.045, d: 0.34, color: "#b56cff" },
    { x: -0.56, y: -0.12, z: 0, w: 0.25, h: 0.045, d: 0.34, color: "#47e9e0" },
  ];
}

export function deckParts(k: Skin, deckOverride: DeckId = "default"): Part[] {
  if (deckOverride === "baguette" || k.deckType === "baguette") {
    return baguetteDeckParts();
  }
  if (deckOverride === "hoverboard") {
    return specialDeckParts("hoverboard");
  }
  if (VOXEL_BOARD_IDS.has(deckOverride)) {
    const parts = getBuddyBoardParts(deckOverride);
    if (parts.length > 0) return parts;
  }
  return [
    { x: 0, y: 0, z: 0, w: 1.7, h: 0.08, d: 0.56, color: k.deck },
    { x: 0, y: 0.05, z: 0, w: 1.6, h: 0.02, d: 0.5, color: "#2b2b2b" },
    { x: 0.9, y: 0.05, z: 0, w: 0.22, h: 0.1, d: 0.5, color: k.deck },
    { x: -0.9, y: 0.05, z: 0, w: 0.22, h: 0.1, d: 0.5, color: k.deck },
    // baseplates (fixed to the deck); the hangers + wheels are separate parts that steer
    { x: 0.55, y: -0.05, z: 0, w: 0.2, h: 0.03, d: 0.3, color: "#a9afb8" },
    { x: -0.55, y: -0.05, z: 0, w: 0.2, h: 0.03, d: 0.3, color: "#a9afb8" },
  ];
}

/** Truck hanger + axle, origin at the kingpin (under the baseplate); steers about the local y axis. */
export function truckParts(): Part[] {
  return [
    { x: 0, y: -0.03, z: 0, w: 0.12, h: 0.06, d: 0.64, color: "#c0c5cc" }, // axle/hanger
    { x: 0, y: -0.02, z: 0, w: 0.16, h: 0.08, d: 0.2, color: "#b1b7c0" }, // hanger body
    { x: 0, y: 0.0, z: 0, w: 0.05, h: 0.05, d: 0.05, color: "#8a8f98" }, // kingpin nut
  ];
}

/** Warna ban pilihan pemain: default HITAM, bisa merah/hijau/kuning/biru (atau ikut warna skin). */
export const WHEEL_HEX: Record<string, string> = {
  black: "#1c1e22",
  red: "#e63946",
  green: "#2ec46b",
  yellow: "#ffd60a",
  blue: "#2e7de6",
};

/** Wheel + bearing; axis along z. `wheelOverride` = pilihan warna ban pemain (default: hitam). */
export function wheelParts(k: Skin, deckOverride: DeckId = "default", wheelOverride: string = "auto"): Part[] {
  const isWheelless = deckOverride === "hoverboard" || VOXEL_BOARD_IDS.has(deckOverride);
  // Keep a valid placeholder geometry for the shared Three.js builder; the
  // player hides the complete truck assembly for wheelless boards.
  if (isWheelless) return [{ x: 0, y: -10, z: 0, w: 0.01, h: 0.01, d: 0.01, color: "#000000" }];
  const isBaguette = deckOverride === "baguette" || k.deckType === "baguette";
  const wheelColor =
    wheelOverride !== "auto" && WHEEL_HEX[wheelOverride]
      ? WHEEL_HEX[wheelOverride]
      : isBaguette
        ? "#ffe066" // Roda mentega gurih saat memakai roti baguette
        : k.wheels;
  return [
    { x: 0, y: 0, z: 0, w: 0.18, h: 0.18, d: 0.14, color: wheelColor },
    { x: 0, y: 0, z: 0, w: 0.08, h: 0.08, d: 0.16, color: "#c0c5cc" },
  ];
}



