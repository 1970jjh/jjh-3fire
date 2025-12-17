import React from 'react';
import { AlertTriangle, Clock, FileText, Search, Users, Activity } from 'lucide-react';
import { SimulationStep } from './types';

export const STEPS: { id: SimulationStep; label: string; icon: React.ReactNode }[] = [
  { id: 'INTRO', label: '시나리오 브리핑', icon: <Users className="w-5 h-5" /> },
  { id: 'SITUATION', label: '1. 현상 파악', icon: <Search className="w-5 h-5" /> },
  { id: 'DEFINITION', label: '2. 문제 정의', icon: <AlertTriangle className="w-5 h-5" /> },
  { id: 'ANALYSIS', label: '3. 원인 분석', icon: <Activity className="w-5 h-5" /> },
  { id: 'SOLUTION', label: '4. 해결 방안', icon: <FileText className="w-5 h-5" /> },
  { id: 'REPORT', label: '5. 보고서 제출', icon: <Clock className="w-5 h-5" /> },
];

export const SCENARIO_INFO = {
  date: "8월 4일 목요일 오전 10:30",
  location: "우리산업(주) 제3공장",
  incident: "화재 발생 및 인명 사고",
  victim: "생산팀 박계장 (전치 4주 화상)",
  productionImpact: "생산 중단 (4,000 unit 부족)",
  client: "코끼리건설(주) 납품 기한 8월 12일",
  deadline: "1시간 내 보고서 작성"
};

export const STEP_GUIDES: Record<string, { title: string; goal: string; concept: string; description: string }> = {
  SITUATION: {
    title: "팩트 체크 (Fact Finding)",
    goal: "주관적 의견(Opinion)을 배제하고 객관적 사실(Fact)만을 수집한다.",
    concept: "3현주의 (현장, 현물, 현상)",
    description: "사건 현장에는 수많은 정보가 섞여 있습니다. 문제 해결의 첫 단추는 '진짜 사실'을 가려내는 것입니다. 거짓 정보나 주관적 추측에 속지 마십시오."
  },
  DEFINITION: {
    title: "문제 정의 (Gap Analysis)",
    goal: "현재 상태(As-Is)와 바람직한 상태(To-Be)의 차이를 명확히 정의한다.",
    concept: "Problem = Ideal - Current",
    description: "막연히 '불이 났다'는 문제가 아닙니다. 화재로 인해 '무엇이' 달성되지 못하고 있는지를 구체적으로 서술해야 해결의 실마리가 보입니다."
  },
  ANALYSIS: {
    title: "원인 분석 (Root Cause)",
    goal: "현상에 대한 대책이 아닌, 근본 원인을 찾아 제거한다.",
    concept: "5 Whys & Logic Tree",
    description: "왜 화재가 발생했나요? 왜 소화기는 작동하지 않았나요? 꼬리에 꼬리를 무는 질문(Why)을 통해 숨겨진 진짜 원인을 찾아내십시오."
  },
  SOLUTION: {
    title: "해결책 수립 (Action Plan)",
    goal: "단기적인 수습책과 장기적인 재발방지책을 구분하여 수립한다.",
    concept: "대책의 3요소 (기술적, 관리적, 교육적)",
    description: "당장 급한 불(납기 준수)을 끄는 것만큼이나, 다시는 같은 사고가나지 않도록 시스템을 고치는 것(재발 방지)이 중요합니다."
  }
};

