import { useEffect, useRef, useState, type ReactNode } from "react";
import { useUI, WHEEL_COLORS, type WheelColor } from "../game/store";
import { getSkin, SKINS, DECKS, type Skin, type DeckOption } from "../game/skins";
import { VOXEL_BOARD_IDS } from "../game/buddiesSkins";
import { sfx } from "../game/audio";
import { engine } from "../game/engine";
import { ensureThumbs, ensureDeckThumbs, getThumb, getThumbSprite, getDeckThumb, getDeckThumbSprite, onThumbsReady, onDeckThumbsReady, registerThumbSpin, THUMB_FRAME_COUNT, THUMB_BASE_F, getHeroSprite, ensureHeroThumb, onHeroReady, clearHeroCache } from "../game/thumbs";
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

/**
 * Ukuran tampilan. Sprite karakter/papan punya framing yang sama (kaki/roda
 * selalu di THUMB_BASE_F tinggi sprite), jadi offset di bawah membuat kaki
 * karakter besar dan kaki setiap item barisan jatuh di garis yang sama persis.
 */
const BIG = 384;
const DECK_BIG = 300;
const SMALL = 76;
const DECK_SMALL = 64;
/** Garis kaki: 58% dari atas area tengah (42% dari bawah). */
const FEET_FROM_BOTTOM = 42;
/** Jarak bayangan/nama di bawah garis kaki. */
const NAME_GAP = 14;

/** Offset dasar sprite dari garis kaki (bagian kosong di bawah kaki). */
const feetOffset = (size: number) => Math.round((1 - THUMB_BASE_F) * size);

function Thumb({ skin, locked, size, hero }: { skin: Skin; locked: boolean; size: number; hero?: boolean }) {
  const spinRef = useRef<HTMLSpanElement>(null);
  const [, force] = useState(0);
  const heroSprite = hero ? getHeroSprite("skin", skin.id) : undefined;
  const sprite = heroSprite ?? getThumbSprite(skin.id);
  const url = getThumb(skin.id);
  const style = locked ? { filter: "grayscale(0.85) brightness(0.8)" } : undefined;

  // Preview besar: minta sprite resolusi tinggi (framing identik, jadi tidak ada yang bergeser)
  useEffect(() => {
    if (!hero || heroSprite) return;
    const off = onHeroReady(() => force((n) => n + 1));
    ensureHeroThumb("skin", skin.id);
    return off;
  }, [hero, skin.id, heroSprite]);

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

function DeckThumb({ deck, size, hero }: { deck: DeckOption; size: number; hero?: boolean }) {
  const spinRef = useRef<HTMLSpanElement>(null);
  const [, force] = useState(0);
  const heroSprite = hero ? getHeroSprite("deck", deck.id) : undefined;
  const sprite = heroSprite ?? getDeckThumbSprite(deck.id);
  const url = getDeckThumb(deck.id);

  // Preview besar: minta sprite resolusi tinggi (framing identik)
  useEffect(() => {
    if (!hero || heroSprite) return;
    const off = onHeroReady(() => force((n) => n + 1));
    ensureHeroThumb("deck", deck.id);
    return off;
  }, [hero, deck.id, heroSprite]);

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

/* ---------- Ikon putih tombol bulat ala Crossy Road ---------- */

/** Kaos / baju — tombol tab karakter. */
function ShirtIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#ffffff" aria-hidden="true">
      <path d="M12 4.5c1.1 0 2 .5 2.7 1.2.6-.4 1.3-.7 2.1-.7H19l3 6-3 1.5-1.5-3V20c0 .6-.4 1-1 1H7.5c-.6 0-1-.4-1-1V9.5L5 12.5 2 11l3-6h2.2c.8 0 1.5.3 2.1.7.7-.7 1.6-1.2 2.7-1.2z" />
    </svg>
  );
}

/** Skateboard — tombol tab papan. */
function SkateIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#ffffff" aria-hidden="true" style={{ transform: "rotate(-25deg)" }}>
      <rect x="2" y="9.5" width="20" height="5" rx="2.5" />
      <circle cx="6" cy="17" r="2.2" />
      <circle cx="18" cy="17" r="2.2" />
    </svg>
  );
}

