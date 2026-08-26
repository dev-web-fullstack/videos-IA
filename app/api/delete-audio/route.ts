// app/api/delete-audio/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { audioPath } = body;

    if (!audioPath) {
      return NextResponse.json(
        { success: false, error: "Caminho do áudio não fornecido" },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), "public", audioPath);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { success: false, error: "Áudio não encontrado" },
        { status: 404 }
      );
    }

    // Tentar deletar várias vezes (caso esteja em uso)
    let deleted = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        fs.unlinkSync(fullPath);
        deleted = true;
        console.log(`🗑️ Áudio deletado: ${audioPath}`);
        break;
      } catch (err) {
        if (attempt < 4) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    if (!deleted) {
      // Se não conseguiu deletar, tentar renomear e depois deletar
      try {
        const tempPath = fullPath + '.old';
        fs.renameSync(fullPath, tempPath);
        fs.unlinkSync(tempPath);
        deleted = true;
        console.log(`🗑️ Áudio deletado (renomeado): ${audioPath}`);
      } catch (err) {
        console.error(`❌ Não foi possível deletar o áudio:`, err);
        return NextResponse.json(
          { success: false, error: "Não foi possível deletar o áudio (arquivo em uso)" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Áudio deletado com sucesso",
    });

  } catch (error) {
    console.error("❌ Erro ao deletar áudio:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao deletar áudio" },
      { status: 500 }
    );
  }
}