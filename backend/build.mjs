/**
 * esbuild build script for the backend.
 *
 * Outputs entry-point files:
 *   dist/index.js       — standalone server (node dist/index.js)
 *   dist/hostEntry.js   — createApp + startServices in ONE bundle (used by root server.js)
 *   dist/createApp.js   — Express app factory (standalone)
 *   dist/startServices.js — DB services (standalone)
 *
 * All node_modules are marked external — they stay in node_modules.
 * ~80-100x faster than tsc.
 */
import { build } from 'esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
];

const isProd = process.env.NODE_ENV === 'production';

await build({
  entryPoints: [
    'src/index.ts',
    'src/hostEntry.ts',
    'src/createApp.ts',
    'src/startServices.ts',
  ],
  outdir: 'dist',         // outputs dist/index.js, dist/hostEntry.js, etc.
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  external,
  sourcemap: true,
  minify: isProd,
  treeShaking: true,
  banner: { js: '/* VexironAthletics Backend – built with esbuild */' },
  logLevel: 'info',
});
