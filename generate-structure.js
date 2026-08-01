// generate-structure.js
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const outputFile = path.join(projectRoot, 'estrutura-projeto.txt');

// Pastas para ignorar
const ignoreFolders = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'out',
  '.git',
  'tmp',
  'public/videos',
  'coverage',
  '.vscode',
  '.vercel',
  '.turbo',
  '__pycache__',
  '.cache',
  'public/fonts/.DS_Store'
];

// Extensões para incluir
const includeExtensions = [
  '.ts', '.tsx', '.js', '.jsx',
  '.css', '.scss', '.module.css',
  '.json', '.md', '.yml', '.yaml',
  '.html', '.htm', '.txt', '.env',
  '.gitignore', '.eslintrc', '.prettierrc'
];

// Arquivos específicos para incluir (mesmo sem extensão)
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
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  '.env.example',
  '.env.local',
  '.env.development',
  '.env.production',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  '.gitignore',
  '.eslintrc.json',
  '.eslintrc.js',
  '.prettierrc',
  '.prettierrc.json',
  '.prettierrc.js',
  'components.json',
  'next-env.d.ts'
];

// Arquivos para SEMPRE ignorar (mesmo se estiverem na lista de include)
const alwaysIgnore = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  'next-env.d.ts',
  '.DS_Store',
  'thumbs.db'
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
  for (const folder of ignoreFolders) {
    if (normalizedPath.includes(folder)) {
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

function generateStructure(dir, prefix = '', isLast = true) {
  let output = '';

  // Ler todos os itens do diretório
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
    // Pular se não deve ser incluído
    if (!shouldInclude(itemPath)) continue;

    const stats = fs.statSync(itemPath);
    filteredItems.push({
      name: item,
      path: itemPath,
      isDirectory: stats.isDirectory(),
      size: stats.size
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
      // Mostrar pasta
      output += `${prefix}${connector}📁 ${item.name}/\n`;
      // Recursivamente gerar conteúdo da pasta
      const subContent = generateStructure(item.path, nextPrefix, isLastItem);
      output += subContent;
    } else {
      // Mostrar arquivo com tamanho
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
    'next.config': '⚙️',
    'tailwind.config': '🎨',
    'postcss.config': '⚙️',
    'package.json': '📦',
    'README.md': '📖',
    'LICENSE': '📜',
  };

  // Verificar por nome exato
  if (icons[fileName]) return icons[fileName];

  // Verificar por extensão
  if (icons[ext]) return icons[ext];

  return '📄';
}

// Gerar estrutura
let fullOutput = '========================================\n';
fullOutput += '📁 ESTRUTURA DO PROJETO NEXT.JS\n';
fullOutput += `📅 ${new Date().toLocaleString()}\n`;
fullOutput += '========================================\n\n';

const structure = generateStructure(projectRoot);
fullOutput += structure || 'Nenhum arquivo encontrado.\n';

// Adicionar resumo
fullOutput += '\n========================================\n';
fullOutput += '📊 RESUMO DO PROJETO\n';
fullOutput += '========================================\n\n';

// Contar arquivos por extensão
const allFiles = [];
function collectFiles(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    if (!shouldInclude(itemPath)) continue;
    try {
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        collectFiles(itemPath);
      } else {
        allFiles.push(itemPath);
      }
    } catch (e) { }
  }
}
collectFiles(projectRoot);

// Filtrar lock files do resumo
const filteredFiles = allFiles.filter(f => {
  const name = path.basename(f);
  return !alwaysIgnore.includes(name);
});

const extensions = {};
for (const file of filteredFiles) {
  const ext = path.extname(file) || 'sem_extensao';
  extensions[ext] = (extensions[ext] || 0) + 1;
}

fullOutput += `📁 Total de arquivos: ${filteredFiles.length}\n\n`;
fullOutput += '📊 Por extensão:\n';
for (const [ext, count] of Object.entries(extensions).sort()) {
  const emoji = getFileIcon('example' + ext);
  fullOutput += `   ${emoji} ${ext}: ${count} arquivos\n`;
}

// Listar pastas principais
fullOutput += '\n📁 Pastas principais:\n';
const mainFolders = ['app', 'components', 'lib', 'public', 'styles', 'utils', 'hooks', 'types'];
for (const folder of mainFolders) {
  const folderPath = path.join(projectRoot, folder);
  if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
    const count = fs.readdirSync(folderPath).filter(f => {
      const fPath = path.join(folderPath, f);
      return shouldInclude(fPath);
    }).length;
    fullOutput += `   ✅ ${folder}/ (${count} itens)\n`;
  } else {
    fullOutput += `   ❌ ${folder}/ (não encontrado)\n`;
  }
}

fullOutput += '\n========================================\n';
fullOutput += '🎯 ARQUIVOS IMPORTANTES\n';
fullOutput += '========================================\n\n';

const importantFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  'next.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  'components/form/TextStyleEditor.tsx',
  'components/form/BackgroundSelector.tsx',
  'lib/ffmpeg.ts',
  'lib/textStyle.ts',
  'lib/backgroundAnimations.ts',
];

for (const file of importantFiles) {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    const size = (fs.statSync(filePath).size / 1024).toFixed(1);
    fullOutput += `✅ ${file} (${size}KB)\n`;
  } else {
    fullOutput += `❌ ${file} (não encontrado)\n`;
  }
}

// Salvar arquivo
fs.writeFileSync(outputFile, fullOutput, 'utf-8');
console.log(`✅ Estrutura salva em: ${outputFile}`);

// Mostrar no console também
console.log('\n' + fullOutput);