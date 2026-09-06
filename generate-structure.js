// generate-structure.js
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const outputFile = path.join(projectRoot, 'estrutura-projeto.txt');

// Pastas para ignorar (apenas as essenciais)
const ignoreFolders = ['node_modules', '.next'];

// Pastas principais que queremos mapear (incluindo tmp)
const mainFolders = ['app', 'components', 'lib', 'public', 'tmp'];

// Pastas que devem ser mostradas mesmo se vazias
const keepEmptyFolders = ['tmp'];

function shouldInclude(filePath) {
  const relativePath = path.relative(projectRoot, filePath);
  const normalizedPath = relativePath.replace(/\\/g, '/');
  const pathParts = normalizedPath.split('/');

  // Verificar se está em pasta ignorada
  for (const part of pathParts) {
    if (ignoreFolders.includes(part)) {
      return false;
    }
  }

  return true;
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

function generateStructure(dir, prefix = '', isRoot = false) {
  let output = '';

  let items = [];
  try {
    items = fs.readdirSync(dir);
  } catch (e) {
    return output;
  }

  // Filtrar itens
  const filteredItems = [];
  for (const item of items) {
    const itemPath = path.join(dir, item);
    try {
      const stats = fs.statSync(itemPath);
      const isDirectory = stats.isDirectory();

      // Se for raiz, verificar se está nas pastas principais
      if (isRoot && isDirectory) {
        // Se for tmp, sempre incluir (mesmo que vazia)
        if (item === 'tmp') {
          const subItems = fs.readdirSync(itemPath);
          const isEmpty = subItems.length === 0;
          filteredItems.push({
            name: item,
            path: itemPath,
            isDirectory: true,
            size: 0,
            isEmpty: isEmpty
          });
          continue;
        }

        // Para outras pastas, verificar se está na lista de pastas principais
        if (!mainFolders.includes(item)) {
          continue;
        }
      }

      // Se for diretório e estiver vazio, verificar se deve manter
      if (isDirectory && !(isRoot && item === 'tmp')) {
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
    } catch (e) {
      continue;
    }
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
        const subContent = generateStructure(item.path, nextPrefix, false);
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
    '.zip': '📦'
  };

  if (icons[fileName]) return icons[fileName];
  if (icons[ext]) return icons[ext];
  return '📄';
}

// ============================================
// GERAR ESTRUTURA
// ============================================

let fullOutput = '========================================\n';
fullOutput += '📁 ESTRUTURA DO PROJETO\n';
fullOutput += `📅 ${new Date().toLocaleString()}\n`;
fullOutput += '========================================\n\n';

// Gerar estrutura apenas das pastas principais
const structure = generateStructure(projectRoot, '', true);
fullOutput += structure || 'Nenhum arquivo encontrado.\n';

// Salvar
fs.writeFileSync(outputFile, fullOutput, 'utf-8');
console.log(`✅ Estrutura salva em: ${outputFile}`);
console.log('\n' + fullOutput);