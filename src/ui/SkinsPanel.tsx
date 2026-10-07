import { useEffect, useRef, useState } from "react";
import { useUI, WHEEL_COLORS, type WheelColor } from "../game/store";
import { getSkin, SKINS, DECKS, type Skin, type DeckOption } from "../game/skins";
import { VOXEL_BOARD_IDS } from "../game/buddiesSkins";
import { sfx } from "../game/audio";
import { engine } from "../game/engine";
import { ensureThumbs, ensureDeckThumbs, getThumb, getThumbSprite, getDeckThumb, getDeckThumbSprite, onThumbsReady, onDeckThumbsReady, registerThumbSpin, THUMB_FRAME_COUNT } from "../game/thumbs";
import { BreadIcon } from "./BreadIcon";
import { PigeonIcon } from "./PigeonIcon";
import { LockIcon } from "./LockIcon";

function useThumbs() {
  const [, force] = useState(0);
  useEffect(() => {
    const off1 = onThumbsReady(() => force((n) => n + 1));
    const off2 = onDeckThumbsReady(() => force((n) => n + 1));
    if (ensureThumbs()) force((n) => n + 1);
    if (ensureDeckThumbs()) force((n) => n + 1);
    return () => {
      off1();
      off2();
    };
  }, []);
}

function Thumb({ skin, locked, size }: { skin: Skin; locked: boolean; size: number }) {
  const spinRef = useRef<HTMLSpanElement>(null);
  const sprite = getThumbSprite(skin.id);
  const url = getThumb(skin.id);
  const style = locked ? { filter: "grayscale(0.85) brightness(0.8)" } : undefined;

  useEffect(() => {
    const element = spinRef.current;
    if (!element || !sprite) return;
    return registerThumbSpin(element);
  }, [sprite]);

  if (sprite) {
    return (
      <span
        ref={spinRef}
        role="img"
        aria-label={skin.name}
        className="skin-thumb-spin select-none"
        style={{
          ...style,
          width: size,
          height: size,
          backgroundImage: `url(${sprite})`,
          backgroundSize: `${THUMB_FRAME_COUNT * 100}% 100%`,
        }}
      />
    );
  }
  if (url) return <img src={url} width={size} height={size} draggable={false} alt={skin.name} style={style} className="select-none" />;
  return <PigeonIcon skin={skin} size={size} locked={locked} />;
}

type SkinRarity = "BASIC" | "EPIC" | "LEGENDARY" | "UNIQUE";

const RARITY_META: Record<SkinRarity, { label: string; accent: string; badge: string; image: string; card: string }> = {
  BASIC: {
    label: "BASIC",
    accent: "#2ec4b6",
    badge: "bg-[#2ec4b6] text-white shadow-[0_2px_0_#1f9a8f]",
    image: "bg-gradient-to-b from-[#bfe6ff] to-[#e9f6ff]",
    card: "bg-[#f4fffd] ring-2 ring-[#2ec4b6]/35",
  },
  EPIC: {
    label: "EPIC",
    accent: "#8b5cf6",
    badge: "bg-[#8b5cf6] text-white shadow-[0_2px_0_#6841c7]",
    image: "bg-gradient-to-b from-[#e7d9ff] to-[#f7f0ff]",
    card: "bg-[#fbf8ff] ring-2 ring-[#8b5cf6]/35",
  },
  LEGENDARY: {
    label: "LEGENDARY",
    accent: "#f59e0b",
    badge: "bg-[#f59e0b] text-white shadow-[0_2px_0_#c56f00]",
    image: "bg-gradient-to-b from-[#ffe0a3] to-[#fff5d9]",
    card: "bg-[#fffaf0] ring-2 ring-[#f59e0b]/40",
  },
  UNIQUE: {
    label: "UNIQUE",
    accent: "#ef476f",
    badge: "bg-[#ef476f] text-white shadow-[0_2px_0_#b92d51]",
    image: "bg-gradient-to-b from-[#ffd1e0] to-[#fff0f7]",
    card: "bg-[#fff6fa] ring-2 ring-[#ef476f]/40",
  },
};

