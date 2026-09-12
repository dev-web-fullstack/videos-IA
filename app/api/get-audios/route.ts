// app/api/get-audios/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { ensureAudioFolder, cleanAudioFolder } from "../../../lib/utils";

// Cache de durações em memória
const durationCache = new Map<string, { duration: number; mtime: number }>();

// Obter duração do áudio com ffprobe (com cache)
function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      resolve(0);
      return;
    }

    try {
      const stats = fs.statSync(filePath);
      const cached = durationCache.get(filePath);

      // Verificar cache
      if (cached && cached.mtime === stats.mtimeMs) {
        resolve(cached.duration);
        return;
      }

      const ffprobe = exec(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
        { timeout: 15000 },
        (error, stdout) => {
          if (error || !stdout) {
            resolve(0);
            return;
          }
          const duration = parseFloat(stdout.trim());
          if (isNaN(duration) || duration <= 0) {
            resolve(0);
          } else {
            // Salvar no cache
            durationCache.set(filePath, {
              duration,
              mtime: stats.mtimeMs,
            });
            resolve(duration);
          }
        }
      );

      setTimeout(() => {
        try {
          ffprobe.kill();
        } catch (e) { }
        resolve(0);
      }, 16000);

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      resolve(0);
    }
  });
}

// Processar em série (evita sobrecarga)
async function processAudiosSequentially(files: string[], audioDir: string) {
  const audios = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.mp3', '.wav', '.ogg', '.m4a', '.mp4'].includes(ext)) continue;

    const filePath = path.join(audioDir, file);
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > 0) {
        const duration = await getAudioDuration(filePath);

        audios.push({
          name: file,
          path: `/audio/${file}`,
          size: stats.size,
          duration: duration,
          uploadedAt: stats.mtime,
        });
      } else {
        // Remover arquivos vazios
        try {
          fs.unlinkSync(filePath);
          console.log(`Arquivo vazio removido: ${file}`);
        } catch (e) { }
      }
    } catch (error) {
      console.warn(`Arquivo problemático: ${file}`, error);
      try {
        fs.unlinkSync(filePath);
        console.log(`Arquivo problemático removido: ${file}`);
      } catch (e) {
        console.error(`Não foi possível remover: ${file}`, e);
      }
    }
  }

  return audios;
}

export async function GET() {
  try {
    ensureAudioFolder();
    cleanAudioFolder();

    const audioDir = path.join(process.cwd(), "public", "audio");

    if (!fs.existsSync(audioDir)) {
      return NextResponse.json({ audios: [] });
    }

    const files = fs.readdirSync(audioDir);

    // Filtrar apenas arquivos válidos (ignora a pasta tts)
    const validFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp3', '.wav', '.ogg', '.m4a', '.mp4'].includes(ext);
    });

    if (validFiles.length === 0) {
      return NextResponse.json({ audios: [] });
    }

    console.log(`Processando ${validFiles.length} arquivos de audio...`);

    const audios = await processAudiosSequentially(validFiles, audioDir);

    // Ordenar por data (mais recentes primeiro)
    audios.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    console.log(`${audios.length} audios disponiveis`);

    return NextResponse.json({ audios });

  } catch (error) {
    console.error("Erro ao listar audios:", error);
    return NextResponse.json(
      { error: "Erro ao listar audios", audios: [] },
      { status: 500 }
    );
  }
}