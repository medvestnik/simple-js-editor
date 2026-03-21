import { cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const distDir = 'dist';
const requiredFiles = [
  'simple-js-editor.umd.js',
  'simple-js-editor.esm.js',
  'simple-js-editor.css'
];

const fallbackRenameMap = new Map([
  ['editor.umd.js', 'simple-js-editor.umd.js'],
  ['editor.esm.js', 'simple-js-editor.esm.js'],
  ['style.css', 'simple-js-editor.css']
]);

for (const [from, to] of fallbackRenameMap) {
  const fromPath = join(distDir, from);
  const toPath = join(distDir, to);

  if (existsSync(fromPath) && !existsSync(toPath)) {
    cpSync(fromPath, toPath);
  }
}

for (const file of requiredFiles) {
  if (!existsSync(join(distDir, file))) {
    throw new Error(`Missing required dist file: ${file}`);
  }
}

cpSync('types/index.d.ts', join(distDir, 'index.d.ts'));

const zipPath = join(distDir, 'dist.zip');
if (existsSync(zipPath)) rmSync(zipPath);

const zipInputs = [
  ...requiredFiles.map((f) => join(distDir, f)),
  join(distDir, 'index.d.ts'),
  'README.md',
  'LICENSE'
];

const zipResult = spawnSync('zip', ['-j', zipPath, ...zipInputs], { stdio: 'inherit' });
if (zipResult.status !== 0) {
  throw new Error('Failed to create dist/dist.zip');
}

console.log('dist artifacts are ready in ./dist');
