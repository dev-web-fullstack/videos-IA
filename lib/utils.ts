// lib/utils.ts
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import https from 'https';

// ============================================
// FUNÇÕES DE PASTAS
// ============================================

export function ensureVideoFolder() {
  const dir = path.join(process.cwd(), "public", "videos");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("📁 Pasta de vídeos criada:", dir);
  }
  return dir;
}

export function ensureTempFolder() {
  const dir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("📁 Pasta temporária criada:", dir);
  }
  return dir;
}

export function ensureAudioFolder() {
  const dir = path.join(process.cwd(), "public", "audio");

  // Criar pasta se não existir
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("📁 Pasta de áudio criada:", dir);
  }

  // Tentar corrigir permissões no Windows
  try {
    if (process.platform === 'win32') {
      try {
        fs.accessSync(dir, fs.constants.W_OK);
      } catch (e) {
        console.warn("⚠️ Pasta de áudio sem permissão de escrita, tentando corrigir...");
        const command = `icacls "${dir}" /grant Everyone:F /T`;
        exec(command, (error) => {
          if (error) {
            console.warn("⚠️ Não foi possível ajustar permissões automaticamente. Execute como Administrador.");
          } else {
            console.log("✅ Permissões ajustadas para a pasta de áudio");
          }
        });
      }
    }
  } catch (e) {
    // Ignorar erros de permissão
  }

  return dir;
}

// ============================================
// FUNÇÕES DE LIMPEZA
// ============================================

export function cleanAudioFolder() {
  const dir = path.join(process.cwd(), "public", "audio");
  if (!fs.existsSync(dir)) return;

  try {
    const files = fs.readdirSync(dir);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      } catch (e) {
        try {
          fs.unlinkSync(filePath);
          deletedCount++;
        } catch (err) {
          console.warn(`⚠️ Não foi possível deletar: ${file}`);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`🗑️ ${deletedCount} arquivos de áudio problemáticos removidos`);
    }
  } catch (e) {
    console.warn("⚠️ Erro ao limpar pasta de áudio:", e);
  }
}

export function deleteAudioFileSync(audioPath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), "public", audioPath);
    if (!fs.existsSync(fullPath)) {
      return false;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Áudio deletado: ${audioPath}`);
        return true;
      } catch (err) {
        if (attempt < 4) {
          const waitUntil = Date.now() + 500;
          while (Date.now() < waitUntil) { }
        }
      }
    }

    try {
      const tempPath = fullPath + '.old';
      fs.renameSync(fullPath, tempPath);
      fs.unlinkSync(tempPath);
      console.log(`🗑️ Áudio deletado (renomeado): ${audioPath}`);
      return true;
    } catch (e) {
      console.error(`❌ Não foi possível deletar o áudio: ${audioPath}`);
      return false;
    }
  } catch (e) {
    console.error(`❌ Erro ao deletar áudio:`, e);
    return false;
  }
}

export async function deleteAudioFile(audioPath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), "public", audioPath);
    if (!fs.existsSync(fullPath)) {
      return false;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Áudio deletado: ${audioPath}`);
        return true;
      } catch (err) {
        if (attempt < 4) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    try {
      const tempPath = fullPath + '.old';
      fs.renameSync(fullPath, tempPath);
      fs.unlinkSync(tempPath);
      console.log(`🗑️ Áudio deletado (renomeado): ${audioPath}`);
      return true;
    } catch (e) {
      console.error(`❌ Não foi possível deletar o áudio: ${audioPath}`);
      return false;
    }
  } catch (e) {
    console.error(`❌ Erro ao deletar áudio:`, e);
    return false;
  }
}

export function clearAllVideos() {
  const dir = path.join(process.cwd(), "public", "videos");
  if (!fs.existsSync(dir)) return;

  try {
    const files = fs.readdirSync(dir);
    let deletedCount = 0;
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (e) { }
    }
    if (deletedCount > 0) {
      console.log(`🗑️ ${deletedCount} vídeos antigos removidos da pasta`);
    }
  } catch (e) { }
}

export function clearTempFolder() {
  const dir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(dir)) return;

  try {
    const files = fs.readdirSync(dir);
    let deletedCount = 0;
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (e) {
        console.warn(`⚠️ Não foi possível deletar: ${file}`);
      }
    }
    if (deletedCount > 0) {
      console.log(`🗑️ ${deletedCount} arquivos temporários removidos da pasta tmp/`);
    }
  } catch (e) {
    console.warn("⚠️ Erro ao limpar pasta tmp:", e);
  }
}

