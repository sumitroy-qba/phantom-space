const { db } = require('./config/database');
const bcrypt = require('bcryptjs');

function seedDatabase() {
    db.serialize(() => {
        // Create default admin user (username: admin, password: admin123)
        const adminPassword = bcrypt.hashSync('admin123', 10);
        db.run(`
      INSERT OR IGNORE INTO admins (username, password_hash) 
      VALUES ('admin', ?)
    `, [adminPassword], function (err) {
            if (err) {
                console.error('Error creating admin:', err);
            } else {
                console.log('✓ Default admin user created (username: admin, password: admin123)');
            }
        });

        // Create initial survey version
        const defaultSectionWeights = JSON.stringify({
            'B': 15, // Product & Stage
            'C': 15, // Market & Geography
            'D': 15, // Regulatory & Compliance
            'E': 5,  // IP
            'F': 15, // Unit Economics
            'G': 10, // Market Sizing
            'H': 15, // Revenue & Growth
            'I': 5,  // Customers & Contracts
            'JKL': 5 // Exit + Financial Plan + Self Risks
        });

        db.run(`
      INSERT INTO survey_versions (is_active, notes, section_weights) 
      VALUES (1, 'Initial version with default scoring', ?)
    `, [defaultSectionWeights], function (err) {
            if (err) {
                console.error('Error creating survey version:', err);
                return;
            }

            const versionId = this.lastID;
            console.log('✓ Survey version created (ID:', versionId, ')');

            // Create risk config for this version
            db.run(`
        INSERT INTO risk_config (survey_version_id) 
        VALUES (?)
      `, [versionId]);

            // Seed questions for all sections
            seedQuestions(versionId);
        });
    });
}

