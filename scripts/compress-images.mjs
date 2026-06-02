import sharp from 'sharp';
import { readdir, rename, stat, unlink } from 'fs/promises';
import { join, extname, basename } from 'path';

const IMAGES_DIR = join(process.cwd(), 'images');

const JOBS = [
  { in: 'hero-emenu.png', out: 'hero-emenu.webp', w: 1400, q: 82 },
  { in: 'hero-sites.png', out: 'hero-sites.webp', w: 1400, q: 82 },
  { in: 'product-emenu.jpg', out: 'product-emenu.jpg', w: 1200, q: 82, overwrite: true },
  { in: 'card-travel-elena.png', out: 'card-travel-elena.webp', w: 900, q: 80 },
  { in: 'portrait.png', out: 'portrait.webp', w: 1000, q: 82 },
  { in: 'card-cosmetology-yelena.png', out: 'card-cosmetology-yelena.webp', w: 900, q: 80 },
  { in: 'card-flowers-butterflies.jpg', out: 'card-flowers-butterflies.webp', w: 900, q: 80 },
  { in: 'card-atlas-hall.jpg', out: 'card-atlas-hall.webp', w: 900, q: 80 },
  { in: '26799c6b-97a2-437f-8542-d6cbf8fa3d2f.jfif', out: 'card-agent-x.webp', w: 900, q: 82 },
  { in: '2677c34d-866d-4071-bd80-98bbde72f501.jfif', out: 'card-beauty-studio.webp', w: 900, q: 82 },
  { in: 'brand-atmosphere.png', out: 'brand-atmosphere.webp', w: 800, q: 78 },
];

async function sizeKb(path) {
  const s = await stat(path);
  return Math.round(s.size / 1024);
}

for (const job of JOBS) {
  const input = join(IMAGES_DIR, job.in);
  const output = join(IMAGES_DIR, job.out);
  const ext = extname(job.out).slice(1);

  try {
    await stat(input);
  } catch {
    try {
      await stat(output);
      console.log(`skip ${job.in}: already compressed → ${job.out}`);
      continue;
    } catch {
      console.warn(`skip ${job.in}: source missing`);
      continue;
    }
  }

  let pipeline = sharp(input).rotate().resize({ width: job.w, withoutEnlargement: true });

  if (ext === 'webp') {
    pipeline = pipeline.webp({ quality: job.q, effort: 6 });
  } else if (ext === 'jpg' || ext === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: job.q, mozjpeg: true });
  }

  const tmp = output + '.tmp';
  await pipeline.toFile(tmp);
  const before = await sizeKb(input);
  const after = await sizeKb(tmp);
  if (job.in === job.out) {
    await unlink(output).catch(() => {});
  }
  await rename(tmp, output);
  console.log(`${job.in} → ${job.out}: ${before} KB → ${after} KB`);

  if (job.out !== job.in) {
    await unlink(input).catch(() => {});
  }
}

const unused = ['hero-card.png', 'i.webp', 'card-beauty-studio.png'];
for (const file of unused) {
  const path = join(IMAGES_DIR, file);
  try {
    await unlink(path);
    console.log(`removed unused: ${file}`);
  } catch {
    /* ignore */
  }
}

console.log('done');
