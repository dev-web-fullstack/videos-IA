// app/api/download-video/route.ts
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

    // Construir caminho completo
    const fullPath = path.join(process.cwd(), "public", videoPath);

    // Verificar se o arquivo existe
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { success: false, error: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    // Ler o arquivo
    const videoBuffer = fs.readFileSync(fullPath);
    const fileName = path.basename(fullPath);

    console.log(`📥 Baixando vídeo: ${fileName}`);

    // IMPORTANTE: Salvar os caminhos para deletar depois do download
    const filePathToDelete = fullPath;

    // Retornar o vídeo
    const response = new NextResponse(videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": videoBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

    // DELETAR O ARQUIVO APÓS O DOWNLOAD
    // Usamos um setTimeout para garantir que o download começou
    setTimeout(() => {
      try {
        // Deletar o vídeo
        if (fs.existsSync(filePathToDelete)) {
          fs.unlinkSync(filePathToDelete);
          console.log(`🗑️ Vídeo deletado: ${fileName}`);
        }

        // Deletar arquivos temporários da pasta tmp/
        const tmpDir = path.join(process.cwd(), "tmp");
        if (fs.existsSync(tmpDir)) {
          const files = fs.readdirSync(tmpDir);
          let deletedCount = 0;

          for (const file of files) {
            const filePath = path.join(tmpDir, file);
            // Deletar apenas arquivos .txt (textos temporários)
            if (file.endsWith('.txt')) {
              try {
                fs.unlinkSync(filePath);
                deletedCount++;
              } catch (err) {
                console.error(`❌ Erro ao deletar arquivo temporário ${file}:`, err);
              }
            }
          }

          if (deletedCount > 0) {
            console.log(`🗑️ ${deletedCount} arquivos temporários deletados da pasta tmp/`);
          }
        }
      } catch (error) {
        console.error("❌ Erro ao deletar arquivos:", error);
      }
    }, 1500); // Espera 1.5 segundos para garantir que o download começou

    return response;

  } catch (error) {
    console.error("❌ Erro ao baixar vídeo:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao baixar vídeo",
      },
      { status: 500 }
    );
  }
}