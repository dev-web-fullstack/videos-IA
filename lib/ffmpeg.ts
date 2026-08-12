// lib/ffmpeg.ts
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import https from 'https';

import { getVideoConfig } from "./videoConfig";
import { buildTextLayout } from "./textLayout";
import { ensureVideoFolder, ensureTempFolder, clearAllVideos } from "./utils";

import type { TextStyle } from "./textStyle";

// Função para baixar imagem via HTTPS com validação
function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    let responseReceived = false;

    https.get(url, (response) => {
      // Verificar se é um redirecionamento
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }

      // Verificar se a resposta é uma imagem (content-type)
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('image/')) {
        // Se não for imagem, pode ser um erro JSON
        let data = '';
        response.on('data', (chunk) => {
          data += chunk.toString();
        });
        response.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) {
              reject(new Error(`Erro da API: ${json.error}`));
            } else {
              reject(new Error(`Resposta inesperada: ${contentType}`));
            }
          } catch (e) {
            reject(new Error(`Conteúdo não é uma imagem: ${contentType}`));
          }
        });
        return;
      }

      responseReceived = true;
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        // Verificar se o arquivo é uma imagem PNG válida
        try {
          const buffer = fs.readFileSync(dest);
          // Verificar assinatura PNG: 89 50 4E 47
          if (buffer.length > 4 &&
            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4E &&
            buffer[3] === 0x47) {
            resolve();
          } else if (buffer.length > 4 &&
            buffer[0] === 0xFF &&
            buffer[1] === 0xD8 &&
            buffer[2] === 0xFF) {
            // É JPEG - aceitar também
            resolve();
          } else {
            // Não é PNG nem JPEG
            const preview = buffer.slice(0, 100).toString();
            reject(new Error(`Arquivo não é uma imagem válida: ${preview}`));
          }
        } catch (err) {
          reject(new Error(`Erro ao validar imagem: ${err}`));
        }
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => { });
      reject(err);
    });
  });
}

// Função para tentar baixar com retry
async function downloadImageWithRetry(url: string, dest: string, maxRetries: number = 3): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries} de baixar imagem...`);
      await downloadImage(url, dest);
      console.log(`✅ Imagem baixada com sucesso!`);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`⚠️ Tentativa ${attempt} falhou: ${lastError.message}`);

      // Limpar arquivo se existir
      try {
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
      } catch (e) { }

      // Esperar antes de tentar novamente
      if (attempt < maxRetries) {
        console.log(`⏳ Aguardando 1s antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw new Error(`Falha ao baixar imagem após ${maxRetries} tentativas: ${lastError?.message}`);
}

