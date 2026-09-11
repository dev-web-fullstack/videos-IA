// components/form/MediaManager.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  X,
  FolderOpen
} from "lucide-react";

interface UploadedImage {
  name: string;
  path: string;
  size: number;
  uploadedAt: Date;
}

interface MediaManagerProps {
  onImagesChange: (images: { path: string; position: { x: number; y: number }; size: number; aspectRatio?: number }[]) => void;
  selectedImages: { path: string; position: { x: number; y: number }; size: number; aspectRatio?: number }[];
  disabled?: boolean;
}

const MAX_VISIBLE_ITEMS = 10;
const ITEM_HEIGHT = 48;

export default function MediaManager({
  onImagesChange,
  selectedImages,
  disabled = false,
}: MediaManagerProps) {

  const [availableImages, setAvailableImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    try {
      const response = await fetch("/api/get-images");
      const data = await response.json();
      if (data.images) {
        setAvailableImages(data.images);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar imagens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const getImageAspectRatio = (imagePath: string): Promise<number> => {
    return new Promise((resolve) => {
      const img = new (window as any).Image();
      img.onload = () => {
        resolve(img.width / img.height);
      };
      img.onerror = () => {
        resolve(1);
      };
      img.src = imagePath;
    });
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        await loadImages();
        const aspectRatio = await getImageAspectRatio(data.imagePath);
        const newImage = {
          path: data.imagePath,
          position: { x: 0, y: 0 },
          size: 40,
          aspectRatio: aspectRatio,
        };
        onImagesChange([...selectedImages, newImage]);
      } else {
        alert(data.error || "Erro ao fazer upload");
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const addImageToVideo = async (imagePath: string) => {
    if (selectedImages.some(img => img.path === imagePath)) {
      onImagesChange(selectedImages.filter(img => img.path !== imagePath));
    } else {
      const aspectRatio = await getImageAspectRatio(imagePath);
      const newImage = {
        path: imagePath,
        position: { x: 0, y: 0 },
        size: 40,
        aspectRatio: aspectRatio,
      };
      onImagesChange([...selectedImages, newImage]);
    }
  };

  const handleDelete = async (imagePath: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return;

    try {
      const response = await fetch("/api/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imagePath }),
      });

      if (response.ok) {
        await loadImages();
        onImagesChange(selectedImages.filter(img => img.path !== imagePath));
      }
    } catch (error) {
      console.error("❌ Erro ao deletar:", error);
      alert("Erro ao deletar imagem");
    }
  };

  const removeFromVideo = (imagePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onImagesChange(selectedImages.filter(img => img.path !== imagePath));
  };

  const isSelected = (imagePath: string) => {
    return selectedImages.some(img => img.path === imagePath);
  };

  const cleanImageName = (name: string): string => {
    let cleaned = name;
    cleaned = cleaned.replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i, '');
    cleaned = cleaned.replace(/^upload-/i, '');
    cleaned = cleaned.replace(/^\d+_/, '');
    cleaned = cleaned.replace(/_\d{10,}_[a-z0-9]{6,}$/i, '');
    cleaned = cleaned.replace(/_\d{10,}$/, '');
    cleaned = cleaned.replace(/_/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned || name;
  };

  const maxHeight = MAX_VISIBLE_ITEMS * ITEM_HEIGHT;
  const showScroll = availableImages.length > MAX_VISIBLE_ITEMS;

  return (
    <div className="space-y-4">
      {/* Área de upload */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${disabled || isUploading
              ? "bg-gray-700/50 cursor-not-allowed opacity-60"
              : "bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-white"
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
              Upload Mídia
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          multiple
          onChange={(e) => {
            const files = e.target.files;
            if (files) {
              for (const file of files) {
                handleUpload(file);
              }
            }
            e.target.value = "";
          }}
          className="hidden"
          disabled={disabled || isUploading}
        />
        <span className="text-[10px] text-gray-500">
          PNG, JPG, WEBP, GIF, SVG (max 10MB cada)
        </span>
      </div>

      {/* Estatísticas */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {availableImages.length} mídia(s) disponível(is)
        </span>
        <span>
          {selectedImages.length} selecionada(s)
        </span>
      </div>

      {/* Lista de Mídias Disponíveis */}
      {!isLoading && availableImages.length > 0 && (
        <div className="space-y-2 border-t border-gray-700/50 pt-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <FolderOpen className="w-3 h-3" />
              Mídias Disponíveis ({availableImages.length})
            </label>
            <span className="text-[10px] text-gray-500">
              {selectedImages.length > 0 ? `${selectedImages.length} selecionada(s)` : "Nenhuma selecionada"}
            </span>
          </div>
          <div
            className="space-y-1 pr-1"
            style={{
              maxHeight: showScroll ? `${maxHeight}px` : 'none',
              overflowY: showScroll ? 'auto' : 'visible',
            }}
          >
            {availableImages.map((img) => {
              const selected = isSelected(img.path);
              const cleanedName = cleanImageName(img.name);

              return (
                <div
                  key={img.path}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer group
                    ${selected
                      ? "border-purple-400 bg-purple-600/20"
                      : "border-gray-700 hover:border-gray-500 bg-gray-800/30"
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                  onClick={() => !disabled && addImageToVideo(img.path)}
                >
                  <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden bg-gray-700">
                    <img
                      src={img.path}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="flex-1 text-xs text-gray-300 truncate">
                    {cleanedName.length > 28 ? cleanedName.substring(0, 28) + '...' : cleanedName}
                  </span>
                  <span className="text-[10px] text-gray-500 flex-shrink-0">
                    {(img.size / 1024).toFixed(0)}KB
                  </span>
                  {selected && (
                    <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  )}
                  <button
                    onClick={(e) => handleDelete(img.path, e)}
                    disabled={disabled}
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

      {/* Imagens selecionadas no vídeo */}
      {selectedImages.length > 0 && (
        <div className="space-y-2 border-t border-gray-700/50 pt-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Check className="w-3 h-3" />
              No Vídeo ({selectedImages.length})
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedImages.map((img) => (
              <div
                key={img.path}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs"
              >
                <ImageIcon className="w-3 h-3 text-purple-400" />
                <span className="text-purple-300 truncate max-w-[80px]">
                  {img.path.split('/').pop()}
                </span>
                <button
                  onClick={(e) => removeFromVideo(img.path, e)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem quando não há imagens */}
      {!isLoading && availableImages.length === 0 && (
        <div className="text-center py-6 rounded-lg border border-dashed border-gray-700">
          <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            Nenhuma mídia carregada
          </p>
          <p className="text-[10px] text-gray-600">
            Clique em "Upload Mídia" para adicionar
          </p>
        </div>
      )}
    </div>
  );
}