#!/usr/bin/env node
/**
 * Generates src/data/video-placeholders.json for VideoWithPlaceholder.
 * Uses ffmpeg/ffprobe when available and the video file exists; otherwise keeps a neutral SVG data URL + default aspect ratio.
 *
 * Requires ffmpeg in PATH for regeneration (optional for CI — committed JSON is the fallback).
 */
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src/data/video-placeholders.json');

const VIDEOS = [
  {publicPath: '/img/banner-hero-video.mp4', file: 'static/img/banner-hero-video.mp4'},
];

function defaultPlaceholderSvg() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"><rect width="160" height="90" fill="#e6e6e6"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function defaultEntry() {
  return {
    placeholder: defaultPlaceholderSvg(),
    aspectRatio: 16 / 9,
  };
}

function hasFfmpeg() {
  try {
    execSync('ffmpeg -version', {stdio: 'ignore'});
    execSync('ffprobe -version', {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
}

function probeAspect(fullPath) {
  const raw = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,display_aspect_ratio -of json "${fullPath}"`,
    {encoding: 'utf8'},
  );
  const j = JSON.parse(raw);
  const s = j.streams?.[0];
  if (!s) {
    return 16 / 9;
  }
  if (s.width && s.height) {
    return s.width / s.height;
  }
  const dar = s.display_aspect_ratio;
  if (dar && typeof dar === 'string' && dar.includes(':')) {
    const [w, h] = dar.split(':').map(Number);
    if (w > 0 && h > 0) {
      return w / h;
    }
  }
  return 16 / 9;
}

function extractPngBase64(fullPath) {
  const buf = execSync(
    `ffmpeg -nostdin -hide_banner -loglevel error -ss 00:00:00.500 -i "${fullPath}" -an -vframes 1 -vf scale=64:-1 -f image2pipe -vcodec png -`,
    {maxBuffer: 8 * 1024 * 1024},
  );
  return `data:image/png;base64,${buf.toString('base64')}`;
}

function buildEntry(publicPath, relFile) {
  const full = path.join(ROOT, relFile);
  if (!fs.existsSync(full)) {
    console.warn(`[generate-video-placeholders] Missing ${relFile} — using defaults for ${publicPath}`);
    return {[publicPath]: defaultEntry()};
  }
  if (!hasFfmpeg()) {
    console.warn('[generate-video-placeholders] ffmpeg/ffprobe not in PATH — using defaults');
    return {[publicPath]: defaultEntry()};
  }
  try {
    const aspectRatio = probeAspect(full);
    const placeholder = extractPngBase64(full);
    console.log(`[generate-video-placeholders] ${publicPath} → aspect ${aspectRatio.toFixed(4)}`);
    return {[publicPath]: {placeholder, aspectRatio}};
  } catch (e) {
    console.warn(`[generate-video-placeholders] Failed for ${publicPath}:`, e.message);
    return {[publicPath]: defaultEntry()};
  }
}

function main() {
  const out = {};
  for (const v of VIDEOS) {
    Object.assign(out, buildEntry(v.publicPath, v.file));
  }
  fs.mkdirSync(path.dirname(OUT), {recursive: true});
  fs.writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  console.log(`[generate-video-placeholders] Wrote ${OUT}`);
}

main();
