// Gemini 3 Pro Image Preview - 벤토그리드 인포그래픽 생성
import { FinalReportData } from '../types';

// 학습자 보고서를 벤토그리드 인포그래픽으로 변환하는 프롬프트
const createInfographicPrompt = (report: FinalReportData, teamName: string): string => {
  return `Generate a BENTO GRID style infographic image for a factory fire incident report.

REPORT DATA:
- Title: ${report.title}
- Team: ${teamName}
- Members: ${report.members}

SECTIONS TO VISUALIZE:
1. 현상파악 (Situation): ${report.situation}
2. 문제정의 (Problem): ${report.definition}
3. 원인분석 (Root Cause): ${report.cause}
4. 해결방안 (Solution): ${report.solution}
5. 재발방지 (Prevention): ${report.prevention}
6. 실행일정 (Schedule): ${report.schedule}

DESIGN STYLE:
- Modern BENTO GRID layout (asymmetric grid boxes)
- Color palette: Yellow (#FFC107), Black (#1a1a1a), White, Gray
- Bold headings with thick black borders
- Clean sans-serif Korean typography
- Professional business report aesthetic
- Include simple icons for each section
- A4 portrait format (3:4 ratio)`;
};

// Gemini 3 Pro Image로 인포그래픽 생성
export const generateInfographicImage = async (
  report: FinalReportData,
  teamName: string
): Promise<{ success: boolean; imageBlob?: Blob; error?: string }> => {
  const prompt = createInfographicPrompt(report, teamName);

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const responseText = await response.text();

    // 에러 응답 처리
    if (!response.ok) {
      let errorMessage = `서버 오류 (${response.status})`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) errorMessage = errorData.error;
      } catch {
        if (response.status === 504) {
          errorMessage = '이미지 생성 시간이 초과되었습니다. 다시 시도해주세요.';
        }
      }
      return { success: false, error: errorMessage };
    }

    // 성공 응답 파싱
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return { success: false, error: '서버 응답을 처리할 수 없습니다.' };
    }

    if (!data.success || !data.imageBase64) {
      return { success: false, error: data.error || '이미지 생성에 실패했습니다.' };
    }

    // Base64 → Blob 변환
    const byteCharacters = atob(data.imageBase64);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const imageBlob = new Blob([byteArray], { type: data.mimeType || 'image/png' });

    return { success: true, imageBlob };

  } catch (error) {
    console.error('인포그래픽 생성 실패:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  }
};
