import * as THREE from "three";
import { SKINS, DECKS, getSkin, type DeckId } from "./skins";
import { useUI } from "./store";
import { buildPigeonGroup, buildBoardGroup } from "./pigeonRig";
import { curveUniforms } from "./curve";

export const THUMB_FRAME_COUNT = 16;

/**
 * Framing sprite yang seragam untuk semua karakter & papan:
 * - isi sprite tidak melebihi THUMB_FILL_H (tinggi) / THUMB_FILL_W (lebar) frame,
 * - dasar isi sprite (kaki/roda) selalu bertumpu di garis yang sama, yaitu
 *   THUMB_BASE_F dari atas frame.
 * Berkat garis dasar yang identik, karakter besar dan barisan karakter kecil
 * bisa disejajarkan secara eksak walaupun ukuran tampilannya berbeda.
 */
export const THUMB_FILL_H = 0.68;
export const THUMB_FILL_W = 0.88;
export const THUMB_BASE_F = 0.94;

/**
 * Menormalkan posisi & skala grup di depan kamera ortografis. Batas gabungan
 * seluruh frame putaran dipakai supaya tidak ada frame yang terpotong, lalu
 * grup digeser sehingga dasar konten selalu berada di garis yang sama.
 */
function frameThumb(
  group: THREE.Object3D,
  cam: THREE.OrthographicCamera,
  baseRotation: number,
  baseScale: number,
) {
  cam.updateMatrixWorld(true);
  const camRight = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
  const camUp = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
  const half = (cam.top - cam.bottom) / 2;

  // Ukur pada skala dasar dulu supaya faktor skala akhir tepat
  group.scale.setScalar(baseScale);

  // Batas gabungan semua frame putaran
  const union = new THREE.Box3();
  const frameBox = new THREE.Box3();
  for (let frame = 0; frame < THUMB_FRAME_COUNT; frame += 1) {
    group.rotation.y = baseRotation + (frame / THUMB_FRAME_COUNT) * Math.PI * 2;
    frameBox.setFromObject(group);
    union.union(frameBox);
  }

  // Proyeksikan sudut kotak ke bidang kamera (kamera menghadap origin, jadi
  // koordinat bidang kamera = titik · sumbu kamera)
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const corner = new THREE.Vector3();
  for (const x of [union.min.x, union.max.x]) {
    for (const y of [union.min.y, union.max.y]) {
      for (const z of [union.min.z, union.max.z]) {
        corner.set(x, y, z);
        const px = corner.dot(camRight);
        const py = corner.dot(camUp);
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    }
  }
  const width = Math.max(maxX - minX, 1e-6);
  const height = Math.max(maxY - minY, 1e-6);
  const scale = Math.min((THUMB_FILL_H * 2 * half) / height, (THUMB_FILL_W * 2 * half) / width);
  group.scale.setScalar(baseScale * scale);

  // Geser grup agar dasar konten tepat di garis target dan konten tetap di tengah
  const targetBase = half - 2 * half * THUMB_BASE_F;
  group.position.addScaledVector(camUp, targetBase - minY * scale);
  group.position.addScaledVector(camRight, -((minX + maxX) / 2) * scale);
}

const cache = new Map<string, { first: string; sprite: string }>();
const deckCache = new Map<string, { first: string; sprite: string }>();
const spinningThumbs = new Set<HTMLElement>();
let failed = false;
let deckFailed = false;
let listeners: (() => void)[] = [];
let deckListeners: (() => void)[] = [];
let spinStart = 0;
let spinRaf = 0;
let lastSpinFrame = -1;

function tickThumbSpin(now: number) {
  const frame = Math.floor((now - spinStart) / 105) % THUMB_FRAME_COUNT;
  if (frame !== lastSpinFrame) {
    const position = `${(frame / (THUMB_FRAME_COUNT - 1)) * 100}% 0%`;
    spinningThumbs.forEach((element) => {
      element.style.backgroundPosition = position;
    });
    lastSpinFrame = frame;
  }
  spinRaf = window.requestAnimationFrame(tickThumbSpin);
}

/** Register each visible card with one shared clock so every skin and deck turns together. */
export function registerThumbSpin(element: HTMLElement) {
  spinningThumbs.add(element);
  element.style.backgroundPosition = "0% 0%";
  if (!spinRaf && typeof window !== "undefined") {
    spinStart = performance.now();
    lastSpinFrame = -1;
    spinRaf = window.requestAnimationFrame(tickThumbSpin);
  }
  return () => {
    spinningThumbs.delete(element);
    if (spinningThumbs.size === 0 && spinRaf) {
      window.cancelAnimationFrame(spinRaf);
      spinRaf = 0;
      lastSpinFrame = -1;
    }
  };
}

export function getThumb(id: string): string | undefined {
  return cache.get(id)?.first;
}

export function getThumbSprite(id: string): string | undefined {
  return cache.get(id)?.sprite;
}

export function onThumbsReady(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function getDeckThumb(id: string): string | undefined {
  return deckCache.get(id)?.first;
}

export function getDeckThumbSprite(id: string): string | undefined {
  return deckCache.get(id)?.sprite;
}

export function onDeckThumbsReady(fn: () => void) {
  deckListeners.push(fn);
  return () => {
    deckListeners = deckListeners.filter((l) => l !== fn);
  };
}

/**
 * Renders every skin into one sixteen-frame sprite strip. The shared animation
 * clock moves only background-position, avoiding React re-renders and image
 * decoding on every frame.
 */
export function ensureThumbs(size = 208, force = false): boolean {
  if (force) cache.clear();
  if (cache.size === SKINS.length) return true;
  if (failed || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = size * THUMB_FRAME_COUNT;
    spriteCanvas.height = size;
    const spriteContext = spriteCanvas.getContext("2d");
    if (!spriteContext) return false;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "low-power" });
    renderer.setPixelRatio(1);
    renderer.setSize(size, size, false);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight("#ffffff", "#b0c4d8", 1.7));
    scene.add(new THREE.AmbientLight("#ffffff", 0.2));
    const sun = new THREE.DirectionalLight("#ffffff", 2.1);
    sun.position.set(-2, 25, 4.5);
    scene.add(sun);

    // Almost eye-level: the character should read front-on, centered without skateboard.
    const half = 0.88;
    const cam = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 100);
    cam.position.set(-5.2, 0.8, 7.4).normalize().multiplyScalar(30);
    cam.lookAt(0, 0, 0);

    const savedDown = curveUniforms.uCurveDown.value;
    curveUniforms.uCurveDown.value = 0;
    for (const skin of SKINS) {
      const { group, dispose } = buildPigeonGroup(skin, "default", useUI.getState().wheelColor, false);
      scene.add(group);
      frameThumb(group, cam, 4.35, 1.22);
      for (let frame = 0; frame < THUMB_FRAME_COUNT; frame += 1) {
        group.rotation.y = 4.35 + (frame / THUMB_FRAME_COUNT) * Math.PI * 2;
        renderer.render(scene, cam);
        spriteContext.drawImage(canvas, frame * size, 0, size, size);
      }
      cache.set(skin.id, {
        first: canvas.toDataURL("image/png"),
        sprite: spriteCanvas.toDataURL("image/png"),
      });
      spriteContext.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
      scene.remove(group);
      dispose();
    }
    curveUniforms.uCurveDown.value = savedDown;
    renderer.dispose();
    listeners.forEach((l) => l());
    return true;
  } catch {
    failed = true;
    return false;
  }
}

