// generate-structure.js
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const outputFile = path.join(projectRoot, 'estrutura-projeto.txt');

// Pastas para ignorar (APENAS as essenciais)
const ignoreFolders = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'out',
  '.git',
  'coverage',
  '.vscode',
  '.vercel',
  '.turbo',
  '__pycache__',
  '.cache',
  '.DS_Store'
];

// Extensões para incluir
const includeExtensions = [
  '.ts', '.tsx', '.js', '.jsx',
  '.css', '.scss', '.module.css',
  '.json', '.md', '.yml', '.yaml',
  '.html', '.htm', '.txt', '.env',
  '.gitignore', '.eslintrc', '.prettierrc',
  '.mjs', '.cjs', '.ttf', '.woff', '.woff2', '.otf',
  '.mp4', '.webm', '.avi', '.mov',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.zip', '.rar', '.7z'
];

// Arquivos específicos para incluir
const includeFiles = [
  'next.config.js',
  'next.config.ts',
  'next.config.mjs',
  'tailwind.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'postcss.config.mjs',
  'tsconfig.json',
  'package.json',
  'package-lock.json',
  '.env.example',
  '.env.local',
  'README.md',
  'LICENSE',
  '.gitignore',
  '.eslintrc.json',
  '.prettierrc',
  'components.json',
  'generate-structure.js',
  'eslint.config.mjs'
];

// Arquivos para SEMPRE ignorar
const alwaysIgnore = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  'next-env.d.ts',
  '.DS_Store',
  'thumbs.db'
];

// Pastas que DEVEM ser mostradas mesmo se vazias
const keepEmptyFolders = [
  'public/videos',
  'temp',
  'tmp',
  'public'
];

function shouldInclude(filePath) {
  const relativePath = path.relative(projectRoot, filePath);
  const fileName = path.basename(filePath);

  // Verificar se é um arquivo para sempre ignorar
  if (alwaysIgnore.includes(fileName)) {
    return false;
  }

  // Verificar se está em pasta ignorada
  const normalizedPath = relativePath.replace(/\\/g, '/');
  const pathParts = normalizedPath.split('/');

  for (const part of pathParts) {
    if (ignoreFolders.includes(part)) {
      return false;
    }
  }

  const ext = path.extname(filePath);

  // Verificar se é um arquivo específico
  if (includeFiles.includes(fileName)) {
    return true;
  }

  // Verificar extensão
  return includeExtensions.includes(ext);
}

function shouldKeepFolder(folderPath) {
  const relativePath = path.relative(projectRoot, folderPath);
  const normalizedPath = relativePath.replace(/\\/g, '/');

  // Verificar se a pasta está na lista de pastas a manter
  for (const keepFolder of keepEmptyFolders) {
    if (normalizedPath === keepFolder || normalizedPath.startsWith(keepFolder + '/')) {
      return true;
    }
  }
  return false;
}

function generateStructure(dir, prefix = '') {
  let output = '';

  let items = [];
  try {
    items = fs.readdirSync(dir);
  } catch (e) {
    return output;
  }

  // Filtrar itens que devem ser incluídos
  const filteredItems = [];
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    const isDirectory = stats.isDirectory();

    // Se for diretório e estiver vazio, verificar se deve manter
    if (isDirectory) {
      const subItems = fs.readdirSync(itemPath);
      if (subItems.length === 0) {
        // Pasta vazia - manter apenas se estiver na lista
        if (shouldKeepFolder(itemPath)) {
          filteredItems.push({
            name: item,
            path: itemPath,
            isDirectory: true,
            size: 0,
            isEmpty: true
          });
        }
        continue;
      }
    }

    // Verificar se deve incluir
    if (!shouldInclude(itemPath)) continue;

    filteredItems.push({
      name: item,
      path: itemPath,
      isDirectory: isDirectory,
      size: stats.size,
      isEmpty: false
    });
  }

  // Ordenar: pastas primeiro, depois arquivos
  filteredItems.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });

  for (let i = 0; i < filteredItems.length; i++) {
    const item = filteredItems[i];
    const isLastItem = i === filteredItems.length - 1;
    const connector = isLastItem ? '└── ' : '├── ';
    const nextPrefix = prefix + (isLastItem ? '    ' : '│   ');

    if (item.isDirectory) {
      if (item.isEmpty) {
        // Pasta vazia
        output += `${prefix}${connector}📁 ${item.name}/ (vazia)\n`;
      } else {
        // Pasta com conteúdo
        output += `${prefix}${connector}📁 ${item.name}/\n`;
        const subContent = generateStructure(item.path, nextPrefix);
        if (subContent) {
          output += subContent;
        }
      }
    } else {
      const sizeKB = (item.size / 1024).toFixed(1);
      const sizeStr = sizeKB > 0 ? ` (${sizeKB}KB)` : ' (0.1KB)';
      const icon = getFileIcon(item.name);
      output += `${prefix}${connector}${icon} ${item.name}${sizeStr}\n`;
    }
  }

  return output;
}

