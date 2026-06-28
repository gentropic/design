// build-site.mjs — assemble the deployable root site into dist/, and render a preview.
//
// The landing lives at landing/index.html and references the repo structure
// (../system/switchboard.css, ../brand/*.svg). This flattens those refs so the page
// serves from the SITE ROOT (gentropic.org/). Push dist/* to gentropic.github.io to deploy.
//
//   npm run build:site      →  dist/{index.html, switchboard.css, *.svg, _preview.png}

import { readFile, writeFile, mkdir, copyFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');

// 1. fresh dist/
await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

// 2. the landing's local deps, flattened to the root
await copyFile(path.join(ROOT, 'system', 'switchboard.css'), path.join(DIST, 'switchboard.css'));
for (const svg of ['gcu-favicon-32.svg', 'gcu-logo-icon.svg']) {
  await copyFile(path.join(ROOT, 'brand', svg), path.join(DIST, svg));
}

// 3. landing/index.html → dist/index.html, structure refs flattened (../system|../brand → ./)
let html = await readFile(path.join(ROOT, 'landing', 'index.html'), 'utf8');
html = html.replaceAll('../system/', '').replaceAll('../brand/', '');
await writeFile(path.join(DIST, 'index.html'), html);
console.log('Assembled dist/ — index.html, switchboard.css, gcu-favicon-32.svg, gcu-logo-icon.svg');

// 3b. previous/ showcase → dist/previous/. Its refs point one level up at the deployed
// root (../system|../brand → ../), where switchboard.css + the favicon already land. Its
// own assets (img/, the preserved digikom app) copy alongside. The live embeds are absolute
// endarthur.github.io URLs, so they need nothing here.
await mkdir(path.join(DIST, 'previous'), { recursive: true });
let prev = await readFile(path.join(ROOT, 'previous', 'index.html'), 'utf8');
prev = prev.replaceAll('../system/', '../').replaceAll('../brand/', '../');
await writeFile(path.join(DIST, 'previous', 'index.html'), prev);
for (const dir of ['img', 'digikom']) {
  await cp(path.join(ROOT, 'previous', dir), path.join(DIST, 'previous', dir), { recursive: true });
}
console.log('Assembled dist/previous/ — index.html + img/ + digikom/');

// 4. preview — render the assembled landing headlessly + screenshot
async function launchBrowser() {
  for (const opts of [undefined, { channel: 'msedge' }, { channel: 'chrome' }]) {
    try {
      return await chromium.launch(opts);
    } catch {
      /* try next */
    }
  }
  throw new Error('No Chromium-family browser. Run: npx playwright install chromium');
}
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page
  .goto(pathToFileURL(path.join(DIST, 'index.html')).href, { waitUntil: 'load', timeout: 20000 })
  .catch(() => {});
await page.waitForTimeout(2000); // let unpkg bearing.js render + the stereonet fade in
await page.screenshot({ path: path.join(DIST, '_preview.png') });
await browser.close();
console.log('Preview → dist/_preview.png');
console.log('Deploy: push dist/* to gentropic.github.io (served at gentropic.org).');