/**
 * Renders every skateboard deck into one sixteen-frame rotating sprite strip.
 * Features the isolated 3D board rotating 360 degrees so top grip, graphics,
 * side profile, and wheels all show smoothly on the showcase turntable.
 */
export function ensureDeckThumbs(size = 208, force = false): boolean {
  if (force) deckCache.clear();
  if (deckCache.size === DECKS.length) return true;
  if (deckFailed || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = size * THUMB_FRAME_COUNT;
    spriteCanvas.height = size;
    const spriteContext = spriteCanvas.getContext("2d");
    if (!spriteContext) return false;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(1);
    renderer.setSize(size, size, false);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight("#ffffff", "#9ab8d0", 1.9));
    scene.add(new THREE.AmbientLight("#ffffff", 0.35));
    const sun = new THREE.DirectionalLight("#ffffff", 2.2);
    sun.position.set(4, 18, 8);
    scene.add(sun);
    const fill = new THREE.DirectionalLight("#ffffff", 0.85);
    fill.position.set(-6, 8, -4);
    scene.add(fill);

    // Camera framed on the skateboard turntable (looking at board from ~28 deg elevated angle)
    const half = 1.35;
    const cam = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 100);
    cam.position.set(-2.8, 2.2, 3.4).normalize().multiplyScalar(25);
    cam.lookAt(0, 0, 0);

    const savedDown = curveUniforms.uCurveDown.value;
    curveUniforms.uCurveDown.value = 0;

    const currentSkin = getSkin(useUI.getState().skin);
    const wheelColor = useUI.getState().wheelColor;

    for (const deck of DECKS) {
      const { group, dispose } = buildBoardGroup(deck.id, wheelColor, currentSkin);
      scene.add(group);
      frameThumb(group, cam, 0.55, 1.05);

      for (let frame = 0; frame < THUMB_FRAME_COUNT; frame += 1) {
        // Initial angle offset so the first frame is an attractive 3/4 hero view
        group.rotation.y = 0.55 + (frame / THUMB_FRAME_COUNT) * Math.PI * 2;
        renderer.render(scene, cam);
        spriteContext.drawImage(canvas, frame * size, 0, size, size);
      }

      deckCache.set(deck.id, {
        first: canvas.toDataURL("image/png"),
        sprite: spriteCanvas.toDataURL("image/png"),
      });
      spriteContext.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
      scene.remove(group);
      dispose();
    }

    curveUniforms.uCurveDown.value = savedDown;
    renderer.dispose();
    deckListeners.forEach((l) => l());
    return true;
  } catch (e) {
    console.error("Failed to render deck thumbs:", e);
    deckFailed = true;
    return false;
  }
}


