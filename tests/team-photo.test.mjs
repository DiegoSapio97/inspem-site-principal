import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';

const slugs = ['ansiedade', 'depressao', 'tdah', 'avaliacao-neuropsicologica', 'sexualidade'];
const expectedHash = '0f193541deac8c2df8e9b4854c8d72681505160786c6c99fd43c6bc28858a300';
test('home about section uses the exact approved team photo and intrinsic dimensions', () => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  const section = html.match(/<section\b[^>]*id="sobre"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  const image = section?.match(/<img\b[^>]*>/)?.[0];
  assert.ok(image, 'home about photograph must be rendered');
  assert.match(image, /src="\/assets\/equipe-inspem\.avif"/);
  assert.match(image, /width="686"/);
  assert.match(image, /height="558"/);
  for (const directory of ['public', 'dist']) {
    const bytes = readFileSync(new URL(`../${directory}/assets/equipe-inspem.avif`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedHash, `${directory} must preserve the supplied AVIF bytes`);
  }
});

for (const slug of slugs) {
  test(`${slug} uses the exact approved team photo and intrinsic dimensions`, () => {
    const html = readFileSync(new URL(`../dist/${slug}/index.html`, import.meta.url), 'utf8');
    const image = html.match(/<figure class="team-photo"[^>]*>\s*(<img\b[^>]*>)/)?.[1];
    assert.ok(image, 'team photograph must be rendered');
    assert.ok(image.includes(`/assets/equipe-inspem.avif`), 'approved team asset must be used');
    assert.match(image, /width="686"/);
    assert.match(image, /height="558"/);
    for (const directory of ['public', 'dist']) {
      const bytes = readFileSync(new URL(`../${directory}/assets/equipe-inspem.avif`, import.meta.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedHash, `${directory} must preserve the supplied AVIF bytes`);
    }
  });
}
