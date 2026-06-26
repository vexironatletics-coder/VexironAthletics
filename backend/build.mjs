/**
 * esbuild build script for the backend.
 * Transpiles TypeScript → CommonJS, bundles all internal source files,
 * and marks every node_modules package as external (they stay in node_modules,
 * not embedded in the bundle). This is ~80-100x faster than tsc.
 *
 * Type-checking is still available via: npm run typecheck
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
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  external,
  sourcemap: true,
  minify: isProd,
  // Tree-shake dead code
  treeShaking: true,
  // Inject a banner so source maps work with Node
  banner: {
    js: '/* VexironAthletics Backend – built with esbuild */',
  },
  logLevel: 'info',
});
