"use client";

import type { TextStyle } from "../../lib/textStyle";

interface Props {
  text: string;

  width: number;
  height: number;

  style: TextStyle;
}

export default function LiveTextPreview({
  text,
  width,
  height,
  style,
}: Props) {

  //----------------------------------------------------
  // Escala da prévia
  //----------------------------------------------------

  const MAX_WIDTH = 420;
  const MAX_HEIGHT = 300;

  const scale = Math.min(
    MAX_WIDTH / width,
    MAX_HEIGHT / height
  );

  const previewWidth = width * scale;
  const previewHeight = height * scale;

  //----------------------------------------------------
  // Fundo com transparência
  //----------------------------------------------------

  const alpha = Math.round(
    (style.backgroundOpacity / 100) * 255
  )
    .toString(16)
    .padStart(2, "0");

  const background =
    style.backgroundOpacity === 0
      ? "transparent"
      : `${style.backgroundColor}${alpha}`;

  //----------------------------------------------------

  return (

    <section className="space-y-4">

      <h2 className="text-lg font-semibold text-white">

        Prévia do vídeo

      </h2>

      <div className="flex justify-center">

        <div

          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-gray-700
            bg-black
            shadow-2xl
          "

          style={{

            width: previewWidth,

            height: previewHeight,

          }}

        >

          {/* Área do texto */}

          <div

            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
            "

            style={{

              paddingLeft:
                style.marginX * scale,

              paddingRight:
                style.marginX * scale,

              paddingTop:
                style.marginY * scale,

              paddingBottom:
                style.marginY * scale,

            }}

          >

            <div

              style={{

                width: "100%",

                textAlign: style.align,

                color: style.color,

                fontFamily:
                  style.fontFamily,

                fontSize:
                  style.fontSize * scale,

                lineHeight:
                  1.35,

                whiteSpace:
                  "pre-wrap",

                wordBreak:
                  "break-word",

                overflowWrap:
                  "break-word",

                padding:
                  style.padding * scale,

                borderRadius:
                  style.borderRadius * scale,

                background:

                  background,

                WebkitTextStroke:
                  `${style.borderWidth * scale}px ${style.borderColor}`,

                textShadow:

                  style.shadow

                    ? `
                      ${style.shadowX * scale}px
                      ${style.shadowY * scale}px
                      ${style.shadowBlur * scale}px
                      ${style.shadowColor}
                    `

                    : "none",

                transition:
                  "all .25s ease",

              }}

            >

              {text.trim().length > 0
                ? text
                : "Seu texto aparecerá aqui"}

            </div>

          </div>

        </div>

      </div>

      <div className="text-center text-xs text-gray-400">

        {width} × {height}

      </div>

    </section>

  );

}