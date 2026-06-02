import { cp, mkdir, readdir, stat, unlink } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

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
];

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
  await cp(join(ROOT, file), join(DIST, file));
}

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
