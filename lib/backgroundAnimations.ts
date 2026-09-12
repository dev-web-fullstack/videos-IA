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
// 32 TEMAS COM 8 PROMPTS CADA
// ============================================

export const backgroundThemes = {
  // ==========================================
  // TEMAS ORIGINAIS (1-8)
  // ==========================================

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
  },

  // ==========================================
  // SEGUNDO BLOCO DE TEMAS (9-16)
  // ==========================================

  // Tema 9: Praias e Oceanos
  beaches: {
    name: "🏖️ Praias e Oceanos",
    prompts: [
      "tropical beach with turquoise water, white sand, palm trees, paradise, high quality, 4k, serene",
      "ocean waves crashing on rocky shore, dramatic sea, high quality, 4k, powerful",
      "sunset over calm beach, golden sand, peaceful ocean, high quality, 4k, beautiful",
      "underwater coral reef scene, colorful fish, tropical ocean, high quality, 4k, vibrant",
      "beach with palm trees silhouette at sunset, tropical paradise, high quality, 4k, cinematic",
      "secluded beach with crystal clear water, peaceful paradise, high quality, 4k, serene",
      "ocean horizon with sailing boat, calm sea, high quality, 4k, peaceful",
      "tropical island with white sand beach, turquoise lagoon, high quality, 4k, beautiful"
    ]
  },

  // Tema 10: Desertos
  deserts: {
    name: "🏜️ Desertos",
    prompts: [
      "golden sand dunes at sunset, dramatic desert landscape, high quality, 4k, cinematic",
      "desert with cactus and dramatic sky, western landscape, high quality, 4k, beautiful",
      "sahara desert with camel caravan silhouette, golden light, high quality, 4k, majestic",
      "desert oasis with palm trees and water, peaceful scene, high quality, 4k, serene",
      "starry night over desert, Milky Way, magical atmosphere, high quality, 4k, beautiful",
      "desert canyon with red rocks, dramatic landscape, high quality, 4k, cinematic",
      "sand dunes with long shadows, minimalist desert, high quality, 4k, elegant",
      "desert sunrise with warm golden tones, peaceful atmosphere, high quality, 4k, serene"
    ]
  },

  // Tema 11: Cidades e Urbanismo
  cities: {
    name: "🌃 Cidades e Urbanismo",
    prompts: [
      "city skyline at night with lights, urban landscape, high quality, 4k, cinematic",
      "tokyo street at night with neon lights, cyberpunk atmosphere, high quality, 4k, vibrant",
      "paris skyline at sunset with Eiffel Tower, romantic city, high quality, 4k, beautiful",
      "new york city aerial view at night, glowing lights, high quality, 4k, cinematic",
      "european old town street with cobblestones, charming city, high quality, 4k, peaceful",
      "modern city with glass skyscrapers, urban architecture, high quality, 4k, modern",
      "venice canals with gondolas, italian city, high quality, 4k, romantic",
      "cityscape at golden hour, warm light on buildings, high quality, 4k, beautiful"
    ]
  },

  // Tema 12: Espaço e Galáxias
  space: {
    name: "🌌 Espaço e Galáxias",
    prompts: [
      "colorful nebula in deep space, cosmic clouds, stars, high quality, 4k, beautiful",
      "galaxy spiral with millions of stars, cosmic scene, high quality, 4k, majestic",
      "earth from space with blue oceans and clouds, high quality, 4k, breathtaking",
      "milky way over mountain landscape, astrophotography, high quality, 4k, magical",
      "aurora borealis over snowy landscape, northern lights, high quality, 4k, colorful",
      "cosmic nebula with purple and blue colors, deep space, high quality, 4k, stunning",
      "starry night sky with shooting star, peaceful cosmos, high quality, 4k, serene",
      "moon surface with earth rising, space landscape, high quality, 4k, cinematic"
    ]
  },

  // Tema 13: Neve e Inverno
  winter: {
    name: "❄️ Neve e Inverno",
    prompts: [
      "snowy forest with snow-covered trees, peaceful winter, high quality, 4k, serene",
      "frozen lake with snow, winter landscape, high quality, 4k, beautiful",
      "snowy mountain village with warm lights, cozy winter, high quality, 4k, charming",
      "winter sunset over snowy fields, golden light on snow, high quality, 4k, warm",
      "ice crystals and frost patterns, macro winter, high quality, 4k, elegant",
      "snowy cabin in the woods, cozy winter scene, high quality, 4k, peaceful",
      "aurora over snowy landscape, northern lights, high quality, 4k, magical",
      "winter forest with falling snow, serene atmosphere, high quality, 4k, beautiful"
    ]
  },

  // Tema 14: Flores e Jardins
  flowers: {
    name: "🌸 Flores e Jardins",
    prompts: [
      "cherry blossom trees in full bloom, pink flowers, high quality, 4k, beautiful",
      "tulip field in spring, colorful flowers, high quality, 4k, vibrant",
      "japanese garden with cherry blossoms, peaceful, high quality, 4k, serene",
      "sunflower field at sunset, golden flowers, high quality, 4k, warm",
      "lavender field in provence, purple flowers, high quality, 4k, beautiful",
      "rose garden with various colors, romantic garden, high quality, 4k, elegant",
      "lotus flowers on pond, peaceful scene, high quality, 4k, serene",
      "spring garden with butterflies, colorful flowers, high quality, 4k, vibrant"
    ]
  },

  // Tema 15: Minimalista e Geométrico
  minimal: {
    name: "⬜ Minimalista",
    prompts: [
      "minimalist gradient background, soft colors, clean design, high quality, 4k, elegant",
      "abstract geometric shapes, modern minimal, high quality, 4k, sophisticated",
      "soft pastel gradient, minimalist aesthetic, high quality, 4k, calm",
      "black and white minimalist landscape, dramatic contrast, high quality, 4k, artistic",
      "simple line art background, clean minimalist, high quality, 4k, modern",
      "gradient mesh background, colorful minimal, high quality, 4k, vibrant",
      "soft blurred abstract shapes, minimalist, high quality, 4k, elegant",
      "minimalist mountain silhouette, clean design, high quality, 4k, serene"
    ]
  },

  // Tema 16: Tecnologia e Futurista
  futuristic: {
    name: "🚀 Futurista",
    prompts: [
      "futuristic city with flying cars, sci-fi landscape, high quality, 4k, cinematic",
      "abstract technology background with circuits, digital art, high quality, 4k, modern",
      "holographic geometric shapes, futuristic design, high quality, 4k, vibrant",
      "cyberpunk city with neon lights, futuristic atmosphere, high quality, 4k, cinematic",
      "space station orbiting earth, sci-fi scene, high quality, 4k, majestic",
      "digital matrix background, green code, high quality, 4k, tech",
      "futuristic architecture with glass and light, modern design, high quality, 4k, elegant",
      "abstract energy waves, futuristic pattern, high quality, 4k, dynamic"
    ]
  },

  // ==========================================
  // TERCEIRO BLOCO DE TEMAS (17-32)
  // ==========================================

  // Tema 17: Cachoeiras
  waterfalls: {
    name: "💧 Cachoeiras",
    prompts: [
      "majestic waterfall in tropical jungle, cascading water, lush vegetation, high quality, 4k, breathtaking",
      "waterfall with rainbow mist, sunlight through water, magical atmosphere, high quality, 4k, beautiful",
      "icelandic waterfall with dramatic cliffs, powerful nature, high quality, 4k, cinematic",
      "hidden waterfall in forest, serene nature, high quality, 4k, peaceful",
      "waterfall at sunset with golden light, warm colors, high quality, 4k, beautiful",
      "frozen waterfall in winter, ice formations, high quality, 4k, stunning",
      "tropical waterfall with turquoise pool, paradise scene, high quality, 4k, serene",
      "waterfall cascading over mossy rocks, green nature, high quality, 4k, tranquil"
    ]
  },

  // Tema 18: Outono
  autumn: {
    name: "🍂 Outono",
    prompts: [
      "autumn forest with golden and red leaves, colorful landscape, high quality, 4k, beautiful",
      "autumn path through forest, fallen leaves, cozy atmosphere, high quality, 4k, serene",
      "autumn lake with reflections of colorful trees, peaceful nature, high quality, 4k, beautiful",
      "autumn countryside with orange trees, rural landscape, high quality, 4k, warm",
      "misty autumn morning in forest, golden light, high quality, 4k, atmospheric",
      "autumn park with benches and falling leaves, peaceful scene, high quality, 4k, serene",
      "red and orange autumn leaves close up, macro photography, high quality, 4k, vibrant",
      "autumn mountain landscape with colorful trees, high quality, 4k, majestic"
    ]
  },

  // Tema 19: Primavera
  spring: {
    name: "🌱 Primavera",
    prompts: [
      "spring meadow with fresh green grass and flowers, vibrant nature, high quality, 4k, beautiful",
      "cherry blossom trees along a path, pink petals, high quality, 4k, romantic",
      "spring garden with blooming flowers, colorful nature, high quality, 4k, vibrant",
      "spring forest with new leaves, fresh green, high quality, 4k, peaceful",
      "spring lake with flowers on shore, reflections, high quality, 4k, serene",
      "spring rain on flowers, water droplets, high quality, 4k, fresh",
      "spring countryside with blooming trees, high quality, 4k, beautiful",
      "spring sunrise over green fields, golden light, high quality, 4k, peaceful"
    ]
  },

  // Tema 20: Verão
  summer: {
    name: "☀️ Verão",
    prompts: [
      "summer beach with bright sun, blue sky, tropical paradise, high quality, 4k, vibrant",
      "summer field with sunflowers, golden light, high quality, 4k, warm",
      "summer lake with people swimming, fun atmosphere, high quality, 4k, beautiful",
      "summer sunset over ocean, warm colors, high quality, 4k, serene",
      "tropical summer island with palm trees, turquoise water, high quality, 4k, paradise",
      "summer garden with colorful flowers, butterflies, high quality, 4k, vibrant",
      "summer mountain landscape with green meadows, high quality, 4k, peaceful",
      "summer picnic in park, sunny day, high quality, 4k, cheerful"
    ]
  },

  // Tema 21: Pôr do Sol no Mar
  seaSunset: {
    name: "🌊 Pôr do Sol no Mar",
    prompts: [
      "sunset over calm ocean, golden reflections on water, peaceful scene, high quality, 4k, serene",
      "dramatic sunset over rough sea, powerful waves, high quality, 4k, cinematic",
      "sunset over tropical beach with palm trees, paradise, high quality, 4k, beautiful",
      "sunset over ocean with sailing boat silhouette, romantic scene, high quality, 4k, serene",
      "sunset over rocky coast with lighthouse, dramatic landscape, high quality, 4k, cinematic",
      "sunset over calm bay with mountains, reflections, high quality, 4k, peaceful",
      "sunset over ocean with clouds, colorful sky, high quality, 4k, beautiful",
      "sunset over sea with gentle waves on beach, tranquil, high quality, 4k, serene"
    ]
  },

  // Tema 22: Céu Noturno
  nightSky: {
    name: "🌙 Céu Noturno",
    prompts: [
      "starry night sky with Milky Way, astrophotography, high quality, 4k, magical",
      "night sky with full moon and stars, serene, high quality, 4k, beautiful",
      "northern lights aurora borealis, colorful sky, high quality, 4k, stunning",
      "starry night over mountain lake, reflections, high quality, 4k, peaceful",
      "night sky with shooting stars, magical moment, high quality, 4k, beautiful",
      "moonlit night landscape, silvery light, high quality, 4k, serene",
      "starry desert night, Milky Way over dunes, high quality, 4k, majestic",
      "night sky with clouds and moon, dramatic, high quality, 4k, atmospheric"
    ]
  },

  // Tema 23: Vulcões
  volcanoes: {
    name: "🌋 Vulcões",
    prompts: [
      "active volcano erupting at night, lava flow, dramatic scene, high quality, 4k, cinematic",
      "volcano with smoke and ash, dramatic sky, high quality, 4k, powerful",
      "lava field with glowing cracks, volcanic landscape, high quality, 4k, intense",
      "volcano at sunset with orange sky, majestic, high quality, 4k, beautiful",
      "volcanic crater lake with turquoise water, unique landscape, high quality, 4k, stunning",
      "volcano silhouette at sunrise, dramatic, high quality, 4k, cinematic",
      "lava meets ocean, steam and fire, high quality, 4k, dramatic",
      "volcanic landscape with black sand, unique nature, high quality, 4k, fascinating"
    ]
  },

  // Tema 24: Cavernas
  caves: {
    name: "🕳️ Cavernas",
    prompts: [
      "crystal cave with glowing formations, magical underground, high quality, 4k, stunning",
      "limestone cave with stalactites, natural wonder, high quality, 4k, majestic",
      "underwater cave with turquoise water, mysterious, high quality, 4k, beautiful",
      "ice cave with blue light, winter wonder, high quality, 4k, breathtaking",
      "cave with light beam from opening, dramatic, high quality, 4k, cinematic",
      "lava tube cave with colorful minerals, unique, high quality, 4k, fascinating",
      "cave entrance in forest, mysterious, high quality, 4k, atmospheric",
      "cave with underground river, serene, high quality, 4k, peaceful"
    ]
  },

  // Tema 25: Ilhas e Atóis
  islands: {
    name: "🏝️ Ilhas e Atóis",
    prompts: [
      "tropical island with white sand beach, turquoise water, paradise, high quality, 4k, beautiful",
      "aerial view of tropical atoll, crystal clear water, high quality, 4k, stunning",
      "remote island with palm trees, secluded paradise, high quality, 4k, serene",
      "island sunset with palm silhouettes, romantic, high quality, 4k, beautiful",
      "volcanic island with black sand beach, unique, high quality, 4k, fascinating",
      "island with overwater bungalows, luxury, high quality, 4k, elegant",
      "small island with lighthouse, peaceful, high quality, 4k, serene",
      "tropical island from above, turquoise lagoon, high quality, 4k, breathtaking"
    ]
  },

  // Tema 26: Jardins Zen
  zen: {
    name: "🧘 Jardins Zen",
    prompts: [
      "japanese zen garden with raked sand, peaceful, high quality, 4k, serene",
      "zen garden with stones and moss, minimal, high quality, 4k, elegant",
      "japanese garden with pond and bridge, tranquil, high quality, 4k, beautiful",
      "zen temple garden with maple trees, high quality, 4k, peaceful",
      "rock garden with bamboo, minimalist, high quality, 4k, serene",
      "zen garden with cherry blossoms, spring, high quality, 4k, beautiful",
      "japanese tea garden, peaceful, high quality, 4k, tranquil",
      "zen garden at sunrise, soft light, high quality, 4k, meditative"
    ]
  },

  // Tema 27: Castelos e Palácios
  castles: {
    name: "🏰 Castelos e Palácios",
    prompts: [
      "medieval castle on hill at sunset, dramatic, high quality, 4k, majestic",
      "fairytale castle with towers, magical, high quality, 4k, beautiful",
      "castle by lake with reflections, peaceful, high quality, 4k, serene",
      "ruined castle in mist, mysterious, high quality, 4k, atmospheric",
      "french chateau with gardens, elegant, high quality, 4k, beautiful",
      "german castle in forest, romantic, high quality, 4k, cinematic",
      "castle at night with lights, dramatic, high quality, 4k, majestic",
      "scottish castle on cliff, dramatic coast, high quality, 4k, cinematic"
    ]
  },

  // Tema 28: Pontes e Arquitetura
  bridges: {
    name: "🌉 Pontes e Arquitetura",
    prompts: [
      "golden gate bridge at sunset, iconic, high quality, 4k, beautiful",
      "ancient stone bridge in countryside, charming, high quality, 4k, peaceful",
      "suspension bridge in mountains, dramatic, high quality, 4k, cinematic",
      "bridge over calm river with reflections, serene, high quality, 4k, beautiful",
      "modern bridge with lights at night, urban, high quality, 4k, cinematic",
      "wooden bridge in forest, peaceful, high quality, 4k, serene",
      "bridge in japanese garden, elegant, high quality, 4k, beautiful",
      "viaduct in misty valley, dramatic, high quality, 4k, atmospheric"
    ]
  },

  // Tema 29: Fazendas e Vida Rural
  farm: {
    name: "🚜 Fazendas e Vida Rural",
    prompts: [
      "countryside farm with barn and fields, peaceful, high quality, 4k, serene",
      "wheat field with tractor at sunset, rural, high quality, 4k, warm",
      "farmhouse with garden and animals, cozy, high quality, 4k, charming",
      "vineyard on hills at sunset, wine country, high quality, 4k, beautiful",
      "rural landscape with windmill, classic, high quality, 4k, peaceful",
      "farm at sunrise with mist, serene, high quality, 4k, beautiful",
      "countryside road with trees, peaceful, high quality, 4k, serene",
      "farm fields with rolling hills, rural, high quality, 4k, beautiful"
    ]
  },

  // Tema 30: Música e Arte
  music: {
    name: "🎵 Música e Arte",
    prompts: [
      "piano in elegant room with light, artistic, high quality, 4k, beautiful",
      "guitar on beach at sunset, musical, high quality, 4k, serene",
      "vinyl records and music player, retro, high quality, 4k, nostalgic",
      "concert stage with lights, musical, high quality, 4k, energetic",
      "musical notes abstract art, creative, high quality, 4k, artistic",
      "violin on wooden table, classical, high quality, 4k, elegant",
      "music studio with instruments, creative, high quality, 4k, inspiring",
      "abstract music waves, colorful, high quality, 4k, vibrant"
    ]
  },

  // Tema 31: Comida e Culinária
  food: {
    name: "🍽️ Comida e Culinária",
    prompts: [
      "rustic table with fresh vegetables, farm to table, high quality, 4k, appetizing",
      "italian pasta with herbs, food photography, high quality, 4k, delicious",
      "breakfast spread with coffee, morning, high quality, 4k, cozy",
      "fresh fruits on wooden board, colorful, high quality, 4k, vibrant",
      "sushi platter with wasabi, japanese cuisine, high quality, 4k, elegant",
      "coffee cup with latte art, cafe, high quality, 4k, warm",
      "dessert with berries, sweet, high quality, 4k, beautiful",
      "spices and herbs in bowls, colorful, high quality, 4k, aromatic"
    ]
  },

  // Tema 32: Yoga e Meditação
  yoga: {
    name: "🧘‍♀️ Yoga e Meditação",
    prompts: [
      "yoga pose at sunrise on beach, peaceful, high quality, 4k, serene",
      "meditation in nature, calm, high quality, 4k, peaceful",
      "yoga studio with natural light, minimal, high quality, 4k, serene",
      "meditation garden with lotus flowers, tranquil, high quality, 4k, beautiful",
      "yoga on mountain top at sunrise, inspiring, high quality, 4k, majestic",
      "meditation with candles and incense, spiritual, high quality, 4k, peaceful",
      "yoga in forest clearing, natural, high quality, 4k, serene",
      "sunrise meditation by lake, calm, high quality, 4k, beautiful"
    ]
  }
};

