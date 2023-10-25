import { test, expect } from '@playwright/test';
import { loadStory } from './utils/loadStory';

test('toolbar storybook', async ({ page }) => {
  await loadStory(page, 'example-toolbar');
  await expect(page).toHaveScreenshot();
});

test('cad model container storybook', async ({ page }) => {
  await loadStory(page, 'example-primitivewrappers-cadmodelcontainer');
  await expect(page).toHaveScreenshot();
});

test('image360 details storybook', async ({ page }) => {
  await loadStory(page, 'example-image360details');
  await expect(page).toHaveScreenshot();
});
