import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { resolve, join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const sources = {
  ansiedade: ['inspem-digital-copia', 'c4c66fb4ca157d06f142a4b6b615e3b432514ac7'],
  depressao: ['INSPEM-DEPRESSAO', '8954338cb0b1591f520b32060b3264b8f6bb18f1'],
  tdah: ['INSPEM-TDAH', '4d4e75295b6e715ff38424178fee206328e6fa06'],
  'avaliacao-neuropsicologica': ['inspem-avaliacao-neuropsi', 'ddea0216865a398b9739eb0f8b0540e57b4cf262'],
};
const [sourceRoot, slug, replaceFlag] = process.argv.slice(2);
if (!sourceRoot || !Object.hasOwn(sources, slug) || (replaceFlag && replaceFlag !== '--replace-generated')) {
  throw new Error('Usage: node scripts/import-service.mjs <source-parent> <service-slug> [--replace-generated]');
}
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [repo, expectedSha] = sources[slug];
const source = resolve(sourceRoot, repo);
const sha = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (sha !== expectedSha) throw new Error(`Unexpected source revision for ${repo}: ${sha}`);
const dirty = execFileSync('git', ['-C', source, 'status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim();
if (dirty) throw new Error('Source must have no tracked modifications');
const target = join(project, 'src/services', slug);
const route = join(project, 'src/pages', `${slug}.astro`);
if (!replaceFlag && (existsSync(target) || existsSync(route))) throw new Error('Import exists; review changes before using --replace-generated');
const files = [];
for (const directory of ['components', 'data', 'styles']) {
  for (const entry of readdirSync(join(source, 'src', directory), { withFileTypes: true })) {
    if (entry.isFile() && ['.astro', '.ts', '.css'].includes(extname(entry.name)) && entry.name !== 'legal.css') files.push(`${directory}/${entry.name}`);
  }
}
files.push('layouts/Layout.astro', 'pages/index.astro');
const footerLinks = `<a href="/politica-de-privacidade">Política de Privacidade</a>\n          <a href="/politica-de-privacidade#cookies">Cookies</a>\n          <a href="/termos-de-uso">Termos de Uso</a>`;
const output = [];
for (const relative of files) {
  let content = readFileSync(join(source, 'src', relative), 'utf8');
  content = content.replaceAll('/assets/', `/servicos/${slug}/assets/`);
  if (relative === 'components/Hero.astro') {
    content = content.replace('<main class="hero">', '<div class="hero">').replace('</main>', '</div>');
  }
  if (relative === 'layouts/Layout.astro') {
    if (!content.includes('<title>{title}</title>')) throw new Error('Layout shape changed');
    content = content.replace('<title>{title}</title>', `<title>{title}</title>\n    <link rel="canonical" href={new URL('/${slug}/', Astro.site)} />`);
    content = content.replace("import '../styles/device-mobile.css';", "import '../styles/device-mobile.css';\nimport '../../integration.css';");
  }
  if (relative === 'components/Header.astro') {
    content = content.replaceAll('href: "/#', `href: "/${slug}/#`);
    content = content.replace(/<a class="logo" href="(?:#top|\/)"\s*>/, '<a class="logo" href="/" aria-label="INSPEM — página inicial">');
  }
  if (relative === 'components/Footer.astro') {
    content = content.replace('href="#top"', 'href="/"');
    content = content.replace(/<(nav|div) class="footer-policy-list"[^>]*>[\s\S]*?<\/(?:nav|div)>/, `<nav class="footer-policy-list" aria-label="Documentos institucionais">\n          ${footerLinks}\n        </nav>`);
  }
  if (relative === 'components/Localizacao.astro') {
    if ((content.match(/<iframe\b/g) || []).length !== 1) throw new Error('Map integration needs review');
    content = content.replace('---', "---\nimport ExternalMapLink from '../../../components/ExternalMapLink.astro';");
    content = content.replace(/<iframe[\s\S]*?<\/iframe>/, '<ExternalMapLink url={siteConfig.contact.mapsUrl} />');
  }
  if (relative === 'pages/index.astro') {
    content = content.replace('---', "---\nimport ServiceNavigation from '../../../components/ServiceNavigation.astro';");
    content = content.replace('<Header />', `<Header />\n  <ServiceNavigation current="${slug}" />\n  <main>`);
    content = content.replace('<Footer />', '</main>\n  <Footer />');
  }
  output.push([join(target, relative), content]);
}
// Complete source validation before writing the imported snapshot.
for (const [path, content] of output) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}
const assets = join(project, 'public/servicos', slug, 'assets');
mkdirSync(assets, { recursive: true });
let assetCount = 0;
for (const file of readdirSync(join(source, 'public/assets'), { withFileTypes: true })) {
  if (file.isFile() && ['.webp', '.png', '.jpg', '.jpeg', '.svg', '.woff2'].includes(extname(file.name))) {
    copyFileSync(join(source, 'public/assets', file.name), join(assets, file.name));
    assetCount++;
  }
}
writeFileSync(route, `---\nimport ServicePage from '../services/${slug}/pages/index.astro';\n---\n<ServicePage />\n`);
writeFileSync(join(target, 'source.json'), JSON.stringify({ repository: `https://github.com/DiegoSapio97/${repo}`, commit: sha, route: `/${slug}/`, sourceFiles: files, legalPolicy: 'Shared reviewed documents at root; source legal pages are not imported.', maps: 'External link only; no automatic third-party embed.' }, null, 2) + '\n');
console.log(JSON.stringify({ slug, sha, sourceFiles: files.length, assets: assetCount, route }));
