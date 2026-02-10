const { db } = require('../../server/config/database');
const bcrypt = require('bcryptjs');

/**
 * Test data fixtures for E2E tests
 */

// Admin credentials
exports.testAdmin = {
    username: 'admin',
    password: 'admin123'
};

// Test startup users
exports.testStartups = {
    startup1: {
        email: 'test1@startup.com',
        startup_name: 'FinFlow Systems',
        contact_name: 'John Doe'
    },
    startup2: {
        email: 'test2@startup.com',
        startup_name: 'HealthTech Innovations',
        contact_name: 'Jane Smith'
    },
    startup3: {
        email: 'test3@startup.com',
        startup_name: 'GreenEnergy Dynamics',
        contact_name: 'Bob Johnson'
    }
};

// Test survey data for different stages
exports.testSurveyData = {
    ideaStage: {
        stage: 'Idea',
        expectedStageRisk: 90,
        company_name: 'Test Idea Startup',
        industry: 'Technology',
        geography: 'North America'
    },
    scaleupStage: {
        stage: 'Scale-up',
        expectedStageRisk: 25,
        company_name: 'Test Scaleup Startup',
        industry: 'Healthcare',
        geography: 'Europe'
    }
};

// Test KPI data
exports.testKPIData = {
    lowRisk: {
        kpi_regulatory: 20,
        kpi_unit_economics: 15,
        kpi_growth_stability: 25,
        kpi_customer_concentration: 18,
        kpi_execution_complexity: 22,
        kpi_exit_clarity: 20
    },
    mediumRisk: {
        kpi_regulatory: 45,
        kpi_unit_economics: 50,
        kpi_growth_stability: 48,
        kpi_customer_concentration: 52,
        kpi_execution_complexity: 47,
        kpi_exit_clarity: 50
    },
    highRisk: {
        kpi_regulatory: 75,
        kpi_unit_economics: 80,
        kpi_growth_stability: 78,
        kpi_customer_concentration: 82,
        kpi_execution_complexity: 77,
        kpi_exit_clarity: 80
    }
};

// Risk band boundaries for testing
exports.riskBands = {
    low: { min: 0, max: 33 },
    medium: { min: 34, max: 66 },
    high: { min: 67, max: 100 }
};

// Test regulatory bodies
exports.regulatoryBodies = [
    'SEC',
    'FDA',
    'GDPR',
    'HIPAA',
    'FCA',
    'PCI DSS'
];

// Database seeding helper
exports.seedTestData = async () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Clear existing test data
            db.run('DELETE FROM survey_submissions WHERE startup_user_id IN (SELECT id FROM startup_users WHERE email LIKE "test%@startup.com")');
            db.run('DELETE FROM survey_drafts WHERE startup_user_id IN (SELECT id FROM startup_users WHERE email LIKE "test%@startup.com")');
            db.run('DELETE FROM invite_codes WHERE startup_user_id IN (SELECT id FROM startup_users WHERE email LIKE "test%@startup.com")');
            db.run('DELETE FROM startup_users WHERE email LIKE "test%@startup.com"');

            resolve();
        });
    });
};

// Database cleanup helper
exports.cleanupTestData = async () => {
    return exports.seedTestData();
};
