import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('sexualidade hero uses the approved heading and welcoming introduction', () => {
  const html = readFileSync(new URL('../dist/sexualidade/index.html', import.meta.url), 'utf8');
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]+>/g, '');
  assert.equal(heading, 'Você pode se cobrar menos e se sentir mais à vontade consigo mesmo e com seus relacionamentos.');
  assert.ok(html.includes('Dificuldades no sexo, conflitos na relação ou inseguranças para viver sua sexualidade? Aqui, você encontra um espaço para falar sobre isso com acolhimento e sem julgamentos.'));
});

test('sexualidade presents the four requested topics and revised introduction and closing', () => {
  const html = readFileSync(new URL('../dist/sexualidade/index.html', import.meta.url), 'utf8');
  const section = html.match(/<section id="para-quem"[^>]*>([\s\S]*?)<\/section>/)[1];
  const copy = [
    'Na psicoterapia individual ou de casal, você encontra um espaço seguro para compreender e lidar com questões que podem afetar sua vida, seus relacionamentos e sua sexualidade. Tais como:',
    'Desempenho e sexualidade',
    'Ansiedade, medo de falhar, dificuldades de ereção, ejaculação, desejo e outras questões que podem interferir na vida sexual.',
    'Relacionamentos e intimidade',
    'Conflitos, dificuldade para se comunicar, distanciamento, inseguranças e desafios na construção da intimidade.',
    'Vivências LGBT+',
    'Vergonha, medo de rejeição, conflitos com a própria identidade e impactos do preconceito.',
    'Masculinidades',
    'Pressões, expectativas, inseguranças e dificuldades relacionadas às formas de viver e expressar a masculinidade.',
    'Embora o conteúdo tenha foco principal nas experiências masculinas, o atendimento não é exclusivo para homens.',
  ];
  for (const text of copy) assert.ok(section.includes(text), `Missing copy: ${text}`);
  assert.equal((section.match(/class="scene"/g) || []).length, 4);
});