function getFileIcon(fileName) {
  const ext = path.extname(fileName);
  const icons = {
    '.ts': '📘',
    '.tsx': '⚛️',
    '.js': '📜',
    '.jsx': '⚛️',
    '.css': '🎨',
    '.scss': '🎨',
    '.module.css': '🎨',
    '.json': '📋',
    '.md': '📝',
    '.yml': '⚙️',
    '.yaml': '⚙️',
    '.html': '🌐',
    '.htm': '🌐',
    '.txt': '📄',
    '.env': '🔒',
    '.gitignore': '🔒',
    '.eslintrc': '🔧',
    '.prettierrc': '💅',
    '.mjs': '📄',
    '.cjs': '📄',
    '.ttf': '🔤',
    '.woff': '🔤',
    '.woff2': '🔤',
    '.otf': '🔤',
    '.mp4': '🎬',
    '.webm': '🎬',
    '.png': '🖼️',
    '.jpg': '🖼️',
    '.jpeg': '🖼️',
    '.gif': '🖼️',
    '.svg': '🖼️',
    '.ico': '🖼️',
    '.pdf': '📄',
    '.zip': '📦',
    'next.config': '⚙️',
    'tailwind.config': '🎨',
    'postcss.config': '⚙️',
    'package.json': '📦',
    'README.md': '📖',
    'LICENSE': '📜',
  };

  if (icons[fileName]) return icons[fileName];
  if (icons[ext]) return icons[ext];
  return '📄';
}

// ============================================
// GERAR ESTRUTURA
// ============================================

let fullOutput = '========================================\n';
fullOutput += '📁 ESTRUTURA COMPLETA DO PROJETO\n';
fullOutput += `📅 ${new Date().toLocaleString()}\n`;
fullOutput += '========================================\n\n';

const structure = generateStructure(projectRoot);
fullOutput += structure || 'Nenhum arquivo encontrado.\n';

// ============================================
// RESUMO
// ============================================

fullOutput += '\n========================================\n';
fullOutput += '📊 RESUMO DO PROJETO\n';
fullOutput += '========================================\n\n';

// Contar arquivos
const allFiles = [];
const allFolders = [];

function collectFiles(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    try {
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        allFolders.push(itemPath);
        collectFiles(itemPath);
      } else {
        if (shouldInclude(itemPath)) {
          allFiles.push(itemPath);
        }
      }
    } catch (e) { }
  }
}
collectFiles(projectRoot);

// Filtrar arquivos
const filteredFiles = allFiles.filter(f => {
  const name = path.basename(f);
  return !alwaysIgnore.includes(name);
});

const extensions = {};
for (const file of filteredFiles) {
  const ext = path.extname(file) || 'sem_extensao';
  extensions[ext] = (extensions[ext] || 0) + 1;
}

fullOutput += `📁 Total de arquivos: ${filteredFiles.length}\n`;
fullOutput += `📁 Total de pastas: ${allFolders.length}\n\n`;
fullOutput += '📊 Por extensão:\n';
for (const [ext, count] of Object.entries(extensions).sort()) {
  const emoji = getFileIcon('example' + ext);
  fullOutput += `   ${emoji} ${ext}: ${count} arquivos\n`;
}

