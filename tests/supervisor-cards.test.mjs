import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

for (const slug of ['ansiedade', 'depressao', 'tdah', 'avaliacao-neuropsicologica']) {
  test(`${slug} adds the Sexualidade supervisor without removing existing supervisors`, () => {
    const html = readFileSync(new URL(`../dist/${slug}/index.html`, import.meta.url), 'utf8');
    const section = html.match(/<section\b[^>]*id="equipe"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(section);
    assert.equal((section.match(/<h3>Tiago Ribeiro<\/h3>/g) || []).length, 1);
    assert.match(section, /Supervisor responsável por questões de sexualidade, gênero e relacionamentos/);
    assert.match(section, /<p class="sup-meta">CRP: 07\/35\.690<\/p>/);
    assert.match(section, /Especialização em:/);
    for (const qualification of ['TCC', 'Neurociência e comportamento', 'Saúde mental com ênfase em dependência química']) {
      assert.ok(section.includes(`<strong>${qualification}</strong>`));
    }
    assert.match(section, /src="\/assets\/tiago-retrato\.avif"/);
    assert.match(section, slug === 'avaliacao-neuropsicologica' ? /<h3>Simone Regina Sandri<\/h3>/ : /<h3>Simone Sandri Modesti<\/h3>/);
    if (slug !== 'avaliacao-neuropsicologica') assert.match(section, /<h3>Ingrid Francke<\/h3>/);
  });
}
