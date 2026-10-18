import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = slug => readFileSync(new URL(`../dist/${slug}/index.html`, import.meta.url), 'utf8');
const section = (html, id) => html.match(new RegExp(`<section id="${id}"[^>]*>[\\s\\S]*?</section>`))[0];

test('dependencia quimica explains CBT with the approved adult-facing copy', () => {
  const html = section(read('dependencia-quimica'), 'como-funciona');
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  for (const copy of [
    'Terapia Cognitivo-Comportamental — TCC',
    'Você pode aprender a lidar com a vontade de usar.',
    'Na terapia, você aprende a reconhecer os pensamentos, as emoções e as situações que aumentam sua vontade de consumir álcool ou outras drogas. Com o terapeuta, você desenvolve e pratica estratégias para atravessar esses momentos e fazer escolhas que protejam sua saúde.',
    'O objetivo é ajudar você a recuperar espaço para o que importa.',
    'Isso envolve aprender a enfrentar o estresse, lidar com a vontade intensa de usar — chamada fissura — e se preparar para situações de risco. O cuidado também busca ajudar você a retomar atividades, relações e planos que o consumo deixou em segundo plano.'
  ]) assert.ok(text.includes(copy), `Missing approved copy: ${copy}`);
});

test('dependencia quimica preserves the anxiety layout, team and location with substance-specific care', () => {
  assert.ok(existsSync(new URL('../dist/dependencia-quimica/index.html', import.meta.url)), 'Missing /dependencia-quimica/ page');
  const html = read('dependencia-quimica');
  const anxiety = read('ansiedade');
  assert.match(html, /<title>Dependência química: atendimento psicológico \| INSPEM<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/inspem.com.br\/dependencia-quimica\/"/);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.equal(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g, ''), 'A dependência química controla a sua vida? Você pode retomar o controle da sua vida e fazer ela valer a pena.');
  for (const id of ['valor', 'equipe', 'localizacao']) assert.equal(section(html, id), section(anxiety, id), `Preserve ${id}`);
  assert.deepEqual([...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(m => m[1]), [...anxiety.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(m => m[1]));
  for (const copy of ['álcool e outras drogas', 'fissura', 'Terapia Cognitivo-Comportamental', 'abstinência', 'avaliação médica', 'SAMU (192)', 'R$ 95', '50 minutos', 'Quero solicitar uma triagem']) assert.ok(html.includes(copy), `Missing ${copy}`);
  assert.doesNotMatch(html, /cura garantida|especialista em dependência|5,0 no Google|cid=INSPEM|2\.000\+/);
  assert.match(html, /href="https:\/\/wa.me\//);
  for (const id of ['faq-plano-saude', 'faq-imposto-renda']) {
    const pattern = new RegExp(`<details id="${id}"[\\s\\S]*?</details>`);
    assert.equal(html.match(pattern)?.[0], anxiety.match(pattern)?.[0], `Preserve ${id} answers linked from investment`);
  }
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(anchor), `Missing anchor ${anchor}`);
});
