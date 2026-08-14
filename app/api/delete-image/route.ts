// app/api/delete-image/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imagePath } = body;

    if (!imagePath) {
      return NextResponse.json(
        { success: false, error: "Caminho da imagem não fornecido" },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), "public", imagePath);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { success: false, error: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    fs.unlinkSync(fullPath);
    console.log(`🗑️ Imagem deletada: ${imagePath}`);

    return NextResponse.json({
      success: true,
      message: "Imagem deletada com sucesso",
    });

  } catch (error) {
    console.error("❌ Erro ao deletar imagem:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao deletar imagem" },
      { status: 500 }
    );
  }
}