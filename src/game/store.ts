import { create } from "zustand";
import { SKINS, getSkin, DECKS, type DeckId } from "./skins";
import { TRICKS, type TrickKind } from "./tricks";
import { loadWordHunt, saveWordHunt, type WordHuntData } from "./wordHunt";
import { evaluate, markAllSeen, unseenCount, getAch } from "./achievements";

export type Phase = "menu" | "playing" | "crashed" | "gameover";
export type TurnMode = "old" | "new";
export type TrackMode = "tokyo" | "haruna" | "shibuya";
export type CameraMode = "chase" | "crossy";
export type MenuView = "main" | "skins" | "tricks" | "exit" | "bye";
/** Warna ban skateboard: default HITAM, bisa diganti merah/hijau/kuning/biru (atau ikut warna skin). */
export type WheelColor = "auto" | "black" | "red" | "green" | "yellow" | "blue";
export const WHEEL_COLORS: { id: WheelColor; hex: string; label: string }[] = [
  { id: "auto", hex: "#b9c0ca", label: "AUTO" },
  { id: "black", hex: "#1c1e22", label: "HITAM" },
  { id: "red", hex: "#e63946", label: "MERAH" },
  { id: "green", hex: "#2ec46b", label: "HIJAU" },
  { id: "yellow", hex: "#ffd60a", label: "KUNING" },
  { id: "blue", hex: "#2e7de6", label: "BIRU" },
];

import defaultDeckAdjustmentsJson from "./defaultDeckAdjustments.json";

export interface DeckAdjustment {
  scale: number; // Skala ukuran proporsional keseluruhan (default 1.0)
  scaleX: number; // Skala panjang / maju-mundur (default 1.0)
  scaleY: number; // Skala ketebalan vertikal (default 1.0)
  scaleZ: number; // Skala lebar samping (default 1.0)
  offsetY: number; // Ketinggian relatif agar mepet telapak kaki (default 0.0)
}

export const DEFAULT_DECK_ADJUSTMENTS: Record<DeckId, DeckAdjustment> =
  defaultDeckAdjustmentsJson as Record<DeckId, DeckAdjustment>;

export interface Popup {
  id: number;
  text: string;
  sub?: string;
  color: string;
}

