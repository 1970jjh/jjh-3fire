import React, { useState, useRef, useEffect } from 'react';
import { SimulationState, FinalReportData } from '../types';
import { Lock, FileText, Download, CheckCircle, Loader2, CloudUpload, Image, Sparkles, AlertCircle, Ban } from 'lucide-react';
import { submitReport, uploadAIReportImage, submitAIReport, subscribeToTeamAIReportStatus } from '../services/firestore';
import { generateInfographicImage } from '../services/gemini';

interface Props {
  data: SimulationState;
  sessionId: string;
  groupName: string; // 교육 그룹명
  onRestart: () => void;
  isReportEnabled: boolean;
  onUpdateReport: (report: FinalReportData) => void;
}

const StepFiveReport: React.FC<Props> = ({ data, sessionId, groupName, onRestart, isReportEnabled, onUpdateReport }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiInfographicUrl, setAiInfographicUrl] = useState<string | null>(null);
  const [aiInfographicBlob, setAiInfographicBlob] = useState<Blob | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);
  const [teamAlreadySubmitted, setTeamAlreadySubmitted] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Initialize form with empty values - students fill everything
  const [formData, setFormData] = useState<FinalReportData>({
    title: '',
    members: '',
    contents: '',
    situation: '',
    definition: '',
    cause: '',
    solution: '',
    prevention: '',
    schedule: ''
  });

  // 팀 AI 보고서 제출 상태 실시간 구독
  useEffect(() => {
    if (!sessionId || !data.user?.teamId) return;

    const unsubscribe = subscribeToTeamAIReportStatus(
      sessionId,
      data.user.teamId,
      (submitted) => {
        setTeamAlreadySubmitted(submitted);
        if (submitted) {
          setIsFinalSubmitted(true);
        }
      }
    );

    return () => unsubscribe();
  }, [sessionId, data.user?.teamId]);

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

  // AI 보고서 생성 (Imagen 4)
  const handleGenerateAIReport = async () => {
    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const result = await generateInfographicImage(formData, data.teamName);

      if (!result.success || !result.imageBlob) {
        setAiError(result.error || 'AI 보고서 생성에 실패했습니다.');
        return;
      }

      // Blob을 URL로 변환하여 미리보기 표시
      const previewUrl = URL.createObjectURL(result.imageBlob);
      setAiInfographicUrl(previewUrl);
      setAiInfographicBlob(result.imageBlob);

      alert('AI 보고서가 생성되었습니다! 최종 제출 버튼을 눌러 관리자에게 제출하세요.');
    } catch (err) {
      console.error('AI 보고서 생성 실패:', err);
      setAiError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // AI 보고서 최종 제출
  const handleFinalSubmit = async () => {
    if (!aiInfographicBlob) {
      alert('먼저 AI 보고서를 생성해주세요.');
      return;
    }

    if (teamAlreadySubmitted) {
      alert('이미 팀에서 AI 보고서를 제출했습니다. 추가 제출은 불가능합니다.');
      return;
    }

    setIsSubmittingFinal(true);
    console.log('AI 보고서 최종 제출 시작...');
    console.log('Blob size:', aiInfographicBlob.size, 'bytes');

    try {
      // 1. Firebase Storage에 업로드
      console.log('Firebase Storage 업로드 시작...');
      const imageUrl = await uploadAIReportImage(
        sessionId,
        groupName,
        data.user?.teamId || 0,
        aiInfographicBlob
      );
      console.log('Firebase Storage 업로드 완료:', imageUrl);

      // 2. Firestore에 AI 보고서 제출 기록
      console.log('Firestore 제출 기록 시작...');
      await submitAIReport(
        sessionId,
        data.user?.teamId || 0,
        data.user?.name || '',
        imageUrl,
        formData
      );
      console.log('Firestore 제출 기록 완료!');

      setIsFinalSubmitted(true);
      alert('AI 보고서가 최종 제출되었습니다! 관리자가 확인할 수 있습니다.');
    } catch (err: any) {
      console.error('AI 보고서 최종 제출 실패:', err);
      alert(`AI 보고서 제출 실패: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setIsSubmittingFinal(false);
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-40">
        {isSubmitted && (
          <div className="bg-green-100 border-2 border-green-600 p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-black text-green-800">보고서가 제출되었습니다!</p>
              <p className="text-sm text-green-700">관리자가 확인할 수 있습니다.</p>
            </div>
          </div>
        )}

        {/* 팀 이미 제출 경고 */}
        {teamAlreadySubmitted && (
          <div className="bg-orange-100 border-2 border-orange-600 p-4 flex items-center gap-3">
            <Ban className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-black text-orange-800">팀에서 이미 AI 보고서를 제출했습니다</p>
              <p className="text-sm text-orange-700">추가 제출은 불가능합니다.</p>
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

        {/* AI 보고서 미리보기 */}
        {aiInfographicUrl && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-600 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <p className="font-black text-purple-800">AI 보고서가 생성되었습니다!</p>
            </div>
            <img
              src={aiInfographicUrl}
              alt="AI 생성 보고서"
              className="w-full border-2 border-black shadow-[4px_4px_0px_0px_#000]"
            />
            {!isFinalSubmitted && (
              <p className="mt-3 text-sm text-purple-700 font-bold">
                아래 "AI 보고서 최종 제출" 버튼을 눌러 관리자에게 제출하세요.
              </p>
            )}
          </div>
        )}

        {/* AI Error Message */}
        {aiError && (
          <div className="bg-red-100 border-2 border-red-600 p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-black text-red-800">AI 보고서 생성 실패</p>
              <p className="text-sm text-red-700">{aiError}</p>
            </div>
          </div>
        )}

        {/* 최종 제출 완료 메시지 */}
        {isFinalSubmitted && (
          <div className="bg-green-100 border-2 border-green-600 p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-black text-green-800">AI 보고서가 최종 제출되었습니다!</p>
              <p className="text-sm text-green-700">관리자 대시보드에서 다운로드할 수 있습니다.</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-black md:absolute z-30 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-white border-2 border-black text-black font-black py-3 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] text-sm"
              >
                  EDIT
              </button>
              <button
                  onClick={handleDownload}
                  className="flex-1 bg-gray-100 border-2 border-black text-black font-black py-3 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-1 text-sm"
              >
                  <Download className="w-4 h-4" />
                  내 기기 저장
              </button>
            </div>

            {/* AI 보고서 생성 버튼 (먼저) */}
            <button
                onClick={handleGenerateAIReport}
                disabled={isGeneratingAI || !!aiInfographicUrl || teamAlreadySubmitted}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-4 border-2 border-black shadow-[4px_4px_0px_0px_#71717a] hover:from-purple-700 hover:to-pink-700 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#71717a] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI 보고서 생성 중... (약 30초 소요)
                  </>
                ) : aiInfographicUrl ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    AI 보고서 생성 완료
                  </>
                ) : teamAlreadySubmitted ? (
                  <>
                    <Ban className="w-5 h-5" />
                    팀 제출 완료
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    AI 보고서 생성
                  </>
                )}
            </button>

            {/* AI 보고서 최종 제출 버튼 (나중에) */}
            <button
                onClick={handleFinalSubmit}
                disabled={!aiInfographicUrl || isSubmittingFinal || isFinalSubmitted || teamAlreadySubmitted}
                className="w-full bg-[#4f46e5] text-white font-black py-4 border-2 border-black shadow-[4px_4px_0px_0px_#71717a] hover:bg-[#4338ca] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#71717a] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmittingFinal ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    제출 중...
                  </>
                ) : isFinalSubmitted || teamAlreadySubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    AI 보고서 제출 완료
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-5 h-5" />
                    AI 보고서 최종 제출
                  </>
                )}
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
