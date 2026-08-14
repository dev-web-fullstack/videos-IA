// lib/utils.ts
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

// NOVA FUNÇÃO: Limpar arquivos temporários da pasta tmp
export function clearTempFolder() {
  const dir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(dir)) return;

  try {
    const files = fs.readdirSync(dir);
    let deletedCount = 0;
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        // Verificar se o arquivo não está em uso
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (e) {
        // Se não conseguir deletar, pular (arquivo pode estar em uso)
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

// Função para limpar arquivos temporários antigos (mais de 1 hora)
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
        if (now - stats.mtimeMs > 3600000) { // 1 hora
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