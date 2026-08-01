// lib/videoConfig.ts
import path from "path";
import fs from "fs";

export interface VideoConfigOptions {
  platform: string;
  width: number;
  height: number;
  fontFamily: string;
}

export interface VideoConfig {
  platform: string;
  width: number;
  height: number;
  fps: number;
  videoCodec: string;
  pixelFormat: string;
  backgroundColor: string;
  fontColor: string;
  fontFile: string;
}

function getFontFile(fontFamily: string): string {
  const fontsDir = path.join(process.cwd(), "public", "fonts");

  // Mapeamento exato dos nomes das fontes para os arquivos
  const fontMap: Record<string, string> = {
    'Roboto-Regular': 'Roboto-Regular.ttf',
    'OpenSans-Regular': 'OpenSans-Regular.ttf',
    'Montserrat-Regular': 'Montserrat-Regular.ttf',
    'Lato-Regular': 'Lato-Regular.ttf',
    'Inter-Regular': 'Inter-Regular.ttf',
    'Poppins-Regular': 'Poppins-Regular.ttf',
    'Nunito-Regular': 'Nunito-Regular.ttf',
    'Quicksand-Regular': 'Quicksand-Regular.ttf',
    'Raleway-Regular': 'Raleway-Regular.ttf',
    'Oswald-Regular': 'Oswald-Regular.ttf',
  };

  const fontFileName = fontMap[fontFamily];
  if (!fontFileName) {
    console.warn(`⚠️ Fonte não mapeada: ${fontFamily}, usando Roboto como fallback`);
    return path.join(fontsDir, "Roboto-Regular.ttf");
  }

  const fontPath = path.join(fontsDir, fontFileName);

  if (!fs.existsSync(fontPath)) {
    console.warn(`⚠️ Arquivo não encontrado: ${fontPath}, usando Roboto como fallback`);
    return path.join(fontsDir, "Roboto-Regular.ttf");
  }

  return fontPath;
}

export function getVideoConfig({
  platform,
  width,
  height,
  fontFamily,
}: VideoConfigOptions): VideoConfig {

  return {
    platform,
    width,
    height,
    fps: 30,
    videoCodec: "libx264",
    pixelFormat: "yuv420p",
    backgroundColor: "black",
    fontColor: "white",
    fontFile: getFontFile(fontFamily),
  };

}