const { expect } = require('@playwright/test');

/**
 * Helper functions for E2E tests
 */

// ==================== ADMIN HELPERS ====================

/**
 * Login as admin user
 * @param {import('@playwright/test').Page} page
 * @param {string} username
 * @param {string} password
 */
exports.loginAsAdmin = async (page, username = 'admin', password = 'admin123') => {
    await page.goto('/admin/login.html');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/admin/dashboard.html');
    await expect(page.locator('#username-display')).toContainText(username);
};

/**
 * Create a startup user from admin panel
 * @param {import('@playwright/test').Page} page
 * @param {Object} userData
 * @returns {Promise<string>} The generated one-time code
 */
exports.createStartupUser = async (page, userData) => {
    await page.goto('/admin/startup-users.html');
    await page.click('button:has-text("Create New User")');

    // Fill form
    await page.fill('input[name="email"]', userData.email);
    await page.fill('input[name="startup_name"]', userData.startup_name);
    await page.fill('input[name="contact_name"]', userData.contact_name);

    // Submit and wait for success
    await page.click('button:has-text("Create User")');
    await page.waitForSelector('.alert-success');

    // Extract the one-time code from the success message or modal
    const codeElement = await page.locator('.one-time-code, [data-code]').first();
    const code = await codeElement.textContent();

    return code.trim();
};

/**
 * Regenerate code for a startup user
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 * @returns {Promise<string>} The new one-time code
 */
exports.regenerateCode = async (page, email) => {
    await page.goto('/admin/startup-users.html');

    // Find the user row and click regenerate
    const userRow = page.locator(`tr:has-text("${email}")`);
    await userRow.locator('button:has-text("Regenerate")').click();

    // Wait for confirmation and extract new code
    await page.waitForSelector('.alert-success');
    const codeElement = await page.locator('.one-time-code, [data-code]').first();
    const newCode = await codeElement.textContent();

    return newCode.trim();
};

/**
 * Disable a startup user
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 */
exports.disableStartupUser = async (page, email) => {
    await page.goto('/admin/startup-users.html');

    const userRow = page.locator(`tr:has-text("${email}")`);
    await userRow.locator('button:has-text("Disable")').click();

    // Confirm action
    await page.click('button:has-text("Confirm")');
    await page.waitForSelector('.alert-success');
};

/**
 * Unlock a submitted survey
 * @param {import('@playwright/test').Page} page
 * @param {number} submissionId
 */
exports.unlockSubmission = async (page, submissionId) => {
    await page.goto(`/admin/submission-details.html?id=${submissionId}`);
    await page.click('button:has-text("Unlock")');
    await page.waitForSelector('.alert-success');
};

// ==================== STARTUP USER HELPERS ====================

/**
 * Login as startup user with one-time code
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 * @param {string} code
 */
exports.loginAsStartup = async (page, email, code) => {
    await page.goto('/login.html');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="code"]', code);
    await page.click('button[type="submit"]');

    // Wait for redirect to survey or dashboard
    await page.waitForURL('**/survey.html');
};

/**
 * Fill a survey section with data
 * @param {import('@playwright/test').Page} page
 * @param {string} sectionName
 * @param {Object} data
 */
exports.fillSurveySection = async (page, sectionName, data) => {
    // Navigate to section if not already there
    await page.click(`a:has-text("${sectionName}")`);

    // Fill fields based on data object
    for (const [fieldName, value] of Object.entries(data)) {
        const input = page.locator(`[name="${fieldName}"], #${fieldName}`);
        const inputType = await input.getAttribute('type');

        if (inputType === 'checkbox' || inputType === 'radio') {
            if (value) await input.check();
        } else if (await input.evaluate(el => el.tagName === 'SELECT')) {
            await input.selectOption(value);
        } else {
            await input.fill(String(value));
        }
    }
};

/**
 * Save draft
 * @param {import('@playwright/test').Page} page
 */
exports.saveDraft = async (page) => {
    await page.click('button:has-text("Save Draft")');
    await page.waitForSelector('.alert-success:has-text("Draft saved")');
};

/**
 * Submit survey
 * @param {import('@playwright/test').Page} page
 */
exports.submitSurvey = async (page) => {
    await page.click('button:has-text("Submit")');

    // Confirm submission if there's a confirmation dialog
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
        await confirmButton.click();
    }

    await page.waitForSelector('.alert-success:has-text("submitted")');
};

// ==================== VALIDATION HELPERS ====================

/**
 * Check if required field validation is working
 * @param {import('@playwright/test').Page} page
 * @param {string} fieldName
 */
exports.checkRequiredFieldValidation = async (page, fieldName) => {
    const field = page.locator(`[name="${fieldName}"]`);
    await field.fill('');
    await field.blur();

    // Check for validation message
    const validationMsg = page.locator(`.error:has-text("required"), .invalid-feedback`);
    await expect(validationMsg).toBeVisible();
};

/**
 * Get submission score from API
 * @param {import('@playwright/test').Page} page
 * @param {number} submissionId
 * @returns {Promise<Object>} Submission data with scores
 */
exports.getSubmissionScore = async (page, submissionId) => {
    const response = await page.request.get(`/admin/api/submissions/${submissionId}`);
    return await response.json();
};

/**
 * Wait for auto-save
 * @param {import('@playwright/test').Page} page
 * @param {number} seconds
 */
exports.waitForAutoSave = async (page, seconds = 10) => {
    await page.waitForTimeout(seconds * 1000);

    // Check for auto-save indicator
    const indicator = page.locator('.auto-save-indicator, .saving-indicator');
    if (await indicator.isVisible()) {
        await expect(indicator).toContainText('Saved');
    }
};

// ==================== DATABASE HELPERS ====================

/**
 * Execute SQL query (for test setup/teardown)
 * @param {string} query
 * @param {Array} params
 */
exports.executeQuery = async (query, params = []) => {
    const { db } = require('../../server/config/database');

    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

/**
 * Get data from database
 * @param {string} query
 * @param {Array} params
 */
exports.queryDatabase = async (query, params = []) => {
    const { db } = require('../../server/config/database');

    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};
