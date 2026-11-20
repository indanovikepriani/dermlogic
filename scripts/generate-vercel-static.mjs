import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const buildDir = path.join(root, 'public/build');
const manifestPath = path.join(buildDir, 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  throw new Error('Manifest Vite tidak ditemukan. Jalankan npm run build terlebih dahulu.');
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const cssFile = manifest['resources/css/app.css']?.file;

if (!cssFile) {
  throw new Error('Entri CSS Vite tidak ditemukan dalam manifest.');
}

const viteTags = `<link rel="stylesheet" href="./public/build/${cssFile}">`;

const replacements = [
  [/<meta name="csrf-token" content="[^"]*">/g, '<meta name="csrf-token" content="">'],
  [/<meta name="ai-url" content="[^"]*">/g, '<meta name="ai-url" content="/ai/tanya">'],
  [/@vite\(\[[^\]]*\]\)/g, viteTags],
  [/\{\{\s*asset\('([^']+)'\)\s*\}\}/g, (_, asset) => `./public/${asset}`],
  [/\{\{\s*route\('ai\.ask'\)\s*\}\}/g, '/ai/tanya'],
  [/\{\{\s*route\('pengetahuan'\)\s*\}\}/g, './pengetahuan'],
  [/\{\{\s*route\('referensi'\)\s*\}\}/g, './referensi'],
  [/\{\{\s*route\('home'\)\s*\}\}/g, './'],
];

const pages = [
  ['index.blade.php', 'index.html'],
  ['pengetahuan.blade.php', 'pengetahuan.html'],
  ['referensi.blade.php', 'referensi.html'],
];

for (const [view, output] of pages) {
  const source = path.join(root, 'resources/views/dermlogic', view);
  let html = fs.readFileSync(source, 'utf8');

  for (const [pattern, replacement] of replacements) {
    html = html.replace(pattern, replacement);
  }

  if (html.includes('{{') || html.includes('{!!') || html.includes('@vite')) {
    throw new Error(`Blade directive tersisa pada ${view}`);
  }

  fs.writeFileSync(path.join(root, output), html);
  console.log(`generated ${output}`);
}