/* ───────────────────────── Preview besar (hero) ─────────────────────────
 * Sprite bersama dirender 208px agar barisan item ringan. Untuk preview
 * besar yang butuh resolusi tinggi, satu item dirender ulang pada ukuran
 * HERO_SIZE dengan framing yang sama persis — jadi posisi kaki karakter
 * tetap identik dan pertukaran sprite tidak menggeser apa pun.
 */

export type HeroKind = "skin" | "deck";
type HeroId = string;
const HERO_SIZE = 384;
const heroCache = new Map<string, { first: string; sprite: string }>();
let heroListeners: (() => void)[] = [];
let heroRenderer: THREE.WebGLRenderer | null = null;
let heroWanted: { kind: HeroKind; id: string } | null = null;
let heroRaf = 0;

export function getHeroSprite(kind: HeroKind, id: string): string | undefined {
  return heroCache.get(`${kind}:${id}`)?.sprite;
}

export function onHeroReady(fn: () => void) {
  heroListeners.push(fn);
  return () => {
    heroListeners = heroListeners.filter((l) => l !== fn);
  };
}

export function clearHeroCache() {
  heroCache.clear();
}

/** Minta render hero resolusi tinggi; false berarti masih diproses. */
export function ensureHeroThumb(kind: HeroKind, id: HeroId): boolean {
  const key = `${kind}:${id}`;
  if (heroCache.has(key) || typeof document === "undefined") return heroCache.has(key);
  heroWanted = { kind, id };
  if (heroRaf) return false;
  heroRaf = requestAnimationFrame(() => {
    heroRaf = 0;
    const wanted = heroWanted;
    heroWanted = null;
    if (!wanted) return;
    const wantedKey = `${wanted.kind}:${wanted.id}`;
    if (heroCache.has(wantedKey)) return;
    let built: { first: string; sprite: string } | null = null;
    try {
      built = renderHeroThumb(wanted.kind, wanted.id);
    } catch {
      built = null;
    }
    if (built) {
      heroCache.set(wantedKey, built);
      heroListeners.forEach((l) => l());
    }
  });
  return false;
}

