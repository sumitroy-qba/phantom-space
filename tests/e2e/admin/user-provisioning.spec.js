const { test, expect } = require('@playwright/test');
const { loginAsAdmin, createStartupUser, regenerateCode, disableStartupUser, unlockSubmission } = require('../fixtures/helpers');
const { testStartups, seedTestData, cleanupTestData } = require('../fixtures/test-data');

test.describe('Admin - Startup User Provisioning', () => {

    test.beforeEach(async () => {
        await seedTestData();
    });

    test.afterEach(async () => {
        await cleanupTestData();
    });

    test('A1: Create startup user (happy path)', async ({ page }) => {
        // Login as admin
        await loginAsAdmin(page);

        // Create startup user
        const code = await createStartupUser(page, testStartups.startup1);

        // Verify code was generated
        expect(code).toBeTruthy();
        expect(code.length).toBeGreaterThan(0);

        // Verify user appears in list with "Invited" status
        await page.goto('/admin/startup-users.html');
        const userRow = page.locator(`tr:has-text("${testStartups.startup1.email}")`);
        await expect(userRow).toBeVisible();
        await expect(userRow.locator('.status-badge')).toContainText('Invited');
    });

    test('A2: Duplicate email prevention', async ({ page }) => {
        // Login as admin
        await loginAsAdmin(page);

        // Create first user
        await createStartupUser(page, testStartups.startup1);

        // Try to create another user with same email
        await page.goto('/admin/startup-users.html');
        await page.click('button:has-text("Create New User")');

        await page.fill('input[name="email"]', testStartups.startup1.email);
        await page.fill('input[name="startup_name"]', 'Different Name');
        await page.fill('input[name="contact_name"]', 'Different Contact');

        await page.click('button:has-text("Create User")');

        // Verify error message
        const errorAlert = page.locator('.alert-danger, .error-message');
        await expect(errorAlert).toBeVisible();
        await expect(errorAlert).toContainText(/email.*already.*exists/i);
    });

    test('A3: Regenerate code invalidates old code', async ({ page }) => {
        // Login as admin and create user
        await loginAsAdmin(page);
        const oldCode = await createStartupUser(page, testStartups.startup1);

        // Regenerate code
        const newCode = await regenerateCode(page, testStartups.startup1.email);

        // Verify codes are different
        expect(newCode).not.toBe(oldCode);

        // Try to login with old code - should fail
        await page.goto('/login.html');
        await page.fill('input[name="email"]', testStartups.startup1.email);
        await page.fill('input[name="code"]', oldCode);
        await page.click('button[type="submit"]');

        // Verify error message
        const errorMsg = page.locator('.alert-danger, .error-message');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText(/invalid.*code/i);

        // Try to login with new code - should succeed
        await page.fill('input[name="email"]', testStartups.startup1.email);
        await page.fill('input[name="code"]', newCode);
        await page.click('button[type="submit"]');

        // Verify successful login
        await page.waitForURL('**/survey.html');
    });

    test('A4: Code expiry enforcement', async ({ page, request }) => {
        // Login as admin and create user
        await loginAsAdmin(page);
        const code = await createStartupUser(page, testStartups.startup1.email);

        // Manually set expiry to past (via API or database)
        const { executeQuery } = require('../fixtures/helpers');
        await executeQuery(
            'UPDATE invite_codes SET expires_at = datetime("now", "-1 day") WHERE startup_user_id = (SELECT id FROM startup_users WHERE email = ?)',
            [testStartups.startup1.email]
        );

        // Try to login with expired code
        await page.goto('/login.html');
        await page.fill('input[name="email"]', testStartups.startup1.email);
        await page.fill('input[name="code"]', code);
        await page.click('button[type="submit"]');

        // Verify rejection
        const errorMsg = page.locator('.alert-danger, .error-message');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText(/expired/i);

        // Admin can regenerate
        await loginAsAdmin(page);
        const newCode = await regenerateCode(page, testStartups.startup1.email);

        // New code should work
        await page.goto('/login.html');
        await page.fill('input[name="email"]', testStartups.startup1.email);
        await page.fill('input[name="code"]', newCode);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/survey.html');
    });

    test('A5: Resend invite updates audit fields', async ({ page }) => {
        // Login as admin and create user
        await loginAsAdmin(page);
        await createStartupUser(page, testStartups.startup1);

        // Get initial resent_count and last_sent_at
        const { queryDatabase } = require('../fixtures/helpers');
        const initialData = await queryDatabase(
            'SELECT resent_count, last_sent_at FROM invite_codes WHERE startup_user_id = (SELECT id FROM startup_users WHERE email = ?)',
            [testStartups.startup1.email]
        );

        const initialCount = initialData[0]?.resent_count || 0;
        const initialSentAt = initialData[0]?.last_sent_at;

        // Resend invite
        await page.goto('/admin/startup-users.html');
        const userRow = page.locator(`tr:has-text("${testStartups.startup1.email}")`);
        await userRow.locator('button:has-text("Resend")').click();
        await page.waitForSelector('.alert-success');

        // Wait a moment for database update
        await page.waitForTimeout(500);

        // Verify resent_count incremented and last_sent_at updated
        const updatedData = await queryDatabase(
            'SELECT resent_count, last_sent_at FROM invite_codes WHERE startup_user_id = (SELECT id FROM startup_users WHERE email = ?)',
            [testStartups.startup1.email]
        );

        expect(updatedData[0].resent_count).toBe(initialCount + 1);
        expect(updatedData[0].last_sent_at).not.toBe(initialSentAt);
    });

    test('A6: Disable user blocks login', async ({ page }) => {
        // Login as admin and create user
        await loginAsAdmin(page);
        const code = await createStartupUser(page, testStartups.startup1);

        // Verify code works initially
        await page.goto('/login.html');
        await page.fill('input[name="email"]', testStartups.startup1.email);
        await page.fill('input[name="code"]', code);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/survey.html');

        // Logout
        await page.click('button:has-text("Logout")');

        // Admin disables user
        await loginAsAdmin(page);
        await disableStartupUser(page, testStartups.startup1.email);

        // Try to login again with valid code
        await page.goto('/login.html');
        await page.fill('input[name="email"]', testStartups.startup1.email);
        await page.fill('input[name="code"]', code);
        await page.click('button[type="submit"]');

        // Verify rejection
        const errorMsg = page.locator('.alert-danger, .error-message');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText(/disabled|inactive/i);
    });

    test('A7: Unlock submitted survey', async ({ page }) => {
        // Login as admin and create user
        await loginAsAdmin(page);
        const code = await createStartupUser(page, testStartups.startup1);

        // Startup logs in and submits survey
        await page.goto('/login.html');
        await page.fill('input[name="email"]', testStartups.startup1.email);
        await page.fill('input[name="code"]', code);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/survey.html');

        // Fill minimum required fields and submit
        // (This is simplified - actual implementation would fill all required fields)
        await page.fill('input[name="company_name"]', 'Test Company');
        await page.selectOption('select[name="stage"]', 'Beta');
        await page.click('button:has-text("Submit")');

        // Confirm submission
        const confirmBtn = page.locator('button:has-text("Confirm")');
        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
        }

        await page.waitForSelector('.alert-success:has-text("submitted")');

        // Get submission ID
        const { queryDatabase } = require('../fixtures/helpers');
        const submissions = await queryDatabase(
            'SELECT id FROM survey_submissions WHERE startup_user_id = (SELECT id FROM startup_users WHERE email = ?)',
            [testStartups.startup1.email]
        );
        const submissionId = submissions[0].id;

        // Verify startup cannot edit (survey is locked)
        await page.goto('/survey.html');
        const editWarning = page.locator('.alert-warning, .locked-message');
        await expect(editWarning).toBeVisible();

        // Admin unlocks submission
        await loginAsAdmin(page);
        await unlockSubmission(page, submissionId);

        // Startup can now edit again
        await page.goto('/login.html');
        await page.fill('input[name="email"]', testStartups.startup1.email);
        await page.fill('input[name="code"]', code);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/survey.html');

        // Verify edit mode is available
        const saveBtn = page.locator('button:has-text("Save Draft")');
        await expect(saveBtn).toBeVisible();
        await expect(saveBtn).toBeEnabled();
    });

});
