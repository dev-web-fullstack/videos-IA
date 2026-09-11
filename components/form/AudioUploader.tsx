// components/form/AudioUploader.tsx
"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Upload,
  Music,
  Loader2,
  Trash2,
  Check,
  Search,
  X,
  Download,
  Play,
  Pause,
  Filter,
  Clock,
  User,
  Tag,
  Sparkles,
} from "lucide-react";
import {
  popularTags,
  formatDuration,
  formatFileSize,
  type SoundResult,
} from "../../lib/freesound";

interface AudioFile {
  name: string;
  path: string;
  size?: number;
}

interface AvailableAudio {
  name: string;
  path: string;
  size: number;
  uploadedAt: Date;
  duration?: number;
}

interface AudioUploaderProps {
  onAudioChange: (file: AudioFile | null) => void;
  audioFile: AudioFile | null;
  onRemove: () => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  disabled?: boolean;
  videoDuration?: number;
  onPreviewStateChange?: (isPlaying: boolean) => void;
}

// Número máximo de itens antes de mostrar scroll
const MAX_VISIBLE_ITEMS = 10;
const ITEM_HEIGHT = 44; // altura aproximada de cada item em px

const AudioUploader = forwardRef<{ pausePreview: () => boolean }, AudioUploaderProps>(({
  onAudioChange,
  audioFile,
  onRemove,
  isGenerating,
  setIsGenerating,
  disabled = false,
  videoDuration = 5,
  onPreviewStateChange,
}, ref) => {

  const [availableAudios, setAvailableAudios] = useState<AvailableAudio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SoundResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreviewId, setCurrentPreviewId] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState("score");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [minDuration, setMinDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(180);

  useImperativeHandle(ref, () => ({
    pausePreview: () => {
      if (isPlaying) {
        stopPreview();
        return true;
      }
      return false;
    }
  }));

  const scrollToTop = () => {
    if (resultsContainerRef.current) {
      resultsContainerRef.current.scrollTop = 0;
    }
  };

  const loadAudios = async () => {
    try {
      const response = await fetch("/api/get-audios");
      const data = await response.json();
      if (data.audios) {
        setAvailableAudios(data.audios);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar áudios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudios();
  }, []);

  useEffect(() => {
    if (audioFile) {
      setSelectedPath(audioFile.path);
    } else {
      setSelectedPath(null);
    }
  }, [audioFile]);

  useEffect(() => {
    if (onPreviewStateChange) {
      onPreviewStateChange(isPlaying);
    }
  }, [isPlaying, onPreviewStateChange]);

  useEffect(() => {
    if (disabled && isPlaying) {
      stopPreview();
    }
  }, [disabled]);

  const stopPreview = () => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.src = '';
      previewAudio.load();
      setPreviewAudio(null);
    }
    setIsPlaying(false);
    setCurrentPreviewId(null);
  };

  const selectAudio = (selectedAudio: AvailableAudio) => {
    if (isPlaying) {
      stopPreview();
    }

    if (selectedPath === selectedAudio.path) {
      setSelectedPath(null);
      onAudioChange(null);
      onRemove();
      return;
    }

    setSelectedPath(selectedAudio.path);
    onAudioChange({
      name: selectedAudio.name,
      path: selectedAudio.path,
      size: selectedAudio.size,
    });
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4"];
    if (!allowedTypes.includes(file.type)) {
      alert("Formato de áudio não suportado. Use MP3, WAV, OGG ou M4A.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo 50MB.");
      return;
    }

    if (isPlaying) {
      stopPreview();
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        await loadAudios();
        const newAudio = {
          name: data.name || file.name,
          path: data.audioPath,
          size: data.size || file.size,
        };
        setSelectedPath(data.audioPath);
        onAudioChange(newAudio);
      } else {
        alert(data.error || "Erro ao fazer upload do áudio");
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      alert("Erro ao fazer upload do áudio");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (audioPath: string) => {
    if (!confirm("Tem certeza que deseja excluir este áudio?")) return;

    if (isPlaying) {
      stopPreview();
    }

    try {
      const response = await fetch("/api/delete-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioPath }),
      });

      if (response.ok) {
        await loadAudios();
        if (selectedPath === audioPath) {
          setSelectedPath(null);
          onAudioChange(null);
        }
      }
    } catch (error) {
      console.error("❌ Erro ao deletar:", error);
      alert("Erro ao deletar áudio");
    }
  };

  const searchFreesound = async (query: string, pageNum: number = 1) => {
    const hasFilters = query.trim() || selectedCategory;

    if (!hasFilters) {
      setSearchError("Digite um termo de busca ou selecione uma categoria");
      return;
    }

    if (isPlaying) {
      stopPreview();
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const searchQuery = query.trim() || selectedCategory || '';
      const maxDur = Math.min(maxDuration, 180);

      const url = `/api/freesound-search?query=${encodeURIComponent(searchQuery)}&page=${pageNum}&pageSize=20&sort=${sortBy}&minDuration=${minDuration}&maxDuration=${maxDur}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results || []);
        setTotalResults(data.count || 0);
        setPage(pageNum);
        if (data.results.length === 0) {
          setSearchError("Nenhum resultado encontrado. Tente uma busca diferente.");
        }
        setTimeout(scrollToTop, 50);
      } else {
        setSearchError(data.error || "Erro ao buscar áudios");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      setSearchError("Erro ao conectar com o servidor");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const downloadFromFreesound = async (sound: SoundResult) => {
    if (isPlaying) {
      stopPreview();
    }

    setIsDownloading(true);

    try {
      console.log('🎵 Baixando áudio do Freesound:', sound.name);
      console.log('🔗 Preview URL:', sound.preview_url);

      const response = await fetch("/api/freesound-download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          soundId: sound.id,
          soundName: sound.name,
          previewUrl: sound.preview_url,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadAudios();
        const newAudio = {
          name: data.name || `${sound.name}.mp3`,
          path: data.audioPath,
          size: data.size || 0,
        };
        setSelectedPath(data.audioPath);
        onAudioChange(newAudio);
        setSearchResults([]);
        setSearchQuery("");
        setSelectedCategory("");
      } else {
        alert(data.error || "Erro ao baixar áudio");
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      alert("Erro ao baixar áudio do Freesound");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreviewSound = (sound: SoundResult) => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.src = '';
      previewAudio.load();
      setPreviewAudio(null);
    }

    if (currentPreviewId === sound.id && !isPlaying) {
      const audio = previewAudio;
      if (audio) {
        audio.play().catch((err) => {
          console.error('❌ Erro ao retomar preview:', err);
        });
        setIsPlaying(true);
        return;
      }
    }

    if (currentPreviewId === sound.id && isPlaying) {
      previewAudio?.pause();
      setIsPlaying(false);
      return;
    }

    let previewUrl = sound.preview_url;
    if (!previewUrl) {
      previewUrl = `/api/freesound-preview?id=${sound.id}&quality=hq`;
    }

    console.log('🎵 Preview URL:', previewUrl);

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';

    let isCleaning = false;

    audio.oncanplay = () => {
      if (isCleaning) return;
      console.log('✅ Preview carregado, duração:', audio.duration);
    };

    audio.onended = () => {
      if (isCleaning) return;
      console.log('⏹️ Preview terminou');
      setIsPlaying(false);
      setCurrentPreviewId(null);
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
        setPreviewAudio(null);
      }
    };

    audio.onerror = (e) => {
      if (isCleaning) return;
      if (!audio.src || audio.src === '' || audio.src === 'http://localhost:3000/') {
        console.log('⏹️ Áudio limpo (ignorando erro)');
        return;
      }
      console.error('❌ Erro no preview:', e);
      console.error('❌ audio.src:', audio.src);
      setIsPlaying(false);
      setCurrentPreviewId(null);
      audio.pause();
      audio.src = '';
      setPreviewAudio(null);
      alert(`Não foi possível reproduzir o preview de "${sound.name}".`);
    };

    audio.src = previewUrl;
    audio.load();

    setPreviewAudio(audio);
    setCurrentPreviewId(sound.id);
    setIsPlaying(true);

    const cleanup = () => {
      isCleaning = true;
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.oncanplay = null;
        audio.onended = null;
        audio.onerror = null;
      }
    };

    (audio as any).cleanup = cleanup;

    audio.play().catch((err) => {
      if (isCleaning) return;
      console.error('❌ Erro ao iniciar preview:', err);
      setIsPlaying(false);
      setCurrentPreviewId(null);
      audio.pause();
      audio.src = '';
      setPreviewAudio(null);
      alert(`Não foi possível reproduzir o preview de "${sound.name}".`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchFreesound(searchQuery, 1);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    searchFreesound(tag, 1);
  };

  const cleanAudioName = (name: string): string => {
    let cleaned = name;

    cleaned = cleaned.replace(/\.(mp3|wav|ogg|m4a|mp4)$/i, '');
    cleaned = cleaned.replace(/^freesound_/i, '');
    cleaned = cleaned.replace(/^pixabay_/i, '');
    cleaned = cleaned.replace(/^audio-/i, '');
    cleaned = cleaned.replace(/^tts_/i, '');
    cleaned = cleaned.replace(/^\d+_/, '');
    cleaned = cleaned.replace(/_\d{10,}_[a-z0-9]{6,}$/i, '');
    cleaned = cleaned.replace(/_\d{10,}$/, '');
    cleaned = cleaned.replace(/_/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned || name;
  };

  const formatAudioDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isBlocked = disabled || isUploading || isGenerating || isDownloading || isSearching;

  // Calcular altura máxima para mostrar 10 itens
  const maxHeight = MAX_VISIBLE_ITEMS * ITEM_HEIGHT;
  const showScroll = availableAudios.length > MAX_VISIBLE_ITEMS;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isBlocked}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${isBlocked
              ? "bg-gray-700/50 cursor-not-allowed opacity-60"
              : "bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-white"
            }
          `}
        >
          {isUploading ? (
            <>
              <span className="animate-spin">⏳</span>
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Áudio
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
          className="hidden"
          disabled={isBlocked}
        />
        <span className="text-[10px] text-gray-500">MP3, WAV, OGG, M4A (max 50MB)</span>
      </div>

      <div className="space-y-3 border-t border-gray-700/50 pt-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-400" />
          <label className="text-xs text-blue-400 font-medium">
            Buscar no Freesound (sons livres de direitos)
          </label>
        </div>

        <div className="flex flex-wrap gap-1">
          {popularTags.slice(0, 12).map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              disabled={isBlocked}
              className="text-[8px] px-2 py-0.5 rounded-full bg-gray-700/30 hover:bg-gray-600/50 text-gray-400 hover:text-white transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar sons por nome, tags..."
            disabled={isBlocked}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white text-sm placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isBlocked}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${isBlocked
                ? "bg-gray-700/50 cursor-not-allowed opacity-60"
                : "bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-white"
              }
            `}
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 rounded-lg border border-gray-700/50 hover:border-gray-500 transition-colors"
            title="Filtros avançados"
          >
            <Filter className="w-4 h-4 text-gray-400" />
          </button>
        </form>

        {showAdvanced && (
          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <div>
              <label className="text-[9px] text-gray-400">Duração mínima (s)</label>
              <input
                type="number"
                value={minDuration}
                onChange={(e) => setMinDuration(Number(e.target.value))}
                min={0}
                max={180}
                className="w-full px-2 py-1 rounded bg-gray-700/50 border border-gray-600 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-400">Duração máxima (s)</label>
              <input
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(Number(e.target.value))}
                min={1}
                max={180}
                className="w-full px-2 py-1 rounded bg-gray-700/50 border border-gray-600 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-400">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2 py-1 rounded bg-gray-700/50 border border-gray-600 text-white text-xs"
              >
                <option value="score">Relevância</option>
                <option value="duration_desc">Duração ↓</option>
                <option value="duration_asc">Duração ↑</option>
                <option value="downloads_desc">Downloads ↓</option>
                <option value="rating_desc">Avaliação</option>
                <option value="created_desc">Recentes</option>
              </select>
            </div>
          </div>
        )}

        {searchError && (
          <div className="text-center text-xs text-yellow-400 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            {searchError}
          </div>
        )}

        {isSearching && (
          <div className="text-center text-xs text-blue-400 p-4">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            Buscando sons no Freesound...
          </div>
        )}

        {searchResults.length > 0 && (
          <div
            ref={resultsContainerRef}
            className="space-y-2 max-h-64 overflow-y-auto"
          >
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>{totalResults} resultados encontrados</span>
              <button
                onClick={() => {
                  setSearchResults([]);
                  setSearchQuery("");
                  setSelectedCategory("");
                  stopPreview();
                }}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {searchResults.map((sound) => (
              <div
                key={sound.id}
                className="flex items-start gap-2 p-2 rounded-lg border border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/30 transition-colors group"
              >
                <button
                  onClick={() => handlePreviewSound(sound)}
                  disabled={isBlocked}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center transition-colors mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Ouvir preview"
                >
                  {currentPreviewId === sound.id && isPlaying ? (
                    <Pause className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Play className="w-4 h-4 text-blue-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm text-white truncate font-medium">
                        {sound.name}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate flex flex-wrap items-center gap-1">
                        <User className="w-3 h-3" />
                        {sound.username}
                        <Clock className="w-3 h-3 ml-1" />
                        {formatDuration(sound.duration)}
                        <Tag className="w-3 h-3 ml-1" />
                        {sound.tags.slice(0, 3).join(', ')}
                      </div>
                      {sound.description && (
                        <div className="text-[9px] text-gray-500 truncate mt-0.5">
                          {sound.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[8px] text-gray-500">{formatFileSize(sound.filesize)}</span>
                      <button
                        onClick={() => downloadFromFreesound(sound)}
                        disabled={isBlocked}
                        className={`
                          p-1.5 rounded-lg transition-colors
                          ${isBlocked
                            ? "bg-gray-700/50 cursor-not-allowed opacity-50"
                            : "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                          }
                        `}
                        title="Baixar este áudio"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {totalResults > 20 && (
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => searchFreesound(searchQuery, page - 1)}
                  disabled={page <= 1 || isSearching || isBlocked}
                  className="px-3 py-1 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-xs text-gray-400 px-2 py-1">
                  Página {page} de {Math.ceil(totalResults / 20)}
                </span>
                <button
                  onClick={() => searchFreesound(searchQuery, page + 1)}
                  disabled={page >= Math.ceil(totalResults / 20) || isSearching || isBlocked}
                  className="px-3 py-1 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!isLoading && availableAudios.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider">
              Áudios disponíveis ({availableAudios.length})
            </label>
            <span className="text-[10px] text-gray-500">
              {audioFile ? "1 selecionado" : "Nenhum selecionado"}
            </span>
          </div>
          <div
            className="space-y-1 pr-1"
            style={{
              maxHeight: showScroll ? `${maxHeight}px` : 'none',
              overflowY: showScroll ? 'auto' : 'visible',
            }}
          >
            {availableAudios.map((audioItem) => {
              const isSelected = selectedPath === audioItem.path;
              const isFreesound = audioItem.name.includes('Freesound') || audioItem.name.includes('freesound');
              const cleanedName = cleanAudioName(audioItem.name);
              const durationFormatted = formatAudioDuration(audioItem.duration);

              return (
                <div
                  key={audioItem.path}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer group
                    ${isSelected
                      ? "border-blue-400 bg-blue-600/20"
                      : "border-gray-700 hover:border-gray-500 bg-gray-800/30"
                    }
                    ${isBlocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                  onClick={() => !isBlocked && selectAudio(audioItem)}
                >
                  <Music className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-blue-400" : "text-gray-400"}`} />
                  {durationFormatted && (
                    <span className="text-[10px] text-gray-500 flex-shrink-0 font-mono">
                      {durationFormatted}
                    </span>
                  )}
                  <span className="flex-1 text-xs text-gray-300 truncate flex items-center gap-1">
                    {isFreesound && <Search className="w-3 h-3 text-blue-400 flex-shrink-0" />}
                    {cleanedName.length > 28 ? cleanedName.substring(0, 28) + '...' : cleanedName}
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isBlocked) handleDelete(audioItem.path);
                    }}
                    disabled={isBlocked}
                    className="p-0.5 rounded-full bg-red-500/80 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isDownloading && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span className="text-xs text-blue-300">Baixando áudio do Freesound...</span>
        </div>
      )}
    </div>
  );
});

AudioUploader.displayName = 'AudioUploader';

export default AudioUploader;