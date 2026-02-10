const { test, expect } = require('@playwright/test');
const { loginAsStartup, loginAsAdmin, createStartupUser } = require('../fixtures/helpers');
const { testStartups, seedTestData, cleanupTestData } = require('../fixtures/test-data');

test.describe('Startup User - Authentication & Session', () => {

    let testCode;

    test.beforeEach(async ({ page }) => {
        await seedTestData();

        // Create a test user for authentication tests
        await loginAsAdmin(page);
        testCode = await createStartupUser(page, testStartups.startup1);
    });

    test.afterEach(async () => {
        await cleanupTestData();
    });

    test('D1: First login consumes OTP', async ({ page }) => {
        // First login with code
        await loginAsStartup(page, testStartups.startup1.email, testCode);

        // Verify successful login
        await expect(page).toHaveURL(/.*survey\.html/);

        // Logout
        await page.click('button:has-text("Logout")');
        await page.waitForURL(/.*login\.html/);

        // Try to login again with same code - should fail
        await page.fill('input[name="email"]', testStartups.startup1.email);
        await page.fill('input[name="code"]', testCode);
        await page.click('button[type="submit"]');

        // Verify error message
        const errorMsg = page.locator('.alert-danger, .error-message');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText(/invalid.*code|already.*used/i);
    });

    test('D2: Wrong code handling', async ({ page }) => {
        // Try to login with wrong code
        await page.goto('/login.html');
        await page.fill('input[name="email"]', testStartups.startup1.email);
        await page.fill('input[name="code"]', 'WRONGCODE123');
        await page.click('button[type="submit"]');

        // Verify generic error message (no info leakage)
        const errorMsg = page.locator('.alert-danger, .error-message');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText(/invalid.*credentials|invalid.*code/i);

        // Should NOT reveal if email exists
        await expect(errorMsg).not.toContainText(/email.*not.*found/i);
    });

    test('D3: Session persistence', async ({ page }) => {
        // Login
        await loginAsStartup(page, testStartups.startup1.email, testCode);

        // Navigate to multiple pages
        await page.goto('/survey.html');
        await expect(page.locator('body')).not.toContainText('Login');

        await page.goto('/survey.html?section=2');
        await expect(page.locator('body')).not.toContainText('Login');

        await page.goto('/survey.html?section=3');
        await expect(page.locator('body')).not.toContainText('Login');

        // Session should still be valid
        const userIndicator = page.locator('#user-email, .user-info');
        await expect(userIndicator).toContainText(testStartups.startup1.email);
    });

    test('D4: Logout and resume', async ({ page }) => {
        // Login
        await loginAsStartup(page, testStartups.startup1.email, testCode);

        // Fill some data
        await page.fill('input[name="company_name"]', 'Test Company');
        await page.selectOption('select[name="stage"]', 'Beta');

        // Save draft
        await page.click('button:has-text("Save Draft")');
        await page.waitForSelector('.alert-success');

        // Logout
        await page.click('button:has-text("Logout")');
        await page.waitForURL(/.*login\.html/);

        // Login again (need new code since first one was consumed)
        await loginAsAdmin(page);
        const { regenerateCode } = require('../fixtures/helpers');
        const newCode = await regenerateCode(page, testStartups.startup1.email);

        await loginAsStartup(page, testStartups.startup1.email, newCode);

        // Verify data was preserved
        await expect(page.locator('input[name="company_name"]')).toHaveValue('Test Company');
        await expect(page.locator('select[name="stage"]')).toHaveValue('Beta');
    });

});
