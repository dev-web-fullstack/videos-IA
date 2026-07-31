// app/api/delete-video/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoPath } = body;

    if (!videoPath) {
      return NextResponse.json(
        { success: false, error: "Caminho do vídeo não fornecido" },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), "public", videoPath);
    let videoDeleted = false;
    let tempDeleted = 0;

    // Deletar o vídeo
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      videoDeleted = true;
      console.log(`🗑️ Vídeo deletado manualmente: ${path.basename(fullPath)}`);
    }

    // Deletar arquivos temporários da pasta tmp/
    const tmpDir = path.join(process.cwd(), "tmp");
    if (fs.existsSync(tmpDir)) {
      const files = fs.readdirSync(tmpDir);

      for (const file of files) {
        const filePath = path.join(tmpDir, file);
        if (file.endsWith('.txt')) {
          try {
            fs.unlinkSync(filePath);
            tempDeleted++;
          } catch (err) {
            console.error(`❌ Erro ao deletar arquivo temporário ${file}:`, err);
          }
        }
      }

      if (tempDeleted > 0) {
        console.log(`🗑️ ${tempDeleted} arquivos temporários deletados da pasta tmp/`);
      }
    }

    if (videoDeleted || tempDeleted > 0) {
      return NextResponse.json({
        success: true,
        message: "Arquivos deletados com sucesso",
        videoDeleted,
        tempDeleted,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo encontrado para deletar" },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("❌ Erro ao deletar vídeo:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao deletar vídeo",
      },
      { status: 500 }
    );
  }
}