// lib/backgroundAnimations.ts

export type BackgroundType =
  | "solid"
  | "ai-generated";

export interface BackgroundConfig {
  type: BackgroundType;
  backgroundColor?: string;
  imageUrl?: string;
  prompt?: string;
  theme?: string;
}

// Cores disponíveis para fundo sólido
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
  { value: "#1a0a0a", label: "Vermelho escuro" },
  { value: "#0a1a0a", label: "Verde escuro" },
  { value: "#1a0a1a", label: "Rosa escuro" },
  { value: "#0a0a1a", label: "Azul profundo" },
];

// ============================================
// 8 TEMAS COM 8 PROMPTS CADA
// ============================================

export const backgroundThemes = {
  // Tema 1: Por do Sol
  sunset: {
    name: "🌅 Por do Sol",
    prompts: [
      "dramatic sunset over mountains, orange and purple sky, golden light, beautiful landscape, high quality, 4k, peaceful atmosphere",
      "sunset over the ocean, golden reflections on water, warm colors, tranquil scene, high quality, 4k, serene",
      "spectacular sunset with clouds, pink and orange sky, dramatic lighting, landscape photography, high quality, 4k",
      "sunset in the desert, golden dunes, warm tones, peaceful desert landscape, high quality, 4k, cinematic",
      "sunset over a calm lake, mirror reflections, golden hour, beautiful nature, high quality, 4k, tranquil",
      "romantic sunset with silhouetted trees, warm glow, peaceful evening, high quality, 4k, serene",
      "sunset over rolling hills, golden light, beautiful countryside, high quality, 4k, peaceful landscape",
      "tropical sunset with palm trees, vibrant colors, paradise scene, high quality, 4k, beautiful"
    ]
  },

  // Tema 2: Nascer do Sol
  sunrise: {
    name: "🌄 Nascer do Sol",
    prompts: [
      "golden sunrise over mountains, mist in valleys, beautiful landscape, high quality, 4k, peaceful morning",
      "sunrise over the ocean, golden pink sky, gentle waves, peaceful morning, high quality, 4k, serene",
      "sunrise in the forest, rays of light through trees, magical atmosphere, high quality, 4k, beautiful",
      "sunrise over green hills, golden light, misty landscape, high quality, 4k, peaceful",
      "sunrise over a calm river, golden reflections, peaceful nature, high quality, 4k, tranquil",
      "sunrise over the city skyline, golden light, beautiful urban landscape, high quality, 4k, cinematic",
      "sunrise over a wheat field, golden light, beautiful countryside, high quality, 4k, serene",
      "sunrise over the desert, warm golden tones, peaceful desert landscape, high quality, 4k, beautiful"
    ]
  },

  // Tema 3: Montanhas
  mountains: {
    name: "🏔️ Montanhas",
    prompts: [
      "snow-capped mountains at golden hour, dramatic landscape, alpine beauty, high quality, 4k, majestic",
      "mountain lake with crystal clear reflections, stunning landscape, high quality, 4k, peaceful",
      "misty mountains at sunrise, layers of hills, atmospheric landscape, high quality, 4k, beautiful",
      "rocky mountains with cascading waterfall, nature landscape, high quality, 4k, serene",
      "mountain range with golden light, dramatic peaks, beautiful landscape, high quality, 4k, majestic",
      "alpine valley with mountains, green meadows, stunning nature, high quality, 4k, peaceful",
      "mountain sunrise with clouds, dramatic lighting, beautiful landscape, high quality, 4k, cinematic",
      "snowy mountain peaks, clear blue sky, majestic landscape, high quality, 4k, serene"
    ]
  },

  // Tema 4: Florestas
  forests: {
    name: "🌲 Florestas",
    prompts: [
      "sunlight through forest canopy, green trees, peaceful woodland, high quality, 4k, serene",
      "autumn forest with golden leaves, colorful landscape, beautiful nature, high quality, 4k, warm",
      "pine forest at sunset, warm light through trees, serene landscape, high quality, 4k, peaceful",
      "tropical forest with waterfall, lush vegetation, stunning nature, high quality, 4k, beautiful",
      "mystical forest with fog, ethereal atmosphere, beautiful landscape, high quality, 4k, magical",
      "green forest path, sunlight rays, peaceful woodland, high quality, 4k, serene",
      "winter forest with snow, peaceful white landscape, high quality, 4k, tranquil",
      "forest in spring with flowers, vibrant nature, high quality, 4k, beautiful"
    ]
  },

  // Tema 5: Lagos e Rios
  lakes: {
    name: "🏞️ Lagos e Rios",
    prompts: [
      "calm lake at sunset, reflections of mountains, peaceful nature, high quality, 4k, serene",
      "river through a valley, crystal clear water, beautiful landscape, high quality, 4k, tranquil",
      "mountain lake with turquoise water, stunning landscape, high quality, 4k, peaceful",
      "peaceful lake with mist, reflections, serene nature, high quality, 4k, beautiful",
      "river in the forest, golden light, peaceful nature, high quality, 4k, serene",
      "lake surrounded by autumn trees, vibrant colors, beautiful landscape, high quality, 4k, warm",
      "crystal clear mountain stream, pure water, high quality, 4k, peaceful",
      "lake with water lilies, peaceful nature, high quality, 4k, beautiful"
    ]
  },

  // Tema 6: Campos e Vales
  fields: {
    name: "🌾 Campos e Vales",
    prompts: [
      "green valley with wildflowers, rolling hills, beautiful landscape, high quality, 4k, peaceful",
      "golden wheat field at sunset, rural landscape, warm colors, high quality, 4k, serene",
      "lavender field in bloom, purple and green, beautiful landscape, high quality, 4k, colorful",
      "spring meadow with flowers, vibrant colors, peaceful landscape, high quality, 4k, beautiful",
      "countryside with green fields, peaceful landscape, high quality, 4k, serene",
      "valley with mist, dramatic landscape, high quality, 4k, atmospheric",
      "golden fields at golden hour, beautiful rural landscape, high quality, 4k, warm",
      "flower field in spring, colorful nature, high quality, 4k, beautiful"
    ]
  },

  // Tema 7: Céu e Nuvens
  clouds: {
    name: "☁️ Céu e Nuvens",
    prompts: [
      "dramatic clouds at sunset, colorful sky, atmospheric, high quality, 4k, beautiful",
      "golden sky with clouds, warm colors, peaceful atmosphere, high quality, 4k, serene",
      "starry night sky with Milky Way, magical atmosphere, high quality, 4k, beautiful",
      "clouds with golden light at sunrise, dramatic sky, high quality, 4k, cinematic",
      "blue sky with white clouds, peaceful atmosphere, high quality, 4k, serene",
      "storm clouds with dramatic lighting, powerful atmosphere, high quality, 4k, dramatic",
      "pink clouds at sunset, beautiful sky, high quality, 4k, romantic",
      "golden sunset clouds, warm and peaceful, high quality, 4k, beautiful"
    ]
  },

  // Tema 8: Abstrato
  abstract: {
    name: "🎨 Abstrato",
    prompts: [
      "flowing colors in abstract art, smooth gradient, vibrant, high quality, 4k, beautiful",
      "golden light particles, abstract background, warm tones, high quality, 4k, elegant",
      "abstract landscape with bold colors, artistic, high quality, 4k, vibrant",
      "soft gradient with golden and blue tones, abstract art, high quality, 4k, peaceful",
      "abstract geometry with light effects, modern art, high quality, 4k, sophisticated",
      "golden fluid art, abstract waves, warm colors, high quality, 4k, elegant",
      "abstract sunset colors, artistic background, high quality, 4k, vibrant",
      "light and shadow abstract, dramatic contrast, high quality, 4k, artistic"
    ]
  }
};

// Lista de temas para seleção
export const themeKeys = Object.keys(backgroundThemes) as Array<keyof typeof backgroundThemes>;

// Função para obter um prompt aleatório de um tema específico
export function getRandomPromptFromTheme(themeKey: keyof typeof backgroundThemes): string {
  const theme = backgroundThemes[themeKey];
  const prompts = theme.prompts;
  return prompts[Math.floor(Math.random() * prompts.length)];
}

// Função para obter um tema aleatório (para o botão de aleatório)
export function getRandomTheme(): keyof typeof backgroundThemes {
  return themeKeys[Math.floor(Math.random() * themeKeys.length)];
}

// Função para obter o nome do tema
export function getThemeName(themeKey: keyof typeof backgroundThemes): string {
  return backgroundThemes[themeKey].name;
}

// Gerar URL da Pollinations.ai com base no prompt
export function generatePollinationsUrl(prompt: string, width: number = 1920, height: number = 1080): string {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Date.now().toString().slice(-6);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=${width}&height=${height}&nologo=true&seed=${seed}&enhance=true&quality=high`;
}

// Gerar cor aleatória
export function getRandomColor(): string {
  return backgroundColors[Math.floor(Math.random() * backgroundColors.length)].value;
}