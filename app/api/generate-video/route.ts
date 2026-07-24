import { NextResponse } from "next/server";

import { generateVideoFromText } from "../../../lib/ffmpeg";

import type { TextStyle } from "../../../lib/textStyle";

export async function POST(req: Request) {

  try {

    const {

      script,

      videoDuration,

      platform,

      width,

      height,

      textStyle,

    }: {

      script: string;

      videoDuration: number;

      platform: string;

      width: number;

      height: number;

      textStyle: TextStyle;

    } = await req.json();

    const videoPath = await generateVideoFromText(

      script,

      videoDuration,

      platform,

      width,

      height,

      textStyle

    );

    return NextResponse.json({

      success: true,

      videoPath,

    });

  }

  catch (error) {

    console.error(error);

    return NextResponse.json(

      {

        success: false,

        error: "Erro ao gerar vídeo.",

      },

      {

        status: 500,

      }

    );

  }

}