/** Tombol bulat chunky (kuning = karakter, biru = papan). */
function RoundTabButton({
  active,
  yellow,
  label,
  onClick,
  children,
}: {
  active: boolean;
  yellow: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-[13.5cqw] w-[13.5cqw] items-center justify-center rounded-full transition-transform active:translate-y-[3px] ${
        yellow
          ? `shadow-[0_4px_0_#d9a40f,0_8px_14px_rgba(0,0,0,0.22)] ${active ? "bg-[#ffd23f] ring-4 ring-white/85" : "bg-[#ffd23f]/60"}`
          : `shadow-[0_4px_0_#1d7cc4,0_8px_14px_rgba(0,0,0,0.22)] ${active ? "bg-[#3ea8f0] ring-4 ring-white/85" : "bg-[#3ea8f0]/60"}`
      }`}
    >
      {children}
    </button>
  );
}

/** Pil filter kecil di atas pita bawah. */
function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 font-display leading-none transition-all active:translate-y-[1px] ${
        active
          ? "bg-white text-[#1f7ab8] shadow-[0_2px_0_rgba(0,0,0,0.15)]"
          : "bg-white/25 text-white hover:bg-white/40"
      }`}
    >
      {children}
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
  const stripRef = useRef<HTMLDivElement>(null);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    setPreviewDeckId(deckOverride);
  }, [deckOverride]);

  // Barisan karakter/papan yang sedang dipreview selalu digulir ke tengah
  useEffect(() => {
    const strip = stripRef.current;
    const el = strip?.querySelector<HTMLElement>('[data-active="true"]');
    if (!strip || !el) return;
    const target = el.offsetLeft + el.offsetWidth / 2 - strip.clientWidth / 2;
    strip.scrollTo({ left: Math.max(0, target), behavior: "auto" });
  }, [previewId, previewDeckId, tab, skinFilter, deckFilter]);

  const currentDeck = DECKS.find((d) => d.id === previewDeckId) ?? DECKS[0];
  const isCurrentDeckEquipped = deckOverride === currentDeck.id;

  const filteredDecks = DECKS.filter((d) => {
    const isVoxel = VOXEL_BOARD_IDS.has(d.id);
    if (deckFilter === "standard") return !isVoxel;
    if (deckFilter === "buddies") return isVoxel;
    return true;
  });

  const current = getSkin(previewId);
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
    clearHeroCache();
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
    addPopup(`${title}!`, "#ff9f1c", "Papan skate aktif");
  };

  // Label tombol SELECT / PAKAI sesuai status item yang dipreview
  const selectLabel =
    tab === "skins"
      ? isEquipped
        ? "EQUIPPED ✓"
        : isUnlocked
          ? "SELECT ▶"
          : affordable
            ? `UNLOCK 🍞 ${current.cost}`
            : `NEED 🍞 ${current.cost}`
      : isCurrentDeckEquipped
        ? "DIPAKAI ✓"
        : "PAKAI";

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex select-none flex-col bg-[radial-gradient(125%_95%_at_50%_28%,#7cd0f8_0%,#4db4ec_58%,#3299dc_100%)]">
      {/* Baris atas: dompet roti (kiri) + tombol tutup (kanan) */}
      <div className="relative z-10 flex items-center justify-between px-3 pt-3">
        <div className="flex h-8 items-center gap-1.5 rounded-full bg-black/25 px-2.5">
          <BreadIcon size={16} />
          <span className="font-display text-[3.4cqw] leading-none text-white">{wallet}</span>
        </div>
        <button
          type="button"
          onClick={close}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 font-display text-[4cqw] leading-none text-white active:translate-y-[2px]"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>

      {/* Pita biru "CHARACTERS" / "SKATEBOARDS" ala Crossy Road */}
      <div className="relative z-10 -mt-1 flex justify-center">
        <div className="relative">
          <div className="ribbon-fold ribbon-fold-l" />
          <div className="ribbon-fold ribbon-fold-r" />
          <div className="ribbon-banner font-display text-[clamp(18px,5.6cqw,30px)] leading-none tracking-wide text-white">
            {tab === "skins" ? "CHARACTERS" : "SKATEBOARDS"}
          </div>
        </div>
      </div>

      {/* Filter kategori + kontrol kontekstual (rapi di bawah pita) */}
      <div className="relative z-10 mt-[2.2cqw] flex flex-col items-center gap-[1.6cqw] px-3">
        <div className="flex flex-wrap items-center justify-center gap-1.5 font-display text-[2.2cqw]">
          {tab === "skins" ? (
            <>
              <FilterPill active={skinFilter === "all"} onClick={() => setSkinFilter("all")}>
                SEMUA ({SKINS.length})
              </FilterPill>
              <FilterPill active={skinFilter === "original"} onClick={() => setSkinFilter("original")}>
                ORIGINAL ({SKINS.filter((s) => !s.buddyId).length})
              </FilterPill>
              <FilterPill active={skinFilter === "buddies"} onClick={() => setSkinFilter("buddies")}>
                🦊 BUDDIES ({SKINS.filter((s) => !!s.buddyId).length})
              </FilterPill>
            </>
          ) : (
            <>
              <FilterPill active={deckFilter === "all"} onClick={() => setDeckFilter("all")}>
                SEMUA ({DECKS.length})
              </FilterPill>
              <FilterPill active={deckFilter === "standard"} onClick={() => setDeckFilter("standard")}>
                STANDAR ({DECKS.filter((d) => !VOXEL_BOARD_IDS.has(d.id)).length})
              </FilterPill>
              <FilterPill active={deckFilter === "buddies"} onClick={() => setDeckFilter("buddies")}>
                🦊 BUDDIES ({DECKS.filter((d) => VOXEL_BOARD_IDS.has(d.id)).length})
              </FilterPill>
            </>
          )}
        </div>

        {/* Skala serentak Voxel Buddies (khusus tab karakter & buddy) */}
        {tab === "skins" && current.buddyId && (
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
            <span className="font-display text-[2.2cqw] leading-none text-white">UKURAN</span>
            <span className="font-display text-[2.4cqw] leading-none text-[#ffd23f]">{buddyScale.toFixed(2)}×</span>
            <button
              type="button"
              onClick={() => setBuddyScale(Math.max(0.4, buddyScale - 0.05))}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white font-display text-[2.6cqw] leading-none text-[#1f7ab8] active:scale-90"
              aria-label="Perkecil"
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
              className="h-1.5 w-16 cursor-pointer accent-white"
              aria-label="Skala ukuran semua Voxel Buddies"
            />
            <button
              type="button"
              onClick={() => setBuddyScale(Math.min(2.2, buddyScale + 0.05))}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white font-display text-[2.6cqw] leading-none text-[#1f7ab8] active:scale-90"
              aria-label="Perbesar"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => resetBuddyScale()}
              className="font-display text-[2cqw] leading-none text-white/90 underline"
            >
              RESET
            </button>
          </div>
        )}

        {/* Warna ban + atur papan (khusus tab papan) */}
        {tab === "decks" && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="font-display text-[2.2cqw] leading-none text-white/90">BAN</span>
            {WHEEL_COLORS.map((c) => {
              const active = c.id === wheelColor;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectWheel(c.id)}
                  aria-label={c.label}
                  className={`h-[4.2cqw] w-[4.2cqw] rounded-full border-2 transition-transform active:scale-90 ${
                    active ? "scale-110 border-white" : "border-white/50"
                  }`}
                  style={{ background: c.hex }}
                />
              );
            })}
            <button
              type="button"
              onClick={() => {
                sfx.click();
                setAdjustTargetDeck(previewDeckId);
                setDeckAdjustOpen(true);
              }}
              className="rounded-full bg-white/25 px-2.5 py-1 font-display text-[2.2cqw] leading-none text-white active:translate-y-[1px]"
            >
              📏 ATUR
            </button>
          </div>
        )}
      </div>

      {/* Area tengah: karakter besar + barisan item bertumpu pada garis kaki yang sama */}
      <div className="relative flex-1 overflow-hidden">
        {/* Karakter/papan besar — kaki tepat di garis, di belakang barisan item */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{ bottom: `calc(${FEET_FROM_BOTTOM}% + ${feetOffset(tab === "skins" ? BIG : DECK_BIG)}px)` }}
        >
          {tab === "skins" ? (
            <Thumb skin={current} locked={!isUnlocked} size={BIG} hero />
          ) : (
            <DeckThumb deck={currentDeck} size={DECK_BIG} hero />
          )}
        </div>

        {/* Barisan karakter/papan — kaki sejajar dengan karakter besar */}
        <div
          ref={stripRef}
          className="no-scrollbar pointer-events-auto absolute inset-x-0 flex items-end gap-2 overflow-x-auto px-[50%]"
          style={{
            bottom: `calc(${FEET_FROM_BOTTOM}% + ${feetOffset(tab === "skins" ? SMALL : DECK_SMALL)}px)`,
            touchAction: "pan-x",
          }}
        >
          {tab === "skins"
            ? filteredSkins.map((s) => {
                const sUnlocked = unlocked.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    data-active={previewId === s.id}
                    onClick={() => {
                      sfx.click();
                      setPreview(s.id);
                      engine.skinPop();
                    }}
                    className="relative flex w-[19.5cqw] shrink-0 flex-col items-center"
                    aria-label={s.name}
                  >
                    <span className={sUnlocked ? "" : "brightness-[0.35]"}>
                      <Thumb skin={s} locked={!sUnlocked} size={SMALL} />
                    </span>
                  </button>
                );
              })
            : filteredDecks.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  data-active={previewDeckId === d.id}
                  onClick={() => {
                    sfx.click();
                    setPreviewDeckId(d.id);
                    selectDeck(d.id);
                  }}
                  className="relative flex w-[16.5cqw] shrink-0 flex-col items-center"
                  aria-label={d.name}
                >
                  <DeckThumb deck={d} size={DECK_SMALL} />
                </button>
              ))}
        </div>

        {/* Bayangan + NAMA tepat di bawah garis kaki */}
        <div
          className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
          style={{ top: `calc(${100 - FEET_FROM_BOTTOM}% + ${NAME_GAP}px)` }}
        >
          <div className="h-[3.4cqw] w-[62cqw] rounded-[50%] bg-black/15 blur-[3px]" />
          {tab === "skins" ? (
            <div className="mt-[2.6cqw] flex items-center gap-1.5">
              {!isUnlocked && <LockIcon size={16} />}
              <div className="go-title font-display text-[clamp(20px,6.6cqw,34px)] leading-none text-white">
                {current.name.toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="mt-[2.6cqw] font-display text-[clamp(18px,5.8cqw,30px)] leading-none text-white [text-shadow:0_2px_0_rgba(15,40,70,0.45)]">
              {currentDeck.name.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Kontrol bawah: tombol bulat baju/skate + SELECT (persis seperti referensi) */}
      <div className="relative z-10 flex flex-col items-center gap-[3.6cqw] px-4 pb-[5cqw]">
        {/* Tombol bulat: baju (karakter) & skate (papan) */}
        <div className="flex items-center gap-[6cqw]">
          <RoundTabButton active={tab === "skins"} yellow label="Skin karakter" onClick={() => { sfx.click(); setTab("skins"); }}>
            <ShirtIcon className="h-[46%] w-[46%] drop-shadow-sm" />
          </RoundTabButton>
          <RoundTabButton active={tab === "decks"} yellow={false} label="Skin skateboard" onClick={() => { sfx.click(); setTab("decks"); }}>
            <SkateIcon className="h-[44%] w-[44%] drop-shadow-sm" />
          </RoundTabButton>
        </div>

        {/* Tombol SELECT / PAKAI besar */}
        <div key={shakeKey} className={shakeKey ? "shake" : ""}>
          <button
            type="button"
            onClick={() => {
              if (tab === "skins") action();
              else {
                sfx.click();
                selectDeck(currentDeck.id);
              }
            }}
            disabled={tab === "decks" && isCurrentDeckEquipped}
            className={`flex items-center gap-2 rounded-[18px] px-[13cqw] py-[3.2cqw] font-display text-[clamp(16px,5.2cqw,26px)] leading-none text-white shadow-[0_5px_0_#d97f00,0_10px_18px_rgba(0,0,0,0.25)] transition-transform active:translate-y-[4px] active:shadow-[0_1px_0_#d97f00] ${
              tab === "skins" && !isUnlocked && !affordable
                ? "bg-[#c3ccd6] shadow-[0_5px_0_#9aa5b1,0_10px_18px_rgba(0,0,0,0.2)]"
                : tab === "decks" && isCurrentDeckEquipped
                  ? "bg-[#ffc46b]"
                  : "bg-[#ffab2e]"
            }`}
          >
            {selectLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
