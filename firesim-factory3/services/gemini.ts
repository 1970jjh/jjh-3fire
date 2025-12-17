// Imagen 3 API 서비스 - 인포그래픽 이미지 생성
import { FinalReportData } from '../types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Imagen 3 모델 (고품질 이미지 생성)
const IMAGEN_MODEL = 'imagen-3.0-generate-002';

interface ImagenResponse {
  generatedImages?: Array<{
    image?: {
      imageBytes: string; // base64 encoded image
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

// 보고서 데이터를 기반으로 인포그래픽 생성 프롬프트 생성
const createInfographicPrompt = (report: FinalReportData, teamName: string): string => {
  // Imagen 3는 영어 프롬프트에서 더 좋은 결과를 생성함
  return `Create a professional business infographic report with the following information:

Title: ${report.title}
Team: ${teamName}
Members: ${report.members}

Key Sections:
1. SITUATION (Current Facts): ${report.situation}
2. PROBLEM DEFINITION (Gap Analysis): ${report.definition}
3. ROOT CAUSE ANALYSIS: ${report.cause}
4. SOLUTIONS: ${report.solution}
5. PREVENTION MEASURES: ${report.prevention}
6. ACTION TIMELINE: ${report.schedule}

Design Requirements:
- Clean, modern business infographic style
- Bento grid layout with distinct sections
- Color palette: Yellow (#fbbf24), Indigo (#4f46e5), White, Black
- Include icons and visual elements for each section
- Professional executive-level presentation
- Bold typography with clear hierarchy
- Include Korean text labels for each section
- High contrast borders and shadows for neo-brutalist style`;
};

// Imagen 3 API를 사용하여 인포그래픽 이미지 생성
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
      `${GEMINI_API_BASE}/${IMAGEN_MODEL}:generateImages?key=${apiKey}`,
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
      console.error('Imagen 3 API error:', errorText);

      // 에러 메시지 파싱 시도
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
    const generatedImage = data.generatedImages?.[0];
    if (!generatedImage?.image?.imageBytes) {
      return {
        success: false,
        error: '이미지 생성에 실패했습니다. 응답에 이미지가 없습니다.'
      };
    }

    // Base64를 Blob으로 변환
    const base64Data = generatedImage.image.imageBytes;
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
    console.error('Imagen 3 인포그래픽 생성 실패:', error);
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
    // 간단한 이미지 생성 테스트
    const response = await fetch(
      `${GEMINI_API_BASE}/${IMAGEN_MODEL}:generateImages?key=${apiKey}`,
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
