# E2E Test Suite - README

## Overview

This directory contains comprehensive End-to-End tests for the Startup Risk Assessment Platform using Playwright.

## Test Coverage

### Admin Tests (18 tests)
- **User Provisioning** (7 tests): Create users, regenerate codes, disable users, unlock surveys
- **Survey Versioning** (7 tests): Version management, scoring integrity, weight validation
- **Dashboards & Exports** (4 tests): Data accuracy, filtering, CSV exports, audit logs

### Startup User Tests (16 tests)
- **Authentication** (4 tests): OTP consumption, session management, logout/resume
- **Draft Management** (5 tests): Auto-save, manual save, multi-device, progress tracking
- **Form Validation** (7 tests): Required fields, conditional logic, data validation

### Scoring & Comparison Tests (12 tests)
- **Scoring Calculations** (7 tests): Stage mapping, KPI calculations, risk bands
- **Compare & Rank** (5 tests): Sorting, filtering, side-by-side comparison

**Total: 46 E2E tests**

## Prerequisites

1. **Node.js** >= 18.0.0
2. **npm** >= 9.0.0
3. **Playwright** (will be installed)

## Installation

### Step 1: Install Playwright

Due to PowerShell execution policy restrictions, you may need to run the installation command in an elevated PowerShell or Command Prompt:

```powershell
# Option 1: Run in Command Prompt (cmd.exe)
npm install --save-dev @playwright/test

# Option 2: Temporarily bypass PowerShell policy (Admin PowerShell)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
npm install --save-dev @playwright/test

# Option 3: Use npx directly
npx -y playwright install
```

### Step 2: Install Playwright Browsers

```bash
npx playwright install
```

This will download Chromium, Firefox, and WebKit browsers for testing.

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Browser Visible (Headed Mode)
```bash
npm run test:headed
```

### Run Specific Test Suites
```bash
# Admin tests only
npm run test:admin

# Startup user tests only
npm run test:startup

# Scoring tests only
npm run test:scoring

# Compare & Rank tests only
npm run test:compare
```

### Debug Mode
```bash
npm run test:debug
```

### Run Single Test File
```bash
npx playwright test tests/e2e/admin/user-provisioning.spec.js
```

### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Reports

### View HTML Report
```bash
npm run test:report
```

### Generate JSON Report
Test results are automatically saved to `test-results/results.json`

## Test Structure

```
tests/
├── e2e/
│   ├── admin/
│   │   ├── user-provisioning.spec.js      (7 tests)
│   │   ├── survey-versioning.spec.js      (7 tests)
│   │   ├── dashboard-exports.spec.js      (4 tests)
│   │   └── audit-logs.spec.js             (included in dashboard)
│   ├── startup/
│   │   ├── authentication.spec.js         (4 tests)
│   │   ├── draft-management.spec.js       (5 tests)
│   │   ├── form-validation.spec.js        (7 tests)
│   │   └── scoring-calculations.spec.js   (7 tests)
│   ├── compare-rank/
│   │   └── comparison.spec.js             (5 tests)
│   └── fixtures/
│       ├── test-data.js                   (Test data & DB helpers)
│       └── helpers.js                     (Reusable test functions)
├── playwright.config.js
└── README.md
```

## Writing New Tests

### Basic Test Template

```javascript
const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('../fixtures/helpers');
const { testStartups, seedTestData, cleanupTestData } = require('../fixtures/test-data');

test.describe('Feature Name', () => {
  
  test.beforeEach(async () => {
    await seedTestData();
  });

  test.afterEach(async () => {
    await cleanupTestData();
  });

  test('Test case description', async ({ page }) => {
    // Your test code here
    await loginAsAdmin(page);
    
    // Assertions
    await expect(page.locator('selector')).toBeVisible();
  });

});
```

### Available Helpers

**Admin Helpers:**
- `loginAsAdmin(page, username, password)`
- `createStartupUser(page, userData)`
- `regenerateCode(page, email)`
- `disableStartupUser(page, email)`
- `unlockSubmission(page, submissionId)`

**Startup Helpers:**
- `loginAsStartup(page, email, code)`
- `fillSurveySection(page, sectionName, data)`
- `saveDraft(page)`
- `submitSurvey(page)`

**Database Helpers:**
- `executeQuery(query, params)`
- `queryDatabase(query, params)`

## CI/CD Integration

Tests are configured to run automatically in CI/CD pipelines. See `playwright.config.js` for CI-specific settings.

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Failing Due to Timing Issues
- Increase timeout in `playwright.config.js`
- Add explicit waits: `await page.waitForSelector('selector')`

### Database Locked Errors
- Ensure proper cleanup in `afterEach` hooks
- Check that no other processes are accessing the database

### Browser Not Found
- Run `npx playwright install` to download browsers

### PowerShell Execution Policy Error
- Run npm commands in Command Prompt (cmd.exe) instead
- Or temporarily change execution policy (see Installation section)

## Best Practices

1. **Use Page Object Model** for complex pages
2. **Keep tests independent** - each test should work in isolation
3. **Use meaningful test names** - describe what is being tested
4. **Clean up test data** - always use beforeEach/afterEach hooks
5. **Avoid hard-coded waits** - use Playwright's auto-waiting features
6. **Take screenshots on failure** - already configured in playwright.config.js

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Add helper functions to `fixtures/helpers.js` if reusable
3. Update this README if adding new test categories
4. Ensure all tests pass before committing

## Support

For issues or questions:
- Check Playwright documentation: https://playwright.dev
- Review existing test examples in this directory
- Check test output and screenshots in `test-results/`
