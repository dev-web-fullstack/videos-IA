// app/api/freesound-download/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { ensureAudioFolder, cleanAudioFolder } from "../../../lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { soundId, soundName, previewUrl } = body;

    if (!soundId) {
      return NextResponse.json(
        { success: false, error: "ID do som não fornecido" },
        { status: 400 }
      );
    }

    console.log(`🎵 Baixando áudio do Freesound: ${soundName || soundId}`);

    ensureAudioFolder();
    cleanAudioFolder();

    let audioUrl = previewUrl;

    if (!audioUrl) {
      const possibleUrls = [
        `https://freesound.org/data/previews/${Math.floor(soundId / 1000)}/${soundId}_preview-hq.mp3`,
        `https://freesound.org/data/previews/${Math.floor(soundId / 1000)}/${soundId}_preview-lq.mp3`,
        `https://freesound.org/data/previews/${Math.floor(soundId / 1000)}/${soundId}.mp3`,
      ];

      for (const url of possibleUrls) {
        try {
          const testResponse = await fetch(url, { method: 'HEAD' });
          if (testResponse.ok) {
            audioUrl = url;
            console.log(`✅ URL encontrada: ${audioUrl}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (!audioUrl) {
      return NextResponse.json(
        { success: false, error: "URL do áudio não disponível" },
        { status: 404 }
      );
    }

    console.log(`🔗 URL download: ${audioUrl}`);

    const response = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      console.error(`❌ Erro no download: ${response.status}`);
      return NextResponse.json(
        { success: false, error: `Erro ao baixar áudio: ${response.status}` },
        { status: response.status }
      );
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    if (audioBuffer.length < 1000) {
      return NextResponse.json(
        { success: false, error: "Áudio baixado está vazio" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const cleanName = soundName
      ? soundName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
      : `freesound_${soundId}`;
    const fileName = `freesound_${cleanName}_${timestamp}_${random}.mp3`;
    const filePath = path.join(process.cwd(), "public", "audio", fileName);

    fs.writeFileSync(filePath, audioBuffer);

    const audioPath = `/audio/${fileName}`;
    const fileSize = fs.statSync(filePath).size;

    console.log(`✅ Áudio salvo: ${audioPath} (${(fileSize / 1024).toFixed(1)}KB)`);

    return NextResponse.json({
      success: true,
      audioPath: audioPath,
      fileName,
      name: `${soundName || `Freesound_${soundId}`}.mp3`,
      duration: 30,
      size: fileSize,
      source: 'freesound',
      soundId: soundId,
    });

  } catch (error) {
    console.error("❌ Erro ao baixar do Freesound:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao baixar áudio"
      },
      { status: 500 }
    );
  }
}