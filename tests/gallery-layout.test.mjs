import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const slugs = ['ansiedade', 'depressao', 'tdah', 'avaliacao-neuropsicologica', 'sexualidade'];
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const css = read('src/services/integration.css');
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
function rule(selector) {
  selector = `#localizacao ${selector}`;
  const match = rules.find(([, selectors]) => selectors.split(',').map(s => s.trim()).includes(selector));
  assert.ok(match, `missing shared override: ${selector}`);
  return match[2];
}

test('gallery overrides keep complete proportional photographs and captions in document flow', () => {
  for (const selector of ['.gallery-hero img', '.gallery-track img']) {
    const body = rule(selector);
    assert.match(body, /height:\s*auto\s*;/);
    assert.match(body, /aspect-ratio:\s*auto\s*;/);
    assert.match(body, /object-fit:\s*contain\s*;/);
    assert.match(body, /width:\s*100%\s*;/);
  }
  for (const selector of ['.gallery-hero figcaption', '.gallery-track figcaption']) {
    const body = rule(selector);
    assert.match(body, /position:\s*static\s*;/);
    assert.match(body, /inset:\s*auto\s*;/);
    assert.match(body, /backdrop-filter:\s*none\s*;/);
  }
  assert.match(rule('.gallery-track'), /align-items:\s*flex-start\s*;/);
});

for (const slug of slugs) {
  test(`${slug}: final shared CSS and semantic captions are preserved`, () => {
    const layout = read(`src/services/${slug}/layouts/Layout.astro`);
    assert.ok(layout.indexOf("import '../../integration.css'") > layout.indexOf("import '../styles/device-mobile.css'"));
    const html = read(`dist/${slug}/index.html`);
    const hero = html.match(/<figure class="gallery-hero"[^>]*>([\s\S]*?)<\/figure>/)?.[1];
    assert.match(hero, /<\/picture>\s*<figcaption>Edifício Baltimore — fachada e acesso<\/figcaption>/);
    const track = html.match(/<div class="gallery-track"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    assert.equal((track.match(/<figure>/g) || []).length, 2);
    assert.equal((track.match(/<img[^>]*>\s*<figcaption>[^<]+<\/figcaption>/g) || []).length, 2);
    const rooms = html.match(/<div class="consultation-rooms"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    assert.ok(rooms, 'separate consultation room gallery');
    assert.match(rooms, /<figcaption[^>]*>Sala 1<\/figcaption>/);
    assert.match(rooms, /<figcaption[^>]*>Sala 2<\/figcaption>/);
  });
}
