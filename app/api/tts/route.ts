// app/api/tts/route.ts
import { NextResponse } from 'next/server';
import {
  TTS_CONFIG,
  isTTSConfigured,
  validateTTSText,
  formatTextForTTS,
} from "../../../lib/tts";
import fs from 'fs';
import path from 'path';

// Salvar áudio localmente
async function saveAudioToFile(audioBuffer: Buffer, filename: string): Promise<string> {
  const audioDir = path.join(process.cwd(), 'public', 'audio', 'tts');

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const filePath = path.join(audioDir, filename);
  fs.writeFileSync(filePath, audioBuffer);

  return `/audio/tts/${filename}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, voice, rate = 0, pitch = 0 } = body;

    // Verificar se a API está configurada
    if (!isTTSConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fish Audio API não configurada. Adicione FISH_AUDIO_API_KEY ao .env.local'
        },
        { status: 500 }
      );
    }

    // Validar texto
    const validation = validateTTSText(text);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const formattedText = formatTextForTTS(text);
    const voiceId = voice || TTS_CONFIG.DEFAULT_VOICE;

    console.log(`🎤 Gerando TTS via Fish Audio API:`);
    console.log(`📝 Texto: "${formattedText.substring(0, 50)}..."`);
    console.log(`🔊 Voz: ${voiceId}`);
    console.log(`📦 Modelo: ${TTS_CONFIG.MODEL}`);

    // ============================================
    // CHAMADA PARA A API DA FISH AUDIO
    // ============================================

    const apiUrl = 'https://api.fish.audio/v1/tts';

    const requestBody: any = {
      text: formattedText,
      format: 'mp3',
    };

    // Só adicionar reference_id se for um ID válido
    if (voiceId && voiceId !== 'default' && voiceId.length > 8) {
      requestBody.reference_id = voiceId;
    }

    console.log(`📤 Enviando:`, JSON.stringify(requestBody, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TTS_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'model': TTS_CONFIG.MODEL,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `Erro na API Fish Audio: ${response.status}`;

      try {
        const errorData = await response.json();
        console.error('❌ Erro da API:', JSON.stringify(errorData, null, 2));

        if (errorData.message) {
          errorMessage = `Erro: ${errorData.message}`;
        } else if (errorData.detail) {
          errorMessage = `Erro: ${errorData.detail}`;
        } else if (errorData.error) {
          errorMessage = `Erro: ${errorData.error}`;
        }
      } catch (e) {
        try {
          const errorText = await response.text();
          console.error('❌ Erro (texto):', errorText);
          errorMessage = errorText || errorMessage;
        } catch (e2) {
          console.error('❌ Erro ao ler corpo:', e2);
        }
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Áudio gerado está vazio' },
        { status: 500 }
      );
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `tts_${timestamp}_${random}.mp3`;

    const audioPath = await saveAudioToFile(audioBuffer, filename);
    const fileSize = audioBuffer.length;

    console.log(`✅ TTS gerado: ${filename}`);
    console.log(`📁 Tamanho: ${(fileSize / 1024).toFixed(1)}KB`);

    return NextResponse.json({
      success: true,
      audioPath,
      filename,
      duration: 0,
      size: fileSize,
      voice: voiceId || 'default',
      text: formattedText,
    });

  } catch (error) {
    console.error('❌ Erro ao gerar TTS:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao gerar áudio'
      },
      { status: 500 }
    );
  }
}