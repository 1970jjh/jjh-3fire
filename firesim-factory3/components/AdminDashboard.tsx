import React from 'react';
import { TeamProgress, SessionConfig } from '../types';
import { Activity, Users, Clock, FileText, CheckCircle, AlertTriangle, LogOut, RotateCcw, Lock, Unlock } from 'lucide-react';

interface Props {
  currentSession: SessionConfig;
  onToggleReport: (enabled: boolean) => void;
  onLogout: () => void;
  onModeSwitch: () => void;
}

const MOCK_TEAMS: TeamProgress[] = [
  { id: '1', name: '1조', step: 'ANALYSIS', status: 'active', lastUpdate: '2분 전', score: 0 },
  { id: '2', name: '2조', step: 'REPORT', status: 'completed', lastUpdate: '완료', score: 95 },
  { id: '3', name: '3조', step: 'SITUATION', status: 'danger', lastUpdate: '10분 전', score: 0 },
  { id: '4', name: '4조', step: 'SOLUTION', status: 'active', lastUpdate: '1분 전', score: 0 },
];

const AdminDashboard: React.FC<Props> = ({ currentSession, onToggleReport, onLogout, onModeSwitch }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white px-8 py-4 flex flex-col md:flex-row justify-between items-center shadow-lg gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">FireSim Admin</h1>
            <p className="text-xs text-slate-400">{currentSession.groupName}</p>
          </div>
        </div>
        
        {/* Report Control */}
        <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-lg border border-slate-700">
           <span className="text-sm font-bold text-slate-300">보고서 제출:</span>
           <button 
             onClick={() => onToggleReport(!currentSession.isReportEnabled)}
             className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-all ${
                 currentSession.isReportEnabled 
                 ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                 : 'bg-slate-600 text-slate-400'
             }`}
           >
             {currentSession.isReportEnabled ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
             {currentSession.isReportEnabled ? '활성화됨 (ON)' : '비활성 (OFF)'}
           </button>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={onModeSwitch}
                className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors"
                title="학습자 모드 선택 화면으로 이동"
            >
                <RotateCcw className="w-4 h-4" />
                모드 전환
            </button>
            
            <button 
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors font-bold"
            >
                <LogOut className="w-4 h-4" />
                종료
            </button>
        </div>
      </header>

      {/* Dashboard Stats */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 font-medium">참여 팀</h3>
                    <Users className="text-blue-500" />
                </div>
                <p className="text-3xl font-black text-slate-800">{currentSession.totalTeams} <span className="text-sm font-normal text-slate-400">Teams</span></p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 font-medium">평균 진행률</h3>
                    <Activity className="text-green-500" />
                </div>
                <p className="text-3xl font-black text-slate-800">65%</p>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 font-medium">남은 시간</h3>
                    <Clock className="text-red-500" />
                </div>
                <p className="text-3xl font-black text-slate-800">59:21</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 font-medium">제출 완료</h3>
                    <FileText className="text-purple-500" />
                </div>
                <p className="text-3xl font-black text-slate-800">1 <span className="text-sm font-normal text-slate-400">/ {currentSession.totalTeams}</span></p>
            </div>
        </div>

        {/* Team Grid */}
        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">팀별 실시간 현황</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {MOCK_TEAMS.map((team) => (
                <div key={team.id} className={`bg-white rounded-xl border-l-4 shadow-sm p-6 ${
                    team.status === 'completed' ? 'border-l-green-500' :
                    team.status === 'danger' ? 'border-l-red-500' : 'border-l-blue-500'
                }`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{team.name}</h3>
                            <p className="text-sm text-slate-500">Last Active: {team.lastUpdate}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                             team.status === 'completed' ? 'bg-green-100 text-green-700' :
                             team.status === 'danger' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {team.step}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">진행 단계</span>
                            <div className="flex gap-1">
                                {['SITUATION', 'DEFINITION', 'ANALYSIS', 'SOLUTION', 'REPORT'].map((step, idx) => {
                                    const steps = ['SITUATION', 'DEFINITION', 'ANALYSIS', 'SOLUTION', 'REPORT'];
                                    const currentIdx = steps.indexOf(team.step);
                                    const isCompleted = idx <= currentIdx;
                                    
                                    return (
                                        <div 
                                            key={step} 
                                            className={`w-8 h-2 rounded-full ${isCompleted ? 'bg-blue-500' : 'bg-slate-200'}`}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                        
                        {team.status === 'completed' && (
                             <div className="bg-green-50 p-3 rounded flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-800 font-bold">보고서 제출 완료 (점수: {team.score})</span>
                                <button className="ml-auto text-xs bg-white border border-green-200 px-2 py-1 rounded text-green-700 font-bold hover:bg-green-50">
                                    결과 보기
                                </button>
                             </div>
                        )}
                        
                        {team.status === 'danger' && (
                             <div className="bg-red-50 p-3 rounded flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <span className="text-sm text-red-800 font-bold">10분 이상 활동 없음</span>
                                <button className="ml-auto text-xs bg-white border border-red-200 px-2 py-1 rounded text-red-700 font-bold hover:bg-red-50">
                                    독려 알림
                                </button>
                             </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;