import { useEffect } from "react";
import { useUI } from "../game/store";
import { engine } from "../game/engine";
import { sfx } from "../game/audio";
import { BreadIcon } from "./BreadIcon";

/** Label singkat penyebab tumbang — dirasionalkan jadi caption kecil di bawah judul. */
const CAUSE_LABEL: Record<string, string> = {
  obstacle: "NUBRUK RINTANGAN",
  car: "KETABRAK MOBIL",
  oncoming: "MOBIL DARI ARAH DEPAN",
  motorcycle: "MOTOR DARI ARAH DEPAN",
  chicken: "AYAM NGEBUT",
  train: "KERETA LEWAT",
  gate: "PALANG TUTUP",
  pedestrian: "NUBRUK PEJALAN KAKI",
  roadwork: "AREA PROYEK",
  cross_traffic: "TABRAKAN DI PEREMPATAN",
};

/**
 * Layar Game Over — super simpel, instan, & TANPA GELAP:
 *  - Latar game di belakang tetap terang benderang 100% (tidak ada overlay hitam/gelap)
 *  - Skor langsung tampil utuh tanpa menunggu hitungan lambat
 *  - Tombol MAIN LAGI langsung aktif & bisa langsung ditap / tekan Spasi
 */
export function GameOver() {
  const phase = useUI((s) => s.phase);
  const score = useUI((s) => s.score);
  const best = useUI((s) => s.best);
  const bread = useUI((s) => s.bread);
  const isNewBest = useUI((s) => s.isNewBest);
  const cause = useUI((s) => s.crashCause);
  const wordHunt = useUI((s) => s.wordHunt);
  const setShowMysteryBox = useUI((s) => s.setShowMysteryBox);

  // Efek suara instan saat layar game over muncul
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

  const canOpen = wordHunt.pendingBox || (wordHunt.collected.every(Boolean) && !wordHunt.claimed);

  const handleRetry = () => {
    sfx.click();
    engine.startRun();
  };

  const handleMenu = () => {
    sfx.click();
    engine.toMenu();
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center p-4">
      {/* TIDAK ADA overlay gelap: game di belakang tetap terang benderang */}
      <div className="card-in pointer-events-auto relative w-[82%] max-w-[340px] overflow-hidden rounded-3xl bg-white/95 p-5 text-center shadow-[0_16px_40px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.8)] backdrop-blur-md">
        {/* Judul & Penyebab Tabrakan */}
        <div className="font-display text-[clamp(24px,6cqw,36px)] leading-none text-[#ff4757] txt-outline-sm drop-shadow-sm">
          GAME OVER
        </div>

        <div className="mt-1.5 flex justify-center">
          <span className="rounded-full bg-[#ffe8e8] px-3 py-0.5 font-body text-[11px] font-extrabold tracking-wider text-[#d63031]">
            {CAUSE_LABEL[cause] ?? "TUMBANG!"}
          </span>
        </div>

        {/* Kotak Skor Utama — langsung tampil */}
        <div className="relative mt-3.5 rounded-2xl bg-[#1a1f2c] px-4 py-3 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
          {isNewBest && (
            <div className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-[#ffd21f] to-[#ff9f1c] px-2.5 py-0.5 font-display text-[9px] tracking-wider text-[#1a1f2c] shadow-md">
              ★ NEW BEST!
            </div>
          )}
          <div className="font-body text-[10px] font-extrabold tracking-[0.25em] text-white/60">
            SCORE
          </div>
          <div className="font-display text-[clamp(32px,9cqw,46px)] leading-tight text-[#ffd21f] [text-shadow:0_2px_0_rgba(120,72,0,0.5)]">
            {score.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center justify-center gap-3 border-t border-white/10 pt-2 font-body text-xs font-bold text-white/80">
            <span>
              BEST <strong className="text-white">{best.toLocaleString()}</strong>
            </span>
            {bread > 0 && (
              <span className="flex items-center gap-1 text-[#ffd21f]">
                <BreadIcon size={14} />
                +{bread}
              </span>
            )}
          </div>
        </div>

        {/* Word Hunt singkat hanya bila box siap dibuka */}
        {canOpen && (
          <button
            type="button"
            onClick={() => {
              sfx.click();
              setShowMysteryBox(true);
            }}
            className="mt-2.5 flex w-full animate-pulse items-center justify-between rounded-xl bg-gradient-to-r from-[#ffd21f] to-[#ff9f1c] px-3 py-2 text-[#1a1f2c] shadow"
          >
            <span className="font-body text-[11px] font-black tracking-wide">WORD HUNT SELESAI!</span>
            <span className="font-display text-xs font-bold">BUKA BOX 🎁</span>
          </button>
        )}

        {/* Tombol Aksi Langsung (tanpa delay) */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full rounded-2xl bg-gradient-to-b from-[#2ec4b6] to-[#20a396] py-3.5 font-display text-[clamp(14px,3.8cqw,18px)] leading-none text-white shadow-[0_5px_0_#178076] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_#178076]"
          >
            MAIN LAGI ↺
          </button>
          <button
            type="button"
            onClick={handleMenu}
            className="w-full rounded-2xl bg-[#f1f4f8] py-2.5 font-display text-[clamp(11px,2.9cqw,14px)] leading-none text-[#57606f] shadow-[0_3px_0_#dcdde1] transition-transform active:translate-y-[2px] active:shadow-[0_1px_0_#dcdde1]"
          >
            MENU UTAMA
          </button>
        </div>
      </div>
    </div>
  );
}
