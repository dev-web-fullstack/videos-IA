// app/api/get-audios/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { ensureAudioFolder, cleanAudioFolder } from "../../../lib/utils";

export async function GET() {
  try {
    ensureAudioFolder();
    cleanAudioFolder();

    const audioDir = path.join(process.cwd(), "public", "audio");

    if (!fs.existsSync(audioDir)) {
      return NextResponse.json({ audios: [] });
    }

    const files = fs.readdirSync(audioDir);
    const audios = [];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!['.mp3', '.wav', '.ogg', '.m4a', '.mp4'].includes(ext)) {
        continue;
      }

      const filePath = path.join(audioDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          audios.push({
            name: file,
            path: `/audio/${file}`,
            size: stats.size,
            uploadedAt: stats.mtime,
          });
        } else {
          try {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Arquivo vazio removido: ${file}`);
          } catch (e) { }
        }
      } catch (error) {
        console.warn(`⚠️ Arquivo problemático: ${file}`, error);
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Arquivo problemático removido: ${file}`);
        } catch (e) {
          console.error(`❌ Não foi possível remover: ${file}`, e);
        }
      }
    }

    audios.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    console.log(`📋 ${audios.length} áudios disponíveis`);
    return NextResponse.json({ audios });

  } catch (error) {
    console.error("❌ Erro ao listar áudios:", error);
    return NextResponse.json(
      { error: "Erro ao listar áudios" },
      { status: 500 }
    );
  }
}