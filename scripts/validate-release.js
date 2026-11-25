'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const version = read('VERSION').trim();
assert.match(version, /^\d+\.\d+\.\d+$/, 'VERSION must be semantic versioning');
const html = read('site/index.html');
const manifest = JSON.parse(read('site/manifest.json'));
const sw = read('site/service-worker.js');

assert.match(html, /<title>Reaction Snake<\/title>/, 'HTML title missing');
assert.match(html, /name="viewport"/, 'Viewport metadata missing');
assert.match(html, /rel="manifest" href="\.\/manifest.json"/, 'Web app manifest is not linked');
assert.match(html, /serviceWorker\.register\('\.\/service-worker\.js'\)/, 'Service Worker registration missing');

const scriptMatches = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
assert.ok(scriptMatches.length > 0, 'No inline game script found');
scriptMatches.forEach((match, index) => new vm.Script(match[1], { filename: 'site/index.html:inline-' + (index + 1) }));

const staticMarkup = html.split(/<script\b/i)[0];
const ids = [...staticMarkup.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate static HTML id found');
const idSet = new Set(ids);
const references = [...html.matchAll(/\$\(['"]([A-Za-z][\w-]*)['"]\)/g)].map((match) => match[1]);
const missingIds = [...new Set(references.filter((id) => !idSet.has(id)))];
assert.deepEqual(missingIds, [], 'JavaScript references missing static DOM ids');

for (const mode of ['classic', 'reflex', 'survival', 'precision', 'daily']) {
  assert.ok(html.includes('data-mode="' + mode + '"'), 'Missing game mode: ' + mode);
}
assert.match(html, /performance\.now\(\)-reflexCueAt/, 'Reflex reaction timing is missing');
assert.match(html, /data\.reflexBestMs/, 'Persistent Reflex record is missing');
assert.match(html, /localStorage\.setItem\('rs-save'/, 'Local game save is missing');
assert.match(html, /localStorage\.setItem\('rs-settings'/, 'Local settings save is missing');

assert.equal(manifest.name, 'Reaction Snake', 'Manifest name mismatch');
assert.equal(manifest.display, 'standalone', 'Installable standalone display missing');
assert.ok(manifest.icons.some((icon) => icon.src === './icon.svg'), 'Local offline app icon missing');
for (const icon of manifest.icons) {
  if (icon.src.startsWith('./')) assert.ok(exists(path.join('site', icon.src.slice(2))), 'Missing local manifest icon: ' + icon.src);
}

new vm.Script(sw, { filename: 'site/service-worker.js' });
const assetsMatch = sw.match(/const ASSETS=\[([^\]]+)\]/);
assert.ok(assetsMatch, 'Service Worker asset list missing');
const assets = [...assetsMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
for (const asset of assets) {
  if (asset.startsWith('./')) {
    const localPath = asset.slice(2).split('?')[0];
    assert.ok(exists(path.join('site', localPath)), 'Missing cached local asset: ' + asset);
  }
}
assert.match(sw, /e\.request\.mode==='navigate'\?caches\.match\('\.\/index\.html'\)/, 'Offline fallback must be navigation-only');

const gameSource = html + sw;
assert.doesNotMatch(gameSource, /supabase|posthog|mixpanel|amplitude|google-analytics|plausible/i, 'Unexpected analytics integration found');
for (const doc of ['README.md', 'README.ru.md', 'README.de.md']) {
  assert.ok(read(doc).includes(version), doc + ' does not mention release version ' + version);
}
console.log('Release validation passed for Reaction Snake ' + version);
console.log('Checked: inline JavaScript syntax, DOM references, five modes, Reflex timing/save, manifest icons, cached assets, offline navigation fallback, and analytics-free game source.');
