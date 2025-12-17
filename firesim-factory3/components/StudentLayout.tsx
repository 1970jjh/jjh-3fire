import React, { useState, useEffect } from 'react';
import { SimulationState, SimulationStep } from '../types';
import { STEPS } from '../constants';
import ScenarioIntro from './ScenarioIntro';
import StepOneSituation from './StepOneSituation';
import StepTwoDefinition from './StepTwoDefinition';
import StepThreeAnalysis from './StepThreeAnalysis';
import StepFourSolution from './StepFourSolution';
import StepFiveReport from './StepFiveReport';
import LearningGuide from './LearningGuide';
import InfoCardModal from './InfoCardModal';
import { ChevronLeft, Clock, RotateCcw, FileText, Menu } from 'lucide-react';

interface Props {
  gameState: SimulationState;
  setGameState: React.Dispatch<React.SetStateAction<SimulationState>>;
  totalTeams: number;
  sessionId: string;
  onLogout: () => void;
  isAdmin?: boolean;
  isReportEnabled: boolean; // Prop for report submission control
}

const StudentLayout: React.FC<Props> = ({ gameState, setGameState, totalTeams, sessionId, onLogout, isAdmin = false, isReportEnabled }) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);
  
  const currentStepIndex = STEPS.findIndex(s => s.id === gameState.currentStep);
  const totalSteps = STEPS.length - 1; 
  const progress = Math.max(0, (currentStepIndex / totalSteps) * 100);

  useEffect(() => {
    if (gameState.currentStep !== 'INTRO' && gameState.currentStep !== 'REPORT' && gameState.currentStep !== 'FEEDBACK') {
      setShowGuide(true);
    } else {
      setShowGuide(false);
    }
  }, [gameState.currentStep]);

  const advanceStep = (nextStep: SimulationStep, dataUpdates?: Partial<SimulationState>) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setGameState(prev => ({
      ...prev,
      currentStep: nextStep,
      ...dataUpdates
    }));
  };

  const handleAddNote = (note: string) => {
    setGameState(prev => ({
        ...prev,
        personalNotes: [...(prev.personalNotes || []), note]
    }));
  };

  const handleDeleteNote = (index: number) => {
    setGameState(prev => ({
        ...prev,
        personalNotes: prev.personalNotes.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative bg-white border-x-2 border-black shadow-[0px_0px_20px_rgba(0,0,0,0.1)]">
      
      {showGuide && (
        <LearningGuide 
          step={gameState.currentStep} 
          onClose={() => setShowGuide(false)} 
        />
      )}

      {showInfoCard && gameState.user && (
        <InfoCardModal 
          teamId={gameState.user.teamId}
          totalTeams={totalTeams}
          onClose={() => setShowInfoCard(false)}
          notes={gameState.personalNotes || []}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />
      )}

      {/* Mobile Top Bar */}
      <header className="bg-white px-4 py-3 border-b-2 border-black sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
            {gameState.currentStep !== 'INTRO' && (
                <button 
                  onClick={() => {
                    if(confirm('초기 화면으로 돌아가시겠습니까? (진행상황은 저장되지 않습니다)')) {
                       onLogout();
                    }
                  }}
                  className="p-1 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}
            <div>
              <span className="font-black text-lg uppercase tracking-tight block">
                  {gameState.currentStep === 'INTRO' ? 'FireSim 3rd' : STEPS[currentStepIndex].label}
              </span>
              {gameState.user && (
                  <span className="text-xs font-bold text-gray-500 block -mt-1">
                      TEAM {gameState.user.teamId} • {gameState.user.name}
                  </span>
              )}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-red-600 font-mono font-bold bg-red-100 px-2 py-1 border-2 border-black text-sm shadow-[2px_2px_0px_0px_#000]">
                <Clock className="w-3 h-3" />
                <span>59:21</span>
            </div>
            
            {isAdmin && (
                <button 
                    onClick={onLogout} 
                    className="text-gray-400 hover:text-black transition-colors p-1"
                    title="관리자 모드 전환"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            )}
        </div>
      </header>

      {/* Progress Bar */}
      {gameState.currentStep !== 'INTRO' && (
          <div className="h-2 bg-gray-200 w-full border-b-2 border-black">
              <div 
                className="h-full bg-[#4f46e5] transition-all duration-500 ease-out border-r-2 border-black"
                style={{ width: `${progress}%` }}
              />
          </div>
      )}

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-32 bg-[#fdfdfd]">
        {gameState.currentStep === 'INTRO' && (
            <ScenarioIntro
                onNext={() => advanceStep('SITUATION')}
                onGoToReport={() => advanceStep('REPORT')}
                onShowInfoCard={() => setShowInfoCard(true)}
                teamId={gameState.user?.teamId}
            />
        )}
        {gameState.currentStep === 'SITUATION' && (
            <StepOneSituation 
                onNext={(facts) => advanceStep('DEFINITION', { collectedFacts: facts })} 
            />
        )}
        {gameState.currentStep === 'DEFINITION' && (
            <StepTwoDefinition 
                onNext={(gap) => advanceStep('ANALYSIS', { gapAnalysis: gap })}
            />
        )}
        {gameState.currentStep === 'ANALYSIS' && (
            <StepThreeAnalysis 
                onNext={(data) => advanceStep('SOLUTION', { powerCalculation: data.powerData })}
            />
        )}
        {gameState.currentStep === 'SOLUTION' && (
            <StepFourSolution 
                onNext={(sol) => advanceStep('REPORT', { solutions: sol })}
            />
        )}
        {gameState.currentStep === 'REPORT' && (
            <StepFiveReport
                data={gameState}
                sessionId={sessionId}
                onRestart={onLogout}
                isReportEnabled={isReportEnabled}
                onUpdateReport={(reportData) => setGameState(prev => ({...prev, finalReport: reportData}))}
            />
        )}
      </main>

      {/* Persistent Info Card Button - Only show if NOT in Intro AND NOT in Report (to avoid button overlap) */}
      {gameState.currentStep !== 'INTRO' && gameState.currentStep !== 'REPORT' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t-2 border-black md:absolute z-40 flex justify-center">
            <button 
            onClick={() => setShowInfoCard(true)}
            className="bg-black text-[#fbbf24] px-6 py-3 font-black text-sm flex items-center gap-2 hover:bg-gray-800 transition-transform active:scale-95 border-2 border-transparent shadow-[4px_4px_0px_0px_#fbbf24] uppercase tracking-wide"
            >
                <FileText className="w-4 h-4" />
                {gameState.user?.teamId}조 정보 확인 (Secret)
            </button>
          </div>
      )}

      {/* Hint/Footer Area */}
      <div className="hidden md:block absolute bottom-20 right-4 text-[10px] font-mono text-gray-400 pointer-events-none rotate-90 origin-right">
        MOBILE EMULATION MODE
      </div>
    </div>
  );
};

export default StudentLayout;