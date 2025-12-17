import React, { useState } from 'react';
import { Check, Square } from 'lucide-react';

interface Props {
  onNext: (facts: string[]) => void;
}

const FACTS_POOL = [
  "8월 4일 오전 10:30분경 화재 발생",
  "생산팀 박계장 전치 4주 화상 입음",
  "화재로 인해 공장 가동 전면 중단됨",
  "납기일은 8월 12일로 일주일 남음",
  "최근 공장 주변에 야생 고양이가 자주 출몰함",
  "박계장은 평소 안전모를 잘 쓰지 않음 (의견)",
  "3공장 사고 시점에 남은 생산량은 4,000 unit",
  "소화기가 작동하지 않아 초기 진압 실패",
  "구내식당 메뉴가 맛이 없어서 불만이 많음",
];

const StepOneSituation: React.FC<Props> = ({ onNext }) => {
  const [selectedFacts, setSelectedFacts] = useState<string[]>([]);

  const toggleFact = (fact: string) => {
    if (selectedFacts.includes(fact)) {
      setSelectedFacts(prev => prev.filter(f => f !== fact));
    } else {
      setSelectedFacts(prev => [...prev, fact]);
    }
  };

  const handleNext = () => {
    if (selectedFacts.length < 3) {
      alert("최소 3개 이상의 핵심 사실(Fact)을 선택해주세요.");
      return;
    }
    onNext(selectedFacts);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#a5f3fc] p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
        <h2 className="text-xl font-black text-black mb-1 uppercase">Step 1. Fact Finding</h2>
        <p className="text-sm font-bold text-gray-700">문제 해결에 필요한 <strong className="bg-white px-1">객관적 사실(Fact)</strong>만 선택하세요.</p>
      </div>

      <div className="space-y-3 pb-24">
        {FACTS_POOL.map((fact, index) => {
           const isSelected = selectedFacts.includes(fact);
           return (
            <div 
                key={index}
                onClick={() => toggleFact(fact)}
                className={`p-4 border-2 border-black transition-all flex items-start gap-3 cursor-pointer ${
                isSelected
                    ? 'bg-[#4f46e5] text-white shadow-[4px_4px_0px_0px_#000] translate-x-[-2px] translate-y-[-2px]' 
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
            >
                <div className={`w-6 h-6 border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-white bg-black' : 'border-black bg-white'}`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm font-bold leading-snug pt-0.5">
                {fact}
                </span>
            </div>
           )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-black md:absolute z-30">
        <button 
          onClick={handleNext}
          disabled={selectedFacts.length < 1}
          className="w-full bg-black disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 text-white font-black py-4 border-2 border-black shadow-[4px_4px_0px_0px_#71717a] hover:bg-gray-800 transition-colors uppercase tracking-wider"
        >
          NEXT STEP ({selectedFacts.length})
        </button>
      </div>
    </div>
  );
};

export default StepOneSituation;
