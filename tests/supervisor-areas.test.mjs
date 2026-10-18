import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const scopes = {
  Simone: 'Supervisora responsável por avaliação neuropsicológica',
  Ingrid: 'Supervisora responsável por Psicologia Clínica — TCC/Terapia do Esquema',
  Tiago: 'Supervisor responsável por questões de sexualidade, gênero e relacionamentos',
};
test('every supervisor card includes its requested area without replacing qualifications', () => {
  for (const slug of ['ansiedade', 'depressao', 'tdah', 'avaliacao-neuropsicologica', 'sexualidade']) {
    const html = readFileSync(new URL(`../dist/${slug}/index.html`, import.meta.url), 'utf8');
    const section = html.match(/<section\b[^>]*id="equipe"[^>]*>([\s\S]*?)<\/section>/)[1];
    const cards = [...section.matchAll(/<div class="sup">([\s\S]*?)<\/ul>/g)];
    assert.equal(cards.length, slug === 'sexualidade' ? 1 : slug === 'avaliacao-neuropsicologica' ? 2 : 3);
    for (const [, card] of cards) {
      const name = card.match(/<h3>(.*?)<\/h3>/)[1];
      const scope = scopes[name.split(' ')[0]];
      assert.ok(card.includes(`<p class="role">${scope}</p>`), `${slug}: ${name} missing purple role ${scope}`);
      assert.ok(!card.includes('Supervisiona:'));
      const metadata = name.startsWith('Ingrid') ? 'Fundadora · CRP 07/18623' : name.startsWith('Tiago') ? 'CRP: 07/35.690' : 'CRP 07/2433';
      assert.ok(card.includes(`<p class="sup-meta">${metadata}</p>`), `${slug}: ${name} missing metadata ${metadata}`);
      assert.equal((card.match(/CRP/g) || []).length, 1, `${slug}: ${name} must show CRP exactly once`);
      assert.match(card, /<li><strong>/);
    }
  }
});
