import { expect } from '@playwright/test';
import { startFixture, TestServer } from '@ve-private/test-helpers';

import test from './fixture';

const buildTypes = [
  'browser',
  'mini-css-extract',
  'style-loader',
  'esbuild',
  'esbuild-runtime',
  'vite',
] as const;

buildTypes.forEach((buildType) => {
  test.describe(buildType, () => {
    let server: TestServer;

    test.beforeAll(async ({ port }) => {
      server = await startFixture('sprinkles', {
        type: buildType,
        basePort: port,
      });
    });

    test('sprinkles', async ({ page }) => {
      await page.goto(server.url);

      expect(await page.screenshot()).toMatchSnapshot('sprinkles.png');
    });

    test.afterAll(async () => {
      await server.close();
    });
  });
});
