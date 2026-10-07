import { useState, useCallback, useEffect, useMemo } from "react";
import { useUI, type DeckAdjustment, DEFAULT_DECK_ADJUSTMENTS } from "../game/store";
import { DECKS } from "../game/skins";
import { sfx } from "../game/audio";

interface DeckAdjustModalProps {
  onClose?: () => void;
}

export function DeckAdjustModal({ onClose }: DeckAdjustModalProps) {
  const isOpen = useUI((s) => s.deckAdjustOpen);
  const setOpen = useUI((s) => s.setDeckAdjustOpen);
  const targetId = useUI((s) => s.adjustTargetDeck);
  const setTargetId = useUI((s) => s.setAdjustTargetDeck);
  const deckAdjustments = useUI((s) => s.deckAdjustments);
  const setDeckAdjustment = useUI((s) => s.setDeckAdjustment);
  const resetDeckAdjustment = useUI((s) => s.resetDeckAdjustment);
  const resetAllDeckAdjustments = useUI((s) => s.resetAllDeckAdjustments);
  const importDeckAdjustments = useUI((s) => s.importDeckAdjustments);
  const applyDefaultJsonAdjustments = useUI((s) => s.applyDefaultJsonAdjustments);
  const deckOverride = useUI((s) => s.deckOverride);
  const setDeckOverride = useUI((s) => s.setDeckOverride);

  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [jsonToast, setJsonToast] = useState<string | null>(null);

  const targetDeck = useMemo(() => {
    return DECKS.find((d) => d.id === targetId) ?? DECKS[0];
  }, [targetId]);

  const currentAdj: DeckAdjustment = useMemo(() => {
    return deckAdjustments[targetId] || DEFAULT_DECK_ADJUSTMENTS[targetId] || { scale: 1, scaleX: 1, scaleY: 1, scaleZ: 1, offsetY: 0 };
  }, [deckAdjustments, targetId]);

  const close = useCallback(() => {
    sfx.click();
    setOpen(false);
    if (onClose) onClose();
  }, [setOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const updateProp = (prop: keyof DeckAdjustment, val: number) => {
    const rounded = Math.round(val * 100) / 100;
    setDeckAdjustment(targetId, { [prop]: rounded });
  };

  const handleExportJson = useCallback(() => {
    sfx.click();
    const exportData = {
      appName: "Pigeon SK8",
      version: 1,
      exportedAt: new Date().toISOString(),
      note: "Data ukuran tiap papan skateboard (panjang, lebar, tebal, skala, dan posisi nempel kaki)",
      deckAdjustments,
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pigeon-sk8-deck-adjustments-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [deckAdjustments]);

  const handleCopyJson = useCallback(() => {
    sfx.click();
    const exportData = {
      appName: "Pigeon SK8",
      version: 1,
      exportedAt: new Date().toISOString(),
      deckAdjustments,
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    navigator.clipboard
      .writeText(jsonStr)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2600);
      })
      .catch(() => {
        // Fallback prompt
        window.prompt("Salin JSON ukuran papan berikut:", jsonStr);
      });
  }, [deckAdjustments]);

  const handleApplyDefaultJson = useCallback(() => {
    sfx.click();
    applyDefaultJsonAdjustments();
    setJsonToast("Berhasil memakai data JSON ukuran papan! Semua 15 papan kini mepet presisi di kaki rider. ✓");
    setTimeout(() => setJsonToast(null), 3200);
  }, [applyDefaultJsonAdjustments]);

  const handleApplyImport = useCallback(() => {
    sfx.click();
    setImportStatus(null);
    try {
      const parsed = JSON.parse(importText.trim());
      const payload = parsed.deckAdjustments ? parsed.deckAdjustments : parsed;
      const ok = importDeckAdjustments(payload);
      if (ok) {
        setImportStatus("Berhasil menerapkan data ukuran semua papan! ✓");
        setTimeout(() => {
          setShowImport(false);
          setImportText("");
          setImportStatus(null);
        }, 1600);
      } else {
        setImportStatus("Format JSON valid tetapi tidak ada ID papan yang cocok.");
      }
    } catch {
      setImportStatus("Gagal membaca JSON: format tidak valid.");
    }
  }, [importText, importDeckAdjustments]);

  if (!isOpen) return null;

  const totalLength = ((currentAdj.scale ?? 1) * (currentAdj.scaleX ?? 1)).toFixed(2);
  const totalWidth = ((currentAdj.scale ?? 1) * (currentAdj.scaleZ ?? 1)).toFixed(2);
  const totalHeight = ((currentAdj.scale ?? 1) * (currentAdj.scaleY ?? 1)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0e111a]/85 backdrop-blur-md transition-opacity"
        onClick={close}
      />

      {/* Modal Dialog */}
      <div
        className="relative z-10 flex h-[92vh] max-h-[820px] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] border-2 border-white/30 bg-[#161a26] text-white shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#1e2333]/90 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ffd21f] text-lg shadow-md">
              🛹
            </span>
            <div>
              <h2 className="font-black text-sm sm:text-base leading-tight tracking-wide text-white">
                ADJUST UKURAN PAPAN & EXPORT
              </h2>
              <p className="text-[11px] font-bold text-[#ffd21f]/90 leading-tight">
                Sesuaikan dimensi tiap papan agar pas nempel di telapak kaki
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-4" style={{ touchAction: "pan-y" }}>
          {/* Banner: Pakai Data JSON Ukuran Papan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border-2 border-[#ffd21f]/50 bg-gradient-to-r from-[#ffd21f]/20 via-[#ffd21f]/10 to-[#2ec4b6]/20 p-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffd21f] text-base text-[#151823] shadow">
                📋
              </span>
              <div>
                <h4 className="text-xs font-black tracking-wide text-white leading-tight">
                  DATA JSON UKURAN PAPAN (MEPET KAKI)
                </h4>
                <p className="text-[10px] text-[#ffd21f] font-semibold leading-tight mt-0.5">
                  15 papan dikalibrasi presisi pas nempel di telapak kaki
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyDefaultJson}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#ffd21f] px-3.5 py-2 text-xs font-black text-[#151823] shadow-md transition hover:bg-[#ffdf4a] active:scale-95"
            >
              <span>⚡</span>
              <span>Pakai Data JSON Itu</span>
            </button>
          </div>

          {jsonToast && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3 py-2 text-center text-xs font-extrabold text-emerald-300 shadow animate-pulse">
              {jsonToast}
            </div>
          )}

          {/* Section: Pilih Papan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/70">
                PILIH PAPAN YANG DIATUR ({DECKS.length} PAPAN)
              </span>
              {deckOverride !== targetId && (
                <button
                  type="button"
                  onClick={() => {
                    sfx.click();
                    setDeckOverride(targetId);
                  }}
                  className="rounded-full bg-[#2ec4b6]/25 border border-[#2ec4b6]/50 px-2.5 py-0.5 text-[10px] font-extrabold text-[#2ec4b6] transition-all hover:bg-[#2ec4b6] hover:text-white active:scale-95"
                >
                  Gunakan di Game Sekarang ⚡
                </button>
              )}
            </div>

            {/* Horizontal Board Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar" style={{ touchAction: "pan-x" }}>
              {DECKS.map((d) => {
                const active = d.id === targetId;
                const isEquipped = d.id === deckOverride;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      sfx.click();
                      setTargetId(d.id);
                    }}
                    className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold transition-all ${
                      active
                        ? "bg-[#ffd21f] text-[#151823] shadow-lg scale-105"
                        : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{d.emoji}</span>
                    <span className="font-extrabold">{d.name}</span>
                    {isEquipped && (
                      <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${active ? "bg-black text-white" : "bg-[#2ec4b6] text-white"}`}>
                        DIPAKAI
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card: Active Board Info & Real-Time Dimensions */}
          <div className="rounded-2xl border border-white/10 bg-[#222738] p-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{targetDeck.emoji}</span>
                <div>
                  <h3 className="text-sm font-black text-white">{targetDeck.name}</h3>
                  <p className="text-[10px] text-white/60">{targetDeck.tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sfx.click();
                    resetDeckAdjustment(targetId);
                  }}
                  className="rounded-xl bg-white/10 px-2.5 py-1.5 text-[10px] font-bold text-white/80 transition hover:bg-white/20 hover:text-white active:scale-95"
                  title="Reset papan ini ke default"
                >
                  ↺ Reset Papan Ini
                </button>
              </div>
            </div>

            {/* Calculated dimensions summary */}
            <div className="mt-3 grid grid-cols-4 gap-1.5 rounded-xl bg-black/35 p-2 text-center text-[10px]">
              <div>
                <div className="font-bold text-white/50">PANJANG</div>
                <div className="text-xs font-black text-[#2ec4b6]">{totalLength}×</div>
              </div>
              <div>
                <div className="font-bold text-white/50">LEBAR</div>
                <div className="text-xs font-black text-[#2ec4b6]">{totalWidth}×</div>
              </div>
              <div>
                <div className="font-bold text-white/50">TEBAL</div>
                <div className="text-xs font-black text-[#2ec4b6]">{totalHeight}×</div>
              </div>
              <div>
                <div className="font-bold text-white/50">NEMPEL KAKI</div>
                <div className={`text-xs font-black ${Math.abs(currentAdj.offsetY) < 0.005 ? "text-[#ffd21f]" : "text-white"}`}>
                  {Math.abs(currentAdj.offsetY) < 0.005 ? "MEPET ✓" : `${currentAdj.offsetY >= 0 ? "+" : ""}${currentAdj.offsetY.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Sliders for Active Deck */}
          <div className="space-y-3.5 rounded-2xl border border-white/10 bg-[#1e2333] p-4">
            {/* 1. Skala Keseluruhan (Scale) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1 text-white/90">
                  <span>📐</span> Skala Ukuran Keseluruhan:
                </span>
                <span className="font-black text-[#ffd21f]">{(currentAdj.scale ?? 1.0).toFixed(2)}×</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateProp("scale", Math.max(0.4, (currentAdj.scale ?? 1.0) - 0.05))}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-xs font-black hover:bg-white/20 active:scale-95"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0.4}
                  max={2.2}
                  step={0.02}
                  value={currentAdj.scale ?? 1.0}
                  onChange={(e) => updateProp("scale", parseFloat(e.target.value))}
                  className="h-2 flex-1 cursor-pointer accent-[#ffd21f]"
                  aria-label="Skala Ukuran Keseluruhan"
                />
                <button
                  type="button"
                  onClick={() => updateProp("scale", Math.min(2.5, (currentAdj.scale ?? 1.0) + 0.05))}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-xs font-black hover:bg-white/20 active:scale-95"
                >
                  +
                </button>
              </div>
              <div className="mt-1.5 flex gap-1.5">
                {[
                  { label: "0.75× Mini", val: 0.75 },
                  { label: "1.00× Normal", val: 1.0 },
                  { label: "1.25× Besar", val: 1.25 },
                  { label: "1.50× Jumbo", val: 1.5 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => updateProp("scale", p.val)}
                    className={`flex-1 rounded-lg py-1 text-[10px] font-extrabold transition-all ${
                      Math.abs((currentAdj.scale ?? 1.0) - p.val) < 0.02
                        ? "bg-[#ffd21f] text-[#151823]"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Panjang Papan (ScaleX / Maju-Mundur) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1 text-white/90">
                  <span>↔️</span> Panjang Papan (Maju-Mundur):
                </span>
                <span className="font-black text-[#2ec4b6]">{(currentAdj.scaleX ?? 1.0).toFixed(2)}×</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateProp("scaleX", Math.max(0.4, (currentAdj.scaleX ?? 1.0) - 0.05))}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-xs font-black hover:bg-white/20 active:scale-95"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0.4}
                  max={2.2}
                  step={0.02}
                  value={currentAdj.scaleX ?? 1.0}
                  onChange={(e) => updateProp("scaleX", parseFloat(e.target.value))}
                  className="h-2 flex-1 cursor-pointer accent-[#2ec4b6]"
                  aria-label="Panjang Papan"
                />
                <button
                  type="button"
                  onClick={() => updateProp("scaleX", Math.min(2.5, (currentAdj.scaleX ?? 1.0) + 0.05))}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-xs font-black hover:bg-white/20 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* 3. Lebar Papan (ScaleZ / Samping) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1 text-white/90">
                  <span>↕️</span> Lebar Papan (Samping Kiri-Kanan):
                </span>
                <span className="font-black text-[#2ec4b6]">{(currentAdj.scaleZ ?? 1.0).toFixed(2)}×</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateProp("scaleZ", Math.max(0.4, (currentAdj.scaleZ ?? 1.0) - 0.05))}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-xs font-black hover:bg-white/20 active:scale-95"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0.4}
                  max={2.2}
                  step={0.02}
                  value={currentAdj.scaleZ ?? 1.0}
                  onChange={(e) => updateProp("scaleZ", parseFloat(e.target.value))}
                  className="h-2 flex-1 cursor-pointer accent-[#2ec4b6]"
                  aria-label="Lebar Papan"
                />
                <button
                  type="button"
                  onClick={() => updateProp("scaleZ", Math.min(2.5, (currentAdj.scaleZ ?? 1.0) + 0.05))}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-xs font-black hover:bg-white/20 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* 4. Ketebalan / Tinggi (ScaleY) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1 text-white/90">
                  <span>🧱</span> Ketebalan Vertikal (Tinggi Papan):
                </span>
                <span className="font-black text-[#2ec4b6]">{(currentAdj.scaleY ?? 1.0).toFixed(2)}×</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateProp("scaleY", Math.max(0.3, (currentAdj.scaleY ?? 1.0) - 0.05))}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-xs font-black hover:bg-white/20 active:scale-95"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0.3}
                  max={2.2}
                  step={0.02}
                  value={currentAdj.scaleY ?? 1.0}
                  onChange={(e) => updateProp("scaleY", parseFloat(e.target.value))}
                  className="h-2 flex-1 cursor-pointer accent-[#2ec4b6]"
                  aria-label="Ketebalan Papan"
                />
                <button
                  type="button"
                  onClick={() => updateProp("scaleY", Math.min(2.5, (currentAdj.scaleY ?? 1.0) + 0.05))}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-xs font-black hover:bg-white/20 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* 5. Nempel Kaki (Offset Y) - MEPET FIT */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <div className="flex items-center gap-1 text-amber-300">
                  <span>👣</span>
                  <span>Posisi Nempel di Telapak Kaki:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-amber-200">
                    {(currentAdj.offsetY ?? 0.0).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateProp("offsetY", 0.0)}
                    className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-slate-900 transition hover:bg-amber-300 active:scale-95"
                    title="Kembalikan ke mepet presisi otomatis"
                  >
                    ⚡ Mepet Otomatis
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={-0.12}
                max={0.12}
                step={0.005}
                value={currentAdj.offsetY ?? 0.0}
                onChange={(e) => updateProp("offsetY", parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer accent-amber-400"
                aria-label="Offset Ketinggian Nempel Kaki"
              />
              <p className="mt-1 text-[10px] text-amber-200/80 leading-snug">
                Sistem otomatis menempelkan permukaan papan pas di telapak kaki hewan. Geser slider ini jika ingin menaikkan/menurunkan sedikit sesuai kenyamanan.
              </p>
            </div>
          </div>

          {/* Section: Export & Import Data Ukuran */}
          <div className="rounded-2xl border border-white/10 bg-[#1e2333] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  EXPORT DATA UKURAN PAPAN
                </h4>
                <p className="text-[10px] text-white/60">
                  Simpan konfigurasi semua ukuran papan ke file JSON atau clipboard
                </p>
              </div>
              <span className="text-lg">💾</span>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2ec4b6] px-3 py-2 text-xs font-black text-white shadow-md transition hover:bg-[#25ab9e] active:scale-95"
              >
                <span>📥</span>
                <span>Download File JSON</span>
              </button>

              <button
                type="button"
                onClick={handleCopyJson}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-black text-white transition hover:bg-white/25 active:scale-95"
              >
                <span>{copied ? "✓" : "📋"}</span>
                <span>{copied ? "Disalin ke Clipboard!" : "Salin JSON"}</span>
              </button>
            </div>

            {/* Import Toggle & Panel */}
            <div className="border-t border-white/10 pt-2.5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowImport((s) => !s)}
                  className="text-[11px] font-extrabold text-[#ffd21f] hover:underline"
                >
                  {showImport ? "▾ Tutup Menu Import JSON" : "▸ Import Data JSON dari Luar..."}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Kembalikan ukuran semua 15 papan ke setelan default?")) {
                      sfx.click();
                      resetAllDeckAdjustments();
                    }
                  }}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300"
                >
                  ↺ Reset Semua 15 Papan
                </button>
              </div>

              {showImport && (
                <div className="mt-2 space-y-2 rounded-xl bg-black/40 p-3">
                  <textarea
                    rows={4}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='Tempel (paste) kode JSON ukuran papan di sini...'
                    className="w-full rounded-lg border border-white/20 bg-black/60 p-2 font-mono text-[10px] text-white/90 placeholder-white/40 focus:border-[#ffd21f] focus:outline-none"
                  />
                  {importStatus && (
                    <div className="text-[11px] font-bold text-[#ffd21f]">
                      {importStatus}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleApplyImport}
                    className="w-full rounded-lg bg-[#ffd21f] py-1.5 text-xs font-black text-[#151823] transition hover:bg-[#ffdf4a] active:scale-95"
                  >
                    Terapkan Pengaturan JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#1e2333]/90 px-5 py-3">
          <span className="text-[11px] font-semibold text-white/60">
            Perubahan otomatis tersimpan
          </span>
          <button
            type="button"
            onClick={close}
            className="rounded-xl bg-[#ffd21f] px-5 py-2 font-black text-xs text-[#151823] shadow-md transition hover:bg-[#ffdf4a] active:scale-95"
          >
            Selesai ✓
          </button>
        </div>
      </div>
    </div>
  );
}
