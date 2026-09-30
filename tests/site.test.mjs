import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const siteDataUrl = new URL('../src/data/site.mjs', import.meta.url);

test('header exposes each service destination', async () => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] || '';
  const { services } = await import(siteDataUrl.href);
  for (const { href, title } of services) {
    assert.ok(header.includes(`href="${href}"`), `header must link to ${title}`);
  }
});

test('places the clinic photo immediately after the opening section', () => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  const main = html.match(/<main[\s\S]*?<\/main>/)[0];
  const sections = [...main.matchAll(/<section[^>]*class="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(sections.slice(0, 3), ['hero', 'about-section', 'services-section']);
  assert.equal((main.match(/equipe-inspem_7eb2d3c6.webp/g) || []).length, 1);
});

test('explains evidence-based practice and CBT with institutional references', () => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.match(html, /id="como-trabalhamos"/);
  assert.match(html, /Terapia Cognitivo-Comportamental \(TCC\)/);
  for (const concept of ['pesquisas', 'experiência clínica', 'preferências', 'cultura', 'pensamentos', 'comportamentos']) {
    assert.ok(html.includes(concept), `explanation must include ${concept}`);
  }
  assert.match(html, /href="https:\/\/www.apa.org\/practice\/guidelines\/evidence-based-statement"/);
  assert.match(html, /href="https:\/\/beckinstitute.org\/about\/understanding-cbt\/"/);
});

test('defines the five service destinations', async () => {
  assert.ok(existsSync(siteDataUrl), 'src/data/site.mjs must exist');

  const { services } = await import(siteDataUrl.href);
  assert.deepEqual(
    services.map(({ title, href }) => ({ title, href })),
    [
      { title: 'Ansiedade', href: '/ansiedade' },
      { title: 'Depressão', href: '/depressao' },
      { title: 'TDAH', href: '/tdah' },
      {
        title: 'Avaliação neuropsicológica',
        href: '/avaliacao-neuropsicologica',
      },
      { title: 'Sexualidade', href: '/sexualidade' },
    ],
  );
  assert.equal(new Set(services.map(({ href }) => href)).size, services.length);
});

// Snapshot of the supplied v1.4 document, normalized only for Markdown presentation.
// These tests verify editorial fidelity, not legal accuracy or deployed consent tooling.
const privacyHtml = () => readFileSync(new URL('../dist/politica-de-privacidade/index.html', import.meta.url), 'utf8');
const plainText = (html) => html.replace(/<[^>]*>/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

test('privacy v1.4 preserves the entire supplied document body', () => {
  const expected = JSON.parse(readFileSync(new URL('./fixtures/privacy-v1.4.json', import.meta.url), 'utf8'));
  const html = privacyHtml();
  const body = html.split('<div class="legal-body">')[1]?.split('<div class="legal-signature">')[0];
  assert.ok(body);
  assert.equal(plainText(body), expected.bodyText);
  assert.match(html, /Última atualização: 29 de setembro de 2026/);
  assert.match(html, /Versão 1\.4/);
  assert.equal((body.match(/<h2 /g) || []).length, 12);
  assert.doesNotMatch(body, /\\[#*<>\[\]]|\[INSERIR|placeholder|Tiago/i);
  for (const id of ['cookies', 'direitos', 'encarregada', 'canal-de-privacidade']) assert.ok(html.includes(`id="${id}"`));
  assert.match(body, /href="mailto:perceptio@perceptiopsico.com"/);
});

test('privacy preserves revised clinical storage and retention disclosures', () => {
  const text = plainText(privacyHtml());
  for (const term of ['PsicoManager', 'PSICO GESTOR TECNOLOGIA LTDA.', 'Amazon Web Services (AWS) nos Estados Unidos', 'Mínimo de 20 anos a partir do último registro', 'Mínimo de 5 anos a partir do último registro', 'Não há eliminação automática do registro clínico em 30 dias.']) assert.ok(text.includes(term), term);
});

test('privacy rights and privacy channel match the supplied revision', () => {
  const html = privacyHtml();
  const text = plainText(html);
  assert.match(text, /Responderemos em até 15 dias, podendo o prazo ser prorrogado mediante justificativa/);
  assert.match(text, /9\. Canal de privacidade/);
  assert.match(text, /A restrição à eliminação não afasta os demais direitos cabíveis/);
  assert.doesNotMatch(text, /Encarregada:|Encarregada pelo tratamento/);
  const terms = readFileSync(new URL('../dist/termos-de-uso/index.html', import.meta.url), 'utf8');
  assert.match(terms, /Versão 1\.0/);
  assert.match(terms, /2 de setembro de 2026/);
});

test('stylesheets do not use undefined custom properties', () => {
  const globalCss = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  const legalCss = readFileSync(new URL('../src/styles/legal.css', import.meta.url), 'utf8');
  const css = `${globalCss}\n${legalCss}`;
  const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]));
  const used = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]));
  const undefinedProperties = [...used].filter((property) => !defined.has(property));

  assert.deepEqual(undefinedProperties, []);
});

test('all eight pages link to the shared policy without extra tracking', () => {
  const routes = ['', 'ansiedade', 'depressao', 'tdah', 'avaliacao-neuropsicologica', 'sexualidade', 'politica-de-privacidade', 'termos-de-uso'];
  const privacy = privacyHtml();
  for (const route of routes) {
    const html = readFileSync(new URL(`../dist/${route ? route + '/' : ''}index.html`, import.meta.url), 'utf8');
    const footer = html.match(/<footer\b[^>]*class="site-footer"[\s\S]*?<\/footer>/)?.[0] || '';
    assert.ok(footer.includes('href="/politica-de-privacidade"'), route || 'home');
    for (const match of html.matchAll(/href="\/politica-de-privacidade(?:#([^" ]+))?"/g)) {
      if (match[1]) assert.ok(privacy.includes(`id="${match[1]}"`), `${route}: ${match[1]}`);
    }
    assert.doesNotMatch(html, /<script[^>]*src="[^" ]*(?:googletagmanager|google-analytics|doubleclick|connect\.facebook)/i);
    const scripts = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map(m => m[0]).join(' ');
    assert.doesNotMatch(scripts, /gtag\s*\(|fbq\s*\(|GoogleAnalyticsObject|GTM-(?!MCCB6QVW)|G-[A-Z0-9]{6,}/);
  }
});

test('builds an accessible service hub with secondary WhatsApp help', () => {
  const homepagePath = new URL('../dist/index.html', import.meta.url);
  assert.ok(existsSync(homepagePath), 'dist/index.html must exist after the build');

  const html = readFileSync(homepagePath, 'utf8');
  for (const href of [
    '/ansiedade',
    '/depressao',
    '/tdah',
    '/avaliacao-neuropsicologica',
  ]) {
    assert.match(html, new RegExp(`href="${href}"`));
  }
  assert.match(html, /Psicologia baseada em evidências/);
  assert.match(html, /Ainda não sabe qual serviço procurar\?/);
  assert.match(html, /Tirar uma dúvida pelo WhatsApp/);
  assert.match(html, /target="_blank"/);

  for (const page of ['politica-de-privacidade', 'termos-de-uso']) {
    const pagePath = new URL(`../dist/${page}/index.html`, import.meta.url);
    assert.ok(existsSync(pagePath), `${page} must be generated`);
    assert.doesNotMatch(
      readFileSync(pagePath, 'utf8'),
      /Sala 1610\s*[—·-]\s*Sala 1610/,
      `${page} must not repeat the room number`,
    );
  }
});

test('presents the clinic history and evidence-based focus before services and address', () => {
  const homepagePath = new URL('../dist/index.html', import.meta.url);
  assert.ok(existsSync(homepagePath), 'dist/index.html must exist after the build');

  const html = readFileSync(homepagePath, 'utf8');
  const heroStart = html.indexOf('<section class="hero"');
  const servicesStart = html.indexOf('<section class="services-section"');
  const addressStart = html.indexOf('Av. Osvaldo Aranha');

  assert.ok(heroStart >= 0, 'homepage must render the hero');
  assert.ok(servicesStart > heroStart, 'services must remain after the first fold');
  assert.ok(addressStart > servicesStart, 'address must remain after the services');

  const heroHtml = html.slice(heroStart, html.indexOf('</section>', heroStart));
  assert.match(heroHtml, /desde 2010/i);
  assert.match(heroHtml, /basead[ao] em evidências/i);
  assert.doesNotMatch(heroHtml, /Av\. Osvaldo Aranha/);
  assert.doesNotMatch(heroHtml, /Avaliação neuropsicológica/);
});
