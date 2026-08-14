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
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext);
      })
      .map(file => ({
        name: file,
        path: `/images/${file}`,
        size: fs.statSync(path.join(imagesDir, file)).size,
        uploadedAt: fs.statSync(path.join(imagesDir, file)).mtime,
      }))
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    return NextResponse.json({ images });

  } catch (error) {
    console.error("❌ Erro ao listar imagens:", error);
    return NextResponse.json(
      { error: "Erro ao listar imagens" },
      { status: 500 }
    );
  }
}