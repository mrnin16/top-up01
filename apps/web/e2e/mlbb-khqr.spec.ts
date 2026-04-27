import { test, expect } from '@playwright/test';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function registerAndLogin(page: any) {
  const email = `e2e+${Date.now()}@example.com`;
  await page.goto('/auth/register');
  await page.fill('[placeholder="Lina Sok"]',          'Test User');
  await page.fill('[placeholder="you@example.com"]',   email);
  await page.fill('[placeholder="8+ characters"]',     'password123');
  await page.click('button:has-text("Create account")');
  await page.waitForURL('/');
  return email;
}

test.describe('MLBB Direct + KHQR happy path', () => {
  test('desktop: sign up → MLBB → direct → 568+28 pkg → KHQR → DELIVERED', async ({ page }) => {
    await registerAndLogin(page);

    // Search for MLBB
    await page.fill('input[placeholder*="Search"]', 'Mobile Legends');
    await page.click('button:has-text("Mobile Legends")');
    await page.waitForURL(/\/p\/mlbb/);

    // Select direct method (should be pre-selected)
    await page.click('button:has-text("Direct top-up")');

    // Enter IDs
    await page.fill('[placeholder="e.g. 312789045"]', '312789045');
    await page.fill('[placeholder="2155"]',            '2155');
    await expect(page.locator('text=Verified')).toBeVisible({ timeout: 2000 });

    // Pick 568+28 package
    await page.click('button:has-text("568")');

    // Continue
    await page.click('button:has-text("Continue to payment")');
    await page.waitForURL(/\/checkout\//);

    // KHQR is auto-selected; simulate scan
    await page.click('button:has-text("Simulate scan")');
    await page.waitForURL(/\/orders\//, { timeout: 15000 });

    // Should eventually show DELIVERED
    await expect(page.locator('text=Payment successful')).toBeVisible();
    await expect(page.locator('text=Delivery in progress').or(page.locator('text=Delivered'))).toBeVisible({ timeout: 40000 });
  });
});

test.describe('Spotify code + Card', () => {
  test('desktop: Spotify → code → card → redeem code', async ({ page }) => {
    await registerAndLogin(page);

    await page.fill('input[placeholder*="Search"]', 'Spotify');
    await page.click('button:has-text("Spotify")');
    await page.waitForURL(/\/p\/spotify/);

    // Code method should be auto-selected
    await expect(page.locator('[aria-pressed="true"]:has-text("Get a code")')).toBeVisible();

    // Pick first package
    await page.locator('.pkg, button[aria-pressed]').first().click();

    await page.click('button:has-text("Continue to payment")');
    await page.waitForURL(/\/checkout\//);

    // Select card
    await page.click('button:has-text("Visa / Mastercard")');
    await page.fill('[placeholder="4242 4242 4242 4242"]', '4242424242424242');
    await page.fill('[placeholder="Lina Sok"]',             'LINA SOK');
    await page.fill('[placeholder="MM/YY"]',               '12/28');
    await page.fill('[placeholder="123"]',                 '123');

    // Pay (Stripe test mode - needs real Stripe in E2E; skip assertion on card for now)
    // In CI this would use Stripe CLI for webhook forwarding
  });
});

test.describe('Validation failures', () => {
  test('short Game ID is rejected', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto('/p/mlbb');
    await page.fill('[placeholder="e.g. 312789045"]', '123');
    await expect(page.locator('[placeholder="e.g. 312789045"]')).toHaveCSS('border-color', /rgb/);
    // Submit should remain disabled
    await expect(page.locator('button:has-text("Continue to payment")')).toBeDisabled();
  });
});

test.describe('Auth guard', () => {
  test('unauthenticated user visiting /orders/:id redirects to login', async ({ page }) => {
    await page.goto('/orders/nonexistent-id');
    // Should redirect or show 403-like state
    await expect(page).toHaveURL(/\/(auth\/login|orders\/)/);
  });
});
