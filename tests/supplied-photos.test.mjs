import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
const slugs = ['ansiedade', 'depressao', 'tdah', 'avaliacao-neuropsicologica', 'sexualidade'];
const assets = {
  "ingrid-porta-hero": [
    960,
    1260,
    "76d53d4b02339e88c01d832cffe248ad99104b732dd93802e21aa21f78153a20"
  ],
  "simone-retrato": [
    248,
    312,
    "845834c8ed921dbc2ac7acb3e26b536f45ef1cda7aff565fc0beffadc969a45b"
  ],
  "ingrid-retrato": [
    248,
    312,
    "667c4d8735fe7b7da13dc5e89169b35db0bf2bcdc5981af963797a05e7cd96e4"
  ],
  "fachada-inspem-desktop": [
    1216,
    380,
    "c2a1fb3e9f17e7b81cf15d185441f012d99c397e9d08918b006e8f65dc826c4f"
  ],
  "fachada-inspem-mobile": [
    800,
    350,
    "e250876414db91491310ce0a822e6a307b39817aecf27db0db591e563f743104"
  ],
  "sala-espera-inspem": [
    780,
    1040,
    "7300159468cd215d2b76e5161d55df8d68672b0250119a9532342fe379de8f6f"
  ],
  "entrada-inspem": [
    900,
    1200,
    "8210ea0dc9e8b372964e9e917064ce86be4bc11c5f1af2e2e0e77db4d319b0a9"
  ],
  "sala-1-inspem": [
    1200,
    901,
    "04d8bdc0777df055411e2c01aed398184f8807650db8649ab682c1327ca76556"
  ],
  "sala-2-inspem": [
    800,
    600,
    "90743965d7330f4ecd1c2b29867bab572e37ff2d00fa7826366a6ad1d352c5b4"
  ],
  "tiago-hero": [
    960,
    1278,
    "cafea8441f9f1b753cfdda9ee3ddabda3f55eab0d826af89272e192436fb5db8"
  ],
  "tiago-retrato": [
    450,
    570,
    "bc1f6a6035647de9ca330462472bf7f4d2ee3c5cc9d589204defa30664c7da06"
  ]
};
for (const slug of slugs) {
  test(`${slug}: supplied photos, intrinsic dimensions and mobile facade`, () => {
    const html = readFileSync(new URL(`../dist/${slug}/index.html`, import.meta.url), 'utf8');
    assert.ok(!html.includes('/assets/sala-equipe-inspem.avif'), 'team room removed from gallery');
    assert.ok(!html.includes('/assets/consultorio-inspem.avif'), 'vertical room photo replaced');
    const names = ['fachada-inspem-desktop', 'fachada-inspem-mobile', 'sala-espera-inspem', 'entrada-inspem', 'sala-1-inspem', 'sala-2-inspem', ...(slug === 'sexualidade' ? ['tiago-hero', 'tiago-retrato'] : ['ingrid-porta-hero', 'simone-retrato', ...(slug === 'avaliacao-neuropsicologica' ? [] : ['ingrid-retrato'])])];
    for (const name of names) {
      const [w, h, hash] = assets[name];
      const tag = [...html.matchAll(/<(?:img|source)\b[^>]*>/g)].map(m => m[0]).find(t => t.includes(`/assets/${name}.avif`));
      assert.ok(tag, `missing supplied photo ${name}`);
      assert.ok(tag.includes(`width="${w}"`) && tag.includes(`height="${h}"`), `${name}: intrinsic dimensions`);
      for (const directory of ['public', 'dist']) {
        const bytes = readFileSync(new URL(`../${directory}/assets/${name}.avif`, import.meta.url));
        assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, `${name}: unchanged attachment bytes`);
      }
    }
    assert.match(html, /<picture>\s*<source[^>]*media="\(max-width: 600px\)"[^>]*srcset="\/assets\/fachada-inspem-mobile.avif"[^>]*>[\s\S]*?<img[^>]*src="\/assets\/fachada-inspem-desktop.avif"/);
    assert.match(html, /<link[^>]*href="\/assets\/[^"]+-hero.avif"[^>]*type="image\/avif"/);
  });
}