function getSkinRarity(skin: Skin): SkinRarity {
  if (skin.cost >= 200) return "UNIQUE";
  if (skin.cost >= 100) return "LEGENDARY";
  if (skin.cost >= 30) return "EPIC";
  return "BASIC";
}

function SkinCard({ skin }: { skin: Skin }) {
  const rarity = getSkinRarity(skin);
  const rarityMeta = RARITY_META[rarity];
  const equipped = useUI((s) => s.skin) === skin.id;
  const previewing = useUI((s) => s.preview) === skin.id;
  const unlocked = useUI((s) => s.unlocked).includes(skin.id);
  const wallet = useUI((s) => s.wallet);
  const selectSkin = useUI((s) => s.selectSkin);
  const setPreview = useUI((s) => s.setPreview);
  const affordable = wallet >= skin.cost;

  const onClick = () => {
    sfx.click();
    if (unlocked) selectSkin(skin.id);
    else setPreview(skin.id);
    setPreview(skin.id);
    engine.skinPop();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full flex-col items-center rounded-[16px] border-t-4 px-1.5 pb-1.5 pt-1.5 shadow-[0_3px_0_rgba(0,0,0,0.12)] transition-transform hover:z-10 hover:scale-[1.015] active:translate-y-[2px] active:shadow-none ${
        previewing
          ? "bg-[#e6f7f5] ring-[3px] ring-[#2ec4b6]"
          : skin.badgeLabel
            ? "bg-[#fffcf7] ring-2 ring-[#ff9f1c]/35"
            : rarityMeta.card
      }`}
      style={{ borderTopColor: skin.badgeLabel ? "#ff9f1c" : rarityMeta.accent }}
    >
      <div
        className={`absolute left-1.5 top-0.5 z-20 rounded-full px-1.5 py-0.5 font-display text-[2.1cqw] leading-none ${
          skin.badgeLabel
            ? "bg-gradient-to-r from-[#ff9f1c] to-[#e63946] text-white shadow-[0_2px_0_rgba(180,60,0,0.35)]"
            : rarityMeta.badge
        }`}
      >
        {skin.badgeLabel ? `🦊 ${skin.badgeLabel}` : rarityMeta.label}
      </div>
      <div
        className={`relative flex h-[23cqw] w-full items-center justify-center overflow-hidden rounded-[12px] ${
          skin.badgeLabel ? "bg-gradient-to-b from-[#fff0d6] to-[#ffe3bd]" : rarityMeta.image
        }`}
      >
        <Thumb skin={skin} locked={!unlocked} size={112} />
        {!unlocked && (
          <div className="absolute right-1 top-1">
            <LockIcon size={15} />
          </div>
        )}
        {equipped && <div className="absolute right-1 top-1 rounded-full bg-[#2ec4b6] px-1.5 py-0.5 font-display text-[2cqw] leading-none text-white shadow-[0_2px_0_#1f9a8f]">ON</div>}
      </div>
      <div className="mt-0.5 w-full truncate text-center font-body text-[2.7cqw] font-extrabold text-[#1f2430]">{skin.name}</div>
      {unlocked ? (
        <div className="mt-0.5 font-display text-[2.3cqw] leading-none text-[#1f9a8f]">{equipped ? "EQUIPPED" : skin.cost === 0 ? "FREE" : "OWNED"}</div>
      ) : (
        <div className={`mt-0.5 flex items-center gap-1 font-display text-[2.5cqw] leading-none ${affordable ? "text-[#b58600]" : "text-[#9aa1ad]"}`}>
          <BreadIcon size={11} />
          {skin.cost}
        </div>
      )}
    </button>
  );
}

function DeckThumb({ deck, size }: { deck: DeckOption; size: number }) {
  const spinRef = useRef<HTMLSpanElement>(null);
  const sprite = getDeckThumbSprite(deck.id);
  const url = getDeckThumb(deck.id);

  useEffect(() => {
    const element = spinRef.current;
    if (!element || !sprite) return;
    return registerThumbSpin(element);
  }, [sprite]);

  if (sprite) {
    return (
      <span
        ref={spinRef}
        role="img"
        aria-label={deck.name}
        className="skin-thumb-spin select-none"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${sprite})`,
          backgroundSize: `${THUMB_FRAME_COUNT * 100}% 100%`,
        }}
      />
    );
  }
  if (url) {
    return (
      <img
        src={url}
        width={size}
        height={size}
        draggable={false}
        alt={deck.name}
        className="select-none"
      />
    );
  }
  return (
    <span className="text-4xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] select-none" role="img" aria-label={deck.name}>
      {deck.emoji}
    </span>
  );
}

