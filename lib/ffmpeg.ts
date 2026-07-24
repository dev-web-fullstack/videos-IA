import { spawn } from "child_process";
import path from "path";

import { getVideoConfig } from "./videoConfig";
import { buildTextLayout } from "./textLayout";

import {
  ensureVideoFolder,
  generateVideoName,
} from "./utils";

import type { TextStyle } from "./textStyle";

export async function generateVideoFromText(
  script: string,
  videoDuration: number,
  platform: string,
  width: number,
  height: number,
  textStyle: TextStyle
): Promise<string> {

  const outputDir = ensureVideoFolder();
  const outputFile = generateVideoName();
  const outputPath = path.join(outputDir, outputFile);

  const config = getVideoConfig({
    platform,
    width,
    height,
    fontFamily: textStyle.fontFamily,
  });

  if (!script.trim()) {
    throw new Error("Texto vazio.");
  }

  //--------------------------------------------------
  // Layout (quebra de linha inteligente)
  //--------------------------------------------------

  const layout = buildTextLayout({
    text: script,
    width,
    height,
    fontSize: textStyle.fontSize,
    marginX: textStyle.marginX,
  });

  //--------------------------------------------------
  // Escape seguro para FFmpeg drawtext
  //--------------------------------------------------

  const escapeText = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/:/g, "\\:")
      .replace(/'/g, "\\'")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]")
      .replace(/%/g, "\\%")
      .replace(/\r?\n/g, "\\n");

  //--------------------------------------------------
  // Fonte
  //--------------------------------------------------

  const fontFile = config.fontFile
    .replace(/\\/g, "/")
    .replace(":", "\\:");

  //--------------------------------------------------
  // TEXTO FINAL (único ponto crítico)
  //--------------------------------------------------

  const text = escapeText(layout.text);

  //--------------------------------------------------
  // DRAWTEXT (forma segura e compatível)
  //--------------------------------------------------

  const drawTextFilter = `
drawtext=
fontfile='${fontFile}':
text='${text}':
fontcolor=${textStyle.color}:
fontsize=${textStyle.fontSize}:
borderw=${textStyle.borderWidth}:
bordercolor=${textStyle.borderColor}:
shadowcolor=${textStyle.shadowColor}:
shadowx=${textStyle.shadowX}:
shadowy=${textStyle.shadowY}:
x=(w-text_w)/2:
y=(h-text_h)/2
`.replace(/\n/g, "");

  //--------------------------------------------------
  // FFmpeg args (ESTÁVEL)
  //--------------------------------------------------

  const args = [

    "-y",

    "-f",
    "lavfi",

    "-i",
    `color=c=${config.backgroundColor}:s=${width}x${height}:d=${videoDuration}`,

    "-vf",
    drawTextFilter,

    "-r",
    String(config.fps),

    "-c:v",
    config.videoCodec,

    "-pix_fmt",
    config.pixelFormat,

    outputPath,

  ];

  console.log("\n==============================");
  console.log("GERANDO VÍDEO (FINAL ENGINE)");
  console.log("==============================");
  console.log("Plataforma:", platform);
  console.log("Resolução:", `${width}x${height}`);
  console.log("Duração:", videoDuration);
  console.log("Texto:", layout.text);
  console.log("==============================\n");

  return new Promise((resolve, reject) => {

    const ffmpeg = spawn("ffmpeg", args);

    ffmpeg.stderr.on("data", (data) => {
      console.log(data.toString());
    });

    ffmpeg.on("error", reject);

    ffmpeg.on("close", (code) => {

      if (code === 0) {

        resolve(`/videos/${outputFile}`);

      } else {

        reject(
          new Error(
            `FFmpeg finalizou com código ${code}`
          )
        );

      }

    });

  });

}