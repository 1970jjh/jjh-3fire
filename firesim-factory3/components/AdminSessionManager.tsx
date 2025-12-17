import React, { useState } from 'react';
import { SessionConfig } from '../types';
import { Plus, Trash2, MonitorPlay, Users, LogOut, Box, RotateCcw } from 'lucide-react';

interface Props {
  sessions: SessionConfig[];
  onCreateSession: (session: SessionConfig) => void;
  onDeleteSession: (id: string) => void;
  onSelectSession: (session: SessionConfig) => void;
  onLogout: () => void;
  onModeSwitch: () => void;
}

const AdminSessionManager: React.FC<Props> = ({ sessions, onCreateSession, onDeleteSession, onSelectSession, onLogout, onModeSwitch }) => {
  const [newGroupName, setNewGroupName] = useState("");
  const [newTeamCount, setNewTeamCount] = useState(6);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newSession: SessionConfig = {
      id: Date.now().toString(),
      groupName: newGroupName,
      totalTeams: newTeamCount,
      createdAt: Date.now(),
      isReportEnabled: false
    };

    onCreateSession(newSession);
    setNewGroupName("");
    setNewTeamCount(6);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault();  // Double safety
    if (window.confirm('정말 이 세션을 삭제하시겠습니까? 데이터는 복구되지 않습니다.')) {
        onDeleteSession(id);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-4 border-black pb-4">
            <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Session Manager</h1>
                <p className="font-bold text-gray-600 mt-2">교육 그룹 관리 및 실행</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={onModeSwitch}
                    className="bg-white text-black px-4 py-3 font-bold border-2 border-black hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_#000] flex items-center gap-2"
                >
                    <RotateCcw className="w-5 h-5" />
                    MODE SWITCH
                </button>
                <button 
                    onClick={onLogout}
                    className="bg-black text-white px-4 py-3 font-bold border-2 border-black hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_#000] flex items-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    LOGOUT
                </button>
            </div>
        </div>

        {/* Create New Session Form */}
        <div className="bg-[#fbbf24] border-2 border-black shadow-[8px_8px_0px_0px_#000] p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Plus className="w-6 h-6 border-2 border-black rounded-full p-0.5" />
                CREATE NEW GROUP
            </h2>
            <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block font-bold text-sm mb-1">GROUP NAME</label>
                    <input 
                        type="text" 
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Ex: 2024 신입사원 입문교육"
                        className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow bg-white"
                        required
                    />
                </div>
                <div className="w-full md:w-48">
                    <label className="block font-bold text-sm mb-1">TEAMS: {newTeamCount}</label>
                    <input 
                        type="range" 
                        min="1" 
                        max="12" 
                        value={newTeamCount}
                        onChange={(e) => setNewTeamCount(Number(e.target.value))}
                        className="w-full h-2 bg-black appearance-none cursor-pointer accent-white border border-black"
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full md:w-auto bg-white px-6 py-3 font-black border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none transition-all uppercase"
                >
                    Create
                </button>
            </form>
        </div>

        {/* Session List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
                <div key={session.id} className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] p-6 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-200 cursor-pointer relative" onClick={() => onSelectSession(session)}>
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-black text-white text-xs font-mono px-2 py-1">
                                {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                            {/* Improved delete button */}
                            <button 
                                onClick={(e) => handleDeleteClick(e, session.id)}
                                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all z-20"
                                title="세션 삭제"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        <h3 className="text-2xl font-black leading-tight mb-2 pr-10">{session.groupName}</h3>
                        <div className="flex items-center gap-2 font-bold text-gray-600 mb-6">
                            <Users className="w-5 h-5" />
                            <span>Total Teams: {session.totalTeams}</span>
                        </div>
                    </div>
                    
                    <div 
                        className="w-full py-4 bg-[#4f46e5] group-hover:bg-[#4338ca] text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center gap-2 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                    >
                        <MonitorPlay className="w-5 h-5" />
                        START MONITORING
                    </div>
                </div>
            ))}
            
            {sessions.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-400 text-gray-400">
                    <Box className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-bold">No sessions created yet.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default AdminSessionManager;