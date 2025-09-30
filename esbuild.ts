/*
 * This file is part of the vscode-ddev-phpstan extension.
 *
 * © OpenForgeProject
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import * as esbuild from 'esbuild';

const production: boolean = process.argv.includes('--production');
const watch: boolean = process.argv.includes('--watch');

const esbuildProblemMatcherPlugin: esbuild.Plugin = {
	name: 'esbuild-problem-matcher',

	setup(build: esbuild.PluginBuild): void {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result: esbuild.BuildResult) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				if (location) {
					console.error(`    ${location.file}:${location.line}:${location.column}:`);
				}
			});
			console.log('[watch] build finished');
		});
	},
};

async function main(): Promise<void> {
	// Build extension
	const extensionCtx: esbuild.BuildContext = await esbuild.context({
		entryPoints: ['src/extension.ts'],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
	});

	// Build tests
	const testCtx: esbuild.BuildContext = await esbuild.context({
		entryPoints: ['src/test/*.test.ts'],
		bundle: true,
		format: 'cjs',
		minify: false,
		sourcemap: true,
		sourcesContent: false,
		platform: 'node',
		outdir: 'dist/test',
		external: ['vscode', 'mocha'],
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
	});

	if (watch) {
		await Promise.all([
			extensionCtx.watch(),
			testCtx.watch()
		]);
	} else {
		await extensionCtx.rebuild();
		await testCtx.rebuild();
		await extensionCtx.dispose();
		await testCtx.dispose();
	}
}

main().catch((e: Error) => {
	console.error(e);
	process.exit(1);
});
