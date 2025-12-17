import React, { useState } from 'react';

interface Props {
  onNext: (solutions: any) => void;
}

const StepFourSolution: React.FC<Props> = ({ onNext }) => {
  const [shortTerm, setShortTerm] = useState("");
  const [prevention, setPrevention] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="bg-[#a5f3fc] p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
        <h2 className="text-xl font-black text-black mb-1 uppercase">Step 4. Solution</h2>
        <p className="text-sm font-bold text-gray-700"><strong>단기 대책</strong>(문제 해결)과 <strong>재발 방지</strong>(근본 대책)를 수립하세요.</p>
      </div>

      {/* Short Term */}
      <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-black text-lg">1. Short-term (납기)</h3>
          <span className="text-[10px] font-black bg-[#fbbf24] text-black border-2 border-black px-2 py-0.5 uppercase">URGENT</span>
        </div>
        <div className="bg-gray-100 p-2 border-2 border-black mb-3 text-xs font-mono text-gray-600">
            💡 HINT: 1공장(400) + 4공장(600) = 1,000/day
        </div>
        <textarea 
          value={shortTerm}
          onChange={(e) => setShortTerm(e.target.value)}
          className="w-full h-32 p-3 text-sm font-bold border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] resize-none"
          placeholder="납기일 준수를 위한 구체적 계획을 작성하세요."
        />
      </div>

      {/* Long Term */}
      <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
         <div className="flex justify-between items-center mb-3">
          <h3 className="font-black text-lg">2. Prevention (재발방지)</h3>
          <span className="text-[10px] font-black bg-[#4f46e5] text-white border-2 border-black px-2 py-0.5 uppercase">CRITICAL</span>
        </div>
        <p className="text-xs font-bold text-gray-500 mb-3">전력 과부하 및 인명 사고 재발을 막으려면?</p>
        <textarea 
          value={prevention}
          onChange={(e) => setPrevention(e.target.value)}
          className="w-full h-32 p-3 text-sm font-bold border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] resize-none"
          placeholder="시설 보완 및 규정 강화 계획을 작성하세요."
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-black md:absolute z-30">
        <button 
          onClick={() => onNext({ shortTerm, prevention })}
          className="w-full bg-black text-white font-black py-4 border-2 border-black shadow-[4px_4px_0px_0px_#71717a] hover:bg-gray-800 transition-colors uppercase tracking-wider"
        >
          SUBMIT FINAL REPORT
        </button>
      </div>
    </div>
  );
};

export default StepFourSolution;
