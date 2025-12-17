import React, { useState, useEffect } from 'react';
import { SimulationState, INITIAL_POWER_DATA, SessionConfig, UserProfile } from './types';
import StudentLayout from './components/StudentLayout';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import AdminSessionManager from './components/AdminSessionManager';
import StudentLogin from './components/StudentLogin';
import { Smartphone, Monitor, User, Flame, Lock, LogOut, Loader2 } from 'lucide-react';
import {
  subscribeToSessions,
  createSessionWithId,
  deleteSession as deleteSessionFromDB,
  updateSession
} from './services/firestore';

const INITIAL_STATE: SimulationState = {
  currentStep: 'INTRO',
  user: null,
  teamName: '',
  timeLeft: 3600,
  collectedFacts: [],
  personalNotes: [],
  gapAnalysis: { current: '', ideal: '' },
  powerCalculation: INITIAL_POWER_DATA,
  rootCauses: { human: '', machine: '', material: '', method: '' },
  solutions: { shortTerm: '', longTerm: '', prevention: '' },
  finalReport: null,
};

// 기본 세션 (Firebase에 없을 때만 사용)
const DEFAULT_SESSION: SessionConfig = {
    id: 'default',
    groupName: '데모 교육 세션',
    totalTeams: 6,
    createdAt: Date.now(),
    isReportEnabled: false,
};

type AppMode = 'SELECT_ROLE' | 'ADMIN_LOGIN' | 'ADMIN_SESSION_MANAGER' | 'ADMIN_DASHBOARD' | 'STUDENT_LOGIN' | 'STUDENT_GAME';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('SELECT_ROLE');
  const [currentSession, setCurrentSession] = useState<SessionConfig>(DEFAULT_SESSION);
  const [gameState, setGameState] = useState<SimulationState>(INITIAL_STATE);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessions, setSessions] = useState<SessionConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase에서 세션 목록 실시간 구독
  useEffect(() => {
    const unsubscribe = subscribeToSessions((fetchedSessions) => {
      setSessions(fetchedSessions);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Handlers ---

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setAppMode('ADMIN_SESSION_MANAGER');
  };

  const handleSessionSelect = (session: SessionConfig) => {
    setCurrentSession(session);
    setAppMode('ADMIN_DASHBOARD');
  };

  const handleCreateSession = async (newSession: SessionConfig) => {
    try {
      await createSessionWithId(newSession);
      // Firebase 실시간 구독으로 자동 업데이트됨
    } catch (error) {
      console.error('세션 생성 실패:', error);
      alert('세션 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSessionFromDB(id);
      // Firebase 실시간 구독으로 자동 업데이트됨
    } catch (error) {
      console.error('세션 삭제 실패:', error);
      alert('세션 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleToggleReport = async (enabled: boolean) => {
    try {
      // Firebase 업데이트
      await updateSession(currentSession.id, { isReportEnabled: enabled });
      // 로컬 상태도 업데이트
      setCurrentSession(prev => ({ ...prev, isReportEnabled: enabled }));
    } catch (error) {
      console.error('보고서 설정 변경 실패:', error);
      alert('설정 변경에 실패했습니다.');
    }
  };

  const handleStudentJoin = (user: UserProfile, session: SessionConfig) => {
    setCurrentSession(session);
    setGameState(prev => ({
        ...prev,
        user: user,
        teamName: `${user.teamId}조`
    }));
    setAppMode('STUDENT_GAME');
  };

  // Switch Mode (Maintains Admin Login)
  const handleModeSwitch = () => {
    setGameState(INITIAL_STATE);
    setAppMode('SELECT_ROLE');
  };

  // Full Logout (Clears Admin Login)
  const handleFullLogout = () => {
    setIsAdmin(false);
    setGameState(INITIAL_STATE);
    setAppMode('SELECT_ROLE');
  };

  // --- 로딩 화면 ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-gray-500" />
          <p className="font-bold text-gray-600">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // --- Renders ---

  if (appMode === 'SELECT_ROLE') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] relative">

          {isAdmin && (
              <div className="absolute -top-4 -right-4 bg-black text-[#fbbf24] px-3 py-1 text-xs font-black border-2 border-[#fbbf24] shadow-lg flex items-center gap-1 z-10">
                  <Lock className="w-3 h-3" />
                  ADMIN LOGGED IN
              </div>
          )}

          <div className="bg-[#ff5d5d] p-8 text-center border-b-2 border-black">
            <Flame className="w-16 h-16 mx-auto mb-4 text-black drop-shadow-[2px_2px_0px_#fff]" />
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">FireSim 3rd</h1>
            <p className="font-bold text-black/80">제3공장 화재사고 문제해결 시뮬레이션</p>
          </div>
          <div className="p-8 space-y-6">
            <p className="text-center font-bold text-lg mb-6 bg-yellow-300 border-2 border-black p-2 shadow-[4px_4px_0px_0px_#000]">
                접속 모드를 선택하세요
            </p>

            <button
              onClick={() => setAppMode('STUDENT_LOGIN')}
              className="w-full flex items-center justify-between p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all bg-white group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 text-white border-2 border-black rounded-none">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-xl">학습자 입장</span>
                  <span className="text-sm font-bold text-gray-500">Student Access</span>
                </div>
              </div>
              <User className="text-black w-6 h-6" />
            </button>

            <button
              onClick={() => {
                if (isAdmin) {
                  setAppMode('ADMIN_SESSION_MANAGER');
                } else {
                  setAppMode('ADMIN_LOGIN');
                }
              }}
              className="w-full flex items-center justify-between p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all bg-black text-white group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-yellow-400 p-3 text-black border-2 border-white rounded-none">
                  <Monitor className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-xl">관리자 모드</span>
                  <span className="text-sm font-bold text-gray-400">
                      {isAdmin ? '접속 중 (Manager)' : 'Admin Only'}
                  </span>
                </div>
              </div>
            </button>

            {isAdmin && (
                <button
                    onClick={handleFullLogout}
                    className="w-full text-center text-xs font-bold text-gray-400 hover:text-red-500 underline py-2 flex items-center justify-center gap-1"
                >
                    <LogOut className="w-3 h-3" />
                    관리자 로그아웃 (Secure Logout)
                </button>
            )}

          </div>
        </div>
      </div>
    );
  }

  if (appMode === 'ADMIN_LOGIN') {
      return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} onBack={handleModeSwitch} />;
  }
  if (appMode === 'ADMIN_SESSION_MANAGER') {
      return (
        <AdminSessionManager
            sessions={sessions}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onSelectSession={handleSessionSelect}
            onLogout={handleFullLogout}
            onModeSwitch={handleModeSwitch}
        />
      );
  }
  if (appMode === 'ADMIN_DASHBOARD') {
      return (
        <AdminDashboard
            currentSession={currentSession}
            onToggleReport={handleToggleReport}
            onLogout={handleFullLogout}
            onModeSwitch={handleModeSwitch}
        />
      );
  }

  if (appMode === 'STUDENT_LOGIN') {
      return (
        <StudentLogin
            sessions={sessions}
            onJoin={handleStudentJoin}
            onBack={handleModeSwitch}
        />
      );
  }

  return (
    <StudentLayout
      gameState={gameState}
      setGameState={setGameState}
      totalTeams={currentSession.totalTeams}
      sessionId={currentSession.id}
      onLogout={handleModeSwitch}
      isAdmin={isAdmin}
      isReportEnabled={currentSession.isReportEnabled}
    />
  );
}
