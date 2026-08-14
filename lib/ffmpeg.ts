// lib/ffmpeg.ts
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import https from 'https';

import { getVideoConfig } from "./videoConfig";
import { buildTextLayout } from "./textLayout";
import { ensureVideoFolder, ensureTempFolder, clearAllVideos, clearTempFolder } from "./utils";

import type { TextStyle } from "./textStyle";

interface OverlayImage {
  path: string;
  position: { x: number; y: number };
  size: number;
  aspectRatio?: number;
}

function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => { });
      reject(err);
    });
  });
}

function getImageAspectRatio(imagePath: string): Promise<number> {
  return new Promise((resolve) => {
    if (imagePath.startsWith('http')) {
      resolve(1);
      return;
    }

    try {
      const sharp = require('sharp');
      sharp(imagePath)
        .metadata()
        .then((metadata: any) => {
          resolve(metadata.width / metadata.height);
        })
        .catch(() => {
          resolve(1);
        });
    } catch (e) {
      resolve(1);
    }
  });
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
  imageUrl?: string,
  overlayImages?: OverlayImage[]
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

  const hasText = script && script.trim().length > 0;

  let layout;
  let drawTextFilter = "";

  if (hasText) {
    layout = buildTextLayout({
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

    const textFileEscaped = tempTextFile
      .replace(/\\/g, "/")
      .replace(/:/g, "\\:")
      .replace(/'/g, "\\'");

    drawTextFilter = `drawtext=fontfile='${fontFile}':`;
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
      case "left": xPosition = `${textStyle.marginX}`; break;
      case "right": xPosition = `w-text_w-${textStyle.marginX}`; break;
      case "justify": xPosition = `(w-text_w)/2`; break;
      default: xPosition = `(w-text_w)/2`; break;
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
  } else {
    layout = { text: "", lines: [], maxCharsPerLine: 0, align: textStyle.align };
    drawTextFilter = "";
  }

  console.log("\n==============================");
  console.log("🎬 GERANDO VÍDEO");
  console.log("==============================");
  console.log("📱 Plataforma:", platform);
  console.log("📐 Resolução:", `${width}x${height}`);
  console.log("⏱️  Duração:", videoDuration, "segundos");
  console.log("🎨 Tipo de fundo:", backgroundType);
  console.log("🎨 Cor:", backgroundColor);
  if (imageUrl) console.log("🖼️ Imagem IA:", imageUrl);
  if (overlayImages && overlayImages.length > 0) {
    console.log(`📷 Overlays: ${overlayImages.length} imagem(ns)`);
  }
  console.log("📝 Texto:", hasText ? `"${script}"` : "(vazio)");
  console.log("📐 Alinhamento H:", textStyle.align);
  console.log("📐 Posição V:", textStyle.verticalPosition);
  console.log("📁 Salvando em:", outputPath);
  console.log("==============================\n");

  // ============================================
  // ABORDAGEM SIMPLIFICADA: USAR ARQUIVOS INTERMEDIÁRIOS
  // ============================================

  async function createBackground(): Promise<string> {
    const bgHex = backgroundColor.replace('#', '');
    const bgOutput = path.join(tempDir, `bg-${timestamp}.mp4`);

    let bgArgs: string[];

    if (imageUrl && fs.existsSync(tempBgFile)) {
      bgArgs = [
        "-y",
        "-loop", "1",
        "-i", tempBgFile,
        "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
        "-c:v", "libx264",
        "-t", String(videoDuration),
        "-pix_fmt", "yuv420p",
        "-r", String(config.fps),
        bgOutput,
      ];
    } else {
      bgArgs = [
        "-y",
        "-f", "lavfi",
        "-i", `color=c=${bgHex}:s=${width}x${height}:d=${videoDuration}`,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", String(config.fps),
        bgOutput,
      ];
    }

    console.log("🔧 Criando fundo...");

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", bgArgs);

      ffmpeg.stderr.on("data", (data) => {
        const message = data.toString();
        if (message.includes("frame=") || message.includes("time=")) {
          const progress = message.match(/time=(\d+:\d+:\d+\.\d+)/);
          if (progress) {
            console.log(`⏳ Fundo: ${progress[1]}`);
          }
        }
      });

      ffmpeg.on("close", (code) => {
        if (code === 0 && fs.existsSync(bgOutput)) {
          console.log("✅ Fundo criado!");
          resolve(bgOutput);
        } else {
          reject(new Error("Erro ao criar fundo"));
        }
      });

      ffmpeg.on("error", (error) => {
        reject(error);
      });
    });
  }

  async function addOverlays(baseVideo: string, overlays: OverlayImage[]): Promise<string> {
    let currentVideo = baseVideo;

    for (let i = 0; i < overlays.length; i++) {
      const img = overlays[i];
      const outputVideo = path.join(tempDir, `overlay-${timestamp}-${i}.mp4`);

      let overlayPath = "";

      if (img.path.startsWith('/images/')) {
        const localPath = path.join(process.cwd(), 'public', img.path);
        if (fs.existsSync(localPath)) {
          overlayPath = localPath;
        } else {
          console.warn(`⚠️ Overlay ${i + 1} não encontrado`);
          continue;
        }
      } else if (img.path.startsWith('http')) {
        const tempOverlayFile = path.join(tempDir, `overlay-${timestamp}-${i}.png`);
        try {
          await downloadImage(img.path, tempOverlayFile);
          overlayPath = tempOverlayFile;
        } catch (error) {
          console.warn(`⚠️ Erro ao baixar overlay ${i + 1}`);
          continue;
        }
      }

      if (!overlayPath || !fs.existsSync(overlayPath)) {
        console.warn(`⚠️ Overlay ${i + 1} não encontrado`);
        continue;
      }

      let aspectRatio = img.aspectRatio || 1;

      if (!img.aspectRatio) {
        try {
          const sharp = require('sharp');
          const metadata = await sharp(overlayPath).metadata();
          aspectRatio = metadata.width / metadata.height;
          console.log(`   📐 Proporção calculada: ${aspectRatio.toFixed(2)}:1`);
        } catch (e) {
          console.warn(`   ⚠️ Não foi possível calcular proporção, usando 1:1`);
          aspectRatio = 1;
        }
      } else {
        console.log(`   📐 Proporção: ${aspectRatio.toFixed(2)}:1`);
      }

      const baseSize = Math.min(width, height);
      const overlaySize = Math.round(baseSize * (img.size / 100));

      let overlayWidth = overlaySize;
      let overlayHeight = overlaySize / aspectRatio;

      if (overlayHeight > overlaySize) {
        overlayHeight = overlaySize;
        overlayWidth = overlaySize * aspectRatio;
      }

      const posX = (img.position.x / 100) * width;
      const posY = (img.position.y / 100) * height;

      console.log(`🔧 Adicionando overlay ${i + 1}`);
      console.log(`   Tamanho: ${img.size}% = ${overlaySize}px (base: ${baseSize}px)`);
      console.log(`   Dimensões: ${Math.round(overlayWidth)}x${Math.round(overlayHeight)}`);
      console.log(`   Posição: ${Math.round(posX)}x${Math.round(posY)}`);

      const filterComplex = `[1:v]scale=${Math.round(overlayWidth)}:${Math.round(overlayHeight)}[overlay];[0:v][overlay]overlay=${posX}:${posY}[out]`;

      const args = [
        "-y",
        "-i", currentVideo,
        "-i", overlayPath,
        "-filter_complex", filterComplex,
        "-map", "[out]",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "23",
        outputVideo,
      ];

      console.log(`🔧 Comando: ffmpeg ${args.join(" ")}`);

      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", args);

        ffmpeg.stderr.on("data", (data) => {
          const message = data.toString();
          if (message.includes("frame=") || message.includes("time=")) {
            const progress = message.match(/time=(\d+:\d+:\d+\.\d+)/);
            if (progress) {
              console.log(`⏳ Overlay ${i + 1}: ${progress[1]}`);
            }
          }
          if (message.includes("Error") || message.includes("Invalid")) {
            console.error("❌ Erro FFmpeg:", message);
          }
        });

        ffmpeg.on("close", (code) => {
          if (code === 0 && fs.existsSync(outputVideo)) {
            console.log(`✅ Overlay ${i + 1} adicionado!`);
            resolve();
          } else {
            reject(new Error(`Erro ao adicionar overlay ${i + 1} (código ${code})`));
          }
        });

        ffmpeg.on("error", (error) => {
          reject(error);
        });
      });

      if (fs.existsSync(currentVideo) && currentVideo !== baseVideo) {
        try { fs.unlinkSync(currentVideo); } catch (e) { }
      }

      currentVideo = outputVideo;
    }

    return currentVideo;
  }

  async function addText(videoPath: string): Promise<string> {
    if (!hasText || !drawTextFilter) {
      return videoPath;
    }

    const outputVideo = path.join(tempDir, `final-${timestamp}.mp4`);

    const args = [
      "-y",
      "-i", videoPath,
      "-vf", drawTextFilter,
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-preset", "medium",
      "-crf", "23",
      outputVideo,
    ];

    console.log("🔧 Adicionando texto...");

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", args);

      ffmpeg.stderr.on("data", (data) => {
        const message = data.toString();
        if (message.includes("frame=") || message.includes("time=")) {
          const progress = message.match(/time=(\d+:\d+:\d+\.\d+)/);
          if (progress) {
            console.log(`⏳ Texto: ${progress[1]}`);
          }
        }
        if (message.includes("Error") || message.includes("Invalid")) {
          console.error("❌ Erro FFmpeg:", message);
        }
      });

      ffmpeg.on("close", (code) => {
        if (code === 0 && fs.existsSync(outputVideo)) {
          console.log("✅ Texto adicionado!");
          resolve(outputVideo);
        } else {
          reject(new Error(`Erro ao adicionar texto (código ${code})`));
        }
      });

      ffmpeg.on("error", (error) => {
        reject(error);
      });
    });
  }

  // ============================================
  // EXECUTAR FLUXO
  // ============================================

  try {
    if (imageUrl) {
      try {
        await downloadImage(imageUrl, tempBgFile);
        console.log("✅ Imagem de fundo baixada!");
      } catch (error) {
        console.warn("⚠️ Erro ao baixar imagem de fundo, usando cor sólida");
      }
    }

    let currentVideo = await createBackground();

    if (overlayImages && overlayImages.length > 0) {
      currentVideo = await addOverlays(currentVideo, overlayImages);
    }

    if (hasText) {
      currentVideo = await addText(currentVideo);
    }

    if (fs.existsSync(outputPath)) {
      try { fs.unlinkSync(outputPath); } catch (e) { }
    }
    fs.copyFileSync(currentVideo, outputPath);

    // Limpar arquivos temporários individuais
    try {
      if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile);
      if (fs.existsSync(tempBgFile)) fs.unlinkSync(tempBgFile);
      if (fs.existsSync(currentVideo) && currentVideo !== outputPath) {
        fs.unlinkSync(currentVideo);
      }
    } catch (e) { }

    // LIMPAR TODA A PASTA TMP
    try {
      clearTempFolder();
      console.log("🧹 Pasta tmp limpa com sucesso!");
    } catch (e) {
      console.warn("⚠️ Erro ao limpar pasta tmp:", e);
    }

    const fileSize = fs.statSync(outputPath).size;
    console.log(`✅ Vídeo final gerado! Tamanho: ${fileSize} bytes`);

    return `/videos/${outputFile}`;

  } catch (error) {
    console.error("❌ Erro na geração do vídeo:", error);
    throw error;
  }
}