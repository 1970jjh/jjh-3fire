// Gemini API 서비스 - 인포그래픽 이미지 생성
import { FinalReportData } from '../types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Gemini 2.0 Flash Experimental (이미지 생성 지원)
const IMAGE_MODEL = 'gemini-2.0-flash-exp';

interface GeminiImageResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string; // base64 encoded image
        };
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

// 보고서 데이터를 기반으로 인포그래픽 생성 프롬프트 생성
const createInfographicPrompt = (report: FinalReportData, teamName: string): string => {
  return `당신은 전문 비즈니스 인포그래픽 디자이너입니다.
아래 정보를 바탕으로 깔끔하고 전문적인 비즈니스 보고서 인포그래픽 이미지를 생성해주세요.

보고서 정보:
- 제목: ${report.title}
- 팀명: ${teamName}
- 팀원: ${report.members}

주요 내용:
1. 현상 파악 (Facts): ${report.situation}
2. 문제 정의 (Gap Analysis): ${report.definition}
3. 원인 분석 (Root Cause): ${report.cause}
4. 해결 방안 (Solutions): ${report.solution}
5. 재발 방지 대책 (Prevention): ${report.prevention}
6. 실행 일정 (Schedule): ${report.schedule}

디자인 요구사항:
- 16:9 가로 레이아웃
- 깔끔한 비즈니스 스타일
- 섹션별로 구분된 레이아웃 (벤토 그리드 스타일)
- 아이콘과 시각적 요소 사용
- 주요 포인트 강조
- 컬러 팔레트: 노란색(#fbbf24), 파란색(#4f46e5), 흰색, 검정색
- 한국어 텍스트 포함
- 전문적이고 임원 보고에 적합한 스타일

이미지만 생성해주세요. 설명 텍스트 없이 인포그래픽 이미지만 출력합니다.`;
};

// Gemini API를 사용하여 인포그래픽 이미지 생성
export const generateInfographicImage = async (
  report: FinalReportData,
  teamName: string
): Promise<{ success: boolean; imageBlob?: Blob; error?: string }> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Gemini API 키가 설정되지 않았습니다. 관리자에게 문의하세요.'
    };
  }

  const prompt = createInfographicPrompt(report, teamName);

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ['Text', 'Image']
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return {
        success: false,
        error: `API 오류: ${response.status} - ${response.statusText}`
      };
    }

    const data: GeminiImageResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message
      };
    }

    // 응답에서 이미지 데이터 추출
    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts) {
      return {
        success: false,
        error: '응답에서 이미지를 찾을 수 없습니다.'
      };
    }

    // 이미지 파트 찾기
    const imagePart = parts.find(part => part.inlineData);
    if (!imagePart?.inlineData) {
      return {
        success: false,
        error: '이미지 생성에 실패했습니다. 텍스트만 반환되었습니다.'
      };
    }

    // Base64를 Blob으로 변환
    const base64Data = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const imageBlob = new Blob([byteArray], { type: mimeType });

    return {
      success: true,
      imageBlob
    };

  } catch (error) {
    console.error('Gemini 인포그래픽 생성 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
};

// API 키 유효성 검사
export const validateGeminiApiKey = async (): Promise<boolean> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return false;
  }

  try {
    // 간단한 텍스트 생성으로 API 키 검증
    const response = await fetch(
      `${GEMINI_API_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello'
            }]
          }]
        })
      }
    );

    return response.ok;
  } catch {
    return false;
  }
};
