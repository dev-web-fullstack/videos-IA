// lib/utils.ts
import fs from "fs";
import path from "path";
import { exec } from "child_process";

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

// ============================================
// FUNÇÕES PARA ÁUDIO
// ============================================

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
      // Verificar se a pasta tem permissão de escrita
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

// Função para limpar arquivos de áudio problemáticos
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
        // Deletar arquivos vazios (tamanho 0)
        if (stats.size === 0) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      } catch (e) {
        // Se não conseguir ler, tentar deletar
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

// Função para deletar um arquivo de áudio específico (VERSÃO SÍNCRONA)
export function deleteAudioFileSync(audioPath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), "public", audioPath);
    if (!fs.existsSync(fullPath)) {
      return false;
    }

    // Tentar deletar várias vezes (caso esteja em uso)
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Áudio deletado: ${audioPath}`);
        return true;
      } catch (err) {
        if (attempt < 4) {
          // Aguardar 500ms antes de tentar novamente
          const waitUntil = Date.now() + 500;
          while (Date.now() < waitUntil) {
            // Loop síncrono simples para esperar
          }
        }
      }
    }

    // Se não conseguiu deletar, tentar renomear e depois deletar
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

// Versão assíncrona (se preferir)
export async function deleteAudioFile(audioPath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), "public", audioPath);
    if (!fs.existsSync(fullPath)) {
      return false;
    }

    // Tentar deletar várias vezes (caso esteja em uso)
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

    // Se não conseguiu deletar, tentar renomear e depois deletar
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

// ============================================
// FUNÇÕES EXISTENTES
// ============================================

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

// Função para limpar arquivos temporários da pasta tmp
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