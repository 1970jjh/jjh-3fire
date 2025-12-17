// Vercel Serverless Function for Imagen 4 API
// This bypasses CORS by calling the API from server-side

export const config = {
  runtime: 'edge',
};

interface ImagenResponse {
  generatedImages?: Array<{
    image?: {
      imageBytes: string;
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

export default async function handler(request: Request) {
  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
    const IMAGE_MODEL = 'imagen-4.0-generate-001';

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
          return new Response(JSON.stringify({ error: errorJson.error.message }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch {
        // JSON parsing failed
      }

      return new Response(JSON.stringify({ error: `API error: ${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: ImagenResponse = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract image data
    let base64Data: string | undefined;

    if (data.generatedImages?.[0]?.image?.imageBytes) {
      base64Data = data.generatedImages[0].image.imageBytes;
    } else if (data.predictions?.[0]?.bytesBase64Encoded) {
      base64Data = data.predictions[0].bytesBase64Encoded;
    }

    if (!base64Data) {
      return new Response(JSON.stringify({ error: 'No image in response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      imageBase64: base64Data,
      mimeType: 'image/png'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
