# 🎬 Videos IA

Gerador de vídeos personalizados com texto, estilos avançados e fundos gerados por Inteligência Artificial. 
Versão Beta - Funcionando apenas em tempo de projeto
---

## 🚀 O que faz?

- Cria vídeos a partir de qualquer texto
- Personaliza fonte, cor, tamanho, contorno e sombra
- Gera fundo automaticamente com IA baseado no texto
- Alinha o texto (esquerda, centro, direita, justificado)
- Posiciona verticalmente (cima, centro, baixo)
- Preview em tempo real
- Download do vídeo com exclusão automática do servidor

---

## 🛠️ Tecnologias

- Next.js 16
- TypeScript
- Tailwind CSS
- FFmpeg
- Sharp

---

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/videos-ia.git
cd videos-ia

# Instale as dependências
npm install

# Instale o FFmpeg (Windows)
winget install ffmpeg

# Instale o FFmpeg (Mac)
brew install ffmpeg

# Instale o FFmpeg (Linux)
sudo apt install ffmpeg

# Baixe as fontes
npm run download-fonts

# Execute o projeto
npm run dev
