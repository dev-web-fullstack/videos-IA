// lib/textStyle.ts
export type TextAlign =
  | "left"
  | "center"
  | "right"
  | "justify";

export type TextVerticalPosition =
  | "top"
  | "center"
  | "bottom";

export interface TextStyle {

  fontFamily: string;
  fontSize: number;
  color: string;

  borderColor: string;
  borderWidth: number;

  shadow: boolean;
  shadowColor: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;

  backgroundColor: string;
  backgroundOpacity: number;

  padding: number;
  borderRadius: number;
  marginX: number;
  marginY: number;
  lineSpacing: number;
  align: TextAlign;
  verticalPosition: TextVerticalPosition;
}

interface Options {
  width: number;
  height: number;
}

export function createDefaultTextStyle({
  width,
  height,
}: Options): TextStyle {

  const fontSize = 100;

  return {

    fontFamily: "Roboto-Regular",
    fontSize: 100,
    color: "#FFFFFF",

    borderColor: "#000000",
    borderWidth: 0,

    shadow: false,
    shadowColor: "#000000",
    shadowX: Math.round(fontSize * 0.05),
    shadowY: Math.round(fontSize * 0.05),
    shadowBlur: Math.round(fontSize * 0.08),

    backgroundColor: "#000000",
    backgroundOpacity: 100,

    padding: Math.round(fontSize * 0.35),
    borderRadius: Math.round(fontSize * 0.30),

    // MARGENS REDUZIDAS - 2% para texto ficar mais perto das bordas
    marginX: Math.round(width * 0.01),
    marginY: Math.round(height * 0.01),

    lineSpacing: Math.round(fontSize * 0.35),
    align: "center",
    verticalPosition: "center",

  };

}