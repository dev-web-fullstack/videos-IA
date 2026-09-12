import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Cache de durações em memória
const durationCache = new Map<string, { duration: number; mtime: number }>();

// Arquivo de cache persistente
const CACHE_FILE = path.join(process.cwd(), '.tts-duration-cache.json');

// Carregar cache do arquivo
function loadCacheFromFile() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      for (const key of Object.keys(parsed)) {
        durationCache.set(key, parsed[key]);
      }
      console.log(`📦 Cache carregado: ${durationCache.size} entradas`);
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar cache:', error);
  }
}

// Salvar cache em arquivo
function saveCacheToFile() {
  try {
    const obj: Record<string, { duration: number; mtime: number }> = {};
    durationCache.forEach((value, key) => {
      obj[key] = value;
    });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (error) {
    console.warn('⚠️ Erro ao salvar cache:', error);
  }
}

// Carregar cache na inicialização
loadCacheFromFile();

// Obter duração com ffprobe
function getAudioDuration(filePath: string, stats: fs.Stats): Promise<number> {
  return new Promise((resolve) => {
    // Verificar cache
    const cached = durationCache.get(filePath);
    if (cached && cached.mtime === stats.mtimeMs) {
      resolve(cached.duration);
      return;
    }

    const ffprobe = exec(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      { timeout: 10000 },
      (error, stdout) => {
        if (error || !stdout) {
          resolve(0);
          return;
        }
        const duration = parseFloat(stdout.trim());
        const finalDuration = isNaN(duration) || duration <= 0 ? 0 : duration;

        durationCache.set(filePath, {
          duration: finalDuration,
          mtime: stats.mtimeMs,
        });

        resolve(finalDuration);
      }
    );

    setTimeout(() => {
      try { ffprobe.kill(); } catch (e) { }
      resolve(0);
    }, 11000);
  });
}

export async function GET() {
  try {
    const audioDir = path.join(process.cwd(), 'public', 'audio', 'tts');

    if (!fs.existsSync(audioDir)) {
      return NextResponse.json({
        success: true,
        audios: [],
      });
    }

    const files = fs.readdirSync(audioDir);

    const validFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp3', '.wav', '.ogg'].includes(ext);
    });

    if (validFiles.length === 0) {
      return NextResponse.json({
        success: true,
        audios: [],
      });
    }

    console.log(`📂 Processando ${validFiles.length} arquivos...`);

    const audios = [];
    const BATCH_SIZE = 4;

    for (let i = 0; i < validFiles.length; i += BATCH_SIZE) {
      const batch = validFiles.slice(i, i + BATCH_SIZE);

      const results = await Promise.all(
        batch.map(async (file) => {
          const filePath = path.join(audioDir, file);
          try {
            const stats = fs.statSync(filePath);
            if (stats.size === 0) return null;

            const duration = await getAudioDuration(filePath, stats);

            return {
              name: file,
              path: `/audio/tts/${file}`,
              size: stats.size,
              duration: duration,
              createdAt: stats.mtime,
            };
          } catch (error) {
            console.warn(`⚠️ Erro ao processar ${file}:`, error);
            return null;
          }
        })
      );

      for (const result of results) {
        if (result) audios.push(result);
      }
    }

    saveCacheToFile();

    audios.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log(`✅ ${audios.length} áudios processados`);

    return NextResponse.json({
      success: true,
      audios,
    });

  } catch (error) {
    console.error('❌ Erro ao listar áudios:', error);

    return NextResponse.json(
      { success: false, audios: [] },
      { status: 500 }
    );
  }
}