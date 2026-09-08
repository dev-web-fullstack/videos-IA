// lib/tts.ts

// Configuração
export const TTS_CONFIG = {
  BASE_URL: 'https://api.fish.audio/v1',
  API_KEY: process.env.FISH_AUDIO_API_KEY || '',
  // Voz padrão: Cipriano (português masculino)
  DEFAULT_VOICE: '0b12d715e4c741399594fccb12d4bbe2',
  MODEL: 's2.1-pro-free',
  MAX_TEXT_LENGTH: 5000,
};

// Voz padrão para o componente
export const DEFAULT_VOICE = TTS_CONFIG.DEFAULT_VOICE;

// Interfaces
export interface TTSVoice {
  id: string;
  name: string;
  description?: string;
  gender?: 'male' | 'female' | 'neutral';
  language?: string;
  preview_url?: string;
}

export interface TTSVoiceMap {
  [key: string]: TTSVoice;
}

export interface TTSGenerateParams {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
}

export interface TTSGenerateResponse {
  success: boolean;
  audioPath?: string;
  filename?: string;
  duration?: number;
  size?: number;
  voice?: string;
  text?: string;
  error?: string;
}

// ============================================
// TODAS AS VOZES ENCONTRADAS NA VOICE LIBRARY
// ============================================
export const DEFAULT_VOICES: TTSVoiceMap = {
  // ========== PORTUGUÊS (BRASIL) ==========
  '0b12d715e4c741399594fccb12d4bbe2': {
    id: '0b12d715e4c741399594fccb12d4bbe2',
    name: 'Cipriano',
    gender: 'male',
    language: 'pt-BR',
    description: 'Voz masculina em português brasileiro'
  },
  'ceaf7f569bef42c7bd322d88e3a356b7': {
    id: 'ceaf7f569bef42c7bd322d88e3a356b7',
    name: 'Katherine',
    gender: 'female',
    language: 'pt-BR',
    description: 'Voz feminina em português brasileiro'
  },
  '32eafb61f9b14f3784b7c87259edf017': {
    id: '32eafb61f9b14f3784b7c87259edf017',
    name: 'Chico',
    gender: 'male',
    language: 'pt-BR',
    description: 'Voz masculina em português brasileiro'
  },
  '5ff77a8b3143479f99f73ae6d2c88b09': {
    id: '5ff77a8b3143479f99f73ae6d2c88b09',
    name: 'Camila',
    gender: 'female',
    language: 'pt-BR',
    description: 'Voz feminina em português brasileiro'
  },
  '2fcea8b2e83540fab786983017af01af': {
    id: '2fcea8b2e83540fab786983017af01af',
    name: 'Rodolfo',
    gender: 'male',
    language: 'pt-BR',
    description: 'Voz masculina em português brasileiro'
  },
  '74f28613269e48d19d001f0c39e901dc': {
    id: '74f28613269e48d19d001f0c39e901dc',
    name: 'Lourdes',
    gender: 'female',
    language: 'pt-BR',
    description: 'Voz feminina em português brasileiro'
  },
  '1a61293f8fa8441f804deb10d0b2bc95': {
    id: '1a61293f8fa8441f804deb10d0b2bc95',
    name: 'Adam',
    gender: 'male',
    language: 'pt-BR',
    description: 'Voz masculina em português brasileiro'
  },
  'df1fa6d2ae194b3ebcbae60df48fde35': {
    id: 'df1fa6d2ae194b3ebcbae60df48fde35',
    name: 'Raul',
    gender: 'male',
    language: 'pt-BR',
    description: 'Voz masculina em português brasileiro'
  },
  '8aa1fdc67a3840a398164e185bd657b0': {
    id: '8aa1fdc67a3840a398164e185bd657b0',
    name: 'Emilly',
    gender: 'female',
    language: 'pt-BR',
    description: 'Voz feminina em português brasileiro'
  },
  '4b215a58407c4def88e0892def6421b2': {
    id: '4b215a58407c4def88e0892def6421b2',
    name: 'Chris',
    gender: 'male',
    language: 'pt-BR',
    description: 'Voz masculina em português brasileiro'
  },
  '0889ee96fd82421b8ad9e126c4d73312': {
    id: '0889ee96fd82421b8ad9e126c4d73312',
    name: 'Iberê',
    gender: 'male',
    language: 'pt-BR',
    description: 'Voz masculina em português brasileiro'
  },

  // ========== INGLÊS (EUA / REINO UNIDO) ==========
  'b347db033a6549378b48d00acb0d06cd': {
    id: 'b347db033a6549378b48d00acb0d06cd',
    name: 'Selene',
    gender: 'female',
    language: 'en-US',
    description: 'Voz feminina em inglês americano'
  },
  '933563129e564b19a115bedd57b7406a': {
    id: '933563129e564b19a115bedd57b7406a',
    name: 'Sarah',
    gender: 'female',
    language: 'en-US',
    description: 'Voz feminina em inglês americano'
  },
  'e3cd384158934cc9a01029cd7d278634': {
    id: 'e3cd384158934cc9a01029cd7d278634',
    name: 'Laura',
    gender: 'female',
    language: 'en-US',
    description: 'Voz feminina em inglês americano'
  },
  '536d3a5e000945adb7038665781a4aca': {
    id: '536d3a5e000945adb7038665781a4aca',
    name: 'Ethan',
    gender: 'male',
    language: 'en-US',
    description: 'Voz masculina em inglês americano'
  },
  '9a9cf47702da476aa4629e2506d4a857': {
    id: '9a9cf47702da476aa4629e2506d4a857',
    name: 'Hannah',
    gender: 'female',
    language: 'en-US',
    description: 'Voz feminina em inglês americano'
  },
  '79d0bd3e4e5444b18f7b6d89b5927bf1': {
    id: '79d0bd3e4e5444b18f7b6d89b5927bf1',
    name: 'Jordan',
    gender: 'male',
    language: 'en-US',
    description: 'Voz masculina em inglês americano'
  },
};

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