// Pastas principais
fullOutput += '\n📁 Pastas principais:\n';
const mainFolders = ['app', 'components', 'lib', 'public', 'styles', 'utils', 'hooks', 'types', 'temp', 'tmp'];
for (const folder of mainFolders) {
  const folderPath = path.join(projectRoot, folder);
  if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
    const count = countFilesInFolder(folderPath);
    const empty = count === 0 ? ' (vazia)' : '';
    fullOutput += `   ✅ ${folder}/${empty}\n`;
  } else {
    fullOutput += `   ❌ ${folder}/ (não encontrado)\n`;
  }
}

function countFilesInFolder(dir) {
  let count = 0;
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      try {
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          count += countFilesInFolder(itemPath);
        } else {
          if (shouldInclude(itemPath)) {
            count++;
          }
        }
      } catch (e) { }
    }
  } catch (e) { }
  return count;
}

// Pastas vazias importantes
fullOutput += '\n📁 Pastas vazias (criadas automaticamente):\n';
const emptyFolders = ['public/videos', 'temp', 'tmp'];
for (const folder of emptyFolders) {
  const folderPath = path.join(projectRoot, folder);
  if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
    const items = fs.readdirSync(folderPath);
    if (items.length === 0) {
      fullOutput += `   ✅ ${folder}/ (vazia)\n`;
    } else {
      fullOutput += `   ✅ ${folder}/ (${items.length} itens)\n`;
    }
  } else {
    fullOutput += `   ❌ ${folder}/ (não encontrado)\n`;
  }
}

// Arquivos importantes
fullOutput += '\n========================================\n';
fullOutput += '🎯 ARQUIVOS IMPORTANTES\n';
fullOutput += '========================================\n\n';

const importantFiles = [
  // Root
  'package.json',
  'tsconfig.json',
  'next.config.ts',
  // App
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  // API
  'app/api/generate-video/route.ts',
  'app/api/download-video/route.ts',
  'app/api/delete-video/route.ts',
  // Form
  'components/form/BackgroundSelector.tsx',
  'components/form/CustomSizeInput.tsx',
  'components/form/DurationInput.tsx',
  'components/form/GenerateButton.tsx',
  'components/form/ScriptInput.tsx',
  'components/form/TextStyleEditor.tsx',
  'components/form/VideoFormatSelect.tsx',
  'components/form/VideoPreview.tsx',
  'components/form/VideoSizeSelector.tsx',
  // Preview
  'components/preview/AspectRatioPreview.tsx',
  'components/preview/FormatPreview.tsx',
  'components/preview/LiveTextPreview.tsx',
  'components/preview/ProgressBar.tsx',
  'components/preview/ResultCard.tsx',
  'components/preview/VideoPlayer.tsx',
  // UI
  'components/ui/Button.tsx',
  'components/ui/Card.tsx',
  'components/ui/Input.tsx',
  'components/ui/Select.tsx',
  'components/ui/Textarea.tsx',
  // Layout
  'components/layout/Header.tsx',
  // Lib
  'lib/ffmpeg.ts',
  'lib/textStyle.ts',
  'lib/backgroundAnimations.ts',
  'lib/utils.ts',
  'lib/videoConfig.ts',
  'lib/textLayout.ts',
  'lib/textFormatter.ts',
  // Public - Fontes
  'public/fonts/Arial.ttf',
  'public/fonts/Roboto-Regular.ttf',
  'public/fonts/Tahoma.ttf',
  'public/fonts/Verdana.ttf',
];

for (const file of importantFiles) {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        fullOutput += `✅ ${file}/ (pasta)\n`;
      } else {
        const size = (stats.size / 1024).toFixed(1);
        fullOutput += `✅ ${file} (${size}KB)\n`;
      }
    } catch (e) {
      fullOutput += `✅ ${file}\n`;
    }
  } else {
    fullOutput += `❌ ${file} (não encontrado)\n`;
  }
}

// Salvar
fs.writeFileSync(outputFile, fullOutput, 'utf-8');
console.log(`✅ Estrutura salva em: ${outputFile}`);
console.log('\n' + fullOutput);