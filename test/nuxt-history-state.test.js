const { setup, loadConfig, get, url } = require('@nuxtjs/module-test-utils');

describe('reloadable:true', () => {
    let nuxt;

    beforeAll(async () => {
      ({ nuxt } = (await setup(loadConfig(__dirname))));
    }, 60000)
  
    afterAll(async () => {
      await nuxt.close();
    });

    test('run nuxt', async () => {
        const window = await nuxt.renderAndGetWindow(url('/page1'));
    });
});
