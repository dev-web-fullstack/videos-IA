// app/api/tts/audio/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> } // <-- Promise aqui
) {
  try {
    const { filename } = await params; // <-- await aqui

    if (!filename) {
      return NextResponse.json(
        { error: 'Nome do arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Construir caminho do arquivo
    const filePath = path.join(process.cwd(), 'public', 'audio', 'tts', filename);

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Áudio não encontrado' },
        { status: 404 }
      );
    }

    // Ler o arquivo
    const audioBuffer = fs.readFileSync(filePath);

    // Retornar o áudio
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('❌ Erro ao servir áudio TTS:', error);
    return NextResponse.json(
      { error: 'Erro ao servir áudio' },
      { status: 500 }
    );
  }
}