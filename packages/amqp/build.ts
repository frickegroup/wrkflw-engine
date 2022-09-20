import { buildSync } from 'esbuild'
import { builtinModules } from 'node:module'

const dependencies = Object.keys(process.env)
	.filter(k => k.startsWith('npm_package_dependencies'))
	.map(k => k.split('__')[1])

const peerDependencies = Object.keys(process.env)
	.filter(k => k.startsWith('npm_package_peerDependencies'))
	.map(k => k.split('__')[1])

const node = `node${process.env.npm_package_engines_node ?? ''}`

buildSync({
	entryPoints: ['src/index.ts'],
	outfile: 'dist/index.js',
	minify: true,
	platform: 'node',
	sourcemap: 'inline',
	target: node,
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