export function cleanupOldTempFiles() {
  const dir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(dir)) return;

  try {
    const files = fs.readdirSync(dir);
    const now = Date.now();
    let deletedCount = 0;
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > 3600000) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      } catch (e) { }
    }
    if (deletedCount > 0) {
      console.log(`🗑️ ${deletedCount} arquivos temporários antigos removidos`);
    }
  } catch (e) { }
}

// ============================================
// FUNÇÕES PARA POLLINATIONS.AI
// ============================================

export async function downloadAudioFromPollinations(
  url: string,
  destPath: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(destPath);
    let downloaded = false;

    const request = https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          if (fs.existsSync(destPath)) {
            fs.unlinkSync(destPath);
          }
          downloadAudioFromPollinations(redirectUrl, destPath).then(resolve);
          return;
        }
      }

      const contentType = response.headers['content-type'] || '';

      if (contentType.includes('audio') || contentType.includes('octet-stream')) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          downloaded = true;
          if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
            console.log(`✅ Áudio baixado: ${destPath} (${fs.statSync(destPath).size} bytes)`);
            resolve(true);
          } else {
            console.error('❌ Arquivo baixado mas está vazio');
            if (fs.existsSync(destPath)) {
              fs.unlinkSync(destPath);
            }
            resolve(false);
          }
        });
      } else {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk.toString();
        });
        response.on('end', () => {
          console.error('❌ Resposta não é áudio. Content-Type:', contentType);
          console.error('❌ Resposta (primeiros 200 caracteres):', data.substring(0, 200));
          file.close();
          if (fs.existsSync(destPath)) {
            fs.unlinkSync(destPath);
          }
          resolve(false);
        });
      }
    });

    request.on('error', (err) => {
      console.error('❌ Erro no download:', err.message);
      file.close();
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      resolve(false);
    });

    request.setTimeout(60000, () => {
      console.error('❌ Timeout ao baixar áudio');
      request.destroy();
      file.close();
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      resolve(false);
    });
  });
}

export async function convertToWav(inputPath: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Arquivo de entrada não existe:', inputPath);
      resolve(false);
      return;
    }

    const ffmpeg = require('child_process').spawn('ffmpeg', [
      '-y',
      '-i', inputPath,
      '-acodec', 'pcm_s16le',
      '-ar', '44100',
      '-ac', '2',
      outputPath,
    ]);

    let errorOutput = '';

    ffmpeg.stderr.on('data', (data: Buffer) => {
      errorOutput += data.toString();
    });

    ffmpeg.on('close', (code: number) => {
      if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
        console.log(`✅ Áudio convertido para WAV: ${outputPath}`);
        resolve(true);
      } else {
        console.error(`❌ Erro ao converter áudio (código ${code}):`, errorOutput);
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        resolve(false);
      }
    });

    ffmpeg.on('error', (err: Error) => {
      console.error('❌ Erro ao executar FFmpeg:', err.message);
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      resolve(false);
    });
  });
}

export async function tryPollinationsUrls(
  urls: string[],
  destPath: string
): Promise<boolean> {
  for (const url of urls) {
    console.log(`🔗 Tentando URL: ${url}`);
    const success = await downloadAudioFromPollinations(url, destPath);
    if (success) {
      console.log(`✅ Áudio baixado com sucesso de: ${url}`);
      return true;
    }
  }
  return false;
}

export function buildPollinationsAudioUrl(
  prompt: string,
  duration: number = 30,
  format: string = 'wav'
): string {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://audio.pollinations.ai/prompt/${encodedPrompt}?duration=${duration}&format=${format}`;
}

export function isValidAudioFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) return false;
    const stats = fs.statSync(filePath);
    if (stats.size === 0) return false;

    const ext = path.extname(filePath).toLowerCase();
    const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.mp4', '.aac', '.flac'];
    return validExtensions.includes(ext);
  } catch (e) {
    return false;
  }
}

export async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      resolve(0);
      return;
    }

    const ffprobe = require('child_process').spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath,
    ]);

    let output = '';
    ffprobe.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    ffprobe.on('close', (code: number) => {
      if (code === 0 && output) {
        const duration = parseFloat(output.trim());
        if (!isNaN(duration) && duration > 0) {
          resolve(duration);
          return;
        }
      }
      resolve(0);
    });

    ffprobe.on('error', () => {
      resolve(0);
    });
  });
}