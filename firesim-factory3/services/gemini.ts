// Gemini 3 Pro Image Preview API 서비스 - 인포그래픽 이미지 생성 (서버리스 함수 경유)
import { FinalReportData } from '../types';

// 보고서 데이터를 기반으로 인포그래픽 생성 프롬프트 생성
const createInfographicPrompt = (report: FinalReportData, teamName: string): string => {
  return `Create a professional business infographic report image.

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
- Executive presentation quality`;
};

// 서버리스 함수를 통해 Imagen 4 API 호출
export const generateInfographicImage = async (
  report: FinalReportData,
  teamName: string
): Promise<{ success: boolean; imageBlob?: Blob; error?: string }> => {
  const prompt = createInfographicPrompt(report, teamName);

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    // 1. 먼저 응답 텍스트를 가져옴
    const responseText = await response.text();

    // 2. response.ok 먼저 확인
    if (!response.ok) {
      // 타임아웃이나 서버 에러인 경우
      let errorMessage = `서버 오류 (${response.status})`;

      // JSON인지 확인 후 파싱 시도
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // JSON이 아닌 경우 (Vercel 타임아웃 등)
        if (response.status === 504) {
          errorMessage = '이미지 생성 시간이 초과되었습니다. 다시 시도해주세요.';
        } else if (responseText) {
          errorMessage = responseText.substring(0, 100);
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    // 3. 성공 응답을 JSON으로 파싱
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        error: '서버 응답을 처리할 수 없습니다.'
      };
    }

    if (data.error) {
      return {
        success: false,
        error: data.error
      };
    }

    if (!data.success || !data.imageBase64) {
      return {
        success: false,
        error: '이미지 생성에 실패했습니다. 다시 시도해주세요.'
      };
    }

    // Base64를 Blob으로 변환
    const byteCharacters = atob(data.imageBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const imageBlob = new Blob([byteArray], { type: data.mimeType || 'image/png' });

    return {
      success: true,
      imageBlob
    };

  } catch (error) {
    console.error('Gemini 이미지 생성 실패:', error);
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다. 다시 시도해주세요.'
    };
  }
};

// API 키 유효성 검사 (서버리스 함수 상태 확인)
export const validateGeminiApiKey = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'test' })
    });

    // 400 에러가 아니면 API 키가 설정된 것으로 간주
    return response.status !== 500;
  } catch {
    return false;
  }
};
