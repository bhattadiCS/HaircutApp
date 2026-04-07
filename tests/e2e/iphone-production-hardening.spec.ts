import path from 'node:path';
import { expect, test } from '@playwright/test';
import { buildUserProfile } from '../factories/userFactory';
import { getAdminAuth, getAdminDb } from '../support/firebaseAdmin';

const portraitPath = path.join(process.cwd(), 'tests', 'fixtures', 'portrait.svg');

function vibeLabel(vibe) {
  if (vibe === 'flow') {
    return 'The Flow';
  }

  return `${vibe.slice(0, 1).toUpperCase()}${vibe.slice(1)}`;
}

async function signUp(page, profile) {
  await page.getByRole('button', { name: 'Sign up' }).click();
  await page.getByPlaceholder('Full Name').fill(profile.displayName);
  await page.getByPlaceholder('Email').fill(profile.email);
  await page.getByPlaceholder('Password').fill(profile.password);
  await page.getByRole('button', { name: /^Sign up$/ }).click();
}

async function generateLook(page) {
  await expect(page.getByTestId('mirror-canvas')).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles(portraitPath);
  await page.getByRole('button', { name: 'Generate Skin Fade' }).click();
  await expect(page.getByText('Barber Brief')).toBeVisible({ timeout: 15_000 });
}

test('keeps auth CTAs reachable on small iPhone landscape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone-15-pro', 'iPhone-only hardening suite');

  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign up' }).click();

  const authScene = page.getByTestId('auth-scene');
  const metrics = await authScene.evaluate((element) => ({
    overflowY: getComputedStyle(element).overflowY,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
  }));

  expect(metrics.overflowY).toMatch(/auto|scroll/);
  expect(metrics.scrollHeight).toBeGreaterThanOrEqual(metrics.clientHeight);

  await page.getByRole('button', { name: /^Log in$/ }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: /^Log in$/ })).toBeInViewport();
});

test('isolates sessions across sign-out and removes the mirror JSX leak', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone-15-pro', 'iPhone-only hardening suite');

  const userA = buildUserProfile({ vibe: 'street', displayName: 'Jordan Slate' });
  const userB = buildUserProfile({ vibe: 'classic', displayName: 'Casey Birch' });

  await page.goto('/');
  await signUp(page, userA);
  await page.getByRole('button', { name: `Choose ${vibeLabel(userA.vibe)} vibe` }).click();
  await expect(page.getByTestId('mirror-canvas')).toBeVisible();

  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page.getByRole('button', { name: /^Log in$/ })).toBeVisible();

  await signUp(page, userB);
  await expect(page.getByRole('heading', { name: 'Vibe Check', level: 2 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit Profile' })).toHaveCount(0);

  await page.getByRole('button', { name: `Choose ${vibeLabel(userB.vibe)} vibe` }).click();
  await expect(page.getByTestId('mirror-canvas')).toBeVisible();
  await expect(page.getByText('type="button"')).toHaveCount(0);
});

test('persists bio, keeps refine copy honest, exposes file share, and shows recent looks', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone-15-pro', 'iPhone-only hardening suite');

  const profile = buildUserProfile({ vibe: 'flow', displayName: 'Riley Hart' });
  const savedBio = 'Keeps the taper tight and the crown light.';

  await page.addInitScript(() => {
    window.__shareCalls = [];

    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value(payload) {
        return Array.isArray(payload?.files) && payload.files.length > 0;
      },
    });

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (payload) => {
        window.__shareCalls.push({
          title: payload.title,
          text: payload.text,
          url: payload.url ?? null,
          files: (payload.files || []).map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          })),
        });
      },
    });
  });

  await page.goto('/');
  await signUp(page, profile);

  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.getByText('Style Preferences')).toHaveCount(0);
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await page.locator('#profile-bio').fill(savedBio);
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('dialog', { name: 'Edit Profile' })).toBeHidden();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Vibe Check', level: 2 })).toBeVisible();

  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await expect(page.locator('#profile-bio')).toHaveValue(savedBio);
  await page.getByRole('button', { name: 'Cancel' }).click();

  await page.getByRole('button', { name: `Choose ${vibeLabel(profile.vibe)} vibe` }).click();
  await generateLook(page);

  await page.getByRole('button', { name: 'More volume' }).click();
  await expect(page.getByText(/does not change the preview image/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue to Share' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Share' }).click();

  await expect(page.getByRole('button', { name: 'Share Image' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeVisible();
  await page.getByRole('button', { name: 'Share Image' }).click();

  const shareCalls = await page.evaluate(() => window.__shareCalls);
  expect(shareCalls).toHaveLength(1);
  expect(shareCalls[0].url).toBeNull();
  expect(shareCalls[0].files).toHaveLength(1);
  expect(shareCalls[0].files[0].type).toBe('image/png');
  expect(shareCalls[0].files[0].size).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Back to refine studio' }).click();
  await page.getByRole('button', { name: 'Back to mirror mode' }).click();
  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.getByText('Recent Looks', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open recent look 1' })).toBeVisible();
});

test('exposes a working delete-account path', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone-15-pro', 'iPhone-only hardening suite');

  const profile = buildUserProfile({ vibe: 'classic', displayName: 'Morgan Quinn' });

  await page.goto('/');
  await signUp(page, profile);

  const adminAuth = getAdminAuth();
  const createdUser = await adminAuth.getUserByEmail(profile.email);

  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.getByRole('button', { name: 'Delete Account' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete Account' }).click();
  await page.getByRole('button', { name: 'Delete My Account' }).click();

  await expect(page.getByRole('button', { name: /^Log in$/ })).toBeVisible({ timeout: 30_000 });

  await expect.poll(async () => {
    try {
      await adminAuth.getUserByEmail(profile.email);
      return 'present';
    } catch {
      return 'deleted';
    }
  }).toBe('deleted');

  await expect.poll(async () => {
    const snapshot = await getAdminDb().collection('users').doc(createdUser.uid).get();
    return snapshot.exists;
  }).toBe(false);
});