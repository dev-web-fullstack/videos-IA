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
  const [isLoadingAudios, setIsLoadingAudios] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
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
      setIsLoadingAudios(true);
      const response = await fetch("/api/get-audios", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      if (data.audios) {
        setAvailableAudios(data.audios);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar áudios:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingAudios(false);
    }
  };

  useEffect(() => {
    loadAudios();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAudios();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

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

  // ============================================
  // UPLOAD MÚLTIPLO DE ÁUDIOS
  // ============================================
  const handleMultipleUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4"];
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(file.name);
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (muito grande)`);
        continue;
      }
      validFiles.push(file);
    }

    if (invalidFiles.length > 0) {
      alert(`Alguns arquivos não foram aceitos:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length === 0) return;

    if (isPlaying) {
      stopPreview();
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: validFiles.length });

    let successCount = 0;
    let lastUploadedPath: string | null = null;
    let lastUploadedName: string | null = null;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress({ current: i + 1, total: validFiles.length });

      try {
        const formData = new FormData();
        formData.append("audio", file);

        const response = await fetch("/api/upload-audio", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          successCount++;
          lastUploadedPath = data.audioPath;
          lastUploadedName = data.name || file.name;
        } else {
          console.error(`❌ Erro ao enviar ${file.name}:`, data.error);
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar ${file.name}:`, error);
      }
    }

    await loadAudios();

    if (lastUploadedPath && lastUploadedName) {
      setSelectedPath(lastUploadedPath);
      onAudioChange({
        name: lastUploadedName,
        path: lastUploadedPath,
        size: 0,
      });
    }

    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0 });

    if (successCount > 0) {
      console.log(`✅ ${successCount} áudio(s) enviado(s) com sucesso`);
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

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';

    let isCleaning = false;

    audio.oncanplay = () => {
      if (isCleaning) return;
    };

    audio.onended = () => {
      if (isCleaning) return;
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
        return;
      }
      console.error('❌ Erro no preview:', e);
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
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadProgress.total > 1
                ? `Enviando ${uploadProgress.current}/${uploadProgress.total}...`
                : "Enviando..."
              }
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Áudios
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4"
          multiple
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleMultipleUpload(Array.from(files));
            }
            e.target.value = "";
          }}
          className="hidden"
          disabled={isBlocked}
        />
        <span className="text-[10px] text-gray-500">MP3, WAV, OGG, M4A (max 50MB cada)</span>
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

      {/* Lista de Áudios Disponíveis - SEM BARRA DE ROLAGEM */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Music className="w-3 h-3" />
            Áudios disponíveis ({availableAudios.length})
            {isLoadingAudios && (
              <span className="ml-1 text-pink-400 animate-pulse normal-case">
                Carregando...
              </span>
            )}
          </label>
          <span className="text-[10px] text-gray-500">
            {audioFile ? "1 selecionado" : "Nenhum selecionado"}
          </span>
        </div>

        {/* Lista de áudios ou mensagem vazia - SEM SCROLL */}
        {availableAudios.length > 0 ? (
          <div className="space-y-1">
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
                      ? "border-purple-400 bg-purple-600/20"
                      : "border-gray-700 hover:border-gray-500 bg-gray-800/30"
                    }
                    ${isBlocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                  onClick={() => !isBlocked && selectAudio(audioItem)}
                >
                  <Music className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-purple-400" : "text-gray-400"}`} />
                  {durationFormatted && (
                    <span className="text-[10px] text-gray-500 flex-shrink-0 font-mono">
                      {durationFormatted}
                    </span>
                  )}
                  <span className="flex-1 text-xs text-gray-300 truncate flex items-center gap-1">
                    {isFreesound && <Search className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                    {cleanedName.length > 30
                      ? cleanedName.substring(0, 30) + '...'
                      : cleanedName}
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
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
        ) : (
          !isLoadingAudios && (
            <div className="text-center py-4 rounded-lg border border-dashed border-gray-700/50">
              <Music className="w-6 h-6 text-gray-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-500">
                Nenhum áudio disponível ainda
              </p>
            </div>
          )
        )}
      </div>

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