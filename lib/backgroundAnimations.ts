// lib/backgroundAnimations.ts

export type BackgroundType =
  | "solid"
  | "ai-generated";

export interface BackgroundConfig {
  type: BackgroundType;
  backgroundColor?: string;
  imageUrl?: string;
  prompt?: string;
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

// Temas para paisagens
const landscapeThemes = [
  // Por do sol
  'beautiful sunset over mountains, golden orange and pink sky, dramatic clouds, peaceful landscape, high quality, 4k, realistic',
  'sunset over the sea, golden light reflecting on water, warm colors, tranquil scene, high quality, 4k, realistic',
  'dramatic sunset over desert dunes, orange and purple sky, silhouette of mountains, high quality, 4k, realistic',
  'sunset over a calm lake, golden reflections, pine trees silhouette, peaceful atmosphere, high quality, 4k, realistic',

  // Nascer do sol
  'sunrise over mountains, golden light, mist in valleys, beautiful landscape, high quality, 4k, realistic',
  'sunrise over the ocean, golden pink sky, gentle waves, peaceful morning, high quality, 4k, realistic',
  'sunrise in the forest, rays of light through trees, magical atmosphere, high quality, 4k, realistic',
  'sunrise over green hills, golden light, mist, beautiful rural landscape, high quality, 4k, realistic',

  // Montanhas
  'snow-capped mountains at golden hour, dramatic landscape, alpine beauty, high quality, 4k, realistic',
  'mountain lake with reflections, crystal clear water, majestic peaks, high quality, 4k, realistic',
  'misty mountains at sunrise, layers of hills, atmospheric landscape, high quality, 4k, realistic',
  'rocky mountains with waterfall, nature landscape, high quality, 4k, realistic',

  // Florestas
  'sunlight through forest canopy, green trees, peaceful woodland, high quality, 4k, realistic',
  'autumn forest with golden leaves, colorful landscape, high quality, 4k, realistic',
  'pine forest at sunset, warm light through trees, serene landscape, high quality, 4k, realistic',
  'tropical forest with waterfall, lush vegetation, nature beauty, high quality, 4k, realistic',

  // Campos e vales
  'green valley with flowers, rolling hills, beautiful landscape, high quality, 4k, realistic',
  'golden wheat field at sunset, rural landscape, warm colors, high quality, 4k, realistic',
  'lavender field in bloom, purple and green, beautiful landscape, high quality, 4k, realistic',
  'spring meadow with flowers, vibrant colors, peaceful landscape, high quality, 4k, realistic',

  // Lagos e rios
  'calm lake at sunset, reflections of trees, peaceful nature, high quality, 4k, realistic',
  'river through a valley, crystal clear water, beautiful landscape, high quality, 4k, realistic',
  'mountain lake with turquoise water, stunning landscape, high quality, 4k, realistic',
  'waterfall in a tropical forest, beautiful nature, high quality, 4k, realistic',

  // Costas e praias
  'beautiful beach at sunset, golden sand, calm waves, paradise, high quality, 4k, realistic',
  'cliff by the sea, dramatic coastline, waves crashing, high quality, 4k, realistic',
  'tropical beach with palm trees, turquoise water, paradise landscape, high quality, 4k, realistic',

  // Céu e nuvens
  'golden sky with clouds, beautiful sunset, atmospheric, high quality, 4k, realistic',
  'dramatic clouds at sunrise, colorful sky, landscape, high quality, 4k, realistic',
  'starry night sky with Milky Way, magical atmosphere, high quality, 4k, realistic',
];

// Mapeamento de palavras-chave para temas específicos (mantido para compatibilidade)
const keywords = {
  natureza: ['natureza', 'paisagem', 'montanha', 'floresta', 'flor', 'animal', 'beleza'],
  luz: ['luz', 'sol', 'nascer', 'pôr', 'brilho', 'clareza'],
  paz: ['paz', 'calma', 'serenidade', 'tranquilidade', 'harmonia'],
};

// Detecta o tema do texto (simplificado para paisagens)
function detectTheme(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('natureza') || lowerText.includes('paisagem') ||
    lowerText.includes('montanha') || lowerText.includes('floresta')) {
    return 'natureza';
  }
  if (lowerText.includes('luz') || lowerText.includes('sol') ||
    lowerText.includes('nascer') || lowerText.includes('pôr')) {
    return 'luz';
  }
  if (lowerText.includes('paz') || lowerText.includes('calma') ||
    lowerText.includes('serenidade') || lowerText.includes('tranquilidade')) {
    return 'paz';
  }
  return 'natureza';
}

// Gera um prompt baseado no texto do vídeo
export function generatePromptFromText(text: string): string {
  // Se não houver texto, usa um prompt aleatório
  if (!text || text.trim().length === 0) {
    return landscapeThemes[Math.floor(Math.random() * landscapeThemes.length)];
  }

  const theme = detectTheme(text);

  // Filtrar prompts baseado no tema
  let filteredPrompts = [...landscapeThemes];

  if (theme === 'natureza') {
    filteredPrompts = landscapeThemes.filter(p =>
      p.includes('forest') || p.includes('mountain') || p.includes('valley') ||
      p.includes('tree') || p.includes('flower') || p.includes('green')
    );
  } else if (theme === 'luz') {
    filteredPrompts = landscapeThemes.filter(p =>
      p.includes('sun') || p.includes('light') || p.includes('golden') ||
      p.includes('dawn') || p.includes('dusk') || p.includes('ray')
    );
  } else if (theme === 'paz') {
    filteredPrompts = landscapeThemes.filter(p =>
      p.includes('calm') || p.includes('peaceful') || p.includes('lake') ||
      p.includes('serene') || p.includes('quiet') || p.includes('still')
    );
  }

  // Se não houver prompts filtrados, usa todos
  if (filteredPrompts.length === 0) {
    filteredPrompts = landscapeThemes;
  }

  const randomPrompt = filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)];

  // Adicionar estilo cristão suave para manter o tema
  return `${randomPrompt}, divine light, peaceful atmosphere, created by God`;
}

// Gerar URL da Pollinations.ai com base no texto
export function generatePollinationsUrlFromText(
  text: string,
  width: number = 1920,
  height: number = 1080
): string {
  const prompt = generatePromptFromText(text);
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Date.now().toString().slice(-6);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=${width}&height=${height}&nologo=true&seed=${seed}&enhance=true&quality=high`;
}

// Gerar URL da Pollinations.ai (compatibilidade)
export function generatePollinationsUrl(prompt: string, width: number = 1920, height: number = 1080): string {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Date.now().toString().slice(-6);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=${width}&height=${height}&nologo=true&seed=${seed}&enhance=true&quality=high`;
}

// Gerar cor aleatória
export function getRandomColor(): string {
  return backgroundColors[Math.floor(Math.random() * backgroundColors.length)].value;
}