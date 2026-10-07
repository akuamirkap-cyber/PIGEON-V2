import { useEffect } from "react";
import { useUI } from "../game/store";
import { engine } from "../game/engine";
import { sfx } from "../game/audio";

/* ---------- Ikon pixel-art putih ala Crossy Road (digambar manual, chunky) ---------- */

/** Mahkota — tombol kiri (menu utama). */
function CrownIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" fill="#ffffff" aria-hidden="true">
      {/* tiga puncak mahkota (tengah lebih tinggi) */}
      <rect x="3" y="2" width="2" height="5" />
      <rect x="7" y="1" width="2" height="6" />
      <rect x="11" y="2" width="2" height="5" />
      {/* badan mahkota */}
      <rect x="3" y="7" width="10" height="2" />
      {/* alas + dua kaki */}
      <rect x="1" y="9" width="14" height="3" />
      <rect x="3" y="12" width="2" height="1" />
      <rect x="11" y="12" width="2" height="1" />
    </svg>
  );
}

/** Segitiga play — tombol tengah kuning (main lagi). */
function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" fill="#ffffff" aria-hidden="true">
      <path d="M4.6 2.6 13.2 8 4.6 13.4Z" />
    </svg>
  );
}

/** Nampan + panah ke atas — tombol kanan (bagikan skor). */
function ShareIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" fill="#ffffff" aria-hidden="true">
      {/* panah ke atas */}
      <path d="M8 1.6 11.4 5.7H9.4v4.3H6.6V5.7H4.6Z" />
      {/* nampan */}
      <path d="M2.4 10.6h11.2v2.7a1.1 1.1 0 0 1-1.1 1.1H3.5a1.1 1.1 0 0 1-1.1-1.1Z" />
    </svg>
  );
}

/**
 * Layar Game Over — persis gaya Crossy Road:
 *  - Latar game digelapkan tipis biar panel skor menonjol
 *  - Judul "GAME OVER" huruf pixel putih + outline hitam tebal
 *  - Panel skor gelap: SCORE / angka kuning / BEST
 *  - Tiga tombol chunky: mahkota (menu) · main lagi (kuning, besar) · bagikan
 */
export function GameOver() {
  const phase = useUI((s) => s.phase);
  const score = useUI((s) => s.score);
  const best = useUI((s) => s.best);
  const isNewBest = useUI((s) => s.isNewBest);

  // Efek suara saat layar game over muncul
  useEffect(() => {
    if (phase !== "gameover") return;
    try {
      if (isNewBest && score > 0) {
        sfx.fanfare();
      } else {
        sfx.countDone();
      }
    } catch {
      // ignore
    }
  }, [phase, isNewBest, score]);

  if (phase !== "gameover") return null;

  const handleRetry = () => {
    sfx.click();
    engine.startRun();
  };

  const handleMenu = () => {
    sfx.click();
    engine.toMenu();
  };

  const handleShare = async () => {
    sfx.click();
    const text = `Pigeon SK8 — skor ${score.toLocaleString()} (best ${best.toLocaleString()}) 🛹`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Pigeon SK8", text, url: window.location.href });
      } else {
        await navigator.clipboard?.writeText(`${text} ${window.location.href}`);
      }
    } catch {
      // dibatalkan / tidak didukung — abaikan
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex select-none flex-col items-center justify-center">
      {/* Latar digelapkan tipis ala Crossy Road */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="pointer-events-auto relative flex w-full flex-col items-center px-6">
        {/* Judul pixel putih + outline hitam tebal */}
        <h1 className="go-title go-wobble font-display text-[clamp(26px,8.5cqw,42px)] leading-none text-white">
          GAME OVER
        </h1>

        {/* Panel skor gelap */}
        <div className="card-in mt-[5cqw] w-[70%] max-w-[320px] rounded-[20px] bg-[#262b36] px-6 py-5 text-center shadow-[0_6px_0_rgba(0,0,0,0.28),0_14px_28px_rgba(0,0,0,0.35)]">
          <div className="font-body text-[11px] font-black tracking-[0.3em] text-white">SCORE</div>
          <div className="go-numpop mt-0.5 font-display text-[clamp(38px,12cqw,54px)] leading-[1.15] text-[#ffd23f]">
            {score.toLocaleString()}
          </div>
          <div className="mt-1 font-body text-[12px] font-extrabold tracking-wide text-white">
            BEST {best.toLocaleString()}
          </div>
        </div>

        {/* Baris tombol: mahkota · MAIN LAGI (kuning besar) · bagikan */}
        <div className="mt-[7cqw] flex items-center justify-center gap-[3.5cqw]">
          <button
            type="button"
            onClick={handleMenu}
            aria-label="Menu utama"
            className="flex h-[13cqw] w-[14cqw] items-center justify-center rounded-[14px] bg-[#3ea8f0] shadow-[0_4px_0_#1d7cc4,0_8px_14px_rgba(0,0,0,0.3)] transition-transform active:translate-y-[3px] active:shadow-[0_1px_0_#1d7cc4]"
          >
            <CrownIcon className="h-[44%] w-[44%] drop-shadow-sm" />
          </button>

          <button
            type="button"
            onClick={handleRetry}
            aria-label="Main lagi"
            className="flex h-[13cqw] w-[27cqw] items-center justify-center rounded-[14px] bg-[#ffd23f] shadow-[0_4px_0_#d9a40f,0_8px_14px_rgba(0,0,0,0.3)] transition-transform active:translate-y-[3px] active:shadow-[0_1px_0_#d9a40f]"
          >
            <PlayIcon className="h-[40%] w-[40%] drop-shadow-sm" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Bagikan skor"
            className="flex h-[13cqw] w-[14cqw] items-center justify-center rounded-[14px] bg-[#3ea8f0] shadow-[0_4px_0_#1d7cc4,0_8px_14px_rgba(0,0,0,0.3)] transition-transform active:translate-y-[3px] active:shadow-[0_1px_0_#1d7cc4]"
          >
            <ShareIcon className="h-[46%] w-[46%] drop-shadow-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
