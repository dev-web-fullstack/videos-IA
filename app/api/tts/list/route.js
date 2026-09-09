// app/api/tts/list/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const audioDir = path.join(process.cwd(), 'public', 'audio', 'tts');

    if (!fs.existsSync(audioDir)) {
      return NextResponse.json({
        success: true,
        audios: [],
      });
    }

    const files = fs.readdirSync(audioDir);
    const audios = [];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!['.mp3', '.wav', '.ogg'].includes(ext)) continue;

      const filePath = path.join(audioDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          audios.push({
            name: file,
            path: `/audio/tts/${file}`,
            size: stats.size,
            duration: 0, // Pode ser calculado com ffprobe se necessário
            createdAt: stats.mtime,
          });
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao ler arquivo: ${file}`, error);
      }
    }

    // Ordenar por data de criação (mais recentes primeiro)
    audios.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log(`📋 ${audios.length} áudios TTS disponíveis`);
    return NextResponse.json({
      success: true,
      audios,
    });

  } catch (error) {
    console.error('❌ Erro ao listar áudios TTS:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar áudios' },
      { status: 500 }
    );
  }
}