function seedQuestions(versionId) {
    const questions = [
        // Section A: Basic Info
        { section: 'A', label: 'Startup Name', type: 'text', required: 1, weight: 0, order: 1 },
        { section: 'A', label: 'Website', type: 'url', required: 0, weight: 0, order: 2 },
        {
            section: 'A', label: 'Industry/Sector', type: 'dropdown', required: 1, weight: 0, order: 3,
            options: ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'SaaS', 'Marketplace', 'Consumer', 'Enterprise', 'Other']
        },
        { section: 'A', label: 'Year Founded', type: 'number', required: 1, weight: 0, order: 4 },
        {
            section: 'A', label: 'Number of Employees', type: 'dropdown', required: 1, weight: 0, order: 5,
            options: ['1-5', '6-10', '11-25', '26-50', '51-100', '100+']
        },
        { section: 'A', label: 'Founders\' LinkedIn Profiles', type: 'multi-url', required: 0, weight: 0, order: 6 },

        // Section B: Offering & Product
        {
            section: 'B', label: 'Description of Offering(s)', type: 'textarea', required: 1, weight: 1.5, order: 7,
            scoring: { type: 'description_completeness' }
        },
        {
            section: 'B', label: 'Startup Stage', type: 'dropdown', required: 1, weight: 2.0, order: 8,
            options: ['Idea', 'MVP', 'Alpha', 'Beta', 'Early Revenue', 'Scale-up'],
            scoring: { type: 'stage_risk', map: { 'Idea': 90, 'MVP': 75, 'Alpha': 65, 'Beta': 55, 'Early Revenue': 40, 'Scale-up': 25 } }
        },

        // Section C: Market & Geography
        {
            section: 'C', label: 'Primary Geographic Markets', type: 'multi-select', required: 1, weight: 1.5, order: 9,
            options: ['USA', 'Canada', 'UK', 'EU', 'India', 'China', 'Japan', 'Australia', 'Southeast Asia', 'Latin America', 'Middle East', 'Africa'],
            scoring: { type: 'geography_complexity' }
        },
        {
            section: 'C', label: 'Other Markets (Active/Planned)', type: 'multi-select', required: 0, weight: 1.0, order: 10,
            options: ['USA', 'Canada', 'UK', 'EU', 'India', 'China', 'Japan', 'Australia', 'Southeast Asia', 'Latin America', 'Middle East', 'Africa'],
            scoring: { type: 'geography_complexity' }
        },
        {
            section: 'C', label: 'Go-to-Market Motion', type: 'dropdown', required: 0, weight: 0.5, order: 11,
            options: ['Product-Led Growth (PLG)', 'Sales-Led', 'Channel/Partner', 'Marketplace', 'Hybrid']
        },

        // Section D: Regulatory & Compliance
        {
            section: 'D', label: 'Regulatory Bodies', type: 'multi-select', required: 1, weight: 2.0, order: 12,
            options: ['SEC', 'FDA', 'GDPR', 'HIPAA', 'FINRA', 'FCA', 'EMA', 'OCC', 'CFPB', 'MAS', 'SFC', 'ASIC', 'CFTC', 'ISO 27001', 'Other', 'None'],
            scoring: { type: 'regulatory_burden', burden: { 'GDPR': 15, 'HIPAA': 20, 'FDA': 25, 'SEC': 15, 'FINRA': 25, 'FCA': 20, 'EMA': 20, 'OCC': 15, 'CFPB': 15, 'MAS': 15, 'SFC': 15, 'ASIC': 15, 'CFTC': 20, 'ISO 27001': 10, 'Other': 15, 'None': 0 } }
        },
        {
            section: 'D', label: 'Compliance Readiness', type: 'dropdown', required: 1, weight: 1.5, order: 13,
            options: ['Not Started', 'In Progress', 'Fully Compliant'],
            scoring: { type: 'compliance_multiplier', map: { 'Not Started': 1.20, 'In Progress': 1.00, 'Fully Compliant': 0.80 } }
        },

        // Section E: IP (Patents/Trademarks)
        {
            section: 'E', label: 'IP Applicable?', type: 'radio', required: 1, weight: 1.5, order: 14,
            options: ['Yes', 'No']
        },
        {
            section: 'E', label: 'IP Type', type: 'dropdown', required: 0, weight: 0, order: 15,
            options: ['Patent', 'Trademark', 'Both'],
            conditional: { field: 'IP Applicable?', value: 'Yes' }
        },
        {
            section: 'E', label: 'IP Status', type: 'dropdown', required: 0, weight: 0, order: 16,
            options: ['Filed', 'Granted', 'Pending', 'Rejected'],
            conditional: { field: 'IP Applicable?', value: 'Yes' },
            scoring: { type: 'ip_risk', map: { 'Granted': 25, 'Filed': 45, 'Pending': 55, 'Rejected': 80 } }
        },
        {
            section: 'E', label: 'IP Jurisdictions', type: 'text', required: 0, weight: 0, order: 17,
            conditional: { field: 'IP Applicable?', value: 'Yes' }
        },
        {
            section: 'E', label: 'IP Reference/Link', type: 'url', required: 0, weight: 0, order: 18,
            conditional: { field: 'IP Applicable?', value: 'Yes' }
        },

        // Section F: Revenue Model & Unit Economics
        {
            section: 'F', label: 'Revenue Model', type: 'dropdown', required: 1, weight: 0.5, order: 19,
            options: ['Subscription', 'Usage-based', 'Transactional', 'Licensing', 'Advertising', 'Hybrid', 'Other']
        },
        {
            section: 'F', label: 'Expected CAC (Customer Acquisition Cost)', type: 'number', required: 1, weight: 1.5, order: 20,
            scoring: { type: 'unit_economics' }
        },
        {
            section: 'F', label: 'Expected LTV (Lifetime Value)', type: 'number', required: 1, weight: 1.5, order: 21,
            scoring: { type: 'unit_economics' }
        },
        {
            section: 'F', label: 'Currency', type: 'dropdown', required: 1, weight: 0, order: 22,
            options: ['USD', 'EUR', 'GBP', 'INR', 'Other']
        },

        // Section G: Market Sizing
        {
            section: 'G', label: 'TAM (Total Addressable Market)', type: 'number', required: 1, weight: 1.0, order: 23,
            scoring: { type: 'market_sizing' }
        },
        {
            section: 'G', label: 'SAM (Serviceable Addressable Market)', type: 'number', required: 1, weight: 1.0, order: 24,
            scoring: { type: 'market_sizing' }
        },
        {
            section: 'G', label: 'SOM (Serviceable Obtainable Market)', type: 'number', required: 1, weight: 1.0, order: 25,
            scoring: { type: 'market_sizing' }
        },
        {
            section: 'G', label: 'Market Size Currency', type: 'dropdown', required: 1, weight: 0, order: 26,
            options: ['USD', 'EUR', 'GBP', 'INR', 'Other']
        },
        { section: 'G', label: 'Data Sources', type: 'textarea', required: 0, weight: 0.5, order: 27 },
        {
            section: 'G', label: 'Source Type', type: 'dropdown', required: 1, weight: 1.0, order: 28,
            options: ['Analyst Report', 'Government Data', 'Academic', 'Internal Survey', 'Other'],
            scoring: { type: 'source_quality', map: { 'Analyst Report': 45, 'Government Data': 45, 'Academic': 45, 'Internal Survey': 55, 'Other': 65 } }
        },

        // Section H: Revenue & Growth
        {
            section: 'H', label: 'Revenue Status', type: 'dropdown', required: 1, weight: 1.5, order: 29,
            options: ['Pre-revenue', 'Revenue-generating'],
            scoring: { type: 'revenue_stage' }
        },
        {
            section: 'H', label: 'Current MRR/ARR', type: 'number', required: 0, weight: 1.0, order: 30,
            conditional: { field: 'Revenue Status', value: 'Revenue-generating' }
        },
        {
            section: 'H', label: 'Revenue Currency', type: 'dropdown', required: 0, weight: 0, order: 31,
            options: ['USD', 'EUR', 'GBP', 'INR', 'Other'],
            conditional: { field: 'Revenue Status', value: 'Revenue-generating' }
        },
        {
            section: 'H', label: 'MoM Growth Rate (Last 6-12 Months)', type: 'growth-table', required: 0, weight: 2.0, order: 32,
            conditional: { field: 'Revenue Status', value: 'Revenue-generating' },
            scoring: { type: 'growth_consistency' }
        },

        // Section I: Customer Contracts
        {
            section: 'I', label: 'Customer Contracts', type: 'contracts-table', required: 0, weight: 1.5, order: 33,
            scoring: { type: 'contract_concentration' }
        },
        {
            section: 'I', label: 'Top 3 Customers Revenue Share (%)', type: 'number', required: 0, weight: 1.0, order: 34,
            scoring: { type: 'customer_concentration' }
        },

        // Section J: 3-Year Expense Plans
        {
            section: 'J', label: 'Expense Allocation', type: 'expense-table', required: 1, weight: 1.5, order: 35,
            scoring: { type: 'expense_balance' }
        },

        // Section K: Exit Strategy
        {
            section: 'K', label: 'Exit Type', type: 'dropdown', required: 1, weight: 1.5, order: 36,
            options: ['Acquisition', 'IPO', 'Secondary Sale', 'Undecided'],
            scoring: { type: 'exit_clarity', map: { 'Undecided': 80, 'Acquisition': 45, 'IPO': 55, 'Secondary Sale': 50 } }
        },
        {
            section: 'K', label: 'Exit Timeline', type: 'dropdown', required: 1, weight: 1.0, order: 37,
            options: ['<3 years', '3-5 years', '5-7 years', '7-10 years', '10+ years'],
            scoring: { type: 'exit_timeline', map: { '<3 years': 65, '3-5 years': 40, '5-7 years': 45, '7-10 years': 55, '10+ years': 70 } }
        },
        { section: 'K', label: 'Target Valuation', type: 'number', required: 0, weight: 0.5, order: 38 },
        {
            section: 'K', label: 'Target Buyer Profile', type: 'dropdown', required: 0, weight: 0.5, order: 39,
            options: ['Strategic Acquirer', 'Financial Buyer', 'Named Companies', 'Undecided']
        },

        // Section L: Self-Reported Risks
        {
            section: 'L', label: 'Top Risk #1', type: 'textarea', required: 1, weight: 1.0, order: 40,
            scoring: { type: 'self_risk_completeness' }
        },
        {
            section: 'L', label: 'Risk #1 Category', type: 'dropdown', required: 1, weight: 0, order: 41,
            options: ['Market', 'Technology', 'Regulatory', 'Team', 'Financial']
        },
        {
            section: 'L', label: 'Top Risk #2', type: 'textarea', required: 1, weight: 1.0, order: 42,
            scoring: { type: 'self_risk_completeness' }
        },
        {
            section: 'L', label: 'Risk #2 Category', type: 'dropdown', required: 1, weight: 0, order: 43,
            options: ['Market', 'Technology', 'Regulatory', 'Team', 'Financial']
        },
        {
            section: 'L', label: 'Top Risk #3', type: 'textarea', required: 1, weight: 1.0, order: 44,
            scoring: { type: 'self_risk_completeness' }
        },
        {
            section: 'L', label: 'Risk #3 Category', type: 'dropdown', required: 1, weight: 0, order: 45,
            options: ['Market', 'Technology', 'Regulatory', 'Team', 'Financial']
        }
    ];

    const stmt = db.prepare(`
    INSERT INTO questions (survey_version_id, section, label, type, options_json, required, weight, scoring_rules_json, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    questions.forEach(q => {
        const optionsJson = q.options ? JSON.stringify(q.options) : null;
        const scoringJson = q.scoring ? JSON.stringify(q.scoring) : null;
        stmt.run(versionId, q.section, q.label, q.type, optionsJson, q.required, q.weight, scoringJson, q.order);
    });

    stmt.finalize(() => {
        console.log('✓ Questions seeded successfully');
    });
}

module.exports = { seedDatabase };
