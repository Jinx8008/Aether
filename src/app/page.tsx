"use client";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { ArrowLeft, CircleDot, Eye, EyeOff, Pause, Play, RotateCcw } from "lucide-react";
import { type Planet } from "@/components/SolarSystem";

const SolarSystem = dynamic(() => import("@/components/SolarSystem"), { ssr: false });
const glass = "border border-white/15 bg-[#07101e]/65 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,.35)]";

export default function Home() {
  const [selected, setSelected] = useState<Planet | null>(null);
  const [mode, setMode] = useState<"real" | "cinematic">("real");
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [reset, setReset] = useState(0);
  const [resetTime, setResetTime] = useState(0);
  const onTimeChange = useCallback((_ms: number) => {}, []);
  const goBack = () => { setSelected(null); setReset(v => v + 1); };
  const setView = (next: "real" | "cinematic") => {
    setMode(next);
    setPaused(false);
    if (next === "real") setResetTime(v => v + 1);
  };

  return <main className="relative h-[100dvh] min-h-[360px] w-full overflow-hidden bg-[#030712] text-white">
    <SolarSystem selected={selected} onSelect={setSelected} paused={paused} speed={speed}
      showOrbits={showOrbits} reset={reset} mode={mode} onTimeChange={onTimeChange} resetTime={resetTime}/>
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(1,4,12,.36)_100%)]"/>
    {!selected && <div className="pointer-events-none absolute left-4 top-5 z-10 sm:left-8 sm:top-8">
      <div className="text-[12px] font-semibold tracking-[.38em] text-white/75 sm:text-sm">AETHER</div>
      <div className="mt-1 text-[8px] tracking-[.24em] text-[#88a7c0]">BEYOND THE KNOWN</div>
    </div>}
    <div className="pointer-events-auto absolute right-3 top-4 z-20 flex items-center gap-2 sm:right-7 sm:top-7">
      <div className={`flex items-center gap-1 rounded-full p-1 ${glass}`} role="group" aria-label="Simulation mode">
        <button onClick={() => setView("real")} aria-pressed={mode === "real"}
          className={`rounded-full px-3 py-2 text-[11px] transition sm:px-4 ${mode === "real" ? "bg-[#a5e6f0] text-[#082333]" : "text-[#b5c9d9] hover:bg-white/10"}`}>Live</button>
        <button onClick={() => setView("cinematic")} aria-pressed={mode === "cinematic"}
          className={`rounded-full px-3 py-2 text-[11px] transition sm:px-4 ${mode === "cinematic" ? "bg-[#a5e6f0] text-[#082333]" : "text-[#b5c9d9] hover:bg-white/10"}`}>Cinematic</button>
      </div>
      <button onClick={() => setShowOrbits(v => !v)} aria-label={showOrbits ? "Hide orbits" : "Show orbits"}
        title={showOrbits ? "Hide orbits" : "Show orbits"} className={`flex h-10 w-10 items-center justify-center rounded-full text-[#c1e6ee] transition hover:bg-white/15 ${glass}`}>
        {showOrbits ? <Eye size={17}/> : <EyeOff size={17}/>}
      </button>
      {mode === "cinematic" && <button onClick={() => setPaused(v => !v)} aria-label={paused ? "Play simulation" : "Pause simulation"}
        title={paused ? "Play" : "Pause"} className={`flex h-10 w-10 items-center justify-center rounded-full text-[#c1e6ee] hover:bg-white/15 ${glass}`}>
        {paused ? <Play size={16}/> : <Pause size={16}/>}
      </button>}
    </div>
    {mode === "cinematic" && <div className={`pointer-events-auto absolute right-3 top-[76px] z-20 flex items-center gap-3 rounded-full px-4 py-3 sm:right-7 sm:top-[88px] ${glass}`}>
      <span className="text-[10px] tracking-[.12em] text-[#a5c0d0]">SPEED</span>
      <input type="range" aria-label="Cinematic simulation speed" min="0.1" max="20" step="0.1" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-24 accent-[#a5e6f0] sm:w-32"/>
      <span className="w-11 text-right text-xs font-semibold tabular-nums text-[#a5e6f0]">{speed.toFixed(1)}×</span>
    </div>}
    {selected && <>
      <button onClick={goBack} className={`pointer-events-auto absolute left-3 top-4 z-20 flex items-center gap-2 rounded-full px-4 py-3 text-xs text-[#e1f4fa] transition hover:bg-white/15 sm:left-7 sm:top-7 ${glass}`}>
        <ArrowLeft size={16}/> Back to solar system
      </button>
      <section className={`pointer-events-auto absolute bottom-[max(18px,env(safe-area-inset-bottom))] left-3 right-3 z-20 rounded-[28px] p-5 sm:bottom-8 sm:left-8 sm:right-auto sm:w-[min(370px,calc(100vw-64px))] sm:rounded-[32px] sm:p-7 ${glass}`}>
        <div className="mb-3 flex items-center gap-2 text-[10px] font-medium tracking-[.2em] text-[#89dce9]"><CircleDot size={14}/> CELESTIAL BODY</div>
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{selected.name}</h1>
        <p className="mt-3 text-[13px] leading-6 text-[#afc0d0]">{selected.fact}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
          <div><div className="text-[9px] tracking-[.15em] text-[#819eb5]">DIAMETER</div><div className="mt-1.5 text-sm">{selected.diameter}</div></div>
          <div><div className="text-[9px] tracking-[.15em] text-[#819eb5]">ORBITAL PERIOD</div><div className="mt-1.5 text-sm">{selected.period}</div></div>
        </div>
      </section>
    </>}
    {!selected && <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-10 flex justify-center px-4 text-center text-[10px] tracking-[.16em] text-[#9eb2c6]/75 sm:bottom-8">
      SELECT A PLANET TO EXPLORE · DRAG TO ORBIT · SCROLL OR PINCH TO ZOOM
    </div>}
    {selected && <button onClick={goBack} aria-label="Reset camera" title="Return to solar system" className={`pointer-events-auto absolute bottom-[260px] right-4 z-20 hidden h-10 w-10 items-center justify-center rounded-full text-[#c1e6ee] sm:flex ${glass}`}><RotateCcw size={17}/></button>}
  </main>;
}
