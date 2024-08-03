import { buildSync } from 'esbuild'
import { builtinModules } from 'node:module'
import * as pkg from './package.json'

const dependencies = Object.keys(pkg.dependencies)
const peerDependencies = Object.keys(pkg.peerDependencies)
// const node = `node${pkg.engines.node}`

buildSync({
	entryPoints: ['src/index.ts'],
	outfile: 'dist/index.js',
	minify: true,
	platform: 'node',
	// sourcemap: 'inline',
	target: 'node20',
	bundle: true,
	format: 'esm',
	tsconfig: 'tsconfig.json',
	sourceRoot: 'src',
	treeShaking: true,
	logLevel: 'debug',
	external: [
		...builtinModules,
		...dependencies,
		...peerDependencies,
	],
})
