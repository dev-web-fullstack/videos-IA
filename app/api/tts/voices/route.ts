// app/api/tts/voices/route.ts
import { NextResponse } from 'next/server';
import { DEFAULT_VOICES, isTTSConfigured, TTS_CONFIG } from '@/lib/tts';

export async function GET() {
  try {
    // Verificar se a API está configurada
    if (!isTTSConfigured()) {
      return NextResponse.json({
        success: true,
        voices: DEFAULT_VOICES,
        isFallback: true,
        message: 'Usando vozes padrão. Configure FISH_AUDIO_API_KEY para mais opções.'
      });
    }

    // Tentar buscar vozes da Fish Audio
    try {
      const response = await fetch(`${TTS_CONFIG.BASE_URL}/voices`, {
        headers: {
          'Authorization': `Bearer ${TTS_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();

        // Mapear vozes da API para nosso formato
        const voices: Record<string, any> = {};
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((voice: any) => {
            voices[voice.id] = {
              id: voice.id,
              name: voice.name || voice.id,
              gender: voice.gender || 'neutral',
              language: voice.language || 'en-US',
              description: voice.description || '',
              preview_url: voice.preview_url,
            };
          });
        }

        if (Object.keys(voices).length > 0) {
          return NextResponse.json({
            success: true,
            voices: voices,
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar vozes da Fish Audio:', error);
    }

    // Fallback: usar vozes padrão
    return NextResponse.json({
      success: true,
      voices: DEFAULT_VOICES,
      isFallback: true,
    });

  } catch (error) {
    console.error('❌ Erro ao listar vozes:', error);
    return NextResponse.json({
      success: true,
      voices: DEFAULT_VOICES,
      isFallback: true,
    });
  }
}