import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';

const slugs = ['ansiedade', 'depressao', 'tdah', 'avaliacao-neuropsicologica', 'sexualidade'];
const expectedHash = '0591fbe517548f280eb0991f0ee2fe7fcefd9615ee6b4ee3424e9475a6ab4b83';
for (const slug of slugs) {
  test(`${slug} uses the exact approved team photo and intrinsic dimensions`, () => {
    const html = readFileSync(new URL(`../dist/${slug}/index.html`, import.meta.url), 'utf8');
    const image = html.match(/<figure class="team-photo"[^>]*>\s*(<img\b[^>]*>)/)?.[1];
    assert.ok(image, 'team photograph must be rendered');
    assert.ok(image.includes(`/servicos/${slug}/assets/tiago_alto_fc1b84.webp`), 'approved team asset must be used');
    assert.match(image, /width="1391"/);
    assert.match(image, /height="1131"/);
    for (const directory of ['public', 'dist']) {
      const bytes = readFileSync(new URL(`../${directory}/servicos/${slug}/assets/tiago_alto_fc1b84.webp`, import.meta.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedHash, `${directory} must preserve the supplied WebP bytes`);
    }
  });
}
