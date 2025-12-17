import React, { useState, useRef } from 'react';
import { SimulationState, FinalReportData } from '../types';
import { Lock, FileText, Download, CheckCircle, Home, Loader2, CloudUpload } from 'lucide-react';
import { submitReport } from '../services/firestore';

interface Props {
  data: SimulationState;
  sessionId: string;
  onRestart: () => void;
  isReportEnabled: boolean;
  onUpdateReport: (report: FinalReportData) => void;
}

const StepFiveReport: React.FC<Props> = ({ data, sessionId, onRestart, isReportEnabled, onUpdateReport }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Initialize form with previous step data
  const [formData, setFormData] = useState<FinalReportData>({
    title: `${data.teamName} 화재사고 분석 보고서`,
    members: data.user?.name || '',
    contents: '1. 개요\n2. 현상 파악\n3. 원인 분석\n4. 해결 방안',
    situation: data.gapAnalysis.current,
    definition: data.gapAnalysis.ideal,
    cause: '전력 과부하, 소화기 미작동, 관리 소홀',
    solution: data.solutions.shortTerm,
    prevention: data.solutions.prevention,
    schedule: '즉시: 소화기 교체\n1주 내: 안전 교육\n1달 내: 설비 증설'
  });

  const handleInputChange = (field: keyof FinalReportData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.members) {
        alert("보고서 제목과 팀원 이름을 입력해주세요.");
        return;
    }

    setIsSubmitting(true);

    try {
      // Firebase에 보고서 저장
      await submitReport({
        sessionId: sessionId,
        teamId: data.user?.teamId || 0,
        userName: data.user?.name || '',
        report: formData,
        submittedAt: Date.now()
      });

      onUpdateReport(formData);
      setIsEditing(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('보고서 제출 실패:', error);
      alert('보고서 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!reportRef.current) return;

    try {
        // @ts-ignore
        const html2canvas = window.html2canvas;
        if (!html2canvas) {
            alert("이미지 생성 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            backgroundColor: "#f0f0f0",
            useCORS: true
        });

        const link = document.createElement('a');
        link.download = `${data.teamName}_FinalReport.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Report generation failed", err);
        alert("이미지 저장 중 오류가 발생했습니다.");
    }
  };

  // State 1: Locked
  if (!isReportEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-in fade-in">
         <div className="bg-gray-100 p-6 rounded-full border-4 border-black mb-6">
            <Lock className="w-12 h-12 text-gray-400" />
         </div>
         <h2 className="text-2xl font-black uppercase mb-2">보고서 제출 대기</h2>
         <p className="text-gray-500 font-bold mb-8">관리자가 제출 기능을 활성화할 때까지 기다려주세요.</p>
         <div className="animate-pulse text-sm font-mono bg-black text-white px-4 py-2">
            WAITING FOR ADMIN SIGNAL...
         </div>
      </div>
    );
  }

  // State 2: Form Input
  if (isEditing) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
            <div className="bg-[#fbbf24] p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                <h2 className="text-xl font-black text-black mb-1 uppercase">Final Report</h2>
                <p className="text-sm font-bold text-gray-800">임원 보고용 최종 보고서를 작성하세요.</p>
            </div>

            <div className="space-y-4">
                <InputGroup label="1. 보고서 타이틀" subLabel="주제 및 부제">
                    <input className="w-full p-2 border-2 border-black font-bold mb-2" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="제목 입력" />
                </InputGroup>
                <InputGroup label="2. 팀원 (성명)" subLabel="참여 인원 전원 기재">
                    <input className="w-full p-2 border-2 border-black font-bold" value={formData.members} onChange={e => handleInputChange('members', e.target.value)} placeholder="홍길동, 김철수..." />
                </InputGroup>
                <InputGroup label="3. 목차" subLabel="보고서 구성 요약">
                    <textarea className="w-full p-2 border-2 border-black font-bold h-24" value={formData.contents} onChange={e => handleInputChange('contents', e.target.value)} />
                </InputGroup>
                <InputGroup label="4. 현상 파악" subLabel="객관적 사실(Fact)">
                    <textarea className="w-full p-2 border-2 border-black font-bold h-24" value={formData.situation} onChange={e => handleInputChange('situation', e.target.value)} />
                </InputGroup>
                <InputGroup label="5. 문제 정의" subLabel="Gap Analysis (As-Is vs To-Be)">
                    <textarea className="w-full p-2 border-2 border-black font-bold h-24" value={formData.definition} onChange={e => handleInputChange('definition', e.target.value)} />
                </InputGroup>
                <InputGroup label="6. 원인 분석" subLabel="Root Cause (5 Whys)">
                    <textarea className="w-full p-2 border-2 border-black font-bold h-24" value={formData.cause} onChange={e => handleInputChange('cause', e.target.value)} />
                </InputGroup>
                <InputGroup label="7. 해결 방안" subLabel="단기 대책 (Urgent)">
                    <textarea className="w-full p-2 border-2 border-black font-bold h-24" value={formData.solution} onChange={e => handleInputChange('solution', e.target.value)} />
                </InputGroup>
                <InputGroup label="8. 재발 방지 대책" subLabel="장기 대책 (Prevention)">
                    <textarea className="w-full p-2 border-2 border-black font-bold h-24" value={formData.prevention} onChange={e => handleInputChange('prevention', e.target.value)} />
                </InputGroup>
                <InputGroup label="9. 실행 일정 계획" subLabel="Timeline & Action Plan">
                    <textarea className="w-full p-2 border-2 border-black font-bold h-24" value={formData.schedule} onChange={e => handleInputChange('schedule', e.target.value)} />
                </InputGroup>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-black md:absolute z-30">
                <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-black text-white font-black py-4 border-2 border-black shadow-[4px_4px_0px_0px_#71717a] hover:bg-gray-800 transition-colors uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-5 h-5" />
                    SUBMIT REPORT
                  </>
                )}
                </button>
            </div>
        </div>
      );
  }

  // State 3: Infographic Preview & Download
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
        {isSubmitted && (
          <div className="bg-green-100 border-2 border-green-600 p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-black text-green-800">보고서가 제출되었습니다!</p>
              <p className="text-sm text-green-700">관리자가 확인할 수 있습니다.</p>
            </div>
          </div>
        )}

        <div className="bg-[#4f46e5] text-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex justify-between items-center">
            <div>
                <h2 className="text-xl font-black uppercase">Report Preview</h2>
                <p className="text-xs font-mono">생성된 보고서를 확인하고 저장하세요.</p>
            </div>
            <FileText className="w-6 h-6" />
        </div>

        {/* Infographic Container (Bento Grid) */}
        <div ref={reportRef} className="bg-white p-4 md:p-8 border-2 border-black shadow-[8px_8px_0px_0px_#000] max-w-2xl mx-auto">

            {/* Header */}
            <div className="mb-6 border-b-4 border-black pb-4">
                <div className="flex justify-between items-end mb-2">
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{formData.title}</h1>
                    <span className="text-4xl font-black text-[#fbbf24]">03</span>
                </div>
                <div className="flex justify-between text-sm font-bold font-mono text-gray-500">
                    <span>TEAM: {data.teamName}</span>
                    <span>MEMBERS: {formData.members}</span>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* 1. 목차 */}
                <div className="md:col-span-1 bg-gray-100 p-4 border-2 border-black">
                    <h3 className="text-xs font-black bg-black text-white inline-block px-1 mb-2">CONTENTS</h3>
                    <p className="text-xs font-bold whitespace-pre-wrap leading-relaxed">{formData.contents}</p>
                </div>

                {/* 2. 현상 & 문제 */}
                <div className="md:col-span-2 bg-[#a5f3fc] p-4 border-2 border-black flex flex-col justify-between">
                    <div className="mb-4">
                        <h3 className="text-xs font-black bg-blue-600 text-white inline-block px-1 mb-2">SITUATION (FACT)</h3>
                        <p className="text-sm font-bold leading-snug">{formData.situation}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-black bg-red-600 text-white inline-block px-1 mb-2">PROBLEM (GAP)</h3>
                        <p className="text-sm font-bold leading-snug">{formData.definition}</p>
                    </div>
                </div>

                {/* 3. 원인 분석 (Highlight) */}
                <div className="md:col-span-3 bg-black text-white p-5 border-2 border-black relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-[#fbbf24] mb-2 uppercase">Root Cause Analysis</h3>
                        <p className="text-sm font-medium leading-relaxed opacity-90">{formData.cause}</p>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <CheckCircle className="w-24 h-24" />
                    </div>
                </div>

                {/* 4. 해결방안 */}
                <div className="md:col-span-1 md:row-span-2 bg-[#bbf7d0] p-4 border-2 border-black">
                    <h3 className="text-xs font-black bg-green-700 text-white inline-block px-1 mb-3">SOLUTIONS</h3>
                    <p className="text-sm font-bold whitespace-pre-wrap leading-relaxed">{formData.solution}</p>
                </div>

                {/* 5. 재발방지 */}
                <div className="md:col-span-2 bg-white p-4 border-2 border-black">
                    <h3 className="text-xs font-black bg-purple-600 text-white inline-block px-1 mb-2">PREVENTION</h3>
                    <p className="text-sm font-bold whitespace-pre-wrap leading-relaxed">{formData.prevention}</p>
                </div>

                {/* 6. 일정 */}
                <div className="md:col-span-2 bg-gray-50 p-4 border-2 border-black">
                    <h3 className="text-xs font-black bg-gray-500 text-white inline-block px-1 mb-2">SCHEDULE</h3>
                    <p className="text-xs font-mono font-bold whitespace-pre-wrap">{formData.schedule}</p>
                </div>
            </div>

            <div className="mt-6 text-center border-t-2 border-black pt-2">
                <p className="text-[10px] font-mono font-bold text-gray-400">FIRESIM SIMULATION REPORT • APPROVED BY ADMIN</p>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-black md:absolute z-30 flex gap-3">
            <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-white border-2 border-black text-black font-black py-4 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]"
            >
                EDIT
            </button>
            <button
                onClick={handleDownload}
                className="flex-[2] bg-black text-white font-black py-4 border-2 border-black shadow-[4px_4px_0px_0px_#71717a] hover:bg-gray-800 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#71717a] flex items-center justify-center gap-2"
            >
                <Download className="w-5 h-5" />
                DOWNLOAD PNG
            </button>
        </div>
    </div>
  );
};

const InputGroup: React.FC<{label: string, subLabel: string, children: React.ReactNode}> = ({label, subLabel, children}) => (
    <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_#ccc]">
        <div className="mb-2">
            <span className="block font-black text-sm">{label}</span>
            <span className="text-xs text-gray-500 font-bold">{subLabel}</span>
        </div>
        {children}
    </div>
);

export default StepFiveReport;