interface UIState {
  phase: Phase;
  menuView: MenuView;
  score: number;
  bread: number;
  best: number;
  wallet: number;
  runs: number;
  muted: boolean;
  tutorialSeen: boolean;
  setTutorialSeen: () => void;
  isNewBest: boolean;
  popups: Popup[];
  combo: number;
  skin: string;
  preview: string;
  unlocked: string[];
  setPhase: (p: Phase) => void;
  setMenuView: (v: MenuView) => void;
  dist: number;
  nos: number;
  nosActive: boolean;
  /** SHIFT sprint: current intensity (0..1) and whether it can be triggered right now */
  sprint: number;
  sprintReady: boolean;
  sprintLevel: number;
  setSprint: (v: number, ready: boolean, level?: number) => void;
  cycleIndex: number;
  setCycle: (i: number) => void;
  speedMode: 1 | 2 | 3;
  setSpeedMode: (m: 1 | 2 | 3) => void;
  /** "old" = smooth slide between lanes with cosmetic lean; "new" = real wheel steering (heading drives the lateral motion) */
  turnMode: TurnMode;
  setTurnMode: (m: TurnMode) => void;
  /** "tokyo" = city streets & parks; "haruna" = Mount Haruna (Gunma Touge) downhill & hairpins; "shibuya" = Shibuya scramble city */
  trackMode: TrackMode;
  setTrackMode: (m: TrackMode) => void;
  /** Crossy Road = elevated, readable follow camera; chase = original low action camera. */
  cameraMode: CameraMode;
  setCameraMode: (m: CameraMode) => void;
  /** Penyetelan kamera in-game: offset ketinggian, sudut & jarak zoom (tersimpan), plus status panel adjust (game dijeda) */
  camHeight: number;
  camAngle: number;
  camDist: number;
  camAdjusting: boolean;
  setCamHeight: (v: number) => void;
  setCamAngle: (v: number) => void;
  setCamDist: (v: number) => void;
  setCamAdjusting: (v: boolean) => void;
  resetCamView: () => void;
  /** Penyetelan tubuh pigeon: ukuran (scale) dan letak (naik/turun Y, maju/mundur X) tanpa mengubah kaki */
  pigeonSize: number;
  pigeonPosY: number;
  pigeonPosX: number;
  pigeonAdjusting: boolean;
  setPigeonSize: (v: number) => void;
  setPigeonPosY: (v: number) => void;
  setPigeonPosX: (v: number) => void;
  setPigeonAdjusting: (v: boolean) => void;
  resetPigeonAdjust: () => void;
  /** Skala ukuran Voxel Buddies serentak untuk semua 33 karakter */
  buddyScale: number;
  setBuddyScale: (v: number) => void;
  resetBuddyScale: () => void;
  /** cuaca mode siang: cerah / berawan indah */
  weather: "sunny" | "cloudy" | "snow";
  toggleWeather: () => void;
  /** kecerahan lampu malam: 0 = redup, 1 = pas, 2 = terang */
  nightBright: 0 | 1 | 2;
  cycleNightBright: () => void;
  /** waktu hari untuk Shibuya: pagi / siang / sore / malam */
  shibuyaTime: "pagi" | "siang" | "sore" | "malam";
  cycleShibuyaTime: () => void;
  /** Penyetelan ukuran & posisi nempel tiap papan skateboard */
  deckAdjustments: Record<DeckId, DeckAdjustment>;
  setDeckAdjustment: (id: DeckId, adj: Partial<DeckAdjustment>) => void;
  resetDeckAdjustment: (id: DeckId) => void;
  resetAllDeckAdjustments: () => void;
  applyDefaultJsonAdjustments: () => void;
  deckAdjustOpen: boolean;
  setDeckAdjustOpen: (open: boolean) => void;
  adjustTargetDeck: DeckId;
  setAdjustTargetDeck: (id: DeckId) => void;
  importDeckAdjustments: (data: Record<string, Partial<DeckAdjustment>>) => boolean;
  deckOverride: DeckId;
  setDeckOverride: (d: DeckId) => void;
  wheelColor: WheelColor;
  setWheelColor: (c: WheelColor) => void;
  worldCurve: "subway" | "flat";
  setWorldCurve: (c: "subway" | "flat") => void;
  setHud: (score: number, bread: number, combo: number, dist: number, nos: number, nosActive: boolean) => void;
  addPopup: (text: string, color: string, sub?: string) => void;
  crashCause: string;
  tricksOn: Record<TrickKind, boolean>;
  toggleTrick: (k: TrickKind) => void;
  setAllTricks: (on: boolean) => void;
  finishRun: (score: number, bread: number, cause: string) => void;
  toggleMute: () => void;
  selectSkin: (id: string) => void;
  setPreview: (id: string) => void;
  cycleSkin: (dir: 1 | -1) => void;
  unlockSkin: (id: string) => boolean;
  wordHunt: WordHuntData;
  showMysteryBox: boolean;
  setShowMysteryBox: (show: boolean) => void;
  collectWordLetter: (index: number) => { completed: boolean; char: string; remaining: number };
  claimMysteryBox: () => { bread: number; score: number; title: string };
  /** achievement: jumlah yang terbuka tapi belum dilihat (badge merah tombol) + id yang baru terbuka sesi ini */
  unseenAch: number;
  newAch: string[];
  recheckAchievements: () => void;
  markAchSeen: () => void;
}

let popupId = 0;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const defaultFree = SKINS.filter((s) => s.cost === 0).map((s) => s.id);
const initialUnlocked = (() => {
  const u = load<string[]>("pigeon-sk8-unlocked", ["classic"]);
  const set = new Set(Array.isArray(u) ? u : ["classic"]);
  for (const f of defaultFree) set.add(f);
  return Array.from(set);
})();
/** Default view kamera pilihan user: TINGGI -1.0, SUDUT +1.0, JARAK +2.2 (lebih dekat & sinematik). */
const CAM_VIEW_DEFAULT = { h: -1, a: 1, d: 2.2 };
const CAM_VIEW_INIT = (() => {
  const c = load<{ h?: number; a?: number; d?: number }>("pigeon-sk8-cam-view", {});
  const h = typeof c?.h === "number" && isFinite(c.h) ? Math.max(-3, Math.min(7, c.h)) : CAM_VIEW_DEFAULT.h;
  const a = typeof c?.a === "number" && isFinite(c.a) ? Math.max(-3, Math.min(5, c.a)) : CAM_VIEW_DEFAULT.a;
  const d = typeof c?.d === "number" && isFinite(c.d) ? Math.max(-3, Math.min(6, c.d)) : CAM_VIEW_DEFAULT.d;
  return { h, a, d };
})();

