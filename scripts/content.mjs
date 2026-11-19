#!/usr/bin/env node
/**
 * npm run content — re-import the owner's source folder (assets/) into the site.
 *
 *   assets/resume.pdf                  → public/assets/resume.pdf (+ text dump for review)
 *   assets/portrait.*                  → public/assets/portrait.webp (800×800)
 *   assets/og-image.*                  → public/assets/og-image.png (1200×630)
 *   assets/projects/<folder>/
 *       info.md | info.txt | *.pdf | *.docx  → text dump in .content-cache/ (never published)
 *       screenshots/* (or images in root)    → public/assets/projects/<id>/*.webp (≤1600px wide)
 *       video.(mp4|mov|webm)                 → loop.webm + loop.mp4 (muted, ≤10s) via ffmpeg
 *
 * src/data/projects.js is merged, not overwritten: hand-written text is kept, `media` is
 * refreshed from what is on disk, and new folders get a stub entry full of TODO(owner)s.
 * Info files and anything non-media are NEVER copied into public/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets');
const PUB = path.join(ROOT, 'public', 'assets');
const CACHE = path.join(ROOT, '.content-cache');
const PROJECTS_JS = path.join(ROOT, 'src', 'data', 'projects.js');
const GENERATED_JS = path.join(ROOT, 'src', 'data', 'assets.generated.js');
const NOTES = path.join(ROOT, 'CONTENT_NOTES.md');

// Folder name → project id, for folders whose name doesn't slugify to the id used in projects.js.
const FOLDER_ALIASES = {
  '3d portfolio': 'verse',
  'prompt injection defense': 'prompt-defense',
  'legal document risk assesor': 'legal-risk',
  'legal document risk assessor': 'legal-risk',
  'ecommerce': 'glowbox',
  'e-commerce': 'glowbox',
  'ecommerce website': 'glowbox',
  'hospital management': 'careaxis',
  'careaxis hospital management': 'careaxis',
  'northvale wealth': 'northvale',
  'wealth account opening': 'northvale',
};

const IMG_EXT = /\.(png|jpe?g|webp|gif|avif|tiff?|bmp)$/i;
const VID_EXT = /\.(mp4|mov|webm|m4v|mkv)$/i;
const INFO_EXT = /\.(md|txt|pdf|docx)$/i;

const log = (...a) => console.log('  ', ...a);
const slug = (s) => s.toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const has = (cmd) => spawnSync(cmd, ['-version'], { stdio: 'ignore', shell: false }).status === 0
  || spawnSync(cmd, ['-v'], { stdio: 'ignore', shell: false }).status === 0;
const rel = (p) => path.relative(path.join(ROOT, 'public'), p).split(path.sep).join('/');

fs.mkdirSync(PUB, { recursive: true });
fs.mkdirSync(CACHE, { recursive: true });

const report = { resume: null, portrait: null, og: null, projects: [] };
const generated = { portrait: null, ogImage: null };

if (!fs.existsSync(SRC)) {
  console.error('No assets/ folder found. Create assets/ with resume.pdf and projects/<name>/ (see plan §2).');
  process.exit(1);
}

// ── Resume ──────────────────────────────────────────────────────────────────────
console.log('\nResume');
const resume = fs.readdirSync(SRC).find((f) => /^resume.*\.pdf$/i.test(f));
if (resume) {
  fs.copyFileSync(path.join(SRC, resume), path.join(PUB, 'resume.pdf'));
  log(`copied ${resume} → public/assets/resume.pdf`);
  const txt = pdfToText(path.join(SRC, resume));
  if (txt) {
    fs.writeFileSync(path.join(CACHE, 'resume.txt'), txt);
    log('text extracted → .content-cache/resume.txt (re-check src/data/content.js against it)');
  }
  report.resume = resume;
} else log('TODO(owner): assets/resume.pdf missing');

// ── Portrait / OG image ─────────────────────────────────────────────────────────
console.log('\nPortrait & social image');
const portrait = fs.readdirSync(SRC).find((f) => /^portrait\./i.test(f) && IMG_EXT.test(f));
if (portrait) {
  // The whole photo is kept (no crop). Resample with Lanczos, gently stretch the tonal range,
  // lift colour a touch and sharpen, then save at high quality (~2x the displayed size).
  const info = await sharp(path.join(SRC, portrait)).rotate()
    .resize({ width: 480, withoutEnlargement: true, kernel: 'lanczos3' })
    .normalise({ lower: 1, upper: 99 })
    .modulate({ saturation: 1.05 })
    .sharpen({ sigma: 0.8, m1: 0.6, m2: 2 })
    .webp({ quality: 90, smartSubsample: true })
    .toFile(path.join(PUB, 'portrait.webp'));
  generated.portrait = { src: 'assets/portrait.webp', width: info.width, height: info.height };
  report.portrait = portrait;
  log(`${portrait} → public/assets/portrait.webp`);
} else log('TODO(owner): assets/portrait.* missing (a styled monogram is shown instead)');

const og = fs.readdirSync(SRC).find((f) => /^og-image\./i.test(f) && IMG_EXT.test(f));
if (og) {
  await sharp(path.join(SRC, og)).resize(1200, 630, { fit: 'cover' }).png().toFile(path.join(PUB, 'og-image.png'));
  generated.ogImage = 'assets/og-image.png';
  report.og = og;
  log(`${og} → public/assets/og-image.png`);
} else {
  await placeholderOg(path.join(PUB, 'og-image.png'));
  generated.ogImage = 'assets/og-image.png';
  log('TODO(owner): assets/og-image.* missing — generated a plain placeholder og-image.png');
}

// ── Projects ────────────────────────────────────────────────────────────────────
console.log('\nProjects');
const ffmpeg = has('ffmpeg');
const projectsDir = path.join(SRC, 'projects');
const existing = (await import(pathToFileURL(PROJECTS_JS).href + '?t=' + Date.now())).default;
const byId = new Map(existing.map((p) => [p.id, p]));
const folders = fs.existsSync(projectsDir)
  ? fs.readdirSync(projectsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  : [];

for (const folder of folders) {
  const id = FOLDER_ALIASES[folder.toLowerCase()] ?? slug(folder);
  const dir = path.join(projectsDir, folder);
  const out = path.join(PUB, 'projects', id);
  console.log(` ${folder} → ${id}`);
  const entry = byId.get(id) ?? stubEntry(id, folder);
  const r = { id, folder, info: [], screenshots: 0, video: 'none', missing: [], isNew: !byId.has(id) };

  // Info files → text cache (review only, never published).
  const all = walk(dir);
  const infoText = [];
  for (const f of all.filter((f) => INFO_EXT.test(f) && !f.includes(`${path.sep}screenshots${path.sep}`))) {
    const t = extractText(f);
    r.info.push(path.relative(dir, f) + (t ? '' : ' (could not extract text)'));
    if (t) infoText.push(`##### ${path.basename(f)}\n${t}`);
  }
  if (infoText.length) {
    fs.mkdirSync(path.join(CACHE, 'projects'), { recursive: true });
    fs.writeFileSync(path.join(CACHE, 'projects', `${id}.txt`), infoText.join('\n\n'));
  }
  if (r.isNew) fillStubFromInfo(entry, dir);

  // Media: start clean so removed files disappear from the site too.
  fs.rmSync(out, { recursive: true, force: true });
  const images = all.filter((f) => IMG_EXT.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const prevShots = new Map((entry.media?.screenshots ?? []).map((s) => [s.src, s]));
  const shots = [];
  for (const [i, img] of images.entries()) {
    fs.mkdirSync(out, { recursive: true });
    const name = `${slug(path.basename(img)) || 'screenshot-' + (i + 1)}.webp`;
    const dest = path.join(out, name);
    const info = await sharp(img).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
    const src = rel(dest);
    // Smaller variant for panels/phones (srcset).
    let srcset = null;
    if (info.width > 900) {
      const small = dest.replace(/.webp$/, '-800.webp');
      const sinfo = await sharp(img).rotate().resize({ width: 800 }).webp({ quality: 78 }).toFile(small);
      srcset = `${rel(small)} ${sinfo.width}w, ${src} ${info.width}w`;
    }
    const prev = prevShots.get(src);
    shots.push({
      src, srcset, width: info.width, height: info.height,
      alt: prev?.alt ?? `${entry.title}: screenshot ${i + 1}`,
      caption: prev?.caption ?? 'TODO(owner): caption',
    });
  }
  r.screenshots = shots.length;

  let poster = null;
  let video = null;
  const vid = all.find((f) => VID_EXT.test(f));
  if (vid && ffmpeg) {
    fs.mkdirSync(out, { recursive: true });
    const common = ['-y', '-i', vid, '-t', '10', '-an', '-vf', "scale='min(1280,iw)':-2,fps=30"];
    run('ffmpeg', [...common, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', path.join(out, 'loop.webm')]);
    run('ffmpeg', [...common, '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(out, 'loop.mp4')]);
    run('ffmpeg', ['-y', '-ss', '0.5', '-i', vid, '-frames:v', '1', path.join(out, 'poster.png')]);
    const pinfo = await sharp(path.join(out, 'poster.png')).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(out, 'poster.webp'));
    fs.rmSync(path.join(out, 'poster.png'));
    for (const f of ['loop.webm', 'loop.mp4']) {
      const mb = fs.statSync(path.join(out, f)).size / 1048576;
      if (mb > 4) console.warn(`   ! ${f} is ${mb.toFixed(1)}MB (>4MB) — consider a shorter clip`);
    }
    video = { webm: rel(path.join(out, 'loop.webm')), mp4: rel(path.join(out, 'loop.mp4')) };
    poster = { src: rel(path.join(out, 'poster.webp')), width: pinfo.width, height: pinfo.height };
    r.video = 'transcoded';
  } else if (vid) {
    r.video = 'found but ffmpeg is not installed — skipped';
    console.warn(`   ! ${path.basename(vid)} found but ffmpeg is not installed. Install ffmpeg and re-run.`);
  }
  if (!poster && shots.length) {
    // Poster = first screenshot (already optimised).
    poster = { src: shots[0].src, srcset: shots[0].srcset, width: shots[0].width, height: shots[0].height };
  }

  const keepDemo = entry.media?.demo ?? null;
  entry.media = {
    type: keepDemo ? 'demo' : video ? 'video' : shots.length ? 'screenshots' : 'none',
    poster, video, screenshots: shots, demo: keepDemo,
  };
  if (!video && !keepDemo) r.missing.push('loop video (optional)');
  if (!shots.length) r.missing.push('screenshots (optional)');
  for (const l of entry.links ?? []) if (String(l.href).startsWith('TODO')) r.missing.push(`${l.label} link`);
  for (const k of ['summary', 'description']) if (JSON.stringify(entry[k] ?? '').includes('TODO')) r.missing.push(k);
  log(`${shots.length} screenshot(s), video: ${r.video}, info files: ${r.info.length}`);
  byId.set(id, entry);
  report.projects.push(r);
}

// Keep the original order, append new projects at the end.
const ordered = [...existing.map((p) => byId.get(p.id)), ...[...byId.values()].filter((p) => !existing.some((e) => e.id === p.id))];
writeProjects(ordered);
fs.writeFileSync(GENERATED_JS,
  `// Generated by \`npm run content\` — do not edit by hand.\nexport default ${JSON.stringify(generated, null, 2)};\n`);
writeNotes();
console.log('\nDone. Review CONTENT_NOTES.md and src/data/*.js, then run `npm run build`.\n');

// ── helpers ─────────────────────────────────────────────────────────────────────
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
}
function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'pipe' });
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr?.toString().slice(-500)}`);
}
function pdfToText(file) {
  try { return execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8', maxBuffer: 64 << 20 }); }
  catch { console.warn('   ! pdftotext not available — PDF text not extracted (install poppler to enable)'); return null; }
}
function extractText(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.md' || ext === '.txt') return fs.readFileSync(file, 'utf8');
  if (ext === '.pdf') return pdfToText(file);
  if (ext === '.docx') {
    // .docx is a zip; pull word/document.xml with the system `tar` (bsdtar handles zip on Windows/macOS).
    try {
      const xml = execFileSync('tar', ['-xOf', file, 'word/document.xml'], { encoding: 'utf8', maxBuffer: 64 << 20 });
      return xml.replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    } catch { return null; }
  }
  return null;
}
function stubEntry(id, folder) {
  return {
    id,
    title: folder.replace(/\b\w/g, (c) => c.toUpperCase()),
    summary: 'TODO(owner): one-line summary',
    description: ['TODO(owner): fuller description for the details modal'],
    stack: [],
    metrics: [],
    media: { type: 'none', poster: null, video: null, screenshots: [], demo: null },
    links: [{ label: 'Launch', href: 'TODO(owner): link' }],
    featured: false,
  };
}
/** Fill a brand-new stub from a structured info.md / info.txt if one exists. Only literal values are used. */
function fillStubFromInfo(entry, dir) {
  const f = ['info.md', 'info.txt'].map((n) => path.join(dir, n)).find((p) => fs.existsSync(p));
  if (!f) return;
  const text = fs.readFileSync(f, 'utf8');
  const title = text.match(/^#\s+(.+)$/m)?.[1] ?? text.match(/^title:\s*(.+)$/im)?.[1];
  const summary = text.match(/^summary:\s*(.+)$/im)?.[1];
  const stack = text.match(/^(?:stack|tech|tech stack):\s*(.+)$/im)?.[1];
  const link = text.match(/^(?:link|url|launch):\s*(\S+)$/im)?.[1];
  const paras = text.replace(/^#.*$/gm, '').replace(/^\w[\w ]*:.*$/gm, '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (title) entry.title = title.trim();
  if (summary) entry.summary = summary.trim();
  if (stack) entry.stack = stack.split(/[,|·]/).map((s) => s.trim()).filter(Boolean);
  if (link) entry.links = [{ label: 'Launch', href: link }];
  if (paras.length) entry.description = paras;
}
function writeProjects(list) {
  const src = fs.readFileSync(PROJECTS_JS, 'utf8');
  const header = src.slice(0, src.indexOf('export default'));
  fs.writeFileSync(PROJECTS_JS, `${header}export default ${JSON.stringify(list, null, 2)};\n`);
  log(`updated src/data/projects.js (${list.length} projects)`);
}
async function placeholderOg(dest) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><radialGradient id="g" cx="78%" cy="40%" r="70%"><stop offset="0" stop-color="#ECE8F7"/><stop offset=".55" stop-color="#E6EEF8"/><stop offset="1" stop-color="#F7F6FB"/></radialGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="930" cy="300" r="120" fill="none" stroke="#4B3FA8" stroke-opacity=".25" stroke-width="2"/>
  <circle cx="930" cy="300" r="70" fill="#16141F"/>
  <circle cx="930" cy="300" r="78" fill="none" stroke="#D9822B" stroke-opacity=".7" stroke-width="3"/>
  <text x="90" y="290" font-family="Segoe UI, Arial, sans-serif" font-size="84" font-weight="700" fill="#16141F">Dheeraj S J</text>
  <text x="92" y="355" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="#4A4658">Backend · Cloud · LLM Security</text>
  <text x="92" y="410" font-family="Consolas, monospace" font-size="24" fill="#4B3FA8">// beyond the event horizon</text></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(dest);
}
function writeNotes() {
  const START = '<!-- content:auto:start -->';
  const END = '<!-- content:auto:end -->';
  const lines = [START, '## Last `npm run content` import', '', `_Run at ${new Date().toISOString()}_`, ''];
  lines.push(`- Resume: ${report.resume ? `\`assets/${report.resume}\` → \`public/assets/resume.pdf\`` : '**missing**'}`);
  lines.push(`- Portrait: ${report.portrait ? `\`assets/${report.portrait}\` → \`public/assets/portrait.webp\`` : '**missing** (monogram placeholder shown)'}`);
  lines.push(`- OG image: ${report.og ? `\`assets/${report.og}\`` : '**missing** (generated placeholder)'}`);
  lines.push(`- ffmpeg: ${ffmpeg ? 'available' : 'not installed (videos are skipped)'}`, '');
  lines.push('| Project | Source folder | Info files read | Screenshots | Video | Still missing |', '|---|---|---|---|---|---|');
  for (const p of report.projects) {
    lines.push(`| \`${p.id}\`${p.isNew ? ' (new stub)' : ''} | \`assets/projects/${p.folder}/\` | ${p.info.length ? p.info.map((i) => `\`${i}\``).join('<br>') : 'none'} | ${p.screenshots} | ${p.video} | ${p.missing.length ? p.missing.join(', ') : '—'} |`);
  }
  lines.push('', END);
  let notes = fs.existsSync(NOTES) ? fs.readFileSync(NOTES, 'utf8') : '# Content notes\n';
  const block = lines.join('\n');
  notes = notes.includes(START)
    ? notes.replace(new RegExp(`${START}[\\s\\S]*?${END}`), block)
    : `${notes.trimEnd()}\n\n${block}\n`;
  fs.writeFileSync(NOTES, notes);
  log('updated CONTENT_NOTES.md');
}
