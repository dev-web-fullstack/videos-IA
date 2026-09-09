// app/api/tts/delete/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { audioPath } = body;

    if (!audioPath) {
      return NextResponse.json(
        { success: false, error: 'Caminho do áudio não fornecido' },
        { status: 400 }
      );
    }

    // Extrair o nome do arquivo do caminho
    const filename = audioPath.split('/').pop();
    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Nome do arquivo inválido' },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), 'public', 'audio', 'tts', filename);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { success: false, error: 'Áudio não encontrado' },
        { status: 404 }
      );
    }

    // Tentar deletar
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Áudio TTS deletado: ${filename}`);
        return NextResponse.json({
          success: true,
          message: 'Áudio deletado com sucesso',
        });
      } catch (err) {
        if (attempt < 4) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // Se não conseguiu deletar
    return NextResponse.json(
      { success: false, error: 'Não foi possível deletar o áudio (arquivo em uso)' },
      { status: 409 }
    );

  } catch (error) {
    console.error('❌ Erro ao deletar áudio TTS:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar áudio' },
      { status: 500 }
    );
  }
}