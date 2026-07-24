import path from "path";

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

  const fontsDir = path.join(
    process.cwd(),
    "public",
    "fonts"
  );

  switch (fontFamily) {

    case "Arial":
      return path.join(
        fontsDir,
        "Arial.ttf"
      );

    case "Verdana":
      return path.join(
        fontsDir,
        "Verdana.ttf"
      );

    case "Tahoma":
      return path.join(
        fontsDir,
        "Tahoma.ttf"
      );

    case "Roboto-Regular":
    default:
      return path.join(
        fontsDir,
        "Roboto-Regular.ttf"
      );

  }

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

