// app/api/get-images/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), "public", "images");

    if (!fs.existsSync(imagesDir)) {
      return NextResponse.json({ images: [] });
    }

    const files = fs.readdirSync(imagesDir);

    // Filtrar apenas arquivos de imagem válidos
    const validFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext);
    });

    if (validFiles.length === 0) {
      return NextResponse.json({ images: [] });
    }

    console.log(`Processando ${validFiles.length} imagens...`);

    const images = [];

    for (const file of validFiles) {
      const filePath = path.join(imagesDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          images.push({
            name: file,
            path: `/images/${file}`,
            size: stats.size,
            uploadedAt: stats.mtime,
          });
        } else {
          // Remover arquivos vazios
          try {
            fs.unlinkSync(filePath);
            console.log(`Imagem vazia removida: ${file}`);
          } catch (e) { }
        }
      } catch (error) {
        console.warn(`Imagem problemática: ${file}`, error);
        try {
          fs.unlinkSync(filePath);
          console.log(`Imagem problemática removida: ${file}`);
        } catch (e) {
          console.error(`Não foi possível remover: ${file}`, e);
        }
      }
    }

    // Ordenar por data (mais recentes primeiro)
    images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    console.log(`${images.length} imagens disponíveis`);

    return NextResponse.json({ images });

  } catch (error) {
    console.error("Erro ao listar imagens:", error);
    return NextResponse.json(
      { error: "Erro ao listar imagens", images: [] },
      { status: 500 }
    );
  }
}