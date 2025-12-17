import React, { useEffect } from 'react';
import { SCENARIO_INFO } from '../constants';
import { ArrowRight, Volume2, Siren, FileText } from 'lucide-react';

interface Props {
  onNext: () => void;
  onGoToReport: () => void;
  onShowInfoCard: () => void;
  teamId?: number;
}

const ScenarioIntro: React.FC<Props> = ({ onNext, onGoToReport, onShowInfoCard, teamId }) => {
  
  // Audio effect remains same
  useEffect(() => {
    let ctx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;
    let lfo: OscillatorNode | null = null;
    let gain: GainNode | null = null;
    let timer: ReturnType<typeof setTimeout>;

    const playSiren = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        ctx = new AudioContext();
        osc = ctx.createOscillator();
        lfo = ctx.createOscillator();
        gain = ctx.createGain();
        const lfoGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 600;
        lfo.type = 'sine';
        lfo.frequency.value = 1.5;
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5);
        osc.start();
        lfo.start();
        timer = setTimeout(() => {
          if (gain && ctx) {
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            setTimeout(() => { osc?.stop(); lfo?.stop(); ctx?.close(); }, 500);
          }
        }, 5000);
      } catch (e) { console.error("Audio play failed:", e); }
    };
    playSiren();
    return () => { clearTimeout(timer); if (ctx && ctx.state !== 'closed') { try { osc?.stop(); lfo?.stop(); ctx.close(); } catch(e) {} } };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Banner */}
      <div className="bg-[#ff5d5d] text-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] relative overflow-hidden">
        <div className="absolute top-2 right-2 opacity-50 animate-pulse">
            <Volume2 className="w-8 h-8" />
        </div>
        <div className="flex flex-col items-center text-center relative z-10">
            <Siren className="w-14 h-14 mb-4 text-white drop-shadow-[2px_2px_0px_#000] animate-bounce" />
            <span className="bg-black text-[#ff5d5d] text-sm font-black px-2 py-1 mb-2 border border-white">EMERGENCY ALERT</span>
            <h1 className="text-3xl font-black leading-tight uppercase tracking-tighter drop-shadow-[2px_2px_0px_#000]">
                긴급 속보:<br/>제3공장 화재 발생
            </h1>
        </div>
      </div>

      {/* Video Feed */}
      <div className="relative border-2 border-black shadow-[4px_4px_0px_0px_#000] bg-black overflow-hidden">
        <video 
            src="https://raw.githubusercontent.com/1970jjh/image-upload/main/fire.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-auto opacity-90 object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 animate-pulse border border-black">
             LIVE FOOTAGE
        </div>
      </div>

      <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2 uppercase underline decoration-4 decoration-[#fbbf24]">
            사고 개요
          </h2>
          <div className="space-y-4 text-sm font-medium">
            <div className="flex justify-between border-b-2 border-gray-100 pb-2">
              <span className="text-gray-500 font-bold">발생 일시</span>
              <span className="font-bold text-black text-right">{SCENARIO_INFO.date}</span>
            </div>
            <div className="flex justify-between border-b-2 border-gray-100 pb-2">
              <span className="text-gray-500 font-bold">장소</span>
              <span className="font-bold text-black text-right">{SCENARIO_INFO.location}</span>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-3">
              <span className="text-xs font-black text-red-500 uppercase block mb-1">DAMAGE REPORT</span>
              <span className="font-black text-red-600 text-lg">인명사고 발생 (전치 4주)</span>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
              <span className="text-xs font-black text-blue-500 uppercase block mb-1">HIDDEN ISSUE</span>
              <span className="font-black text-slate-400 text-lg tracking-widest">???</span>
            </div>
          </div>
      </div>

      {/* Team Info Button (Secret) - Moved here as requested */}
      <button 
           onClick={onShowInfoCard}
           className="w-full bg-black text-[#fbbf24] px-6 py-4 font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-transform active:scale-95 border-2 border-transparent shadow-[4px_4px_0px_0px_#fbbf24] uppercase tracking-wide"
        >
            <FileText className="w-5 h-5" />
            {teamId ? `${teamId}조` : '나의'} 정보 확인 (Secret)
      </button>

      <div className="bg-black text-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_#71717a]">
        <h2 className="text-lg font-black text-[#fbbf24] mb-3 uppercase">CEO's ORDER</h2>
        <div className="bg-gray-900 p-6 border border-gray-700 mb-4 text-lg md:text-xl font-bold leading-loose text-white font-sans">
            "1시간 내로<br/>
            <span className="text-white font-black bg-red-600 px-1 mx-0.5">현상파악</span> → 
            <span className="text-white font-black bg-blue-600 px-1 mx-0.5">문제정의</span> → 
            <span className="text-white font-black bg-orange-600 px-1 mx-0.5">원인분석</span> → 
            <span className="text-white font-black bg-green-600 px-1 mx-0.5">해결방안</span> → 
            <span className="text-white font-black bg-purple-600 px-1 mx-0.5">재발방지대책</span>
            을 보고하게!"
        </div>
        <div className="flex gap-3 text-xs font-bold font-mono">
            <div className="bg-white text-black px-3 py-2 flex-1 text-center border-2 border-gray-500">
                GOAL: 보고서 작성
            </div>
        </div>
      </div>

      {/* Sticky Bottom Button Container */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-black md:absolute z-30">
        <button
          onClick={onGoToReport}
          className="w-full bg-[#4f46e5] text-white text-lg font-black py-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
        >
          GOAL: 보고서 작성
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ScenarioIntro;