// 전체 정보 카드 이미지 풀 (72장)
export const INFO_CARD_IMAGES = [
  // Group 1
  "https://i.ibb.co/xtVbbr1r/1-1.jpg", "https://i.ibb.co/ymRNcvbh/1-2.jpg", "https://i.ibb.co/TBrSLsZq/1-3.jpg",
  "https://i.ibb.co/4RFt7W5g/1-4.jpg", "https://i.ibb.co/wFWGqbKr/1-5.jpg", "https://i.ibb.co/rRz8PcLZ/1-6.jpg",
  "https://i.ibb.co/yBKkH1xt/1-7.jpg", "https://i.ibb.co/3yNDjQZh/1-8.jpg", "https://i.ibb.co/Z6FCK3nM/1-9.jpg",
  "https://i.ibb.co/fVW1frCN/1-10.jpg", "https://i.ibb.co/vxK6HQrT/1-11.jpg", "https://i.ibb.co/7xK7vWsT/1-12.jpg",
  "https://i.ibb.co/LXmKvDNh/1-13.jpg", "https://i.ibb.co/bMJnZC3S/1-14.jpg", "https://i.ibb.co/5gQqKKDZ/1-15.jpg",
  "https://i.ibb.co/JWknnX40/1-16.jpg", "https://i.ibb.co/KzyMWypP/1-17.jpg", "https://i.ibb.co/VWN42Sqc/1-18.jpg",
  // Group 2
  "https://i.ibb.co/Xxr8kGFz/2-1.png", "https://i.ibb.co/vvKLbsDW/2-2.png", "https://i.ibb.co/GfbKDQ9N/2-3.png",
  "https://i.ibb.co/TxvZBWTh/2-4.png", "https://i.ibb.co/C3y6SZyD/2-5.png", "https://i.ibb.co/tPptp82F/2-6.png",
  "https://i.ibb.co/4qdvzfw/2-7.png", "https://i.ibb.co/3mJY6wDj/2-8.png", "https://i.ibb.co/vvr2wcWs/2-9.png",
  "https://i.ibb.co/Y7h5T8B2/2-10.png", "https://i.ibb.co/YGQysZD/2-11.png", "https://i.ibb.co/4R33TmnV/2-12.png",
  "https://i.ibb.co/8DsgjyH9/2-13.png", "https://i.ibb.co/gMpb2zWx/2-14.png", "https://i.ibb.co/PsdHMz44/2-15.png",
  "https://i.ibb.co/3yJMM93h/2-16.png", "https://i.ibb.co/bT7wGnW/2-17.png", "https://i.ibb.co/B5ZzGNdn/2-18.png",
  // Group 3
  "https://i.ibb.co/FLzgXBDc/3-1.jpg", "https://i.ibb.co/ZbXwMkX/3-2.jpg", "https://i.ibb.co/gb8TdqCz/3-3.jpg",
  "https://i.ibb.co/Mywkm26H/3-4.jpg", "https://i.ibb.co/spgPX41z/3-5.jpg", "https://i.ibb.co/cSpnsmqg/3-6.jpg",
  "https://i.ibb.co/Z6GL6h7T/3-7.jpg", "https://i.ibb.co/VYQt245P/3-8.jpg", "https://i.ibb.co/n88f9dQf/3-9.jpg",
  "https://i.ibb.co/zTR4Kv0s/3-10.jpg", "https://i.ibb.co/ZR22RyXg/3-11.jpg", "https://i.ibb.co/PGKrNv0v/3-12.jpg",
  "https://i.ibb.co/MyfK6MNn/3-13.jpg", "https://i.ibb.co/BKVQYRVS/3-14.jpg", "https://i.ibb.co/Y7wSGbrS/3-15.jpg",
  "https://i.ibb.co/Tx31BJWq/3-16.jpg", "https://i.ibb.co/NgCm4Bbv/3-17.jpg", "https://i.ibb.co/Y7BnGjtK/3-18.jpg",
  // Group 4
  "https://i.ibb.co/6501PHF/4-1.png", "https://i.ibb.co/Kp8sbZYF/4-2.png", "https://i.ibb.co/XZcsc8qc/4-3.png",
  "https://i.ibb.co/KxkwCwb0/4-4.png", "https://i.ibb.co/yFF8Zmbz/4-5.png", "https://i.ibb.co/nqDYc1GN/4-6.png",
  "https://i.ibb.co/R4NhQ7Gs/4-7.png", "https://i.ibb.co/nMsJy9TS/4-8.png", "https://i.ibb.co/YTJVNVVc/4-9.png",
  "https://i.ibb.co/S4zdtsKX/4-10.png", "https://i.ibb.co/23fCDk7s/4-11.png", "https://i.ibb.co/hP316DK/4-12.png",
  "https://i.ibb.co/TxM4784Y/4-13.png", "https://i.ibb.co/N5QhsZT/4-14.png", "https://i.ibb.co/20KVXQWr/4-15.png",
  "https://i.ibb.co/wN1KftHY/4-16.png", "https://i.ibb.co/ccBGmLSY/4-17.png", "https://i.ibb.co/pg1x953/4-18.png"
];
