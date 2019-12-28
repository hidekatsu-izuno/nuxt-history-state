import { Nuxt, Builder } from 'nuxt-edge';
import config from './fixture/nuxt.config';

const port = 3001;
const url = path => `http://localhost:${port}${path}`;
jest.setTimeout(60000);

let nuxt;

const setupNuxt = async (config) => {
    nuxt = new Nuxt(config);
  
    await new Builder(nuxt).build();
    await nuxt.listen(port);
}

describe('reloadable:true', () => {
    beforeAll(async () => {
        await setupNuxt(config);
    });
    
    afterAll(async () => {
        await nuxt.close();
    });

    test('run nuxt', async () => {
        await nuxt.renderAndGetWindow(url('/page1'));
    });
});

describe('reloadable:false', () => {
    beforeAll(async () => {
        await setupNuxt(config);
    });
    
    afterAll(async () => {
        await nuxt.close();
    });

    test('run nuxt', () => {

    });
});