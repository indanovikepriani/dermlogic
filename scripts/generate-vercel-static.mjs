import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const buildDir = path.join(root, 'public/build');
const distDir = path.join(root, 'dist');
const manifestPath = path.join(buildDir, 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  throw new Error('Manifest Vite tidak ditemukan. Jalankan npm run build terlebih dahulu.');
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const cssFile = manifest['resources/css/app.css']?.file;

if (!cssFile) {
  throw new Error('Entri CSS Vite tidak ditemukan dalam manifest.');
}

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

for (const dir of ['build', 'css', 'js']) {
  fs.cpSync(path.join(root, 'public', dir), path.join(distDir, dir), { recursive: true });
}

for (const file of ['favicon.ico', 'robots.txt']) {
  fs.copyFileSync(path.join(root, 'public', file), path.join(distDir, file));
}

const apiSource = path.join(root, 'api');
if (fs.existsSync(apiSource)) {
  fs.cpSync(apiSource, path.join(distDir, 'api'), { recursive: true });
}

const pages = [
  ['index.blade.php', 'index.html'],
  ['pengetahuan.blade.php', 'pengetahuan.html'],
  ['referensi.blade.php', 'referensi.html'],
];

const render = (view, prefix) => {
  let html = fs.readFileSync(path.join(root, 'resources/views/dermlogic', view), 'utf8');
  const replacements = [
    [/<meta name="csrf-token" content="[^"]*">/g, '<meta name="csrf-token" content="">'],
    [/<meta name="ai-url" content="[^"]*">/g, '<meta name="ai-url" content="/api/tanya">'],
    [/@vite\(\[[^\]]*\]\)/g, `<link rel="stylesheet" href="${prefix}build/${cssFile}">`],
    [/\{\{\s*asset\('([^']+)'\)\s*\}\}/g, (_, asset) => `${prefix}${asset}`],
    [/\{\{\s*route\('ai\.ask'\)\s*\}\}/g, '/ai/tanya'],
    [/\{\{\s*route\('pengetahuan'\)\s*\}\}/g, './pengetahuan'],
    [/\{\{\s*route\('referensi'\)\s*\}\}/g, './referensi'],
    [/\{\{\s*route\('home'\)\s*\}\}/g, './'],
  ];

  for (const [pattern, replacement] of replacements) {
    html = html.replace(pattern, replacement);
  }

  if (html.includes('{{') || html.includes('{!!') || html.includes('@vite')) {
    throw new Error(`Blade directive tersisa pada ${view}`);
  }

  return html;
};

for (const [view, output] of pages) {
  fs.writeFileSync(path.join(root, output), render(view, './public/'));
  fs.writeFileSync(path.join(distDir, output), render(view, './'));
  console.log(`generated ${output} and dist/${output}`);
}
