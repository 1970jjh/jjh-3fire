import React, { useState, useEffect } from 'react';
import { INITIAL_POWER_DATA, MAX_POWER_LIMIT, PowerData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { HelpCircle, Zap } from 'lucide-react';

interface Props {
  onNext: (causes: any) => void;
}

const StepThreeAnalysis: React.FC<Props> = ({ onNext }) => {
  const [powerData, setPowerData] = useState<PowerData[]>(INITIAL_POWER_DATA);
  const [totalWattage, setTotalWattage] = useState(0);
  const [selectedCause1, setCause1] = useState("");
  const [selectedCause2, setCause2] = useState("");

  useEffect(() => {
    const total = powerData.reduce((acc, item) => acc + (item.active ? item.count * item.watts : 0), 0);
    setTotalWattage(total);
  }, [powerData]);

  const toggleMachine = (index: number) => {
    const newData = [...powerData];
    newData[index].active = !newData[index].active;
    setPowerData(newData);
  };

  const chartData = [
    { name: 'Total', watts: totalWattage },
  ];

  const handleNext = () => {
    if (totalWattage <= MAX_POWER_LIMIT) {
        alert("전력 시뮬레이션에서 '과부하' 상태를 재현해야 합니다. 어떤 기기들이 켜져 있었나요?");
        return;
    }
    if(!selectedCause1 || !selectedCause2) {
        alert("모든 심층 분석 항목을 선택해주세요.");
        return;
    }
    onNext({ powerData });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* 1. Technical Analysis */}
      <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center gap-2 mb-3 border-b-2 border-black pb-2">
             <span className="bg-black text-white text-xs font-black px-2 py-1 uppercase">Experiment 1</span>
             <h3 className="font-black text-lg">Direct Cause Analysis</h3>
        </div>
        
        <p className="text-xs font-bold text-gray-500 mb-4 bg-gray-100 p-2 border-2 border-transparent">
            MISSION: 3공장 전력 사용량을 재현하여 과부하 원인을 찾으세요. (Limit: 16,000W)
        </p>

        {/* Responsive Chart */}
        <div className="h-32 mb-4 bg-gray-50 border-2 border-black p-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={chartData}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ccc" />
              <XAxis type="number" domain={[0, 20000]} hide />
              <YAxis dataKey="name" type="category" width={1} />
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{border: '2px solid black', boxShadow: '4px 4px 0px 0px #000', borderRadius: '0px', fontWeight: 'bold'}}
              />
              <ReferenceLine x={MAX_POWER_LIMIT} stroke="red" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'MAX', position: 'insideTopRight', fill: 'red', fontSize: 10, fontWeight: 'bold' }} />
              <Bar dataKey="watts" fill={totalWattage > MAX_POWER_LIMIT ? "#ef4444" : "#22c55e"} barSize={30} radius={[0, 0, 0, 0]} stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-4 -translate-y-1/2 text-sm font-black bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_#000]">
             {totalWattage.toLocaleString()}W
          </div>
          {totalWattage > MAX_POWER_LIMIT && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-black px-2 py-1 border-2 border-black animate-pulse flex items-center gap-1">
                  <Zap className="w-3 h-3" /> OVERLOAD
              </div>
          )}
        </div>

        {/* Machine Toggles */}
        <div className="grid grid-cols-1 gap-3">
          {powerData.map((item, idx) => (
            <label 
                key={idx} 
                className={`flex items-center justify-between p-3 border-2 border-black cursor-pointer select-none transition-all ${
                    item.active ? 'bg-[#4f46e5] text-white shadow-[4px_4px_0px_0px_#000]' : 'bg-white hover:bg-gray-50'
                }`}
            >
              <div className="flex flex-col">
                <span className="font-black text-sm uppercase">{item.device}</span>
                <span className={`text-xs font-mono ${item.active ? 'text-white/80' : 'text-gray-500'}`}>{item.count} EA × {item.watts.toLocaleString()}W</span>
              </div>
              <input type="checkbox" checked={item.active} onChange={() => toggleMachine(idx)} className="w-6 h-6 accent-black border-2 border-black" />
            </label>
          ))}
        </div>
      </div>

      {/* 2. Logic Tree Analysis */}
      <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-4">
         <div className="flex items-center gap-2 border-b-2 border-black pb-2">
             <span className="bg-black text-white text-xs font-black px-2 py-1 uppercase">Experiment 2</span>
             <h3 className="font-black text-lg">5 Whys Analysis</h3>
        </div>
         
         <div className="space-y-4">
            <div className="bg-gray-50 p-4 border-2 border-black">
                <p className="text-sm font-black text-red-600 mb-2 flex items-center gap-2 uppercase">
                    <HelpCircle className="w-4 h-4" /> Why 1. 인명피해 발생?
                </p>
                <p className="text-xs font-bold text-gray-500 mb-2 pl-6">박계장은 왜 제때 대피하지 못했는가?</p>
                <select 
                    className="w-full p-2 bg-white border-2 border-black font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_#000]"
                    value={selectedCause1}
                    onChange={(e) => setCause1(e.target.value)}
                >
                    <option value="">원인을 선택하세요</option>
                    <option>대피 방송 시스템 고장</option>
                    <option value="correct">비상구 앞 자재 적재로 탈출 지연</option>
                    <option>안전화 미착용으로 인한 부상</option>
                </select>
            </div>

            <div className="bg-gray-50 p-4 border-2 border-black">
                <p className="text-sm font-black text-red-600 mb-2 flex items-center gap-2 uppercase">
                    <HelpCircle className="w-4 h-4" /> Why 2. 초기진압 실패?
                </p>
                <p className="text-xs font-bold text-gray-500 mb-2 pl-6">왜 작은 불이 큰 화재로 번졌는가?</p>
                <select 
                    className="w-full p-2 bg-white border-2 border-black font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_#000]"
                    value={selectedCause2}
                    onChange={(e) => setCause2(e.target.value)}
                >
                    <option value="">원인을 선택하세요</option>
                    <option>소방차 진입로 부족</option>
                    <option value="correct">소화기 노후화로 인한 작동 불량</option>
                    <option>스프링클러 오작동</option>
                </select>
            </div>
         </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-black md:absolute z-30">
        <button 
          onClick={handleNext}
          className="w-full bg-black text-white font-black py-4 border-2 border-black shadow-[4px_4px_0px_0px_#71717a] hover:bg-gray-800 transition-colors uppercase tracking-wider"
        >
          CONFIRM CAUSES & NEXT
        </button>
      </div>
    </div>
  );
};

export default StepThreeAnalysis;
