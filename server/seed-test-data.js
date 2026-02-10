const { db } = require('./config/database');

/**
 * Seed Test Data Script
 * Adds 3 Low Risk and 2 High Risk startups with valid submissions
 */

const startups = [
    // Low Risk Startups
    {
        email: 'founder@safeharbor.com',
        startup_name: 'SafeHarbor Solutions',
        contact_name: 'Sarah Safe',
        risk_profile: 'low',
        score: 22.5,
        risk_band: 'Low Risk',
        decision: 'Strong candidate for investment',
        submitted_at: '2025-10-15 10:30:00'
    },
    {
        email: 'ceo@steadygrowth.io',
        startup_name: 'SteadyGrowth Inc',
        contact_name: 'Gary Growth',
        risk_profile: 'low',
        score: 28.4,
        risk_band: 'Low Risk',
        decision: 'Strong candidate for investment',
        submitted_at: '2025-11-20 14:15:00'
    },
    {
        email: 'admin@reliabletech.net',
        startup_name: 'Reliable Tech',
        contact_name: 'Rebecca Reliable',
        risk_profile: 'low',
        score: 18.9,
        risk_band: 'Low Risk',
        decision: 'Strong candidate for investment',
        submitted_at: '2025-12-05 09:00:00'
    },
    // High Risk Startups
    {
        email: 'founder@moonshot.xyz',
        startup_name: 'Moonshot Ventures',
        contact_name: 'Mike Moon',
        risk_profile: 'high',
        score: 78.6,
        risk_band: 'High Risk',
        decision: 'Not recommended unless major risks resolved',
        submitted_at: '2026-01-10 16:45:00'
    },
    {
        email: 'danger@riskybusiness.com',
        startup_name: 'Risky Business Ltd',
        contact_name: 'Danny Danger',
        risk_profile: 'high',
        score: 85.2,
        risk_band: 'High Risk',
        decision: 'Not recommended unless major risks resolved',
        submitted_at: '2026-02-01 11:20:00'
    }
];

function generateScores(profile) {
    if (profile === 'low') {
        return {
            section: {
                'A': 20, 'B': 25, 'C': 20, 'D': 15, 'E': 25, 'F': 22, 'G': 20, 'H': 25, 'I': 18, 'JKL': 20
            },
            kpi: {
                'kpi_regulatory': 15,
                'kpi_unit_economics': 20,
                'kpi_growth_stability': 25,
                'kpi_customer_concentration': 18,
                'kpi_execution_complexity': 22,
                'kpi_exit_clarity': 20
            }
        };
    } else {
        return {
            section: {
                'A': 60, 'B': 75, 'C': 80, 'D': 85, 'E': 80, 'F': 78, 'G': 70, 'H': 85, 'I': 82, 'JKL': 80
            },
            kpi: {
                'kpi_regulatory': 85,
                'kpi_unit_economics': 75,
                'kpi_growth_stability': 80,
                'kpi_customer_concentration': 82,
                'kpi_execution_complexity': 78,
                'kpi_exit_clarity': 80
            }
        };
    }
}

function generateAnswers(profile, name) {
    if (profile === 'low') {
        return {
            'A': { 'Startup Name': name, 'Industry/Sector': 'SaaS', 'Year Founded': '2018' },
            'B': { 'Startup Stage': 'Scale-up', 'Description': 'Mature SaaS platform' },
            'C': { 'Primary Geographic Markets': ['USA', 'EU'] },
            'D': { 'Compliance Readiness': 'Fully Compliant' },
            'E': { 'IP Status': 'Granted' },
            'F': { 'Revenue Model': 'Subscription' },
            'H': { 'Revenue Status': 'Revenue-generating' },
            'K': { 'Exit Type': 'IPO' }
        };
    } else {
        return {
            'A': { 'Startup Name': name, 'Industry/Sector': 'Other', 'Year Founded': '2024' },
            'B': { 'Startup Stage': 'Idea', 'Description': 'Just an idea' },
            'C': { 'Primary Geographic Markets': ['Global'] },
            'D': { 'Compliance Readiness': 'Not Started' },
            'E': { 'IP Status': 'None' },
            'F': { 'Revenue Model': 'Other' },
            'H': { 'Revenue Status': 'Pre-revenue' },
            'K': { 'Exit Type': 'Undecided' }
        };
    }
}

function seedTestData() {
    console.log('🌱 Seeding 5 test startups...');

    db.serialize(() => {
        startups.forEach(startup => {
            // 1. Create User
            db.run(`
                INSERT INTO startup_users (email, startup_name, contact_name, status, created_by)
                VALUES (?, ?, ?, 'Assessment Completed', 1)
            `, [startup.email, startup.startup_name, startup.contact_name], function (err) {
                if (err) {
                    console.error('Error creating user:', startup.startup_name, err.message);
                    return;
                }

                const userId = this.lastID;
                const scores = generateScores(startup.risk_profile);
                const answers = generateAnswers(startup.risk_profile, startup.startup_name);

                // 2. Create Submission
                db.run(`
                    INSERT INTO survey_submissions (
                        startup_user_id, survey_version_id, answers_json, submitted_at,
                        total_risk_score, risk_band, decision,
                        section_risk_scores_json, kpi_scores_json
                    ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    userId,
                    JSON.stringify(answers),
                    startup.submitted_at,
                    startup.score,
                    startup.risk_band, // Keep original casing for DB consistency
                    startup.decision,
                    JSON.stringify(scores.section),
                    JSON.stringify(scores.kpi)
                ], function (err) {
                    if (err) console.error('Error creating submission for:', startup.startup_name, err.message);
                    else console.log(`✓ Seeded ${startup.startup_name} (${startup.risk_band})`);
                });
            });
        });
    });
}

seedTestData();
