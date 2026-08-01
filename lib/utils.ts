import fs from "fs";
import path from "path";

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

  // Limpar arquivos temporários antigos (mais de 1 hora)
  try {
    const files = fs.readdirSync(dir);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > 3600000) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) { }
      }
    }
  } catch (e) { }

  return dir;
}

// Função para limpar TODOS os vídeos da pasta
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