function DeckCard({
  deck,
  active,
  previewing,
  onSelect,
}: {
  deck: DeckOption;
  active: boolean;
  previewing: boolean;
  onSelect: () => void;
}) {
  const isVoxel = VOXEL_BOARD_IDS.has(deck.id);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex w-full flex-col items-center rounded-[16px] border-t-4 px-1.5 pb-1.5 pt-1.5 shadow-[0_3px_0_rgba(0,0,0,0.12)] transition-transform hover:z-10 hover:scale-[1.015] active:translate-y-[2px] active:shadow-none ${
        previewing
          ? "bg-[#fff2db] ring-[3px] ring-[#ff9f1c]"
          : active
            ? "bg-[#f4fffd] ring-2 ring-[#2ec4b6]/40"
            : "bg-white ring-1 ring-black/5"
      }`}
      style={{ borderTopColor: isVoxel ? "#ff9f1c" : "#2ec4b6" }}
    >
      <div
        className={`absolute left-1.5 top-0.5 z-20 rounded-full px-1.5 py-0.5 font-display text-[2.1cqw] leading-none ${
          isVoxel
            ? "bg-gradient-to-r from-[#ff9f1c] to-[#e63946] text-white shadow-[0_2px_0_rgba(180,60,0,0.35)]"
            : "bg-[#2ec4b6] text-white shadow-[0_2px_0_#1f9a8f]"
        }`}
      >
        {deck.badge}
      </div>
      <div className="relative flex h-[23cqw] w-full items-center justify-center overflow-hidden rounded-[12px] bg-gradient-to-b from-[#fdf6ea] to-[#faecd3] shadow-inner">
        <DeckThumb deck={deck} size={88} />
        {active && (
          <div className="absolute right-1 top-1 rounded-full bg-[#2ec4b6] px-1.5 py-0.5 font-display text-[2cqw] leading-none text-white shadow-[0_2px_0_#1f9a8f]">
            ON
          </div>
        )}
      </div>
      <div className="mt-0.5 w-full truncate text-center font-body text-[2.7cqw] font-extrabold text-[#1f2430]">
        {deck.name}
      </div>
      <div className="mt-0.5 font-display text-[2.3cqw] leading-none text-[#c9700a]">
        {active ? "DIPAKAI ✓" : "PILIH"}
      </div>
    </button>
  );
}

export function SkinsPanel() {
  useThumbs();
  const [tab, setTab] = useState<"skins" | "decks">("skins");
  const [skinFilter, setSkinFilter] = useState<"all" | "original" | "buddies">("all");
  const wallet = useUI((s) => s.wallet);
  const setMenuView = useUI((s) => s.setMenuView);
  const previewId = useUI((s) => s.preview);
  const equippedId = useUI((s) => s.skin);
  const unlocked = useUI((s) => s.unlocked);
  const selectSkin = useUI((s) => s.selectSkin);
  const unlockSkin = useUI((s) => s.unlockSkin);
  const setPreview = useUI((s) => s.setPreview);
  const deckOverride = useUI((s) => s.deckOverride);
  const setDeckOverride = useUI((s) => s.setDeckOverride);
  const setDeckAdjustOpen = useUI((s) => s.setDeckAdjustOpen);
  const setAdjustTargetDeck = useUI((s) => s.setAdjustTargetDeck);
  const addPopup = useUI((s) => s.addPopup);
  const buddyScale = useUI((s) => s.buddyScale);
  const setBuddyScale = useUI((s) => s.setBuddyScale);
  const resetBuddyScale = useUI((s) => s.resetBuddyScale);

  const [deckFilter, setDeckFilter] = useState<"all" | "standard" | "buddies">("all");
  const [previewDeckId, setPreviewDeckId] = useState<DeckOption["id"]>(deckOverride);

  useEffect(() => {
    setPreviewDeckId(deckOverride);
  }, [deckOverride]);

  const currentDeck = DECKS.find((d) => d.id === previewDeckId) ?? DECKS[0];
  const isCurrentDeckEquipped = deckOverride === currentDeck.id;

  const filteredDecks = DECKS.filter((d) => {
    const isVoxel = VOXEL_BOARD_IDS.has(d.id);
    if (deckFilter === "standard") return !isVoxel;
    if (deckFilter === "buddies") return isVoxel;
    return true;
  });

  const [shakeKey, setShakeKey] = useState(0);
  const current = getSkin(previewId);
  const currentRarity = getSkinRarity(current);
  const currentRarityMeta = RARITY_META[currentRarity];
  const isUnlocked = unlocked.includes(current.id);
  const isEquipped = equippedId === current.id;
  const affordable = wallet >= current.cost;

  const filteredSkins = SKINS.filter((s) => {
    if (skinFilter === "original") return !s.buddyId;
    if (skinFilter === "buddies") return !!s.buddyId;
    return true;
  });

  const close = () => {
    sfx.click();
    if (!unlocked.includes(previewId)) setPreview(equippedId);
    setMenuView("main");
  };

  const action = () => {
    if (isUnlocked) {
      sfx.click();
      selectSkin(current.id);
      engine.skinPop();
      return;
    }
    if (unlockSkin(current.id)) {
      sfx.unlock();
      engine.skinPop();
    } else {
      sfx.deny();
      setShakeKey((k) => k + 1);
    }
  };

  const wheelColor = useUI((st) => st.wheelColor);
  const setWheelColor = useUI((st) => st.setWheelColor);
  const selectWheel = (c: WheelColor) => {
    if (c === wheelColor) return;
    sfx.click();
    setWheelColor(c);
    engine.skinPop();
    ensureDeckThumbs(208, true);
    ensureThumbs(208, true);
    const label = WHEEL_COLORS.find((w) => w.id === c)?.label ?? "AUTO";
    addPopup(c === "auto" ? "BAN IKUT SKIN" : `BAN ${label}`, "#2ec4b6", "Warna roda skateboard");
  };

  const selectDeck = (d: DeckOption["id"]) => {
    setPreviewDeckId(d);
    setDeckOverride(d);
    engine.skinPop();
    sfx.unlock();
    const opt = DECKS.find((k) => k.id === d);
    const title = opt ? opt.name.toUpperCase() : "PAPAN SKATE";
    addPopup(`${title}!`, "#ff9f1c", "Papan skateboard aktif");
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      {/* wallet */}
      <div className="absolute left-[4%] top-[3.5%] flex h-10 items-center gap-1.5 rounded-full bg-black/25 px-3 backdrop-blur-[2px]">
        <BreadIcon size={22} />
        <span className="font-display txt-outline-sm text-[4.6cqw] leading-none text-white">{wallet}</span>
      </div>
      <div className="absolute left-1/2 top-[3.5%] flex h-10 -translate-x-1/2 items-center rounded-full bg-black/25 px-3 font-body text-[2.8cqw] font-extrabold tracking-[0.25em] text-white backdrop-blur-[2px]">
        3D PREVIEW
      </div>

      {/* panel */}
      <div className="card-in pointer-events-auto absolute bottom-0 left-0 right-0 flex h-[56%] flex-col rounded-t-[22px] bg-[#fff8ea] shadow-[0_-5px_0_rgba(0,0,0,0.1)]">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-3 pb-1 pt-2">
          <button
            type="button"
            onClick={() => {
              sfx.click();
              setTab("skins");
            }}
            className={`flex flex-1 items-center justify-center gap-1 rounded-2xl py-1.5 font-display text-[3.2cqw] leading-none whitespace-nowrap transition-all ${
              tab === "skins"
                ? "bg-[#2ec4b6] text-white shadow-[0_3px_0_#1f9a8f]"
                : "bg-white/70 text-[#1f2430]/70 hover:bg-white"
            }`}
          >
            <span>🕊️</span>
            <span>KARAKTER</span>
            <span className="font-body text-[2.2cqw] opacity-80">{unlocked.length}/{SKINS.length}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.click();
              setTab("decks");
            }}
            className={`flex flex-1 items-center justify-center gap-1 rounded-2xl py-1.5 font-display text-[3.2cqw] leading-none whitespace-nowrap transition-all ${
              tab === "decks"
                ? "bg-[#ff9f1c] text-white shadow-[0_3px_0_#c9700a]"
                : "bg-white/70 text-[#1f2430]/70 hover:bg-white"
            }`}
          >
            PAPAN SKATE
            {deckOverride === "baguette" && (
              <span className="rounded-full bg-white px-1.5 py-0.5 text-[2.2cqw] font-extrabold text-[#c9700a]">ROTI</span>
            )}
          </button>
          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1f2430] font-display text-[4.2cqw] text-white shadow-[0_3px_0_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {tab === "skins" ? (
          <>
            {/* Large selected-character showcase: this is the focal point, not a top-down inventory grid. */}
            <div className="skin-showcase relative mx-3 mb-1.5 h-[24cqw] min-h-[6.1rem] overflow-hidden rounded-[18px] px-3 py-1.5 shadow-[0_3px_0_rgba(31,36,48,0.14)]">
              <div className="relative z-10 flex h-full w-[56%] flex-col items-start justify-center">
                <div className="flex items-center gap-1">
                  <div className="rounded-full bg-white/75 px-1.5 py-0.5 font-body text-[1.8cqw] font-black tracking-[0.12em] text-[#1f9a8f]">
                    SHOWCASE
                  </div>
                  {current.badgeLabel ? (
                    <div className="rounded-full bg-gradient-to-r from-[#ff9f1c] to-[#e63946] px-2 py-0.5 font-display text-[1.8cqw] leading-none text-white shadow-[0_2px_0_rgba(180,60,0,0.3)]">
                      🦊 {current.badgeLabel}
                    </div>
                  ) : (
                    <div className={`rounded-full px-1.5 py-0.5 font-display text-[1.8cqw] leading-none ${currentRarityMeta.badge}`}>
                      {currentRarityMeta.label}
                    </div>
                  )}
                </div>
                <div className="mt-0.5 flex max-w-full items-center gap-1 font-display text-[4.1cqw] leading-[0.95] text-[#1f2430]">
                  {!isUnlocked && <LockIcon size={15} />}
                  <span className="truncate">{current.name.toUpperCase()}</span>
                </div>
                <div className="max-w-full truncate font-body text-[2cqw] font-bold text-[#536476]">{current.tagline}</div>
                <div key={shakeKey} className={`mt-1 ${shakeKey ? "shake" : ""}`}>
                  <button
                    type="button"
                    onClick={action}
                    disabled={isEquipped}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 font-display text-[2.6cqw] leading-none ${
                      isEquipped
                        ? "bg-white/80 text-[#1f9a8f]"
                        : isUnlocked
                          ? "bg-[#2ec4b6] text-white shadow-[0_4px_0_#1f9a8f] active:translate-y-[2px] active:shadow-[0_2px_0_#1f9a8f]"
                          : affordable
                            ? "bg-[#ffd60a] text-[#1f2430] shadow-[0_4px_0_#c9a400] active:translate-y-[2px] active:shadow-[0_2px_0_#c9a400]"
                            : "bg-white/70 text-[#9aa1ad]"
                    }`}
                  >
                    {isEquipped ? "EQUIPPED ✓" : isUnlocked ? "EQUIP" : affordable ? "UNLOCK" : "NEED"}
                    {!isUnlocked && (
                      <span className="flex items-center gap-1">
                        <BreadIcon size={15} />
                        {current.cost}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <div className="absolute -right-1 bottom-[-0.45rem] z-10 flex h-[7.3rem] w-[49%] items-end justify-center">
                <Thumb skin={current} locked={!isUnlocked} size={132} />
              </div>
            </div>

            {/* Category filter: Semua / Original / Voxel Buddies */}
            <div className="flex items-center gap-1.5 px-3 pb-1.5">
              <button
                type="button"
                onClick={() => setSkinFilter("all")}
                className={`rounded-full px-2.5 py-1 font-display text-[2.2cqw] leading-none transition-all ${
                  skinFilter === "all"
                    ? "bg-[#1f2430] text-white shadow-[0_2px_0_rgba(0,0,0,0.2)]"
                    : "bg-white/80 text-[#536476] hover:bg-white active:translate-y-[1px]"
                }`}
              >
                SEMUA ({SKINS.length})
              </button>
              <button
                type="button"
                onClick={() => setSkinFilter("original")}
                className={`rounded-full px-2.5 py-1 font-display text-[2.2cqw] leading-none transition-all ${
                  skinFilter === "original"
                    ? "bg-[#2ec4b6] text-white shadow-[0_2px_0_#1f9a8f]"
                    : "bg-white/80 text-[#536476] hover:bg-white active:translate-y-[1px]"
                }`}
              >
                ORIGINAL ({SKINS.filter((s) => !s.buddyId).length})
              </button>
              <button
                type="button"
                onClick={() => setSkinFilter("buddies")}
                className={`rounded-full px-2.5 py-1 font-display text-[2.2cqw] leading-none transition-all ${
                  skinFilter === "buddies"
                    ? "bg-gradient-to-r from-[#ff9f1c] to-[#e63946] text-white shadow-[0_2px_0_rgba(180,60,0,0.3)]"
                    : "bg-white/80 text-[#d97706] hover:bg-white active:translate-y-[1px] font-bold"
                }`}
              >
                🦊 BUDDIES ({SKINS.filter((s) => !!s.buddyId).length})
              </button>
            </div>

            {/* Voxel Buddies simultaneous scale bar */}
            {(skinFilter === "buddies" || current.buddyId) && (
              <div className="mx-3 mb-1.5 flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-[2.6cqw]">📏</span>
                  <span className="font-display text-[2.2cqw] font-bold text-amber-900">
                    UKURAN BUDDIES:
                  </span>
                  <span className="font-display text-[2.4cqw] font-black text-amber-600">
                    {buddyScale.toFixed(2)}×
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBuddyScale(Math.max(0.4, buddyScale - 0.05))}
                    className="flex h-5 w-5 items-center justify-center rounded-lg bg-white text-xs font-black shadow-sm active:scale-90"
                    title="Perkecil (-5%)"
                  >
                    −
                  </button>
                  <input
                    type="range"
                    min={0.4}
                    max={2.2}
                    step={0.02}
                    value={buddyScale}
                    onChange={(e) => setBuddyScale(parseFloat(e.target.value))}
                    className="h-1.5 w-16 cursor-pointer accent-amber-500"
                    aria-label="Skala ukuran semua Voxel Buddies"
                  />
                  <button
                    type="button"
                    onClick={() => setBuddyScale(Math.min(2.2, buddyScale + 0.05))}
                    className="flex h-5 w-5 items-center justify-center rounded-lg bg-white text-xs font-black shadow-sm active:scale-90"
                    title="Perbesar (+5%)"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => resetBuddyScale()}
                    className="ml-1 text-[2cqw] font-bold text-amber-700 hover:underline active:scale-95"
                    title="Reset ukuran ke 0.88x"
                  >
                    RESET
                  </button>
                </div>
              </div>
            )}

            <div className="grid flex-1 grid-cols-3 content-start gap-1.5 overflow-y-auto px-3 pb-2" style={{ touchAction: "pan-y" }}>
              {filteredSkins.map((s) => (
                <SkinCard key={s.id} skin={s} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Large selected-deck showcase: focal point just like the character skin showcase */}
            <div className="deck-showcase relative mx-3 mb-1.5 h-[24cqw] min-h-[6.1rem] overflow-hidden rounded-[18px] px-3 py-1.5 shadow-[0_3px_0_rgba(31,36,48,0.14)]">
              <div className="relative z-10 flex h-full w-[56%] flex-col items-start justify-center">
                <div className="flex items-center gap-1">
                  <div className="rounded-full bg-white/75 px-1.5 py-0.5 font-body text-[1.8cqw] font-black tracking-[0.12em] text-[#c9700a]">
                    ETALASE PAPAN
                  </div>
                  <div className="rounded-full bg-[#ff9f1c] px-2 py-0.5 font-display text-[1.8cqw] leading-none text-white shadow-[0_2px_0_rgba(180,60,0,0.3)]">
                    {currentDeck.badge}
                  </div>
                </div>
                <div className="mt-0.5 flex max-w-full items-center gap-1 font-display text-[3.8cqw] leading-[0.95] text-[#1f2430]">
                  <span className="truncate">{currentDeck.name.toUpperCase()}</span>
                </div>
                <div className="max-w-full truncate font-body text-[2cqw] font-bold text-[#536476]">{currentDeck.tagline}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectDeck(currentDeck.id)}
                    disabled={isCurrentDeckEquipped}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-display text-[2.6cqw] leading-none ${
                      isCurrentDeckEquipped
                        ? "bg-white/80 text-[#c9700a]"
                        : "bg-[#ff9f1c] text-white shadow-[0_4px_0_#c9700a] active:translate-y-[2px]"
                    }`}
                  >
                    {isCurrentDeckEquipped ? "DIPAKAI ✓" : "PAKAI"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.click();
                      setAdjustTargetDeck(currentDeck.id);
                      setDeckAdjustOpen(true);
                    }}
                    className="rounded-lg border border-black/15 bg-white/90 px-2 py-1 font-display text-[2.2cqw] font-black text-slate-800 shadow-[0_2px_0_rgba(0,0,0,0.08)] active:scale-95"
                    title="Atur ukuran & offset mepet kaki"
                  >
                    📏 ATUR
                  </button>
                </div>
              </div>
              <div className="absolute -right-1 bottom-[-0.45rem] z-10 flex h-[7.3rem] w-[49%] items-end justify-center pointer-events-none">
                <DeckThumb deck={currentDeck} size={135} />
              </div>
            </div>

            {/* Category filter: Semua / Standar / Voxel Buddies */}
            <div className="flex items-center gap-1.5 px-3 pb-1.5">
              <button
                type="button"
                onClick={() => setDeckFilter("all")}
                className={`rounded-full px-2.5 py-1 font-display text-[2.2cqw] leading-none transition-all ${
                  deckFilter === "all"
                    ? "bg-[#1f2430] text-white shadow-[0_2px_0_rgba(0,0,0,0.2)]"
                    : "bg-white/80 text-[#536476] hover:bg-white active:translate-y-[1px]"
                }`}
              >
                SEMUA ({DECKS.length})
              </button>
              <button
                type="button"
                onClick={() => setDeckFilter("standard")}
                className={`rounded-full px-2.5 py-1 font-display text-[2.2cqw] leading-none transition-all ${
                  deckFilter === "standard"
                    ? "bg-[#2ec4b6] text-white shadow-[0_2px_0_#1f9a8f]"
                    : "bg-white/80 text-[#536476] hover:bg-white active:translate-y-[1px]"
                }`}
              >
                STANDAR ({DECKS.filter((d) => !VOXEL_BOARD_IDS.has(d.id)).length})
              </button>
              <button
                type="button"
                onClick={() => setDeckFilter("buddies")}
                className={`rounded-full px-2.5 py-1 font-display text-[2.2cqw] leading-none transition-all ${
                  deckFilter === "buddies"
                    ? "bg-gradient-to-r from-[#ff9f1c] to-[#e63946] text-white shadow-[0_2px_0_rgba(180,60,0,0.3)]"
                    : "bg-white/80 text-[#d97706] hover:bg-white active:translate-y-[1px] font-bold"
                }`}
              >
                🦊 BUDDIES ({DECKS.filter((d) => VOXEL_BOARD_IDS.has(d.id)).length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-2" style={{ touchAction: "pan-y" }}>
              <div className="grid grid-cols-3 content-start gap-1.5">
                {filteredDecks.map((d) => (
                  <DeckCard
                    key={d.id}
                    deck={d}
                    active={deckOverride === d.id}
                    previewing={previewDeckId === d.id}
                    onSelect={() => {
                      sfx.click();
                      setPreviewDeckId(d.id);
                      selectDeck(d.id);
                    }}
                  />
                ))}
              </div>

              {/* Banner: Atur Ukuran Papan & Export Data */}
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  setAdjustTargetDeck(previewDeckId);
                  setDeckAdjustOpen(true);
                }}
                className="mt-2.5 mb-2 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#2ec4b6] via-[#0ea5e9] to-[#3b82f6] p-2.5 text-white shadow-[0_4px_12px_rgba(46,196,182,0.35)] transition-all hover:brightness-105 active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 text-left">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-base shadow-sm">
                    🛠️
                  </span>
                  <div>
                    <div className="font-display text-[2.8cqw] leading-tight text-white">
                      ADJUST UKURAN PAPAN & EXPORT
                    </div>
                    <div className="font-body text-[2.2cqw] font-bold text-white/90">
                      Atur panjang, lebar, tebal & pastikan mepet di kaki
                    </div>
                  </div>
                </div>
                <span className="shrink-0 rounded-xl bg-white/25 px-2 py-1 font-display text-[2.3cqw] font-black text-white">
                  BUKA ⚙️
                </span>
              </button>

              {/* warna ban: default hitam, bisa merah / hijau / kuning / biru */}
              <div className="mb-2 rounded-2xl bg-white px-3 py-2.5 shadow-[0_3px_0_rgba(0,0,0,0.08)]">
                <div className="flex items-baseline justify-between">
                  <div className="font-display text-[3.2cqw] leading-none text-[#1f2430]">WARNA BAN</div>
                  <div className="font-body text-[2.2cqw] font-extrabold tracking-[0.15em] text-[#9aa1ad]">DEFAULT HITAM</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {WHEEL_COLORS.map((c) => {
                    const active = c.id === wheelColor;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectWheel(c.id)}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-display text-[2.5cqw] leading-none transition-all ${
                          active
                            ? "bg-[#1f2430] text-white shadow-[0_3px_0_rgba(0,0,0,0.25)]"
                            : "bg-[#eef0f3] text-[#1f2430]/80 active:translate-y-[1px]"
                        }`}
                      >
                        <span
                          className="h-[3cqw] w-[3cqw] shrink-0 rounded-full border border-black/20"
                          style={{ background: c.hex }}
                        />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
