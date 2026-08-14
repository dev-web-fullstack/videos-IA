// components/form/ImageUploader.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Trash2, Check } from "lucide-react";

interface UploadedImage {
  name: string;
  path: string;
  size: number;
  uploadedAt: Date;
}

interface ImageUploaderProps {
  onImagesChange: (images: { path: string; position: { x: number; y: number }; size: number; aspectRatio?: number }[]) => void;
  selectedImages: { path: string; position: { x: number; y: number }; size: number; aspectRatio?: number }[];
  disabled?: boolean;
}

export default function ImageUploader({
  onImagesChange,
  selectedImages,
  disabled = false,
}: ImageUploaderProps) {

  const [availableImages, setAvailableImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar imagens
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

  // Calcular proporção da imagem
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

  // Upload de imagem
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
        // Calcular proporção da imagem
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

  // Adicionar imagem do projeto ao vídeo
  const addImageToVideo = async (imagePath: string) => {
    if (selectedImages.some(img => img.path === imagePath)) {
      onImagesChange(selectedImages.filter(img => img.path !== imagePath));
    } else {
      // Calcular proporção da imagem
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

  // Deletar imagem do servidor
  const handleDelete = async (imagePath: string) => {
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

  // Remover imagem do vídeo
  const removeFromVideo = (imagePath: string) => {
    onImagesChange(selectedImages.filter(img => img.path !== imagePath));
  };

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
              Upload Imagem
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
          {availableImages.length} imagem(ns) disponível(is)
        </span>
        <span>
          {selectedImages.length} selecionada(s)
        </span>
      </div>

      {/* Lista de imagens disponíveis */}
      {!isLoading && availableImages.length > 0 && (
        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
          {availableImages.map((img) => {
            const isSelected = selectedImages.some(s => s.path === img.path);
            return (
              <div
                key={img.path}
                className={`
                  group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer
                  ${isSelected
                    ? "border-green-400 shadow-lg shadow-green-500/20 scale-105"
                    : "border-gray-700 hover:border-gray-500"
                  }
                `}
                onClick={() => addImageToVideo(img.path)}
              >
                <img
                  src={img.path}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />

                {isSelected && (
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(img.path);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-0.5">
                  <span className="text-[8px] text-gray-300 truncate block text-center">
                    {img.name.length > 15 ? img.name.substring(0, 15) + '...' : img.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && availableImages.length === 0 && (
        <div className="text-center py-6 rounded-lg border border-dashed border-gray-700">
          <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            Nenhuma imagem carregada
          </p>
          <p className="text-[10px] text-gray-600">
            Clique em "Upload Imagem" para adicionar
          </p>
        </div>
      )}

      {/* Imagens selecionadas */}
      {selectedImages.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-green-400 font-medium">
            📷 Imagens no vídeo ({selectedImages.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedImages.map((img) => (
              <div
                key={img.path}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-xs"
              >
                <ImageIcon className="w-3 h-3 text-green-400" />
                <span className="text-green-300 truncate max-w-[80px]">
                  {img.path.split('/').pop()}
                </span>
                <button
                  onClick={() => removeFromVideo(img.path)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}