/** Default ukuran & posisi pigeon tubuh (sesuai data pilihan: UKURAN 1.40x, TINGGI Y -0.05, MAJU X -0.15) */
const PIGEON_ADJUST_DEFAULT = { size: 1.40, y: -0.05, x: -0.15 };
const PIGEON_ADJUST_INIT = (() => {
  const c = load<{ size?: number; y?: number; x?: number }>("pigeon-sk8-body-adjust", {});
  const size = typeof c?.size === "number" && isFinite(c.size) ? Math.max(0.5, Math.min(2.2, c.size)) : PIGEON_ADJUST_DEFAULT.size;
  const y = typeof c?.y === "number" && isFinite(c.y) && c.y !== -0.25 ? Math.max(-0.4, Math.min(0.6, c.y)) : PIGEON_ADJUST_DEFAULT.y;
  const x = typeof c?.x === "number" && isFinite(c.x) ? Math.max(-0.4, Math.min(0.4, c.x)) : PIGEON_ADJUST_DEFAULT.x;
  save("pigeon-sk8-body-adjust", { size, y, x });
  return { size, y, x };
})();

/** Skala ukuran Voxel Buddies serentak untuk semua 33 karakter (default 0.88x) */
export const BUDDY_SCALE_DEFAULT = 0.88;
const BUDDY_SCALE_INIT = (() => {
  const c = load<{ scale?: number }>("pigeon-sk8-buddy-scale", {});
  // Bila belum pernah disimpan atau nilainya adalah default lama (1.0), gunakan default baru 0.88
  let scale = BUDDY_SCALE_DEFAULT;
  if (typeof c?.scale === "number" && isFinite(c.scale) && c.scale !== 1.0) {
    scale = Math.max(0.4, Math.min(2.5, Math.round(c.scale * 100) / 100));
  }
  save("pigeon-sk8-buddy-scale", { scale });
  return scale;
})();

const initialSkin = (() => {
  const id = load<string>("pigeon-sk8-skin", "classic");
  const exists = SKINS.some((s) => s.id === id);
  return exists && initialUnlocked.includes(id) ? id : (SKINS[0]?.id ?? "classic");
})();

const defaultTricks = Object.fromEntries(TRICKS.map((t) => [t.kind, true])) as Record<TrickKind, boolean>;
const initialTricks = (() => {
  const saved = load<Partial<Record<TrickKind, boolean>>>("pigeon-sk8-tricks", {});
  return { ...defaultTricks, ...(saved && typeof saved === "object" ? saved : {}) };
})();

