'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const JavaScriptObfuscator = require('javascript-obfuscator');

const root = process.cwd();
const sourceDir = path.join(root, 'site');
const outputDir = path.join(root, 'dist', 'site');
const html = fs.readFileSync(path.join(sourceDir, 'index.html'), 'utf8');
const matches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];

if (matches.length !== 1) {
  throw new Error('Expected exactly one inline game script; refusing an unsafe build.');
}

const source = matches[0][1];
if (!source.includes("'use strict'") || !source.includes('function scheduleReflexCue')) {
  throw new Error('Unexpected game source; refusing to build.');
}

const result = JavaScriptObfuscator.obfuscate(source, {
  compact: true,
  simplify: true,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  stringArray: true,
  stringArrayThreshold: 0.65,
  stringArrayEncoding: ['base64'],
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 1,
  stringArrayWrappersType: 'variable',
  controlFlowFlattening: false,
  deadCodeInjection: false,
  selfDefending: false,
  debugProtection: false,
  disableConsoleOutput: false,
  sourceMap: false,
  numbersToExpressions: false,
  unicodeEscapeSequence: false
}).getObfuscatedCode();

new vm.Script(result, { filename: 'game.js' });
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.cpSync(sourceDir, outputDir, { recursive: true });
const outputSwPath = path.join(outputDir, 'service-worker.js');
let outputSw = fs.readFileSync(outputSwPath, 'utf8');
const outputSwWithBundle = outputSw.replace("'./theme.css?v=22'", "'./theme.css?v=22','./game.js'");
if (outputSwWithBundle === outputSw) throw new Error('Could not add protected game bundle to offline cache.');
fs.writeFileSync(outputSwPath, outputSwWithBundle);
const protectedHtml = html.replace(matches[0][0], '<script src="./game.js"></script>');
fs.writeFileSync(path.join(outputDir, 'index.html'), protectedHtml);
fs.writeFileSync(path.join(outputDir, 'game.js'), result + '\n');
console.log('Protected production build created at dist/site');
console.log('Game logic obfuscated; no source map generated.');
