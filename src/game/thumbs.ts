import * as THREE from "three";
import { SKINS, DECKS, getSkin } from "./skins";
import { useUI } from "./store";
import { buildPigeonGroup, buildBoardGroup } from "./pigeonRig";
import { curveUniforms } from "./curve";

export const THUMB_FRAME_COUNT = 16;
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
      group.scale.setScalar(1.22);
      scene.add(group);
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
      group.scale.setScalar(1.05);
      scene.add(group);

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

