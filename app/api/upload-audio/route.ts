// app/api/upload-audio/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { writeFile } from "fs/promises";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo de áudio enviado" },
        { status: 400 }
      );
    }

    // Validar tipo
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Formato de áudio não suportado" },
        { status: 400 }
      );
    }

    // Validar tamanho (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Arquivo muito grande (máximo 50MB)" },
        { status: 400 }
      );
    }

    // Criar pasta audio se não existir
    const audioDir = path.join(process.cwd(), "public", "audio");
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Gerar nome único
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.name);
    const fileName = `audio-${timestamp}-${random}${ext}`;
    const filePath = path.join(audioDir, fileName);

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verificar se o buffer não está vazio
    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Arquivo vazio" },
        { status: 400 }
      );
    }

    await writeFile(filePath, buffer);

    // Verificar se o arquivo foi salvo corretamente
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
      return NextResponse.json(
        { success: false, error: "Erro ao salvar arquivo" },
        { status: 500 }
      );
    }

    const audioPath = `/audio/${fileName}`;

    console.log(`✅ Áudio salvo: ${audioPath} (${(buffer.length / 1024).toFixed(1)}KB)`);

    return NextResponse.json({
      success: true,
      audioPath,
      fileName,
      name: file.name,
      size: buffer.length,
    });

  } catch (error) {
    console.error("❌ Erro ao fazer upload de áudio:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao fazer upload do áudio" },
      { status: 500 }
    );
  }
}