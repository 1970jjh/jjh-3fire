// Vercel Edge Function - Gemini 3 Pro Image Preview API
export const config = {
  runtime: 'edge',
  maxDuration: 60,
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000); // 55초 타임아웃

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      clearTimeout(timeoutId);
      return jsonResponse({ error: 'Prompt is required' }, 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      clearTimeout(timeoutId);
      return jsonResponse({ error: 'API key not configured' }, 500);
    }

    // Gemini 3 Pro Image Preview API 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
              aspectRatio: '3:4',
              imageSize: '2K'
            }
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    // 에러 응답 처리
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      let errorMessage = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }

      return jsonResponse({ error: errorMessage }, response.status);
    }

    // 성공 응답 파싱
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('JSON parse error:', responseText.substring(0, 500));
      return jsonResponse({ error: '응답 파싱 실패' }, 500);
    }

    if (data.error) {
      return jsonResponse({ error: data.error.message }, 400);
    }

    // 이미지 데이터 추출
    const parts = data.candidates?.[0]?.content?.parts;
    let imageData = null;

    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.data) {
          imageData = {
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/png'
          };
          break;
        }
      }
    }

    if (!imageData) {
      console.error('No image in response:', JSON.stringify(data).substring(0, 500));
      return jsonResponse({ error: '이미지 생성 결과가 없습니다.' }, 500);
    }

    return jsonResponse({
      success: true,
      imageBase64: imageData.base64,
      mimeType: imageData.mimeType
    }, 200);

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Server error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return jsonResponse({ error: '이미지 생성 시간이 초과되었습니다.' }, 504);
    }

    return jsonResponse({
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, 500);
  }
}

function jsonResponse(data: object, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