function renderHeroThumb(kind: HeroKind, id: HeroId): { first: string; sprite: string } | null {
  const isDeck = kind === "deck";
  if (!heroRenderer) {
    const canvas = document.createElement("canvas");
    canvas.width = HERO_SIZE;
    canvas.height = HERO_SIZE;
    heroRenderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "low-power",
    });
    heroRenderer.setPixelRatio(1);
    heroRenderer.toneMapping = THREE.NoToneMapping;
    heroRenderer.setClearColor(0x000000, 0);
  }
  const renderer = heroRenderer;
  renderer.setSize(HERO_SIZE, HERO_SIZE, false);

  const scene = new THREE.Scene();
  if (isDeck) {
    scene.add(new THREE.HemisphereLight("#ffffff", "#9ab8d0", 1.9));
    scene.add(new THREE.AmbientLight("#ffffff", 0.35));
    const sun = new THREE.DirectionalLight("#ffffff", 2.2);
    sun.position.set(4, 18, 8);
    scene.add(sun);
    const fill = new THREE.DirectionalLight("#ffffff", 0.85);
    fill.position.set(-6, 8, -4);
    scene.add(fill);
  } else {
    scene.add(new THREE.HemisphereLight("#ffffff", "#b0c4d8", 1.7));
    scene.add(new THREE.AmbientLight("#ffffff", 0.2));
    const sun = new THREE.DirectionalLight("#ffffff", 2.1);
    sun.position.set(-2, 25, 4.5);
    scene.add(sun);
  }

  const half = isDeck ? 1.35 : 0.88;
  const cam = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 100);
  if (isDeck) cam.position.set(-2.8, 2.2, 3.4).normalize().multiplyScalar(25);
  else cam.position.set(-5.2, 0.8, 7.4).normalize().multiplyScalar(30);
  cam.lookAt(0, 0, 0);

  const built = isDeck
    ? buildBoardGroup(id as DeckId, useUI.getState().wheelColor, getSkin(useUI.getState().skin))
    : buildPigeonGroup(getSkin(id), "default", useUI.getState().wheelColor, false);
  const { group, dispose } = built;
  scene.add(group);
  frameThumb(group, cam, isDeck ? 0.55 : 4.35, isDeck ? 1.05 : 1.22);

  const spriteCanvas = document.createElement("canvas");
  spriteCanvas.width = HERO_SIZE * THUMB_FRAME_COUNT;
  spriteCanvas.height = HERO_SIZE;
  const spriteContext = spriteCanvas.getContext("2d");
  if (!spriteContext) {
    scene.remove(group);
    dispose();
    return null;
  }

  const savedDown = curveUniforms.uCurveDown.value;
  curveUniforms.uCurveDown.value = 0;
  const baseRotation = isDeck ? 0.55 : 4.35;
  let first = "";
  for (let frame = 0; frame < THUMB_FRAME_COUNT; frame += 1) {
    group.rotation.y = baseRotation + (frame / THUMB_FRAME_COUNT) * Math.PI * 2;
    renderer.render(scene, cam);
    spriteContext.drawImage(renderer.domElement, frame * HERO_SIZE, 0, HERO_SIZE, HERO_SIZE);
    if (frame === 0) first = renderer.domElement.toDataURL("image/png");
  }
  const sprite = spriteCanvas.toDataURL("image/png");
  curveUniforms.uCurveDown.value = savedDown;
  scene.remove(group);
  dispose();
  return { first, sprite };
}