export const useUI = create<UIState>((set, get) => ({
  phase: "menu",
  menuView: "main",
  score: 0,
  bread: 0,
  best: load<number>("pigeon-sk8-best", 0) || 0,
  wallet: load<number>("pigeon-sk8-wallet", 0) || 0,
  runs: 0,
  muted: load<boolean>("pigeon-sk8-muted", false) === true,
  tutorialSeen: load<boolean>("pigeon-sk8-tutor", false) === true,
  isNewBest: false,
  popups: [],
  combo: 0,
  skin: initialSkin,
  preview: initialSkin,
  unlocked: initialUnlocked,
  crashCause: "obstacle",
  dist: 0,
  nos: 0,
  nosActive: false,
  sprint: 0,
  sprintReady: true,
  sprintLevel: 0,
  setSprint: (v, ready, level = 0) => {
    const s = get();
    const r = Math.round(v * 20) / 20;
    if (s.sprint !== r || s.sprintReady !== ready || s.sprintLevel !== level) {
      set({ sprint: r, sprintReady: ready, sprintLevel: level });
    }
  },
  cycleIndex: 0,
  setCycle: (cycleIndex) => set({ cycleIndex }),
  speedMode: (() => {
    const m = load<number>("pigeon-sk8-speed-v2", 2);
    return (m === 1 || m === 3 ? m : 2) as 1 | 2 | 3;
  })(),
  setSpeedMode: (speedMode) => {
    save("pigeon-sk8-speed-v2", speedMode);
    save("pigeon-sk8-speed", speedMode);
    set({ speedMode });
  },
  turnMode: (() => {
    const m = load<string>("pigeon-sk8-turn", "new");
    return (m === "old" ? "old" : "new") as TurnMode;
  })(),
  setTurnMode: (turnMode) => {
    save("pigeon-sk8-turn", turnMode);
    set({ turnMode });
  },
  trackMode: (() => {
    const m = load<string>("pigeon-sk8-trackmode", "shibuya");
    return (m === "haruna" || m === "tokyo" ? m : "shibuya") as TrackMode;
  })(),
  cameraMode: (() => {
    const m = load<string>("pigeon-sk8-camera-v2", "chase");
    return m === "crossy" ? "crossy" : "chase";
  })(),
  setCameraMode: (cameraMode) => {
    save("pigeon-sk8-camera-v2", cameraMode);
    save("pigeon-sk8-camera", cameraMode);
    set({ cameraMode });
  },
  camHeight: CAM_VIEW_INIT.h,
  camAngle: CAM_VIEW_INIT.a,
  camDist: CAM_VIEW_INIT.d,
  camAdjusting: false,
  setCamHeight: (v) => {
    const camHeight = Math.max(-3, Math.min(7, Math.round(v * 10) / 10));
    save("pigeon-sk8-cam-view", { h: camHeight, a: get().camAngle, d: get().camDist });
    set({ camHeight });
  },
  setCamAngle: (v) => {
    const camAngle = Math.max(-3, Math.min(5, Math.round(v * 10) / 10));
    save("pigeon-sk8-cam-view", { h: get().camHeight, a: camAngle, d: get().camDist });
    set({ camAngle });
  },
  setCamDist: (v) => {
    const camDist = Math.max(-3, Math.min(6, Math.round(v * 10) / 10));
    save("pigeon-sk8-cam-view", { h: get().camHeight, a: get().camAngle, d: camDist });
    set({ camDist });
  },
  setCamAdjusting: (camAdjusting) => set({ camAdjusting }),
  resetCamView: () => {
    save("pigeon-sk8-cam-view", { ...CAM_VIEW_DEFAULT });
    set({ camHeight: CAM_VIEW_DEFAULT.h, camAngle: CAM_VIEW_DEFAULT.a, camDist: CAM_VIEW_DEFAULT.d });
  },
  pigeonSize: PIGEON_ADJUST_INIT.size,
  pigeonPosY: PIGEON_ADJUST_INIT.y,
  pigeonPosX: PIGEON_ADJUST_INIT.x,
  pigeonAdjusting: false,
  setPigeonSize: (v) => {
    const pigeonSize = Math.max(0.5, Math.min(2.2, Math.round(v * 20) / 20));
    save("pigeon-sk8-body-adjust", { size: pigeonSize, y: get().pigeonPosY, x: get().pigeonPosX });
    set({ pigeonSize });
  },
  setPigeonPosY: (v) => {
    const pigeonPosY = Math.max(-0.4, Math.min(0.6, Math.round(v * 20) / 20));
    save("pigeon-sk8-body-adjust", { size: get().pigeonSize, y: pigeonPosY, x: get().pigeonPosX });
    set({ pigeonPosY });
  },
  setPigeonPosX: (v) => {
    const pigeonPosX = Math.max(-0.4, Math.min(0.4, Math.round(v * 20) / 20));
    save("pigeon-sk8-body-adjust", { size: get().pigeonSize, y: get().pigeonPosY, x: pigeonPosX });
    set({ pigeonPosX });
  },
  setPigeonAdjusting: (pigeonAdjusting) => set({ pigeonAdjusting }),
  resetPigeonAdjust: () => {
    save("pigeon-sk8-body-adjust", { ...PIGEON_ADJUST_DEFAULT });
    save("pigeon-sk8-buddy-scale", { scale: BUDDY_SCALE_DEFAULT });
    set({
      pigeonSize: PIGEON_ADJUST_DEFAULT.size,
      pigeonPosY: PIGEON_ADJUST_DEFAULT.y,
      pigeonPosX: PIGEON_ADJUST_DEFAULT.x,
      buddyScale: BUDDY_SCALE_DEFAULT,
    });
  },
  buddyScale: BUDDY_SCALE_INIT,
  setBuddyScale: (v) => {
    const scale = Math.max(0.4, Math.min(2.5, Math.round(v * 100) / 100));
    save("pigeon-sk8-buddy-scale", { scale });
    set({ buddyScale: scale });
  },
  resetBuddyScale: () => {
    save("pigeon-sk8-buddy-scale", { scale: BUDDY_SCALE_DEFAULT });
    set({ buddyScale: BUDDY_SCALE_DEFAULT });
  },
  weather: ((): "sunny" | "cloudy" | "snow" => {
    const w = load<string>("pigeon-sk8-weather", "sunny");
    return w === "cloudy" || w === "snow" ? (w as "cloudy" | "snow") : "sunny";
  })(),
  toggleWeather: () => {
    const cur = get().weather;
    const weather: "sunny" | "cloudy" | "snow" = cur === "sunny" ? "cloudy" : cur === "cloudy" ? "snow" : "sunny";
    save("pigeon-sk8-weather", weather);
    set({ weather });
  },
  nightBright: ((): 0 | 1 | 2 => {
    const v = load<number>("pigeon-sk8-nightbright", 1);
    return v === 0 || v === 2 ? v : 1;
  })(),
  cycleNightBright: () => {
    const nightBright = (((get().nightBright + 1) % 3) as 0 | 1 | 2);
    save("pigeon-sk8-nightbright", nightBright);
    set({ nightBright });
  },
  shibuyaTime: ((): "pagi" | "siang" | "sore" | "malam" => {
    const v = load<string>("pigeon-sk8-shibuyatime", "siang");
    return v === "pagi" || v === "sore" || v === "malam" ? v : "siang";
  })(),
  cycleShibuyaTime: () => {
    const order = ["pagi", "siang", "sore", "malam"] as const;
    const shibuyaTime = order[(order.indexOf(get().shibuyaTime) + 1) % 4];
    save("pigeon-sk8-shibuyatime", shibuyaTime);
    set({ shibuyaTime });
  },
  setTrackMode: (trackMode) => {
    save("pigeon-sk8-trackmode", trackMode);
    set({ trackMode });
  },
  deckAdjustments: (() => {
    const saved = load<Record<string, Partial<DeckAdjustment>>>("pigeon-sk8-deck-adjustments-v3", null as any);
    if (!saved) {
      save("pigeon-sk8-deck-adjustments-v3", DEFAULT_DECK_ADJUSTMENTS);
      save("pigeon-sk8-deck-adjustments", DEFAULT_DECK_ADJUSTMENTS);
      return { ...DEFAULT_DECK_ADJUSTMENTS };
    }
    const result = { ...DEFAULT_DECK_ADJUSTMENTS };
    for (const [key, val] of Object.entries(saved)) {
      if (key in result && val) {
        result[key as DeckId] = {
          ...result[key as DeckId],
          ...val,
        };
      }
    }
    return result;
  })(),
  setDeckAdjustment: (id, adj) => {
    const prev = get().deckAdjustments;
    const current = prev[id] || DEFAULT_DECK_ADJUSTMENTS[id] || { scale: 1, scaleX: 1, scaleY: 1, scaleZ: 1, offsetY: 0 };
    const updated = {
      ...prev,
      [id]: {
        ...current,
        ...adj,
      },
    };
    save("pigeon-sk8-deck-adjustments-v3", updated);
    save("pigeon-sk8-deck-adjustments", updated);
    set({ deckAdjustments: updated });
  },
  resetDeckAdjustment: (id) => {
    const prev = get().deckAdjustments;
    const updated = {
      ...prev,
      [id]: { ...(DEFAULT_DECK_ADJUSTMENTS[id] || { scale: 1, scaleX: 1, scaleY: 1, scaleZ: 1, offsetY: 0 }) },
    };
    save("pigeon-sk8-deck-adjustments-v3", updated);
    save("pigeon-sk8-deck-adjustments", updated);
    set({ deckAdjustments: updated });
  },
  resetAllDeckAdjustments: () => {
    const updated = { ...DEFAULT_DECK_ADJUSTMENTS };
    save("pigeon-sk8-deck-adjustments-v3", updated);
    save("pigeon-sk8-deck-adjustments", updated);
    set({ deckAdjustments: updated });
  },
  applyDefaultJsonAdjustments: () => {
    const updated = { ...DEFAULT_DECK_ADJUSTMENTS };
    save("pigeon-sk8-deck-adjustments-v3", updated);
    save("pigeon-sk8-deck-adjustments", updated);
    set({ deckAdjustments: updated });
  },
  deckAdjustOpen: false,
  setDeckAdjustOpen: (deckAdjustOpen) => set({ deckAdjustOpen }),
  adjustTargetDeck: "default",
  setAdjustTargetDeck: (adjustTargetDeck) => set({ adjustTargetDeck }),
  importDeckAdjustments: (incoming) => {
    if (!incoming || typeof incoming !== "object") return false;
    const prev = get().deckAdjustments;
    const updated = { ...prev };
    let changed = false;
    for (const [deckId, values] of Object.entries(incoming)) {
      if (deckId in updated && values && typeof values === "object") {
        updated[deckId as DeckId] = {
          ...updated[deckId as DeckId],
          scale: typeof values.scale === "number" && isFinite(values.scale) ? Math.max(0.4, Math.min(2.5, values.scale)) : updated[deckId as DeckId].scale,
          scaleX: typeof values.scaleX === "number" && isFinite(values.scaleX) ? Math.max(0.4, Math.min(2.5, values.scaleX)) : updated[deckId as DeckId].scaleX,
          scaleY: typeof values.scaleY === "number" && isFinite(values.scaleY) ? Math.max(0.4, Math.min(2.5, values.scaleY)) : updated[deckId as DeckId].scaleY,
          scaleZ: typeof values.scaleZ === "number" && isFinite(values.scaleZ) ? Math.max(0.4, Math.min(2.5, values.scaleZ)) : updated[deckId as DeckId].scaleZ,
          offsetY: typeof values.offsetY === "number" && isFinite(values.offsetY) ? Math.max(-0.25, Math.min(0.25, values.offsetY)) : updated[deckId as DeckId].offsetY,
        };
        changed = true;
      }
    }
    if (changed) {
      save("pigeon-sk8-deck-adjustments", updated);
      set({ deckAdjustments: updated });
      return true;
    }
    return false;
  },
  deckOverride: (() => {
    const d = load<string>("pigeon-sk8-deck", "default");
    return DECKS.some((k) => k.id === d) ? (d as DeckId) : "default";
  })(),
  setDeckOverride: (deckOverride) => {
    save("pigeon-sk8-deck", deckOverride);
    set({ deckOverride });
  },
  wheelColor: (() => {
    const w = load<string>("pigeon-sk8-wheels", "black");
    return (["auto", "black", "red", "green", "yellow", "blue"].includes(w) ? w : "black") as WheelColor;
  })(),
  setWheelColor: (wheelColor) => {
    save("pigeon-sk8-wheels", wheelColor);
    set({ wheelColor });
  },
  worldCurve: (() => {
    const c = load<string>("pigeon-sk8-worldcurve", "subway");
    return (c === "flat" ? "flat" : "subway") as "subway" | "flat";
  })(),
  setWorldCurve: (worldCurve) => {
    save("pigeon-sk8-worldcurve", worldCurve);
    set({ worldCurve });
  },
  tricksOn: initialTricks,
  toggleTrick: (k) => {
    const tricksOn = { ...get().tricksOn, [k]: !get().tricksOn[k] };
    save("pigeon-sk8-tricks", tricksOn);
    set({ tricksOn });
    get().recheckAchievements();
  },
  setAllTricks: (on) => {
    const tricksOn = Object.fromEntries(TRICKS.map((t) => [t.kind, on])) as Record<TrickKind, boolean>;
    save("pigeon-sk8-tricks", tricksOn);
    set({ tricksOn });
    get().recheckAchievements();
  },
  setPhase: (phase) => set({ phase }),
  setMenuView: (menuView) => set({ menuView }),
  setHud: (score, bread, combo, dist, nos, nosActive) => {
    const s = get();
    const n = Math.round(nos);
    if (s.score !== score || s.bread !== bread || s.combo !== combo || s.dist !== dist || s.nos !== n || s.nosActive !== nosActive) set({ score, bread, combo, dist, nos: n, nosActive });
  },
  addPopup: (text, color, sub) => {
    const id = ++popupId;
    set((s) => ({ popups: [...s.popups.slice(-2), { id, text, sub, color }] }));
    setTimeout(() => set((s) => ({ popups: s.popups.filter((p) => p.id !== id) })), 1100);
  },
  finishRun: (score, bread, cause) => {
    const s = get();
    const isNewBest = score > s.best;
    const best = Math.max(s.best, score);
    const wallet = s.wallet + bread;
    save("pigeon-sk8-best", best);
    save("pigeon-sk8-wallet", wallet);
    set({ score, bread, best, wallet, isNewBest, phase: "gameover", runs: s.runs + 1, crashCause: cause, newAch: [] });
    get().recheckAchievements();
  },
  toggleMute: () => {
    const muted = !get().muted;
    save("pigeon-sk8-muted", muted);
    set({ muted });
  },
  setTutorialSeen: () => {
    save("pigeon-sk8-tutor", true);
    set({ tutorialSeen: true });
  },
  selectSkin: (id) => {
    if (!get().unlocked.includes(id)) return;
    save("pigeon-sk8-skin", id);
    set({ skin: id, preview: id });
  },
  setPreview: (id) => set({ preview: id }),
  /** Character carousel: browse every skin; unlocked ones are equipped immediately. */
  cycleSkin: (dir) => {
    const s = get();
    const i = SKINS.findIndex((k) => k.id === s.preview);
    const next = SKINS[(i + dir + SKINS.length) % SKINS.length];
    if (s.unlocked.includes(next.id)) {
      save("pigeon-sk8-skin", next.id);
      set({ skin: next.id, preview: next.id });
    } else set({ preview: next.id });
  },
  unlockSkin: (id) => {
    const s = get();
    const skin = getSkin(id);
    if (s.unlocked.includes(id)) return true;
    if (s.wallet < skin.cost) return false;
    const unlocked = [...s.unlocked, id];
    const wallet = s.wallet - skin.cost;
    save("pigeon-sk8-unlocked", unlocked);
    save("pigeon-sk8-wallet", wallet);
    save("pigeon-sk8-skin", id);
    set({ unlocked, wallet, skin: id, preview: id });
    get().recheckAchievements();
    return true;
  },
  wordHunt: loadWordHunt(),
  showMysteryBox: false,
  setShowMysteryBox: (showMysteryBox) => set({ showMysteryBox }),
  collectWordLetter: (index) => {
    const s = get();
    const hunt = { ...s.wordHunt };
    if (index >= 0 && index < hunt.word.length && !hunt.collected[index]) {
      const nextCollected = [...hunt.collected];
      nextCollected[index] = true;
      const allDone = nextCollected.every(Boolean);
      const updated: WordHuntData = {
        ...hunt,
        collected: nextCollected,
        pendingBox: allDone && !hunt.claimed ? true : hunt.pendingBox,
      };
      saveWordHunt(updated);
      set({ wordHunt: updated });
      const remaining = nextCollected.filter((c) => !c).length;
      return {
        completed: allDone,
        char: hunt.word[index],
        remaining,
      };
    }
    const remaining = hunt.collected.filter((c) => !c).length;
    return { completed: hunt.collected.every(Boolean), char: hunt.word[index] || "", remaining };
  },
  claimMysteryBox: () => {
    const s = get();
    const hunt = { ...s.wordHunt };
    const breadReward = 600 + Math.floor(Math.random() * 400); // 600 - 1000 bread
    const scoreReward = 3000 + Math.floor(Math.random() * 2000); // 3000 - 5000 score
    const newWallet = s.wallet + breadReward;
    save("pigeon-sk8-wallet", newWallet);

    const updated: WordHuntData = {
      ...hunt,
      pendingBox: false,
      claimed: true,
    };
    saveWordHunt(updated);
    set({
      wallet: newWallet,
      wordHunt: updated,
    });
    get().recheckAchievements(); // achievement 🎁 Pemburu Kata & wallet total
    return {
      bread: breadReward,
      score: scoreReward,
      title: "HADIAH PETI MISTERI!",
    };
  },
  unseenAch: unseenCount(),
  newAch: [],
  /**
   * Evaluasi ulang semua achievement dari state terkini. Yang baru tercapai
   * langsung memberi hadiah roti ke wallet + menambah badge merah di tombol 🏆.
   */
  recheckAchievements: () => {
    const s = get();
    const newly = evaluate({
      best: s.best,
      wallet: s.wallet,
      skinsUnlocked: s.unlocked.length,
      tricksAllOn: TRICKS.every((t) => s.tricksOn[t.kind]),
      wordDone: s.wordHunt.claimed,
    });
    if (!newly.length) return;
    const bonus = newly.reduce((sum, id) => sum + (getAch(id)?.reward ?? 0), 0);
    const wallet = s.wallet + bonus;
    save("pigeon-sk8-wallet", wallet);
    set({ wallet, newAch: [...s.newAch, ...newly], unseenAch: unseenCount() });
  },
  markAchSeen: () => {
    markAllSeen();
    set({ unseenAch: 0, newAch: [] });
  },
}));
