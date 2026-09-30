import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const routes = ['', 'ansiedade', 'depressao', 'tdah', 'avaliacao-neuropsicologica', 'sexualidade', 'politica-de-privacidade', 'termos-de-uso'];
const dist = new URL('../dist/', import.meta.url);

test('build covers exactly the eight approved pages', () => {
  const pages = readdirSync(dist, { recursive: true }).filter(p => p.endsWith('.html')).map(p => p.replaceAll('\\', '/')).sort();
  assert.deepEqual(pages, routes.map(route => `${route ? route + '/' : ''}index.html`).sort());
});

for (const route of routes) {
  test(`${route || 'home'} installs the approved GTM snippets once at head and body start`, () => {
    const html = readFileSync(new URL(`${route ? route + '/' : ''}index.html`, dist), 'utf8');
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/)?.[1].replace(/<!--[\s\S]*?-->/g, '').trim();
    const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/)?.[1].replace(/<!--[\s\S]*?-->/g, '').trim();
    const script = head?.match(/^<script>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script?.includes('GTM-MCCB6QVW'), 'GTM inline script must be the first head element');
    const noscript = body?.match(/^<noscript>([\s\S]*?)<\/noscript>/)?.[1];
    assert.ok(noscript, 'noscript must be the first body element');
    assert.match(noscript, /^\s*<iframe\s+src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-MCCB6QVW"\s+height="0"\s+width="0"\s+style="display:none;visibility:hidden"\s*><\/iframe>\s*$/);
    assert.equal((html.match(/GTM-MCCB6QVW/g) || []).length, 2);
    assert.equal((html.match(/googletagmanager\.com/g) || []).length, 2);
    assert.equal((html.match(/<iframe\b/g) || []).length, 1);
    assert.equal((html.match(/<noscript\b/g) || []).length, 1);
    assert.deepEqual(html.match(/GTM-[A-Z0-9]+/g), ['GTM-MCCB6QVW', 'GTM-MCCB6QVW']);
    assert.doesNotMatch(html, /@url|google-analytics|doubleclick|connect\.facebook|gtag\s*\(|fbq\s*\(/i);

    // Execute the actual compiled loader against an inert DOM: no network or pageview.
    const inserted = [];
    const first = { parentNode: { insertBefore(node, reference) { assert.equal(reference, first); inserted.push(node); } } };
    const document = {
      getElementsByTagName(tag) { assert.equal(tag, 'script'); return [first]; },
      createElement(tag) { assert.equal(tag, 'script'); return {}; },
    };
    const window = { dataLayer: [{ existing: true }] };
    const originalLayer = window.dataLayer;
    runInNewContext(script, { window, document }, { timeout: 1000 });
    assert.equal(window.dataLayer, originalLayer, 'preserve any existing dataLayer');
    assert.equal(window.dataLayer.length, 2);
    assert.equal(window.dataLayer[1].event, 'gtm.js');
    assert.equal(typeof window.dataLayer[1]['gtm.start'], 'number');
    assert.deepEqual(inserted, [{ async: true, src: 'https://www.googletagmanager.com/gtm.js?id=GTM-MCCB6QVW' }]);
    const emptyWindow = {};
    runInNewContext(script, { window: emptyWindow, document }, { timeout: 1000 });
    assert.equal(emptyWindow.dataLayer.length, 1, 'initialize dataLayer when absent');
    assert.equal(emptyWindow.dataLayer[0].event, 'gtm.js');
  });
}
