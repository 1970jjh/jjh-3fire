import React, { useState } from 'react';
import { UserProfile, SessionConfig } from '../types';
import { Smartphone, LogIn, Users, Hash, ChevronDown } from 'lucide-react';

interface Props {
  sessions: SessionConfig[];
  onJoin: (user: UserProfile, session: SessionConfig) => void;
  onBack: () => void;
}

const StudentLogin: React.FC<Props> = ({ sessions, onJoin, onBack }) => {
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionConfig | null>(
    sessions.length > 0 ? sessions[0] : null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) {
      alert("교육 세션을 선택해주세요.");
      return;
    }
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!teamId) {
      alert("자신의 소속 조를 선택해주세요.");
      return;
    }
    onJoin({ name, teamId }, selectedSession);
  };

  // 세션이 없는 경우
  if (sessions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000]">
          <div className="bg-[#4f46e5] p-6 text-white text-center border-b-2 border-black">
             <h1 className="text-3xl font-black mb-1 uppercase italic tracking-wider">LOGIN</h1>
             <p className="text-white/80 font-bold text-sm">FireSim Simulation Access</p>
          </div>
          <div className="p-6 text-center">
            <div className="bg-yellow-100 border-2 border-black p-6 mb-6">
              <p className="font-bold text-lg mb-2">🚫 현재 열린 교육 세션이 없습니다</p>
              <p className="text-sm text-gray-600">관리자가 세션을 생성할 때까지 기다려주세요.</p>
            </div>
            <button
              onClick={onBack}
              className="w-full py-3 border-2 border-black text-black font-bold hover:bg-gray-100 shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000]"
            >
              BACK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000]">

        <div className="bg-[#4f46e5] p-6 text-white text-center border-b-2 border-black">
           <h1 className="text-3xl font-black mb-1 uppercase italic tracking-wider">LOGIN</h1>
           <p className="text-white/80 font-bold text-sm">FireSim Simulation Access</p>
        </div>

        <div className="p-6">
           {/* Session Selection */}
           <div className="mb-6">
              <label className="block text-sm font-black uppercase flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4" />
                0. Select Session
              </label>
              <div className="relative">
                <select
                  value={selectedSession?.id || ''}
                  onChange={(e) => {
                    const session = sessions.find(s => s.id === e.target.value);
                    setSelectedSession(session || null);
                    setTeamId(null); // 세션 변경 시 팀 선택 초기화
                  }}
                  className="w-full p-3 border-2 border-black font-bold appearance-none bg-white cursor-pointer focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:bg-yellow-50 transition-all"
                >
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.groupName} ({session.totalTeams}개 팀)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
              </div>
           </div>

           {/* Session Info */}
           {selectedSession && (
             <div className="bg-[#a5f3fc] border-2 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-xs font-black uppercase tracking-wider block mb-1">Target Session</span>
                <h2 className="text-lg font-bold text-black truncate">{selectedSession.groupName}</h2>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-2">
                 <label className="block text-sm font-black uppercase flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    1. Select Team
                 </label>
                 <div className="grid grid-cols-4 gap-2">
                    {selectedSession && Array.from({ length: selectedSession.totalTeams }, (_, i) => i + 1).map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => setTeamId(num)}
                            className={`py-2 text-sm font-bold border-2 border-black transition-all ${
                                teamId === num
                                ? 'bg-[#fbbf24] text-black shadow-[2px_2px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {num}조
                        </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="block text-sm font-black uppercase flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    2. Your Name
                 </label>
                 <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:bg-yellow-50 transition-all font-bold"
                    placeholder="성명을 입력하세요"
                 />
              </div>

              <div className="pt-4 flex gap-3">
                 <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 py-3 border-2 border-black text-black font-bold hover:bg-gray-100 shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000]"
                 >
                    BACK
                 </button>
                 <button
                    type="submit"
                    className="flex-[2] py-3 bg-black text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-gray-800 flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000]"
                 >
                    ENTER
                    <LogIn className="w-4 h-4" />
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
