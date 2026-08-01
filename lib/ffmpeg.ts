import { spawn } from "child_process";
import path from "path";
import fs from "fs";

import { getVideoConfig } from "./videoConfig";
import { buildTextLayout } from "./textLayout";
import { ensureVideoFolder, ensureTempFolder, clearAllVideos } from "./utils";
import { generateBackgroundFilter, BackgroundAnimationType, BackgroundPosition } from "./backgroundAnimations";

import type { TextStyle } from "./textStyle";

export async function generateVideoFromText(
  script: string,
  videoDuration: number,
  platform: string,
  width: number,
  height: number,
  textStyle: TextStyle,
  backgroundAnimation: BackgroundAnimationType = "none",
  backgroundPosition: BackgroundPosition = "full",
  backgroundColor: string = "#000000"
): Promise<string> {

  clearAllVideos();

  const outputDir = ensureVideoFolder();
  const outputFile = `video-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;
  const outputPath = path.join(outputDir, outputFile);

  if (fs.existsSync(outputPath)) {
    try {
      fs.unlinkSync(outputPath);
    } catch (e) { }
  }

  const tempDir = ensureTempFolder();
  const tempTextFile = path.join(tempDir, `text-${Date.now()}-${Math.random().toString(36).substring(7)}.txt`);

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

  // Alinhamento horizontal
  let textAlignValue = "";
  switch (textStyle.align) {
    case "left": textAlignValue = "L"; break;
    case "right": textAlignValue = "R"; break;
    case "justify": textAlignValue = "L"; break;
    default: textAlignValue = "C"; break;
  }

  drawTextFilter += `text_align=${textAlignValue}:`;

  // Posição X (horizontal)
  let xPosition = "";
  switch (textStyle.align) {
    case "left": xPosition = `${textStyle.marginX}`; break;
    case "right": xPosition = `w-text_w-${textStyle.marginX}`; break;
    case "justify": xPosition = `(w-text_w)/2`; break;
    default: xPosition = `(w-text_w)/2`; break;
  }

  drawTextFilter += `x=${xPosition}:`;

  // Posição Y (vertical) - NOVO
  let yPosition = "";
  switch (textStyle.verticalPosition) {
    case "top":
      yPosition = `${textStyle.marginY}`;
      break;
    case "bottom":
      yPosition = `h-text_h-${textStyle.marginY}`;
      break;
    case "center":
    default:
      yPosition = `(h-text_h)/2`;
      break;
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
  console.log("🎨 Fundo:", backgroundAnimation);
  console.log("📍 Posição:", backgroundPosition);
  console.log("🎨 Cor:", backgroundColor);
  console.log("📐 Alinhamento H:", textStyle.align);
  console.log("📐 Posição V:", textStyle.verticalPosition);
  console.log("📄 Texto com quebras:");
  console.log(layout.text);
  console.log("📁 Salvando em:", outputPath);
  console.log("==============================\n");

  return new Promise((resolve, reject) => {
    if (backgroundAnimation !== "none") {
      const bgFilter = generateBackgroundFilter(
        backgroundAnimation,
        backgroundPosition,
        width,
        height,
        videoDuration,
        backgroundColor,
        config.fps
      );

      const tempVideoFile = path.join(tempDir, `bg-${Date.now()}.mp4`);

      const bgArgs = [
        "-y",
        "-f", "lavfi",
        "-i", bgFilter,
        "-r", String(config.fps),
        "-c:v", config.videoCodec,
        "-pix_fmt", config.pixelFormat,
        "-preset", "medium",
        "-crf", "23",
        tempVideoFile,
      ];

      const bgProcess = spawn("ffmpeg", bgArgs);

      let bgError = false;
      let bgErrorMessage = "";

      bgProcess.stderr.on("data", (data) => {
        const message = data.toString();
        if (message.includes("Error") || message.includes("Invalid")) {
          bgError = true;
          bgErrorMessage = message;
          console.error("❌ Erro no fundo:", message);
        }
        if (message.includes("frame=") || message.includes("time=")) {
          const progress = message.match(/time=(\d+:\d+:\d+\.\d+)/);
          if (progress) {
            console.log(`⏳ Fundo: ${progress[1]}`);
          }
        }
      });

      bgProcess.on("close", (bgCode) => {
        if (bgCode === 0 && fs.existsSync(tempVideoFile) && !bgError) {
          const finalArgs = [
            "-y",
            "-i", tempVideoFile,
            "-vf", drawTextFilter,
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "medium",
            "-crf", "23",
            outputPath,
          ];

          const finalProcess = spawn("ffmpeg", finalArgs);

          let finalError = false;

          finalProcess.stderr.on("data", (data) => {
            const message = data.toString();
            if (message.includes("Error") || message.includes("Invalid")) {
              finalError = true;
              console.error("❌ Erro no texto:", message);
            }
            if (message.includes("frame=") || message.includes("time=")) {
              const progress = message.match(/time=(\d+:\d+:\d+\.\d+)/);
              if (progress) {
                console.log(`⏳ Texto: ${progress[1]}`);
              }
            }
          });

          finalProcess.on("close", (finalCode) => {
            try {
              if (fs.existsSync(tempVideoFile)) {
                fs.unlinkSync(tempVideoFile);
              }
              if (fs.existsSync(tempTextFile)) {
                fs.unlinkSync(tempTextFile);
              }
            } catch (e) { }

            if (finalCode === 0 && fs.existsSync(outputPath) && !finalError) {
              const fileSize = fs.statSync(outputPath).size;
              console.log(`✅ Vídeo final gerado! Tamanho: ${fileSize} bytes`);
              resolve(`/videos/${outputFile}`);
            } else {
              reject(new Error(`Erro ao adicionar texto`));
            }
          });

          finalProcess.on("error", (error) => {
            reject(error);
          });

        } else {
          try {
            if (fs.existsSync(tempTextFile)) {
              fs.unlinkSync(tempTextFile);
            }
          } catch (e) { }
          reject(new Error(bgErrorMessage || `Erro ao criar fundo: código ${bgCode}`));
        }
      });

      bgProcess.on("error", (error) => {
        reject(error);
      });

    } else {
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
          if (fs.existsSync(tempTextFile)) {
            fs.unlinkSync(tempTextFile);
          }
        } catch (e) { }

        if (code === 0 && fs.existsSync(outputPath) && !hasError) {
          const fileSize = fs.statSync(outputPath).size;
          console.log(`✅ Vídeo gerado! Tamanho: ${fileSize} bytes`);
          resolve(`/videos/${outputFile}`);
        } else {
          reject(new Error(errorMessage || `Código ${code}`));
        }
      });

      ffmpeg.on("error", (error) => {
        reject(error);
      });
    }
  });
}