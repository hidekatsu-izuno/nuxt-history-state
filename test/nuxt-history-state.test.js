const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const test = require('node:test');
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

    assert.deepEqual(plugins.map(({ src, fileName, mode }) => ({
        src: path.basename(src),
        fileName,
        mode
    })), [
        { src: 'plugin.server.js', fileName: 'history-state.server.js', mode: 'server' },
        { src: 'plugin.client.js', fileName: 'history-state.client.js', mode: 'client' }
    ]);
    for (const plugin of plugins) {
        assert.equal(plugin.options.reloadable, true);
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

    assert.deepEqual(injections, [['historyState', context.$historyState]]);
    assert.equal(context.$historyState.action, 'reload');
    assert.equal(context.$historyState.page, 2);
});
