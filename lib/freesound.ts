// lib/freesound.ts

// Configuração da API Freesound
export const FREESOUND_CONFIG = {
  BASE_URL: 'https://freesound.org/apiv2',
  API_KEY: process.env.FREESOUND_API_KEY || '',
};

// Interface do resultado da busca
export interface SoundResult {
  id: number;
  name: string;
  description: string;
  tags: string[];
  duration: number;
  download_url: string;
  preview_url: string;
  username: string;
  license: string;
  created: string;
  bitrate: number;
  filesize: number;
  type: string;
}

// Interface da resposta da API
export interface FreesoundResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FreesoundResult[];
}

export interface FreesoundResult {
  id: number;
  name: string;
  description: string;
  tags: string[];
  duration: number;
  previews: {
    'preview-hq-mp3'?: string;
    'preview-lq-mp3'?: string;
    'preview-hq-ogg'?: string;
  };
  download: string;
  username: string;
  license: string;
  created: string;
  bitrate: number;
  filesize: number;
  type: string;
  url: string;
}

// Mapear resultado da API para nossa interface
export function mapFreesoundResult(result: FreesoundResult): SoundResult {
  const previewUrl = result.previews?.['preview-hq-mp3'] ||
    result.previews?.['preview-lq-mp3'] ||
    result.previews?.['preview-hq-ogg'] || '';

  return {
    id: result.id,
    name: result.name,
    description: result.description || 'Sem descrição',
    tags: result.tags || [],
    duration: result.duration || 0,
    download_url: result.download,
    preview_url: previewUrl,
    username: result.username || 'Desconhecido',
    license: result.license || 'Creative Commons',
    created: result.created || '',
    bitrate: result.bitrate || 0,
    filesize: result.filesize || 0,
    type: result.type || 'audio',
  };
}

// Verificar se a API está configurada
export function isFreesoundConfigured(): boolean {
  const configured = !!FREESOUND_CONFIG.API_KEY && FREESOUND_CONFIG.API_KEY.length > 0;
  if (!configured) {
    console.warn('⚠️ FREESOUND_API_KEY não configurada no .env.local');
  } else {
    console.log(`✅ Freesound API configurada: ${FREESOUND_CONFIG.API_KEY.substring(0, 4)}...`);
  }
  return configured;
}

// Construir URL de busca - LIMITADA A 3 MINUTOS (180 segundos)
export function buildSearchUrl(params: {
  query: string;
  page?: number;
  pageSize?: number;
  sort?: 'score' | 'duration_desc' | 'duration_asc' | 'created_desc' | 'created_asc' | 'downloads_desc' | 'downloads_asc' | 'rating_desc' | 'rating_asc';
  minDuration?: number;
  maxDuration?: number;
  tags?: string[];
}): string {
  const urlParams = new URLSearchParams({
    query: params.query,
    page: String(params.page || 1),
    page_size: String(params.pageSize || 20),
    sort: params.sort || 'score',
    fields: 'id,name,description,tags,duration,previews,download,username,license,created,bitrate,filesize,type',
  });

  // CORRIGIDO: Limitar duração máxima para 180 segundos (3 minutos)
  const maxDuration = Math.min(params.maxDuration || 180, 180);
  const minDuration = params.minDuration || 0;

  // Filtro de licenças
  const licenseFilters = [
    'license:"Creative Commons 0"',
    'license:"Creative Commons Attribution"',
    'license:"Creative Commons Attribution Noncommercial"'
  ];

  let filter = `(${licenseFilters.join(' OR ')})`;
  filter += ` AND duration:[${minDuration}.0 TO ${maxDuration}.0]`;

  if (params.tags && params.tags.length > 0) {
    const tagFilter = params.tags.map(tag => `tag:${tag}`).join(' AND ');
    filter += ` AND (${tagFilter})`;
  }

  urlParams.append('filter', filter);

  return `${FREESOUND_CONFIG.BASE_URL}/search/text/?${urlParams.toString()}`;
}

// Construir URL de download
export function buildDownloadUrl(soundId: number): string {
  return `${FREESOUND_CONFIG.BASE_URL}/sounds/${soundId}/download/?api_key=${FREESOUND_CONFIG.API_KEY}`;
}

// Tags populares para sugerir
export const popularTags = [
  'ambient',
  'cinematic',
  'relaxing',
  'nature',
  'piano',
  'guitar',
  'meditation',
  'background',
  'atmosphere',
  'peaceful',
  'calm',
  'soundscape',
  'instrumental',
  'orchestral',
  'electronic',
  'acoustic',
  'jazz',
  'lofi',
  'rain',
  'waves',
  'forest',
  'birds',
  'water',
  'drone',
];

// Categorias de busca pré-definidas
export const searchCategories = [
  { label: '🎵 Música Ambiente', query: 'ambient relaxing background', tags: ['ambient', 'background'] },
  { label: '🎹 Piano', query: 'piano instrumental peaceful', tags: ['piano', 'instrumental'] },
  { label: '🌿 Natureza', query: 'nature forest birds water', tags: ['nature', 'field-recording'] },
  { label: '🌊 Oceano', query: 'ocean waves beach water', tags: ['waves', 'water'] },
  { label: '🧘 Meditação', query: 'meditation zen calm peaceful', tags: ['meditation', 'calm'] },
  { label: '🎬 Cinematográfico', query: 'cinematic orchestral epic', tags: ['cinematic', 'orchestral'] },
  { label: '🎧 Lo-Fi', query: 'lofi chillhop study relaxed', tags: ['lofi', 'hip-hop'] },
  { label: '🎷 Jazz', query: 'jazz saxophone smooth relaxing', tags: ['jazz', 'saxophone'] },
  { label: '🎸 Acústico', query: 'acoustic guitar gentle folk', tags: ['acoustic', 'guitar'] },
  { label: '🌧️ Chuva', query: 'rain thunderstorm water', tags: ['rain', 'thunder'] },
];

// Formatar duração
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Formatar tamanho do arquivo
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}