export async function generateVideoFromText(
  script: string,
  videoDuration: number,
  platform: string,
  width: number,
  height: number,
  textStyle: TextStyle,
  backgroundType: string = "solid",
  backgroundColor: string = "#000000",
  imageUrl?: string
): Promise<string> {

  clearAllVideos();

  const outputDir = ensureVideoFolder();
  const tempDir = ensureTempFolder();

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const outputFile = `video-${timestamp}-${random}.mp4`;
  const outputPath = path.join(outputDir, outputFile);
  const tempBgFile = path.join(tempDir, `bg-${timestamp}-${random}.png`);

  console.log(`📁 Salvando em: ${outputPath}`);

  if (fs.existsSync(outputPath)) {
    try { fs.unlinkSync(outputPath); } catch (e) { }
  }
  if (fs.existsSync(tempBgFile)) {
    try { fs.unlinkSync(tempBgFile); } catch (e) { }
  }

  const tempTextFile = path.join(tempDir, `text-${timestamp}-${random}.txt`);

  const config = getVideoConfig({
    platform,
    width,
    height,
    fontFamily: textStyle.fontFamily,
  });

  if (!script.trim()) {
    throw new Error("Texto vazio.");
  }

  const layout = buildTextLayout({
    text: script,
    width,
    height,
    fontSize: textStyle.fontSize,
    marginX: textStyle.marginX,
    align: textStyle.align,
  });

  const textContent = layout.text;
  fs.writeFileSync(tempTextFile, textContent, "utf-8");

  const fontFile = config.fontFile
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:");

  let drawTextFilter = `drawtext=fontfile='${fontFile}':`;

  const textFileEscaped = tempTextFile
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'");

  drawTextFilter += `textfile='${textFileEscaped}':`;

  drawTextFilter += `fontcolor=${textStyle.color}:`;
  drawTextFilter += `fontsize=${textStyle.fontSize}:`;

  if (textStyle.borderWidth > 0) {
    drawTextFilter += `borderw=${textStyle.borderWidth}:`;
    drawTextFilter += `bordercolor=${textStyle.borderColor}:`;
  }

  if (textStyle.shadow) {
    drawTextFilter += `shadowcolor=${textStyle.shadowColor}:`;
    drawTextFilter += `shadowx=${textStyle.shadowX}:`;
    drawTextFilter += `shadowy=${textStyle.shadowY}:`;
  }

  if (textStyle.backgroundOpacity > 0) {
    const bgOpacity = (textStyle.backgroundOpacity / 100).toFixed(2);
    drawTextFilter += `box=1:`;
    drawTextFilter += `boxcolor=${textStyle.backgroundColor}@${bgOpacity}:`;
    const paddingX = Math.round(textStyle.padding * 0.5);
    drawTextFilter += `boxborderw=${paddingX}:`;
  }

  let textAlignValue = "";
  switch (textStyle.align) {
    case "left": textAlignValue = "L"; break;
    case "right": textAlignValue = "R"; break;
    case "justify": textAlignValue = "L"; break;
    default: textAlignValue = "C"; break;
  }

  drawTextFilter += `text_align=${textAlignValue}:`;

  let xPosition = "";
  switch (textStyle.align) {
    case "left":
      xPosition = `${textStyle.marginX}`;
      break;
    case "right":
      xPosition = `w-text_w-${textStyle.marginX}`;
      break;
    case "justify":
      // Para justificado, centralizar a caixa mas o texto já está justificado
      xPosition = `(w-text_w)/2`;
      break;
    case "center":
    default:
      xPosition = `(w-text_w)/2`;
      break;
  }

  drawTextFilter += `x=${xPosition}:`;

  let yPosition = "";
  switch (textStyle.verticalPosition) {
    case "top": yPosition = `${textStyle.marginY}`; break;
    case "bottom": yPosition = `h-text_h-${textStyle.marginY}`; break;
    default: yPosition = `(h-text_h)/2`; break;
  }

  drawTextFilter += `y=${yPosition}:`;

  const lineSpacing = Math.round(textStyle.lineSpacing * 0.5);
  drawTextFilter += `line_spacing=${lineSpacing}:`;
  drawTextFilter += `font='${textStyle.fontFamily}':`;
  drawTextFilter += `expansion=none:`;

  drawTextFilter = drawTextFilter.replace(/\n/g, "").replace(/\s+/g, "");

  console.log("\n==============================");
  console.log("🎬 GERANDO VÍDEO");
  console.log("==============================");
  console.log("📱 Plataforma:", platform);
  console.log("📐 Resolução:", `${width}x${height}`);
  console.log("⏱️  Duração:", videoDuration, "segundos");
  console.log("🎨 Tipo de fundo:", backgroundType);
  console.log("🎨 Cor:", backgroundColor);
  if (imageUrl) console.log("🖼️ Imagem:", imageUrl);
  console.log("📐 Alinhamento H:", textStyle.align);
  console.log("📐 Posição V:", textStyle.verticalPosition);
  console.log("📄 Texto com quebras:");
  console.log(layout.text);
  console.log("📁 Salvando em:", outputPath);
  console.log("==============================\n");

  // Função para gerar vídeo com imagem de fundo
  async function generateWithImage(): Promise<void> {
    // Baixar a imagem com retry
    console.log("🖼️ Baixando imagem de fundo...");

    try {
      await downloadImageWithRetry(imageUrl!, tempBgFile, 3);
    } catch (error) {
      console.error("❌ Erro ao baixar imagem:", error);
      // Fallback: usar fundo sólido
      console.warn("⚠️ Usando fundo sólido como fallback...");
      await generateWithSolid();
      return;
    }

    // Verificar se o arquivo existe e tem tamanho
    if (!fs.existsSync(tempBgFile) || fs.statSync(tempBgFile).size === 0) {
      console.warn("⚠️ Arquivo de imagem vazio ou inexistente. Usando fundo sólido...");
      await generateWithSolid();
      return;
    }

    console.log("✅ Imagem baixada com sucesso!");

    return new Promise((resolve, reject) => {
      // CORREÇÃO: Usar o FFmpeg para redimensionar e criar o vídeo em UM PASSO
      const args = [
        "-y",
        "-loop", "1",
        "-i", tempBgFile,
        "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,${drawTextFilter}`,
        "-c:v", config.videoCodec,
        "-t", String(videoDuration),
        "-pix_fmt", config.pixelFormat,
        "-r", String(config.fps),
        "-preset", "medium",
        "-crf", "23",
        outputPath,
      ];

      console.log("🔧 Gerando vídeo final...");

      const ffmpeg = spawn("ffmpeg", args);
      let hasError = false;
      let errorMessage = "";

      ffmpeg.stderr.on("data", (data) => {
        const message = data.toString();

        if (message.includes("Fontconfig") ||
          message.includes("configuration file") ||
          message.includes("Press [q] to stop")) {
          return;
        }

        if (message.includes("Error") || message.includes("Invalid")) {
          hasError = true;
          errorMessage = message;
          console.error("❌ FFmpeg erro:", message);
        }

        if (message.includes("frame=") || message.includes("time=")) {
          const progress = message.match(/time=(\d+:\d+:\d+\.\d+)/);
          if (progress) {
            console.log(`⏳ Progresso: ${progress[1]}`);
          }
        }
      });

      ffmpeg.on("close", (code) => {
        // Limpar arquivos temporários
        try {
          if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile);
          if (fs.existsSync(tempBgFile)) fs.unlinkSync(tempBgFile);
        } catch (e) { }

        if (code === 0 && fs.existsSync(outputPath)) {
          const fileSize = fs.statSync(outputPath).size;
          console.log(`✅ Vídeo gerado com sucesso! Tamanho: ${fileSize} bytes`);
          resolve();
        } else {
          reject(new Error(errorMessage || `Código ${code}`));
        }
      });

      ffmpeg.on("error", (error) => {
        reject(error);
      });
    });
  }

  // Função para gerar vídeo com fundo sólido
  async function generateWithSolid(): Promise<void> {
    return new Promise((resolve, reject) => {
      const bgHex = backgroundColor.replace('#', '');
      const args = [
        "-y",
        "-f", "lavfi",
        "-i", `color=c=${bgHex}:s=${width}x${height}:d=${videoDuration}`,
        "-vf", drawTextFilter,
        "-r", String(config.fps),
        "-c:v", config.videoCodec,
        "-pix_fmt", config.pixelFormat,
        "-preset", "medium",
        "-crf", "23",
        outputPath,
      ];

      console.log("🔧 Gerando vídeo com fundo sólido...");

      const ffmpeg = spawn("ffmpeg", args);
      let hasError = false;
      let errorMessage = "";

      ffmpeg.stderr.on("data", (data) => {
        const message = data.toString();

        if (message.includes("Fontconfig") ||
          message.includes("configuration file") ||
          message.includes("Press [q] to stop")) {
          return;
        }

        if (message.includes("Error") || message.includes("Invalid")) {
          hasError = true;
          errorMessage = message;
          console.error("❌ FFmpeg erro:", message);
        }

        if (message.includes("frame=") || message.includes("time=")) {
          const progress = message.match(/time=(\d+:\d+:\d+\.\d+)/);
          if (progress) {
            console.log(`⏳ Progresso: ${progress[1]}`);
          }
        }
      });

      ffmpeg.on("close", (code) => {
        try {
          if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile);
        } catch (e) { }

        if (code === 0 && fs.existsSync(outputPath)) {
          const fileSize = fs.statSync(outputPath).size;
          console.log(`✅ Vídeo gerado com sucesso! Tamanho: ${fileSize} bytes`);
          resolve();
        } else {
          reject(new Error(errorMessage || `Código ${code}`));
        }
      });

      ffmpeg.on("error", (error) => {
        reject(error);
      });
    });
  }

  // Executar a geração correta
  if (backgroundType === "ai-generated" && imageUrl) {
    await generateWithImage();
  } else {
    await generateWithSolid();
  }

  return `/videos/${outputFile}`;
}