// Validar texto
export function validateTTSText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Digite um texto para converter em voz' };
  }
  if (text.length > TTS_CONFIG.MAX_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Texto muito longo. Máximo ${TTS_CONFIG.MAX_TEXT_LENGTH} caracteres.`
    };
  }
  return { valid: true };
}

// Formatar texto para TTS
export function formatTextForTTS(text: string): string {
  return text
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Verificar se a API está configurada
export function isTTSConfigured(): boolean {
  return !!TTS_CONFIG.API_KEY && TTS_CONFIG.API_KEY.length > 0;
}

// Verificar se o ID da voz é válido
export function isValidVoiceId(voiceId: string): boolean {
  if (!voiceId || voiceId.length < 8) return false;
  return true;
}

// Obter voz pelo ID
export function getVoiceById(voiceId: string): TTSVoice | undefined {
  return DEFAULT_VOICES[voiceId];
}

// Obter lista de vozes disponíveis
export function getAvailableVoices(): TTSVoiceMap {
  return DEFAULT_VOICES;
}

// Obter a primeira voz disponível (fallback)
export function getFirstAvailableVoice(): string {
  const keys = Object.keys(DEFAULT_VOICES);
  return keys.length > 0 ? keys[0] : DEFAULT_VOICE;
}

// Obter vozes por idioma
export function getVoicesByLanguage(language: string): TTSVoiceMap {
  const result: TTSVoiceMap = {};
  for (const [id, voice] of Object.entries(DEFAULT_VOICES)) {
    if (voice.language === language) {
      result[id] = voice;
    }
  }
  return result;
}

// Obter vozes por gênero
export function getVoicesByGender(gender: 'male' | 'female' | 'neutral'): TTSVoiceMap {
  const result: TTSVoiceMap = {};
  for (const [id, voice] of Object.entries(DEFAULT_VOICES)) {
    if (voice.gender === gender) {
      result[id] = voice;
    }
  }
  return result;
}