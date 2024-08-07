import { builtinModules } from 'node:module';
import { buildSync } from 'esbuild';
import * as pkg from './package.json';

const dependencies = Object.keys(pkg.dependencies);
const peerDependencies = Object.keys(pkg.peerDependencies);
const node = `node${pkg.engines.node}`;

buildSync({
	entryPoints: ['src/index.ts'],
	outfile: 'dist/index.js',
	minify: true,
	platform: 'node',
	// sourcemap: 'inline',
	target: node,
	bundle: true,
	format: 'esm',
	tsconfig: 'tsconfig.json',
	sourceRoot: 'src',
	treeShaking: true,
	logLevel: 'debug',
	external: [...builtinModules, ...dependencies, ...peerDependencies],
});
