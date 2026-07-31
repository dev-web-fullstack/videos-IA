export type TextAlign =
  | "left"
  | "center"
  | "right"
  | "justify";

export interface TextStyle {

  //-----------------------
  // Fonte
  //-----------------------

  fontFamily: string;

  fontSize: number;

  color: string;

  //-----------------------
  // Contorno
  //-----------------------

  borderColor: string;

  borderWidth: number;

  //-----------------------
  // Sombra
  //-----------------------

  shadow: boolean;

  shadowColor: string;

  shadowX: number;

  shadowY: number;

  shadowBlur: number;

  //-----------------------
  // Fundo
  //-----------------------

  backgroundColor: string;

  backgroundOpacity: number;

  //-----------------------
  // Layout
  //-----------------------

  padding: number;

  borderRadius: number;

  marginX: number;

  marginY: number;

  lineSpacing: number;

  align: TextAlign;

}

interface Options {

  width: number;

  height: number;

}

export function createDefaultTextStyle({

  width,

  height,

}: Options): TextStyle {

  const shortestSide = Math.min(
    width,
    height
  );

  const fontSize = 100;

  return {

    //-----------------------
    // Fonte
    //-----------------------

    fontFamily: "Roboto-Regular",

    fontSize: 100,

    color: "#FFFFFF",

    //-----------------------
    // Contorno
    //-----------------------

    borderColor: "#000000",

    borderWidth: 0,

    //-----------------------
    // Sombra
    //-----------------------

    shadow: false,

    shadowColor: "#000000",

    shadowX: Math.round(
      fontSize * 0.05
    ),

    shadowY: Math.round(
      fontSize * 0.05
    ),

    shadowBlur: Math.round(
      fontSize * 0.08
    ),

    //-----------------------
    // Fundo
    //-----------------------

    backgroundColor: "#000000",

    backgroundOpacity: 100,

    //-----------------------
    // Layout
    //-----------------------

    padding: Math.round(
      fontSize * 0.35
    ),

    borderRadius: Math.round(
      fontSize * 0.30
    ),

    marginX: Math.round(
      width * 0.08
    ),

    marginY: Math.round(
      height * 0.08
    ),

    lineSpacing: Math.round(
      fontSize * 0.35
    ),

    align: "center",

  };

}