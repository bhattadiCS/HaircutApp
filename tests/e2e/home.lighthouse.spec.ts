import net from 'node:net';
import { test, expect, chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

async function getAvailablePort() {
  return new Promise<number>((resolve, reject) => {
    const server = net.createServer();

    server.unref();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (!address || typeof address === 'string') {
        reject(new Error('Unable to resolve an open debugging port for Lighthouse.'));
        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(address.port);
      });
    });
  });
}

test('holds the landing experience above the baseline performance budget', async () => {
  test.skip(
    test.info().project.name !== 'lighthouse',
    'This performance budget runs only in the dedicated Lighthouse project.',
  );

  const baseUrl = test.info().project.use.baseURL?.toString() || 'http://127.0.0.1:4174/HaircutApp/';
  const auditUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const debuggingPort = await getAvailablePort();

  const browser = await chromium.launch({
    args: [
      `--remote-debugging-port=${debuggingPort}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const result = await lighthouse(auditUrl, {
      port: debuggingPort,
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices'],
      disableStorageReset: true,
    });

    if (!result) {
      throw new Error('Lighthouse did not produce a report.');
    }

    expect(result.lhr.categories.performance.score).toBeGreaterThanOrEqual(0.9);
    expect(result.lhr.categories.accessibility.score).toBeGreaterThanOrEqual(0.95);
    expect(result.lhr.categories['best-practices'].score).toBeGreaterThanOrEqual(0.9);
  } finally {
    await browser.close();
  }
});