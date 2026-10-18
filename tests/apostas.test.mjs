import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const output = new URL('../dist/apostas/index.html', import.meta.url);
const plain = html => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const section = (html, id) => html.match(new RegExp(`<section id="${id}"[^>]*>[\\s\\S]*?</section>`))[0];

test('apostas builds the approved page using the anxiety template without unsupported claims', () => {
  assert.ok(existsSync(output), 'Missing built /apostas/ page');
  const html = readFileSync(output, 'utf8');
  const anxiety = readFileSync(new URL('../dist/ansiedade/index.html', import.meta.url), 'utf8');
  assert.match(html, /<title>Problemas com apostas: atendimento psicológico \| INSPEM<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/inspem.com.br\/apostas\/"/);
  assert.equal(plain(html.match(/<h1[^>]*>[\s\S]*?<\/h1>/)[0]), 'As apostas estão prejudicando sua vida? Você pode buscar ajuda para mudar essa relação.');
  assert.deepEqual([...html.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]), [...anxiety.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]));
  for (const id of ['valor', 'equipe']) assert.equal(section(html, id), section(anxiety, id), `Preserve ${id}`);
  assert.deepEqual([...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(m => m[1]), [...anxiety.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(m => m[1]));
  for (const copy of ['Você tenta parar, mas volta a apostar', 'Você aposta para recuperar o que perdeu', 'Você esconde os gastos e acumula contas', 'As apostas ocupam o espaço de outras atividades', 'O cuidado considera sua vida, não apenas as apostas.', 'Conheça as avaliações sobre a INSPEM.', 'Elas não representam resultados específicos do atendimento para problemas com apostas.', 'O que é ludopatia?', 'Não há um prazo único que possa ser prometido antes dessa avaliação.', 'SAMU (192)', 'Quero solicitar uma triagem', 'Quero conversar com a equipe']) assert.ok(plain(html).includes(copy), `Missing copy: ${copy}`);
  assert.equal((section(html, 'faq').match(/<details\b/g) || []).length, 9);
  for (const id of ['faq-plano-saude', 'faq-imposto-renda']) {
    const pattern = new RegExp(`<details id="${id}"[\\s\\S]*?</details>`);
    assert.equal(html.match(pattern)[0], anxiety.match(pattern)[0]);
  }
  assert.doesNotMatch(html, /2\.000\+|12 e 20 sessões|cid=INSPEM|5,0 no Google|Nota máxima no Google|especialista em ludopatia|\[1\]|\[2\]/);
  assert.match(html, /href="https:\/\/wa.me\//);
  assert.match(html, /href="\/politica-de-privacidade/);
});
