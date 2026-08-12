// app/api/generate-video/route.ts
import { NextResponse } from "next/server";
import { generateVideoFromText } from "../../../lib/ffmpeg";
import type { TextStyle } from "../../../lib/textStyle";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      script,
      videoDuration,
      platform,
      width,
      height,
      textStyle,
      backgroundType = "solid",
      backgroundColor = "#000000",
      imageUrl,
    }: {
      script: string;
      videoDuration: number;
      platform: string;
      width: number;
      height: number;
      textStyle: TextStyle;
      backgroundType?: string;
      backgroundColor?: string;
      imageUrl?: string;
    } = body;

    if (!script?.trim()) {
      return NextResponse.json(
        { success: false, error: "Texto vazio" },
        { status: 400 }
      );
    }

    console.log("📥 Gerando vídeo...");
    console.log("📝 Texto:", script);
    console.log("⏱️ Duração:", videoDuration);
    console.log("📐 Resolução:", `${width}x${height}`);
    console.log("🎨 Fundo:", backgroundType);
    console.log("🎨 Cor:", backgroundColor);
    if (imageUrl) console.log("🖼️ Imagem:", imageUrl);

    const videoPath = await generateVideoFromText(
      script,
      videoDuration,
      platform,
      width,
      height,
      textStyle,
      backgroundType,
      backgroundColor,
      imageUrl
    );

    if (!videoPath) {
      return NextResponse.json(
        { success: false, error: "Erro ao gerar vídeo" },
        { status: 500 }
      );
    }

    console.log("✅ Vídeo gerado:", videoPath);

    return NextResponse.json({
      success: true,
      videoPath,
    });

  } catch (error) {
    console.error("❌ Erro ao gerar vídeo:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao gerar vídeo",
      },
      { status: 500 }
    );
  }
}