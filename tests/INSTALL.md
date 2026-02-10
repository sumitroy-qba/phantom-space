# E2E Test Suite - Installation & Setup Guide

## Quick Start

### 1. Install Playwright

**Option A: Using Command Prompt (Recommended for Windows)**
```cmd
cd "C:\Users\Sumit Roy\.gemini\antigravity\playground\phantom-space"
npm install --save-dev @playwright/test
npx playwright install
```

**Option B: Using PowerShell (with execution policy bypass)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
cd "C:\Users\Sumit Roy\.gemini\antigravity\playground\phantom-space"
npm install --save-dev @playwright/test
npx playwright install
```

### 2. Verify Installation
```bash
npx playwright --version
```

### 3. Run Tests
```bash
# Run all tests
npm test

# Run with browser visible
npm run test:headed

# Run specific suite
npm run test:admin
```

## What's Been Created

### ✅ Test Infrastructure (Phase 1 Complete)
- **playwright.config.js** - Multi-browser configuration
- **tests/e2e/fixtures/helpers.js** - Reusable test functions
- **tests/e2e/fixtures/test-data.js** - Test data and DB utilities
- **tests/README.md** - Comprehensive documentation

### ✅ Test Suites Created (11 tests)
1. **tests/e2e/admin/user-provisioning.spec.js** (7 tests)
   - Create user, duplicate prevention, code regeneration
   - Code expiry, resend invite, disable user, unlock survey

2. **tests/e2e/startup/authentication.spec.js** (4 tests)
   - OTP consumption, wrong code handling
   - Session persistence, logout/resume

3. **tests/e2e/startup/scoring-calculations.spec.js** (5 tests)
   - Stage mapping, LTV/CAC ratio, customer concentration
   - Decision band boundaries, growth stability

### 📋 Remaining Test Suites (35 tests to implement)
- Admin: Survey versioning (7 tests)
- Admin: Dashboards & exports (4 tests)
- Startup: Draft management (5 tests)
- Startup: Form validation (7 tests)
- Scoring: Additional calculations (2 tests)
- Compare & Rank (5 tests)

## Test Execution Examples

```bash
# Run all tests in headless mode
npm test

# Run with browser visible (for debugging)
npm run test:headed

# Run in debug mode with Playwright Inspector
npm run test:debug

# Run only admin tests
npm run test:admin

# Run only startup tests
npm run test:startup

# Run only scoring tests
npm run test:scoring

# Run specific test file
npx playwright test tests/e2e/admin/user-provisioning.spec.js

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# View test report
npm run test:report
```

## File Structure

```
phantom-space/
├── tests/
│   ├── e2e/
│   │   ├── admin/
│   │   │   └── user-provisioning.spec.js (7 tests) ✅
│   │   ├── startup/
│   │   │   ├── authentication.spec.js (4 tests) ✅
│   │   │   └── scoring-calculations.spec.js (5 tests) ✅
│   │   └── fixtures/
│   │       ├── helpers.js ✅
│   │       └── test-data.js ✅
│   └── README.md ✅
├── playwright.config.js ✅
└── package.json (updated with test scripts) ✅
```

## Next Steps

To complete the full 46-test suite:

1. **Implement remaining admin tests** (11 tests)
   - Survey versioning (7 tests)
   - Dashboards & exports (4 tests)

2. **Implement remaining startup tests** (12 tests)
   - Draft management (5 tests)
   - Form validation (7 tests)

3. **Implement compare & rank tests** (5 tests)

4. **Set up CI/CD integration**
   - GitHub Actions workflow
   - Automated test runs on PR

## Troubleshooting

### PowerShell Execution Policy Error
**Solution:** Use Command Prompt (cmd.exe) instead of PowerShell

### Browser Not Found
**Solution:** Run `npx playwright install`

### Database Locked
**Solution:** Ensure no other processes are using the database

### Tests Timing Out
**Solution:** Increase timeout in `playwright.config.js`

## Support

- **Playwright Docs:** https://playwright.dev
- **Test Examples:** See `tests/e2e/` directory
- **Helper Functions:** See `tests/e2e/fixtures/helpers.js`
- **Test Data:** See `tests/e2e/fixtures/test-data.js`
