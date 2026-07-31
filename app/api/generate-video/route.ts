// app/api/generate-video/route.ts
import { NextResponse } from "next/server";
import { generateVideoFromText } from "../../../lib/ffmpeg";
import type { TextStyle } from "../../../lib/textStyle";
import type { BackgroundAnimationType, BackgroundPosition } from "../../../lib/backgroundAnimations";

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
      backgroundAnimation = "none",
      backgroundPosition = "full",
      backgroundColor = "#000000",
    }: {
      script: string;
      videoDuration: number;
      platform: string;
      width: number;
      height: number;
      textStyle: TextStyle;
      backgroundAnimation?: BackgroundAnimationType;
      backgroundPosition?: BackgroundPosition;
      backgroundColor?: string;
    } = body;

    // Validação
    if (!script?.trim()) {
      return NextResponse.json(
        { success: false, error: "Texto vazio" },
        { status: 400 }
      );
    }

    if (!videoDuration || videoDuration < 1) {
      return NextResponse.json(
        { success: false, error: "Duração inválida" },
        { status: 400 }
      );
    }

    if (!width || !height || width < 1 || height < 1) {
      return NextResponse.json(
        { success: false, error: "Resolução inválida" },
        { status: 400 }
      );
    }

    console.log("📥 Gerando vídeo...");
    console.log("📝 Texto:", script);
    console.log("⏱️ Duração:", videoDuration);
    console.log("📐 Resolução:", `${width}x${height}`);
    console.log("🎨 Fundo:", backgroundAnimation, "| Posição:", backgroundPosition);
    console.log("🎨 Cor:", backgroundColor);

    // Gerar vídeo
    const videoPath = await generateVideoFromText(
      script,
      videoDuration,
      platform,
      width,
      height,
      textStyle,
      backgroundAnimation,
      backgroundPosition,
      backgroundColor
    );

    if (!videoPath) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao gerar vídeo: caminho não retornado"
        },
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