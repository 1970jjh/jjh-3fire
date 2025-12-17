import React, { useState } from 'react';
import { Users, Play, Monitor } from 'lucide-react';
import { SessionConfig } from '../types';

interface Props {
  onStartSession: (config: SessionConfig) => void;
  onBack: () => void;
}

const AdminSetup: React.FC<Props> = ({ onStartSession, onBack }) => {
  const [groupName, setGroupName] = useState("신입사원 입문교육");
  const [teams, setTeams] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert("그룹명을 입력해주세요.");
      return;
    }
    onStartSession({
      id: Date.now().toString(),
      groupName,
      totalTeams: teams,
      createdAt: Date.now(),
      isReportEnabled: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8">
        <div className="bg-slate-900 p-6 text-white">
           <div className="flex items-center gap-3 mb-2">
             <Monitor className="w-6 h-6 text-blue-400" />
             <h2 className="text-xl font-bold">관리자 세션 설정</h2>
           </div>
           <p className="text-slate-400 text-sm">교육 그룹과 참여 팀 수를 설정하고 앱을 오픈하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">교육 그룹명</label>
            <input 
              type="text" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="예: 2024 승격자 교육 A차수"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-slate-700">팀(조) 편성 수</label>
                <span className="text-2xl font-black text-blue-600">{teams}개 조</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="12" 
              value={teams}
              onChange={(e) => setTeams(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>1조</span>
              <span>6조</span>
              <span>12조</span>
            </div>
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
               * 최대 12개 조까지 운영 가능합니다.<br/>
               * 학습자는 로그인 시 1 ~ {teams}조 중에서 선택하게 됩니다.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
                type="button"
                onClick={onBack}
                className="flex-1 py-4 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
             >
                취소
             </button>
             <button 
                type="submit"
                className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
             >
                <Play className="w-5 h-5" />
                세션 오픈 (모니터링 시작)
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminSetup;