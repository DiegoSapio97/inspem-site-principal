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

test('defines the four service destinations', async () => {
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
    ],
  );
  assert.equal(new Set(services.map(({ href }) => href)).size, services.length);
});

test('generated privacy page accurately describes the initial site tracking setup', () => {
  const privacyPath = new URL('../dist/politica-de-privacidade/index.html', import.meta.url);
  assert.ok(existsSync(privacyPath), 'privacy page must be generated');

  const html = readFileSync(privacyPath, 'utf8');
  assert.match(
    html,
    /não utiliza Google Analytics, Google Ads, Meta Pixel ou cookies não essenciais/i,
  );
  assert.match(
    html,
    /não exibe (?:aviso|banner) de consentimento nem (?:oferece|disponibiliza) controle de preferências de cookies/i,
  );
  assert.doesNotMatch(html, /Dados de navegação coletados pelo Google Analytics/i);
  assert.doesNotMatch(html, /utilizamos duas ferramentas[^:]*Google LLC/i);
  assert.doesNotMatch(html, /A Google mantém infraestrutura fora do Brasil/i);
  assert.doesNotMatch(html, /aviso de cookies oferece as opções/i);
  assert.doesNotMatch(html, /"Preferências de cookies"/i);
  assert.doesNotMatch(html, /Google Analytics<\/strong> e o <strong>Google Ads/i);
});

test('generated privacy page discloses WhatsApp triage data in international transfers', () => {
  const privacyPath = new URL('../dist/politica-de-privacidade/index.html', import.meta.url);
  assert.ok(existsSync(privacyPath), 'privacy page must be generated');

  const html = readFileSync(privacyPath, 'utf8');
  assert.match(
    html,
    /transferências[\s\S]*dados de contato e às informações que você escolhe compartilhar durante a triagem pelo WhatsApp/i,
  );
  assert.doesNotMatch(html, /Registros clínicos não são armazenados em servidores no exterior/i);
});

test('generated privacy page distinguishes LGPD response deadlines by right and format', () => {
  const html = readFileSync(new URL('../dist/politica-de-privacidade/index.html', import.meta.url), 'utf8');
  const rights = html.match(/<h2 id="direitos">[\s\S]*?(?=<h2 id="encarregada">)/)?.[0];
  assert.ok(rights, 'privacy page must render the rights section');
  const text = rights.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

  assert.match(text, /confirmação de existência ou o acesso a dados pessoais[^.]*formato simplificado, imediatamente/i);
  assert.match(text, /ou por meio de declaração clara e completa, em até 15 dias contados da data do requerimento/i);
  assert.match(text, /demais direitos[^.]*prazos legais e regulamentares aplicáveis/i);
  assert.doesNotMatch(text, /Responderemos em até 15 dias|prorrog|mediante justificativa/i);
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

test('generated privacy page limits visitor data to ordinary access logs', () => {
  const privacyPath = new URL('../dist/politica-de-privacidade/index.html', import.meta.url);
  assert.ok(existsSync(privacyPath), 'privacy page must be generated');

  const html = readFileSync(privacyPath, 'utf8');
  assert.match(
    html,
    /Endereço IP, data e hora do acesso, endereço solicitado, código de resposta, navegador \(user agent\) e página de origem \(referer\)/i,
  );
  assert.doesNotMatch(html, /tempo de permanência/i);
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
