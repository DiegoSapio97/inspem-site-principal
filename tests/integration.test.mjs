import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const integrated = ['ansiedade', 'depressao', 'tdah', 'avaliacao-neuropsicologica', 'sexualidade'];
const dist = new URL('../dist/', import.meta.url);

for (const slug of integrated) {
  test(`integrates the real ${slug} page with local assets and working navigation`, () => {
    const target = new URL(`${slug}/index.html`, dist);
    assert.ok(existsSync(target), `${slug} route must be built`);
    const html = readFileSync(target, 'utf8');
    assert.match(html, /<h1[ >]/);
    assert.equal((html.match(/<main[ >]/g) || []).length, 1, 'service must have one main landmark');
    assert.ok(html.includes(`href="https://inspem.com.br/${slug}/"`), 'canonical must identify the service');
    assert.match(html, /href="\/"[^>]*>[^<]*Página inicial/);
    assert.match(html, /href="\/politica-de-privacidade"/);
    assert.match(html, /href="\/termos-de-uso"/);
    assert.doesNotMatch(html, /<iframe|googletagmanager|google-analytics|connect.facebook.net/);
    assert.ok(html.includes(`/servicos/${slug}/assets/`), 'service assets must be namespaced');
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
    for (const [, ref] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (ref.startsWith('#')) assert.ok(ids.has(ref.slice(1)), `missing anchor ${ref}`);
      if (ref.startsWith(`/${slug}/#`)) assert.ok(ids.has(ref.split('#')[1]), `missing service anchor ${ref}`);
      if (!ref.startsWith('/') || ref.startsWith('//') || ref.includes('#')) continue;
      const path = ref.split('?')[0];
      if (/\.[a-z0-9]+$/i.test(path)) assert.ok(existsSync(new URL(`.${path}`, dist)), `missing asset ${path}`);
    }
    assert.ok((html.match(/<img\b/g) || []).length >= 5, 'real service content must include original imagery');
    assert.ok(html.includes('id="faq"') && html.includes('id="localizacao"'), 'original sections must remain');
    if (slug === 'sexualidade') {
      for (const copy of ['Você pode se cobrar menos e se aceitar mais', 'consigo mesmo e com seu relacionamento.', 'Desempenho sexual', 'Autoaceitação LGBT+', 'Tiago Ribeiro', '07/35.690', '50 minutos', 'R$ 95', 'não por pessoa']) {
        assert.ok(html.includes(copy), `approved content must remain: ${copy}`);
      }
      const home = readFileSync(new URL('index.html', dist), 'utf8');
      assert.match(home, /number[^>]*>05</);
      assert.match(home, /class="service-card" href="\/sexualidade" aria-label="Conhecer o atendimento em sexualidade"/);
    }
  });
}
