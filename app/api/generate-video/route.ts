// app/api/generate-video/route.ts
import { NextResponse } from "next/server";
import { generateVideoFromText } from "../../../lib/ffmpeg";
import { clearTempFolder } from "../../../lib/utils";
import type { TextStyle } from "../../../lib/textStyle";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      script = "",
      videoDuration,
      platform,
      width,
      height,
      textStyle,
      backgroundType = "solid",
      backgroundColor = "#000000",
      imageUrl,
      overlayImages,
    }: {
      script?: string;
      videoDuration: number;
      platform: string;
      width: number;
      height: number;
      textStyle: TextStyle;
      backgroundType?: string;
      backgroundColor?: string;
      imageUrl?: string;
      overlayImages?: { path: string; position: { x: number; y: number }; size: number; aspectRatio?: number }[];
    } = body;

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
    console.log("📝 Texto:", script || "(vazio)");
    console.log("⏱️ Duração:", videoDuration);
    console.log("📐 Resolução:", `${width}x${height}`);
    console.log("🎨 Fundo:", backgroundType);
    console.log("🎨 Cor:", backgroundColor);
    if (imageUrl) console.log("🖼️ Imagem IA:", imageUrl);
    if (overlayImages && overlayImages.length > 0) {
      console.log(`📷 Overlays: ${overlayImages.length} imagem(ns)`);
    }

    const videoPath = await generateVideoFromText(
      script || "",
      videoDuration,
      platform,
      width,
      height,
      textStyle,
      backgroundType,
      backgroundColor,
      imageUrl,
      overlayImages
    );

    if (!videoPath) {
      return NextResponse.json(
        { success: false, error: "Erro ao gerar vídeo" },
        { status: 500 }
      );
    }

    console.log("✅ Vídeo gerado:", videoPath);

    // Limpar pasta tmp após geração bem-sucedida
    try {
      clearTempFolder();
      console.log("🧹 Pasta tmp limpa via API route!");
    } catch (e) {
      console.warn("⚠️ Erro ao limpar tmp na API:", e);
    }

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