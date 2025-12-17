import React, { useState } from 'react';
import { ArrowDown } from 'lucide-react';

interface Props {
  onNext: (gap: { current: string; ideal: string }) => void;
}

const StepTwoDefinition: React.FC<Props> = ({ onNext }) => {
  const [current, setCurrent] = useState("");
  const [ideal, setIdeal] = useState("");

  const handleNext = () => {
    if (!current || !ideal) {
      alert("내용을 모두 입력해주세요.");
      return;
    }
    onNext({ current, ideal });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#a5f3fc] p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
        <h2 className="text-xl font-black text-black mb-1 uppercase">Step 2. Gap Analysis</h2>
        <p className="text-sm font-bold text-gray-700"><strong>As-Is(현재)</strong>와 <strong>To-Be(목표)</strong>의 차이(Gap)를 정의하세요.</p>
      </div>

      <div className="space-y-4 pb-24">
        {/* Current State */}
        <div className="bg-[#fecaca] p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <label className="block text-black font-black mb-2 text-sm uppercase bg-white inline-block px-2 border-2 border-black">
            As-Is (Current)
          </label>
          <textarea 
            className="w-full h-28 p-3 text-sm border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] resize-none bg-white font-bold"
            placeholder="예: 화재로 인명사고 발생 및 생산 중단..."
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>

        <div className="flex justify-center -my-4 relative z-10">
          <div className="bg-black text-white p-2 border-2 border-black rounded-full">
             <ArrowDown className="w-6 h-6" />
          </div>
        </div>

        {/* Ideal State */}
        <div className="bg-[#bbf7d0] p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <label className="block text-black font-black mb-2 text-sm uppercase bg-white inline-block px-2 border-2 border-black">
            To-Be (Ideal)
          </label>
          <textarea 
            className="w-full h-28 p-3 text-sm border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] resize-none bg-white font-bold"
            placeholder="예: 안전한 작업 환경에서 납기 내 생산..."
            value={ideal}
            onChange={(e) => setIdeal(e.target.value)}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-black md:absolute z-30">
        <button 
          onClick={handleNext}
          className="w-full bg-black text-white font-black py-4 border-2 border-black shadow-[4px_4px_0px_0px_#71717a] hover:bg-gray-800 transition-colors uppercase tracking-wider"
        >
          CONFIRM GAP
        </button>
      </div>
    </div>
  );
};

export default StepTwoDefinition;