// Lista de temas para seleção
export const themeKeys = Object.keys(backgroundThemes) as Array<keyof typeof backgroundThemes>;

// ============================================
// FUNÇÕES
// ============================================

// Função para obter um prompt aleatório de um tema específico
export function getRandomPromptFromTheme(themeKey: keyof typeof backgroundThemes): string {
  const theme = backgroundThemes[themeKey];
  if (!theme) {
    const keys = Object.keys(backgroundThemes) as Array<keyof typeof backgroundThemes>;
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return backgroundThemes[randomKey].prompts[0];
  }
  const prompts = theme.prompts;
  return prompts[Math.floor(Math.random() * prompts.length)];
}

// Função para obter um tema aleatório (para o botão de aleatório)
export function getRandomTheme(): keyof typeof backgroundThemes {
  return themeKeys[Math.floor(Math.random() * themeKeys.length)];
}

// Função para obter o nome do tema - com fallback para "custom"
export function getThemeName(themeKey: string): string {
  if (themeKey === "custom") {
    return "✏️ Personalizado";
  }

  if (themeKey && themeKey in backgroundThemes) {
    return backgroundThemes[themeKey as keyof typeof backgroundThemes].name;
  }

  return themeKey || "Tema";
}

// Gerar URL da Pollinations.ai com base no prompt
export function generatePollinationsUrl(prompt: string, width: number = 1920, height: number = 1080): string {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Date.now().toString().slice(-6);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=${width}&height=${height}&nologo=true&seed=${seed}&enhance=true&quality=high`;
}

// Gerar cor aleatória das predefinidas
export function getRandomColor(): string {
  return backgroundColors[Math.floor(Math.random() * backgroundColors.length)].value;
}

// Gerar cor hexadecimal aleatória
export function getRandomHexColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Verificar se um tema é válido
export function isValidTheme(themeKey: string): boolean {
  return themeKey in backgroundThemes;
}

// Verificar se é um tema personalizado
export function isCustomTheme(themeKey: string): boolean {
  return themeKey === "custom";
}