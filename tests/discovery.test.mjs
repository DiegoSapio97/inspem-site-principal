import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
const root = new URL('../dist/', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

test('discovery files survive the build with the correct content', () => {
  for (const name of ['llms.txt', 'robots.txt', 'sitemap.xml']) {
    assert.equal(read(name), readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8'));
    assert.doesNotMatch(read(name), /<!doctype html/i);
  }
  assert.match(read('llms.txt'), /^# INSPEM/m);
  assert.match(read('robots.txt'), /^User-agent: \*\r?$/m);
  assert.match(read('robots.txt'), /^Sitemap: https:\/\/inspem\.com\.br\/sitemap\.xml\r?$/m);
});

test('llms links resolve to built pages and real section identifiers', () => {
  const links = [...read('llms.txt').matchAll(/\[[^\]]+\]\((https:\/\/[^)]+)\)/g)];
  assert.ok(links.length > 0);
  for (const [, href] of links) {
    const url = new URL(href);
    if (url.hostname !== 'inspem.com.br') continue;
    const html = read(`${url.pathname.slice(1)}index.html`);
    if (url.hash) assert.ok(html.includes(`id="${url.hash.slice(1)}"`), `Missing anchor: ${href}`);
  }
});

test('sitemap covers all built HTML pages with their canonical URLs', () => {
  const paths = readdirSync(root, { recursive: true }).filter(p => p.replaceAll('\\', '/').endsWith('index.html'));
  const canonical = paths.map(path => read(path.replaceAll('\\', '/')).match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)[1]);
  const urls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.equal(urls.length, new Set(urls).size);
  assert.deepEqual(urls.sort(), canonical.sort());
});
