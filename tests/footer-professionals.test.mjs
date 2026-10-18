import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('service footers include Tiago once and preserve their existing professionals', () => {
  for (const slug of ['ansiedade', 'depressao', 'tdah', 'avaliacao-neuropsicologica', 'sexualidade']) {
    const html = readFileSync(new URL(`../dist/${slug}/index.html`, import.meta.url), 'utf8');
    const footer = html.match(/<footer\b[^>]*id="footer"[^>]*>([\s\S]*?)<\/footer>/)?.[1];
    assert.ok(footer, slug);
    assert.equal((footer.match(/<strong>Tiago Ribeiro<\/strong>/g) || []).length, 1, slug);
    assert.match(footer, /CRP:? 07\/35\.690/, slug);
    assert.doesNotMatch(footer, /Psicólogas/, slug);
    if (slug === 'sexualidade') continue;
    assert.match(footer, /CRP 07\/2433/, slug);
    if (slug === 'avaliacao-neuropsicologica') {
      assert.match(footer, /Simone Regina Sandri/, slug);
      assert.match(footer, /Supervisão das avaliações/, slug);
    } else {
      assert.match(footer, /Simone Sandri Modesti/, slug);
      assert.match(footer, /Ingrid Francke/, slug);
      assert.match(footer, /CRP 07\/18623/, slug);
      assert.match(footer, />Psicólogos<\//, slug);
    }
  }
});