// lib/backgroundAnimations.ts

export type BackgroundAnimationType =
  | "none"
  | "gradient-wave"
  | "particles"
  | "waves"
  | "geometric-rotate"
  | "light-pulse";

export type BackgroundPosition =
  | "full"
  | "top-half"
  | "center"
  | "bottom-half";

export interface BackgroundAnimation {
  type: BackgroundAnimationType;
  position: BackgroundPosition;
  duration: number;
  width: number;
  height: number;
  fps: number;
  backgroundColor?: string;
}

// Cores disponíveis para fundo
export const backgroundColors = [
  { value: "#000000", label: "Preto" },
  { value: "#1a1a2e", label: "Azul escuro" },
  { value: "#2d1b69", label: "Roxo escuro" },
  { value: "#1b2838", label: "Azul petróleo" },
  { value: "#2c1810", label: "Marrom escuro" },
  { value: "#1a1a1a", label: "Cinza escuro" },
  { value: "#0a192f", label: "Azul marinho" },
  { value: "#1b1b2f", label: "Índigo" },
  { value: "#2c2c3a", label: "Cinza azulado" },
  { value: "#0d0d0d", label: "Preto puro" },
];

// Função para gerar animação aleatória
export function getRandomAnimation(): BackgroundAnimationType {
  const types: BackgroundAnimationType[] = [
    "gradient-wave",
    "particles",
    "waves",
    "geometric-rotate",
    "light-pulse"
  ];
  return types[Math.floor(Math.random() * types.length)];
}

// Gerar cor aleatória
export function getRandomColor(): string {
  return backgroundColors[Math.floor(Math.random() * backgroundColors.length)].value;
}

// Gerar posição aleatória
export function getRandomPosition(): BackgroundPosition {
  const positions: BackgroundPosition[] = ["full", "top-half", "center", "bottom-half"];
  return positions[Math.floor(Math.random() * positions.length)];
}

// Gerar configuração aleatória completa
export function getRandomBackgroundConfig() {
  return {
    type: getRandomAnimation(),
    position: getRandomPosition(),
    backgroundColor: getRandomColor(),
  };
}

// Gerar filtro de fundo - CORRIGIDO
export function generateBackgroundFilter(
  type: BackgroundAnimationType,
  position: BackgroundPosition,
  width: number,
  height: number,
  duration: number,
  backgroundColor: string = "#000000",
  fps: number = 30
): string {

  // Calcular posição ANTES de qualquer coisa
  let overlayY = 0;
  let overlayHeight = height;

  switch (position) {
    case "top-half":
      overlayHeight = Math.floor(height / 2);
      overlayY = 0;
      break;
    case "center":
      overlayHeight = Math.floor(height / 2);
      overlayY = Math.floor(height / 4);
      break;
    case "bottom-half":
      overlayHeight = Math.floor(height / 2);
      overlayY = Math.floor(height / 2);
      break;
    case "full":
    default:
      overlayHeight = height;
      overlayY = 0;
      break;
  }

  if (type === "none") {
    return `color=c=${backgroundColor.replace('#', '')}:s=${width}x${height}:d=${duration}`;
  }

  const bg = backgroundColor.replace('#', '');

  // TODAS AS ANIMAÇÕES USAM A MESMA ABORDAGEM: GRADIENTE COM GEQ
  // Isso é mais estável no FFmpeg
  return `color=c=${bg}:s=${width}x${height}:d=${duration}[bg];` +
    `nullsrc=s=${width}x${overlayHeight}:d=${duration}[anim];` +
    `[anim]geq=r='128+127*sin(2*PI*T/5+X/200)':` +
    `g='128+127*cos(2*PI*T/5+X/200)':` +
    `b='128+127*sin(2*PI*T/5+X/200+2*PI/3)'[anim2];` +
    `[bg][anim2]overlay=0:${overlayY}`;
}