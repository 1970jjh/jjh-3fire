import React, { useState, useEffect } from 'react';
import { SessionConfig, ReportData } from '../types';
import { Activity, Users, FileText, CheckCircle, LogOut, RotateCcw, Lock, Unlock, Download, Eye, X, ChevronDown, ChevronUp, Image, Clock, Play, Square, RefreshCw } from 'lucide-react';
import { subscribeToReports, updateSession } from '../services/firestore';

interface Props {
  currentSession: SessionConfig;
  onToggleReport: (enabled: boolean) => void;
  onLogout: () => void;
  onModeSwitch: () => void;
}

const AdminDashboard: React.FC<Props> = ({ currentSession, onToggleReport, onLogout, onModeSwitch }) => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());
  const [timerMinutes, setTimerMinutes] = useState(60); // 기본 60분
  const [remainingTime, setRemainingTime] = useState<string>('--:--');

  // Firebase에서 보고서 실시간 구독
  useEffect(() => {
    const unsubscribe = subscribeToReports(currentSession.id, (fetchedReports) => {
      setReports(fetchedReports);
    });

    return () => unsubscribe();
  }, [currentSession.id]);

  // 타이머 카운트다운 로직
  useEffect(() => {
    const updateTimer = () => {
      if (currentSession.isTimerRunning && currentSession.timerEndTime) {
        const now = Date.now();
        const diff = currentSession.timerEndTime - now;

        if (diff <= 0) {
          setRemainingTime('00:00');
          // 타이머 종료 시 자동 정지
          updateSession(currentSession.id, { isTimerRunning: false });
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setRemainingTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      } else {
        setRemainingTime('--:--');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentSession.isTimerRunning, currentSession.timerEndTime, currentSession.id]);

  // 타이머 시작
  const handleStartTimer = async () => {
    const endTime = Date.now() + (timerMinutes * 60 * 1000);
    await updateSession(currentSession.id, {
      timerEndTime: endTime,
      timerDuration: timerMinutes,
      isTimerRunning: true
    });
  };

  // 타이머 정지
  const handleStopTimer = async () => {
    await updateSession(currentSession.id, {
      isTimerRunning: false
    });
  };

  // 타이머 리셋
  const handleResetTimer = async () => {
    await updateSession(currentSession.id, {
      timerEndTime: null,
      isTimerRunning: false
    });
    setRemainingTime('--:--');
  };

  const toggleTeamExpand = (teamId: number) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  // 보고서를 JSON으로 다운로드
  const downloadReportAsJSON = (report: ReportData) => {
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${report.teamId}조_${report.userName}_보고서.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 모든 보고서를 CSV로 다운로드
  const downloadAllReportsAsCSV = () => {
    if (reports.length === 0) {
      alert('다운로드할 보고서가 없습니다.');
      return;
    }

    const headers = ['팀', '이름', '제목', '팀원', '현상파악', '문제정의', '원인분석', '해결방안', '재발방지', '일정'];
    const rows = reports.map(r => [
      `${r.teamId}조`,
      r.userName,
      r.report.title,
      r.report.members,
      r.report.situation.replace(/\n/g, ' '),
      r.report.definition.replace(/\n/g, ' '),
      r.report.cause.replace(/\n/g, ' '),
      r.report.solution.replace(/\n/g, ' '),
      r.report.prevention.replace(/\n/g, ' '),
      r.report.schedule.replace(/\n/g, ' ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${currentSession.groupName}_전체보고서.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

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
                    <h3 className="text-slate-500 font-medium">제출 완료</h3>
                    <FileText className="text-green-500" />
                </div>
                <p className="text-3xl font-black text-slate-800">{reports.length} <span className="text-sm font-normal text-slate-400">/ {currentSession.totalTeams}</span></p>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{width: `${(reports.length / currentSession.totalTeams) * 100}%`}}></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-slate-500 font-medium">타이머 제어</h3>
                    <Clock className={`${currentSession.isTimerRunning ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                </div>
                <p className={`text-3xl font-black mb-3 ${currentSession.isTimerRunning ? 'text-red-600' : 'text-slate-400'}`}>
                  {remainingTime}
                </p>
                {!currentSession.isTimerRunning ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-2 py-1 border rounded text-center font-bold"
                        min="1"
                        max="180"
                      />
                      <span className="text-sm text-slate-500">분</span>
                    </div>
                    <button
                      onClick={handleStartTimer}
                      className="w-full bg-green-600 text-white py-2 rounded font-bold text-sm hover:bg-green-700 flex items-center justify-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      시작
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleStopTimer}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded font-bold text-sm hover:bg-yellow-600 flex items-center justify-center gap-1"
                    >
                      <Square className="w-4 h-4" />
                      정지
                    </button>
                    <button
                      onClick={handleResetTimer}
                      className="flex-1 bg-slate-500 text-white py-2 rounded font-bold text-sm hover:bg-slate-600 flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      리셋
                    </button>
                  </div>
                )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 font-medium">보고서 다운로드</h3>
                    <Download className="text-purple-500" />
                </div>
                <button
                  onClick={downloadAllReportsAsCSV}
                  disabled={reports.length === 0}
                  className="w-full bg-purple-600 text-white py-2 rounded font-bold text-sm hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  전체 CSV 다운로드
                </button>
            </div>
        </div>

        {/* Team Reports */}
        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          제출된 보고서 ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-bold">아직 제출된 보고서가 없습니다.</p>
            <p className="text-slate-400 text-sm mt-2">학습자가 보고서를 제출하면 여기에 표시됩니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-xl border-l-4 border-l-green-500 shadow-sm overflow-hidden">
                      <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h3 className="text-lg font-bold text-slate-900">{report.teamId}조</h3>
                                  <p className="text-sm text-slate-500">작성자: {report.userName}</p>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700">
                                  제출완료
                              </span>
                          </div>

                          <div className="bg-slate-50 p-3 rounded mb-4">
                            <p className="font-bold text-slate-700 truncate">{report.report.title}</p>
                            <p className="text-xs text-slate-500 mt-1">팀원: {report.report.members}</p>
                          </div>

                          {/* Expandable Content */}
                          <button
                            onClick={() => toggleTeamExpand(report.teamId)}
                            className="w-full flex items-center justify-between text-sm text-slate-600 hover:text-slate-900 py-2"
                          >
                            <span className="font-bold">보고서 내용 보기</span>
                            {expandedTeams.has(report.teamId) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          {expandedTeams.has(report.teamId) && (
                            <div className="mt-4 space-y-3 text-sm border-t pt-4">
                              <div>
                                <span className="font-black text-xs text-blue-600 block">현상 파악</span>
                                <p className="text-slate-700">{report.report.situation || '-'}</p>
                              </div>
                              <div>
                                <span className="font-black text-xs text-red-600 block">문제 정의</span>
                                <p className="text-slate-700">{report.report.definition || '-'}</p>
                              </div>
                              <div>
                                <span className="font-black text-xs text-orange-600 block">원인 분석</span>
                                <p className="text-slate-700">{report.report.cause || '-'}</p>
                              </div>
                              <div>
                                <span className="font-black text-xs text-green-600 block">해결 방안</span>
                                <p className="text-slate-700">{report.report.solution || '-'}</p>
                              </div>
                              <div>
                                <span className="font-black text-xs text-purple-600 block">재발 방지</span>
                                <p className="text-slate-700">{report.report.prevention || '-'}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="flex-1 bg-blue-600 text-white py-2 rounded font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                전체 보기
                              </button>
                              <button
                                onClick={() => downloadReportAsJSON(report)}
                                className="flex-1 bg-slate-200 text-slate-700 py-2 rounded font-bold text-sm hover:bg-slate-300 flex items-center justify-center gap-1"
                              >
                                <Download className="w-4 h-4" />
                                JSON
                              </button>
                            </div>
                            {report.reportImageUrl ? (
                              <a
                                href={report.reportImageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={`${report.teamId}조_${report.userName}_보고서.png`}
                                className="w-full bg-purple-600 text-white py-2 rounded font-bold text-sm hover:bg-purple-700 flex items-center justify-center gap-1"
                              >
                                <Image className="w-4 h-4" />
                                PNG 이미지 다운로드
                              </a>
                            ) : (
                              <div className="w-full bg-gray-100 text-gray-400 py-2 rounded text-sm text-center italic">
                                이미지 없음 (학습자 미생성)
                              </div>
                            )}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
        )}
      </main>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{selectedReport.teamId}조 보고서</h3>
                <p className="text-sm text-slate-400">작성자: {selectedReport.userName}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* PNG 이미지가 있으면 표시 */}
              {selectedReport.reportImageUrl && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-black text-sm flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      인포그래픽 보고서
                    </h5>
                    <a
                      href={selectedReport.reportImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={`${selectedReport.teamId}조_${selectedReport.userName}_보고서.png`}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-purple-700 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      다운로드
                    </a>
                  </div>
                  <img
                    src={selectedReport.reportImageUrl}
                    alt="보고서 이미지"
                    className="w-full rounded border border-purple-300"
                  />
                </div>
              )}

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-black text-lg">{selectedReport.report.title}</h4>
                <p className="text-sm text-slate-600 mt-1">팀원: {selectedReport.report.members}</p>
              </div>

              <ReportSection title="목차" color="gray">{selectedReport.report.contents}</ReportSection>
              <ReportSection title="현상 파악" color="blue">{selectedReport.report.situation}</ReportSection>
              <ReportSection title="문제 정의" color="red">{selectedReport.report.definition}</ReportSection>
              <ReportSection title="원인 분석" color="orange">{selectedReport.report.cause}</ReportSection>
              <ReportSection title="해결 방안" color="green">{selectedReport.report.solution}</ReportSection>
              <ReportSection title="재발 방지 대책" color="purple">{selectedReport.report.prevention}</ReportSection>
              <ReportSection title="실행 일정" color="slate">{selectedReport.report.schedule}</ReportSection>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportSection: React.FC<{title: string, color: string, children: React.ReactNode}> = ({title, color, children}) => {
  const colorMap: {[key: string]: string} = {
    gray: 'bg-gray-100 border-gray-300',
    blue: 'bg-blue-50 border-blue-300',
    red: 'bg-red-50 border-red-300',
    orange: 'bg-orange-50 border-orange-300',
    green: 'bg-green-50 border-green-300',
    purple: 'bg-purple-50 border-purple-300',
    slate: 'bg-slate-50 border-slate-300',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorMap[color] || colorMap.gray}`}>
      <h5 className="font-black text-sm mb-2">{title}</h5>
      <p className="text-slate-700 whitespace-pre-wrap">{children || '-'}</p>
    </div>
  );
};

export default AdminDashboard;
