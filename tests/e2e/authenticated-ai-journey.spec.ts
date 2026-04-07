import path from 'node:path';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { buildUserProfile } from '../factories/userFactory';
import { getAdminAuth, getAdminDb } from '../support/firebaseAdmin';

test('promotes a guest into an authenticated profile and generates a local recommendation', async ({
  page,
  browserName,
}) => {
  const profile = buildUserProfile({
    vibe: 'street',
    displayName: 'Jordan Rivers',
  });
  const portraitPath = path.join(process.cwd(), 'tests', 'fixtures', 'portrait.svg');

  await page.goto('/');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await page.getByPlaceholder('Full Name').fill(profile.displayName);
  await page.getByPlaceholder('Email').fill(profile.email);
  await page.getByPlaceholder('Password').fill(profile.password);
  await page.getByRole('button', { name: /^Sign up$/ }).click();

  await expect(
    page.getByRole('heading', { name: 'Vibe Check', level: 2 }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Choose Street vibe' }).click();

  await expect(page.getByTestId('mirror-canvas')).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles(portraitPath);
  await expect(
    page.getByRole('button', { name: 'Generate Skin Fade' }),
  ).toBeVisible();

  const styleSelectionAudit = await new AxeBuilder({ page }).analyze();
  expect(styleSelectionAudit.violations).toEqual([]);

  if (browserName === 'chromium') {
    await expect(page.getByTestId('mirror-canvas')).toHaveScreenshot(
      'mirror-canvas.png',
      {
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
      },
    );
  }

  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await expect(page.getByRole('dialog', { name: 'Edit Profile' })).toBeVisible();
  await page.waitForTimeout(500);

  const profileAudit = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();
  expect(profileAudit.violations).toEqual([]);

  await page.getByRole('button', { name: 'Cancel' }).click();

  await page.getByRole('button', { name: 'Generate Skin Fade' }).click();
  await expect(page.getByText(/Profiling|Mapping|Staging/)).toBeVisible({
    timeout: 5_000,
  });

  const animationWindow = await page.evaluate(async () => {
    return new Promise<number>((resolve) => {
      let frames = 0;
      const startedAt = performance.now();

      const tick = () => {
        frames += 1;
        if (frames === 12) {
          resolve(performance.now() - startedAt);
          return;
        }

        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  });

  const animationBudgetByBrowser = {
    chromium: 500,
    firefox: 1000,
    webkit: 4_500,
  };

  expect(animationWindow).toBeLessThan(animationBudgetByBrowser[browserName]);
  await expect(page.getByText('Barber Brief')).toBeVisible({ timeout: 15_000 });

  const adminAuth = getAdminAuth();
  const createdUser = await adminAuth.getUserByEmail(profile.email);
  const profileSnapshot = await getAdminDb()
    .collection('users')
    .doc(createdUser.uid)
    .get();
  const historySnapshot = await getAdminDb()
    .collection('users')
    .doc(createdUser.uid)
    .collection('history')
    .get();

  expect(profileSnapshot.data()?.vibe).toBe('street');
  expect(historySnapshot.size).toBeGreaterThan(0);
});