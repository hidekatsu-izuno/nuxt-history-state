import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename } from 'node:path';
import { expect, test } from 'vite-plus/test';

const require = createRequire(import.meta.url);
const historyStateModule = require('..');

function registerPlugins(moduleOptions) {
    const plugins = [];
    historyStateModule.call({
        options: {},
        addPlugin(plugin) {
            plugins.push(plugin);
        }
    }, moduleOptions);
    return plugins;
}

test('registers the Nuxt server and client plugins', () => {
    const plugins = registerPlugins({ reloadable: true });

    expect(plugins.map(({ src, fileName, mode }) => ({
        src: basename(src),
        fileName,
        mode
    }))).toEqual([
        { src: 'plugin.server.js', fileName: 'history-state.server.js', mode: 'server' },
        { src: 'plugin.client.js', fileName: 'history-state.client.js', mode: 'client' }
    ]);
    for (const plugin of plugins) {
        expect(plugin.options.reloadable).toBe(true);
    }
});

test('restores the page number from a reloadable URL on the server', async () => {
    const [serverPlugin] = registerPlugins({ reloadable: true });
    const template = await readFile(serverPlugin.src, 'utf8');
    const source = template.replace('<%= options.reloadable %>', String(serverPlugin.options.reloadable));
    const { default: initialize } = await import('data:text/javascript,' + encodeURIComponent(source));
    const context = { req: { url: '/page1?_p=2' } };
    const injections = [];

    initialize(context, (name, state) => injections.push([name, state]));

    expect(injections).toEqual([['historyState', context.$historyState]]);
    expect(context.$historyState.action).toBe('reload');
    expect(context.$historyState.page).toBe(2);
});
