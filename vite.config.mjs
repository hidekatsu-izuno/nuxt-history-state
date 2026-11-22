import { defineConfig } from 'vite-plus';

export default defineConfig({
    pack: {
        entry: { 'lib/module': 'lib/module.js' },
        format: 'cjs',
        outDir: 'dist',
        fixedExtension: false,
        dts: false,
        // Keep the module's metadata tied to the packaged manifest.
        deps: { neverBundle: ['../package.json'] },
        inputOptions: { makeAbsoluteExternalsRelative: false },
        copy: [
            'package.json',
            'README.md',
            'LICENSE',
            // Nuxt 2 renders the plugin templates when it loads the module.
            { from: 'lib/plugin.*.js', to: 'dist/lib' },
            { from: 'types/*.d.ts', to: 'dist/types' },
        ],
    },
});
