import { cp, mkdir, readFile, readdir, stat, unlink, writeFile } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const SITE_BASE_URL = (process.env.SITE_BASE_URL || 'https://khristinamaxout.github.io/-website-Agent-X').replace(/\/$/, '');

const FILES = [
  'index.html',
  'examples.html',
  'privacy.html',
  'offer.html',
  '404.html',
  'robots.txt',
  'styles.css',
  'border-glow.css',
  'text-type.css',
  'script.js',
  'border-glow.js',
  'text-type.js',
  '.nojekyll',
];

const HTML_PAGES = [
  { path: 'index.html', priority: '1.0', changefreq: 'weekly' },
  { path: 'examples.html', priority: '0.8', changefreq: 'monthly' },
  { path: 'privacy.html', priority: '0.3', changefreq: 'yearly' },
  { path: 'offer.html', priority: '0.3', changefreq: 'yearly' },
];

function injectSeo(html) {
  let out = html;

  if (!out.includes('og:image')) {
    out = out.replace(
      '</head>',
      `  <meta property="og:image" content="${SITE_BASE_URL}/images/logo.png">\n  <meta property="og:image:alt" content="Цифровой Агент Х">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:image" content="${SITE_BASE_URL}/images/logo.png">\n</head>`
    );
  }

  if (!out.includes('rel="icon"')) {
    out = out.replace(
      '</head>',
      '  <link rel="icon" href="images/favicon.png" type="image/png">\n  <meta name="theme-color" content="#07060b">\n</head>'
    );
  }

  return out;
}

await mkdir(DIST, { recursive: true });

const imagesSrc = join(ROOT, 'images');
const imagesDist = join(DIST, 'images');
await mkdir(imagesDist, { recursive: true });

const imageNames = new Set();
for (const entry of await readdir(imagesSrc, { withFileTypes: true })) {
  if (!entry.isFile() || entry.name.endsWith('.tmp')) continue;
  imageNames.add(entry.name);
  await cp(join(imagesSrc, entry.name), join(imagesDist, entry.name));
}

for (const entry of await readdir(imagesDist, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (!imageNames.has(entry.name) || entry.name.endsWith('.tmp')) {
    await unlink(join(imagesDist, entry.name)).catch(() => {});
  }
}

for (const file of FILES) {
  const src = join(ROOT, file);
  const dest = join(DIST, file);

  if (file.endsWith('.html')) {
    const html = await readFile(src, 'utf8');
    await writeFile(dest, injectSeo(html), 'utf8');
    continue;
  }

  await cp(src, dest);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${HTML_PAGES.map(({ path, priority, changefreq }) => `  <url>
    <loc>${SITE_BASE_URL}/${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

await writeFile(join(DIST, 'sitemap.xml'), sitemap, 'utf8');

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_BASE_URL}/sitemap.xml
`;

await writeFile(join(DIST, 'robots.txt'), robots, 'utf8');

const distStat = async (dir) => {
  let total = 0;
  let count = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await distStat(p);
      total += sub.total;
      count += sub.count;
    } else {
      const s = await stat(p);
      total += s.size;
      count += 1;
    }
  }
  return { total, count };
};

const { total, count } = await distStat(DIST);
console.log(`dist ready: ${count} files, ${(total / 1024 / 1024).toFixed(2)} MB`);
