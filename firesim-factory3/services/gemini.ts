// Imagen 4 API 서비스 - 인포그래픽 이미지 생성
import { FinalReportData } from '../types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Imagen 4 - 고품질 이미지 생성 모델
const IMAGE_MODEL = 'imagen-4.0-generate-001';

interface ImagenResponse {
  generatedImages?: Array<{
    image?: {
      imageBytes: string; // base64 encoded image
    };
  }>;
  predictions?: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
  }>;
  error?: {
    message: string;
    code: number;
  };
}

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

// Imagen 4를 사용하여 인포그래픽 이미지 생성
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
      `${GEMINI_API_BASE}/${IMAGE_MODEL}:generateImages?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt
            }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: '16:9',
            personGeneration: 'DONT_ALLOW',
            safetySetting: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imagen 4 API error:', errorText);

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

    const data: ImagenResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message
      };
    }

    // 응답에서 이미지 데이터 추출
    let base64Data: string | undefined;

    // generatedImages 형식 체크
    if (data.generatedImages?.[0]?.image?.imageBytes) {
      base64Data = data.generatedImages[0].image.imageBytes;
    }
    // predictions 형식 체크
    else if (data.predictions?.[0]?.bytesBase64Encoded) {
      base64Data = data.predictions[0].bytesBase64Encoded;
    }

    if (!base64Data) {
      return {
        success: false,
        error: '이미지 생성에 실패했습니다. 응답에 이미지가 없습니다.'
      };
    }

    // Base64를 Blob으로 변환
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const imageBlob = new Blob([byteArray], { type: 'image/png' });

    return {
      success: true,
      imageBlob
    };

  } catch (error) {
    console.error('Imagen 4 인포그래픽 생성 실패:', error);
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
      `${GEMINI_API_BASE}/${IMAGE_MODEL}:generateImages?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: 'A simple blue square'
            }
          ],
          parameters: {
            sampleCount: 1
          }
        })
      }
    );

    return response.ok;
  } catch {
    return false;
  }
};
