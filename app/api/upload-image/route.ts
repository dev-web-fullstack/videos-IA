// app/api/upload-image/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { writeFile } from "fs/promises";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhuma imagem enviada" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Tipo de arquivo não suportado" },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Arquivo muito grande (máximo 10MB)" },
        { status: 400 }
      );
    }

    // Criar pasta images se não existir
    const imagesDir = path.join(process.cwd(), "public", "images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Gerar nome único
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.name);
    const fileName = `upload-${timestamp}-${random}${ext}`;
    const filePath = path.join(imagesDir, fileName);

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retornar caminho da imagem
    const imagePath = `/images/${fileName}`;

    console.log(`✅ Imagem salva: ${imagePath}`);

    return NextResponse.json({
      success: true,
      imagePath,
      fileName,
    });

  } catch (error) {
    console.error("❌ Erro ao fazer upload:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao fazer upload da imagem" },
      { status: 500 }
    );
  }
}