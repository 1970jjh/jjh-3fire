// Gemini 2.0 Flash API 서비스 - 네이티브 이미지 생성
import { FinalReportData } from '../types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Gemini 2.0 Flash Experimental - 네이티브 이미지 생성 지원
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
  return `Create a professional business infographic image based on this report data.

REPORT INFORMATION:
- Title: ${report.title}
- Team: ${teamName}
- Members: ${report.members}

CONTENT SECTIONS:
1. SITUATION (Facts): ${report.situation}
2. PROBLEM (Gap Analysis): ${report.definition}
3. ROOT CAUSE: ${report.cause}
4. SOLUTIONS: ${report.solution}
5. PREVENTION: ${report.prevention}
6. SCHEDULE: ${report.schedule}

DESIGN REQUIREMENTS:
- Professional business infographic style
- 16:9 landscape layout
- Bento grid layout with distinct colored sections
- Color scheme: Yellow (#fbbf24), Indigo (#4f46e5), White, Black
- Bold neo-brutalist style with thick borders
- Icons for each section
- Clean typography hierarchy
- Executive presentation quality

Generate ONLY the infographic image. No text explanation needed.`;
};

// Gemini 2.0 Flash를 사용하여 인포그래픽 이미지 생성
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
            responseModalities: ['Text', 'Image'],
            responseMimeType: 'text/plain'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          return {
            success: false,
            error: `API 오류: ${errorJson.error.message}`
          };
        }
      } catch {
        // JSON 파싱 실패시 원본 에러 사용
      }

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
        error: '응답에서 콘텐츠를 찾을 수 없습니다.'
      };
    }

    // 이미지 파트 찾기
    const imagePart = parts.find(part => part.inlineData);
    if (!imagePart?.inlineData) {
      // 텍스트만 반환된 경우
      const textPart = parts.find(part => part.text);
      console.log('Gemini response (text only):', textPart?.text);
      return {
        success: false,
        error: '이미지 생성에 실패했습니다. 모델이 텍스트만 반환했습니다.'
      };
    }

    // Base64를 Blob으로 변환
    const base64Data = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';

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
