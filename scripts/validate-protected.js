'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.join(process.cwd(), 'dist', 'site');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');

assert.match(html, /<script src="\.\/game\.js"><\/script>/, 'Protected game script is not linked');
assert.doesNotMatch(html, /<script>([\s\S]*?)<\/script>/i, 'Readable inline game code remains in production HTML');
assert.ok(js.length > 10000, 'Obfuscated game bundle is unexpectedly small');
assert.doesNotMatch(js, /function scheduleReflexCue|const skins=|const achievementDefs=/, 'Readable game source appears in production bundle');
assert.doesNotMatch(js, /sourceMappingURL=/, 'Source map reference must not be published');
assert.ok(!fs.existsSync(path.join(root, 'game.js.map')), 'Source map file must not be published');
new vm.Script(js, { filename: 'dist/site/game.js' });
assert.match(sw, /'\.\/game\.js'/, 'Service Worker does not precache the protected game bundle');
console.log('Protected production validation passed: external obfuscated bundle, JavaScript syntax, no source maps, offline precache.');
