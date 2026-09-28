import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { resolve, join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

// Imports the explicitly approved working tree, including untracked page files.
// Deliberately separate from the commit-only importer for the older services.
const [sourceArg] = process.argv.slice(2);
if (!sourceArg || process.argv.length !== 3) throw Error('Usage: node scripts/import-sexualidade.mjs <source-working-tree>');
const source = resolve(sourceArg);
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(project, 'src/services/sexualidade');
const assets = join(project, 'public/servicos/sexualidade/assets');
const route = join(project, 'src/pages/sexualidade.astro');
if ([target, assets, route].some(existsSync)) throw Error('Import exists; review and preserve it before reimporting. No automatic overwrite.');
const sha = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();

const src = join(source, 'src');
const entry = 'pages/sexualidade/index.astro';
const files = new Map();
function collect(name) {
  if (files.has(name)) return;
  const text = readFileSync(join(src, name), 'utf8');
  files.set(name, text);
  for (const match of text.matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)) {
    const base = resolve(src, dirname(name), match[1]);
    const path = [base, `${base}.ts`, `${base}.astro`, `${base}.css`].find(existsSync);
    if (!path) throw Error(`Unresolved import: ${name}: ${match[1]}`);
    collect(relative(src, path).replaceAll('\\', '/'));
  }
}
collect(entry);
const footerLinks = '<a href="/politica-de-privacidade">Política de Privacidade</a>\n          <a href="/politica-de-privacidade#cookies">Cookies</a>\n          <a href="/termos-de-uso">Termos de Uso</a>';
const output = [];
const hashes = {};
for (const [name, original] of files) {
  hashes[`src/${name}`] = createHash('sha256').update(original).digest('hex');
  let text = original.replaceAll('/assets/', '/servicos/sexualidade/assets/');
  let destination = name;
  if (name === entry) {
    destination = 'pages/index.astro';
    text = text.replaceAll("from '../../", "from '../");
    text = text.replace('---', "---\nimport ServiceNavigation from '../../../components/ServiceNavigation.astro';");
    text = text.replace('<main class="hero">', '<div class="hero">').replace('</main>', '</div>');
    text = text.replace('<Header />', '<Header />\n  <ServiceNavigation current="sexualidade" />\n  <main>');
    text = text.replace('<Footer />', '</main>\n  <Footer />');
  }
  if (name === 'layouts/Layout.astro') {
    text = text.replace("import { photos } from '../data/photos';", "import { photos } from '../data/photos';\nimport { sexualidadePhotos } from '../data/sexualidadePhotos';");
    text = text.replace('href={photos.hero.src}', 'href={sexualidadePhotos.hero.src}');
    text = text.replace("import '../styles/device-mobile.css';", "import '../styles/device-mobile.css';\nimport '../../integration.css';");
    text = text.replace('<title>{title}</title>', '<title>{title}</title>\n    <link rel="canonical" href={new URL(\'/sexualidade/\', Astro.site)} />');
  }
  if (name === 'components/Header.astro') text = text.replace('class="logo" href="#top"', 'class="logo" href="/" aria-label="INSPEM — página inicial"');
  if (name === 'components/sexualidade/Footer.astro') text = text.replace(/<nav class="footer-policy-list"[^>]*>[\s\S]*?<\/nav>/, `<nav class="footer-policy-list" aria-label="Documentos institucionais">${footerLinks}</nav>`);
  if (name === 'components/sexualidade/Localizacao.astro') {
    if ((text.match(/<iframe\b/g) || []).length !== 1) throw Error('Review changed map source');
    text = text.replace('---', "---\nimport ExternalMapLink from '../../../../components/ExternalMapLink.astro';");
    text = text.replace(/<iframe[\s\S]*?<\/iframe>/, '<ExternalMapLink url={siteConfig.contact.mapsUrl} />');
  }
  output.push([join(target, destination), text]);
}
const assetFiles = [];
function collectAssets(dir) {
  for (const file of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, file.name);
    if (file.isDirectory()) collectAssets(path);
    else if (['.webp', '.png', '.jpg', '.jpeg', '.svg', '.woff2'].includes(extname(path))) {
      const name = relative(join(source, 'public/assets'), path).replaceAll('\\', '/');
      hashes[`public/assets/${name}`] = createHash('sha256').update(readFileSync(path)).digest('hex');
      assetFiles.push([path, join(assets, name)]);
    }
  }
}
collectAssets(join(source, 'public/assets'));
for (const [path, text] of output) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); }
for (const [from, to] of assetFiles) { mkdirSync(dirname(to), { recursive: true }); copyFileSync(from, to); }
writeFileSync(route, "---\nimport ServicePage from '../services/sexualidade/pages/index.astro';\n---\n<ServicePage />\n");
writeFileSync(join(target, 'source.json'), JSON.stringify({ repository: 'https://github.com/DiegoSapio97/inspem-sexualidade', baseCommit: sha, snapshot: 'Approved local working tree, including untracked files; not an exact HEAD export.', route: '/sexualidade/', sourceFiles: [...files.keys()], sha256: hashes, legalPolicy: 'Shared reviewed root documents.', maps: 'External link only; no automatic third-party embed.' }, null, 2) + '\n');
console.log(JSON.stringify({ route, sourceFiles: files.size, assets: assetFiles.length, baseCommit: sha }));
