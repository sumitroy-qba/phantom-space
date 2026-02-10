const { db } = require('./config/database');
const bcrypt = require('bcryptjs');
const ScoringEngine = require('./utils/scoring');

console.log('Creating test data for Startup Investment Risk Assessment Platform...\n');

// Array of test companies with complete data
const testCompanies = [
    {
        user: {
            email: 'demo@innovatetech.com',
            startup_name: 'InnovateTech Solutions',
            contact_name: 'Sarah Chen',
            code: 'DEMO2024'
        },
        answers: {
            // Section A: Basic Info
            'Startup Name': 'InnovateTech Solutions',
            'Website': 'https://innovatetech.io',
            'Industry/Sector': 'SaaS',
            'Year Founded': '2022',
            'Number of Employees': '11-25',
            'Founders\' LinkedIn Profiles': 'https://linkedin.com/in/sarah-chen-ceo, https://linkedin.com/in/michael-wong-cto',

            // Section B: Offering & Product
            'Description of Offering(s)': 'InnovateTech Solutions provides an AI-powered analytics platform that helps enterprise companies transform their raw data into actionable business insights. Our platform uses advanced machine learning algorithms to identify patterns, predict trends, and recommend strategic actions. Unlike traditional analytics tools, our solution integrates seamlessly with existing data infrastructure and provides real-time insights through an intuitive dashboard. We serve mid-to-large enterprises across finance, healthcare, and retail sectors, helping them make data-driven decisions faster and more accurately. Our unique value proposition lies in our proprietary AI models that learn from each client\'s specific business context, delivering increasingly personalized and accurate insights over time.',
            'Startup Stage': 'Early Revenue',

            // Section C: Market & Geography
            'Primary Geographic Markets': ['USA', 'Canada', 'UK'],
            'Other Markets (Active/Planned)': ['EU', 'Australia'],
            'Go-to-Market Motion': 'Sales-Led',

            // Section D: Regulatory & Compliance
            'Regulatory Bodies': ['GDPR', 'ISO 27001', 'SOC 2'],
            'Compliance Readiness': 'In Progress',

            // Section E: IP
            'IP Applicable?': 'Yes',
            'IP Type': 'Patent',
            'IP Status': 'Filed',
            'IP Jurisdictions': 'USA, EU',
            'IP Reference/Link': 'https://patents.google.com/patent/US123456789',

            // Section F: Unit Economics
            'Revenue Model': 'Subscription',
            'Expected CAC (Customer Acquisition Cost)': '8000',
            'Expected LTV (Lifetime Value)': '36000',
            'Currency': 'USD',

            // Section G: Market Sizing
            'TAM (Total Addressable Market)': '50000000000',
            'SAM (Serviceable Addressable Market)': '8000000000',
            'SOM (Serviceable Obtainable Market)': '400000000',
            'Market Size Currency': 'USD',
            'Data Sources': 'Gartner Market Research Report 2024, McKinsey Digital Analytics Study, Internal market analysis based on enterprise software adoption rates',
            'Source Type': 'Analyst Report',

            // Section H: Revenue & Growth
            'Revenue Status': 'Revenue-generating',
            'Current MRR/ARR': '180000',
            'Revenue Currency': 'USD',
            'MoM Growth Rate (Last 6-12 Months)': [
                { month: 'Jan 2025', rate: 12 },
                { month: 'Feb 2025', rate: 15 },
                { month: 'Mar 2025', rate: 18 },
                { month: 'Apr 2025', rate: 14 },
                { month: 'May 2025', rate: 16 },
                { month: 'Jun 2025', rate: 17 },
                { month: 'Jul 2025', rate: 15 },
                { month: 'Aug 2025', rate: 19 },
                { month: 'Sep 2025', rate: 16 },
                { month: 'Oct 2025', rate: 18 },
                { month: 'Nov 2025', rate: 20 },
                { month: 'Dec 2025', rate: 17 }
            ],

            // Section I: Customer Contracts
            'Customer Contracts': [
                { customer: 'TechCorp Financial', value: 120000, duration: 24, terms: 'Annual renewal, 30-day termination notice, no early termination penalties' },
                { customer: 'HealthData Systems', value: 96000, duration: 12, terms: 'Monthly billing, 60-day notice, standard SLA' },
                { customer: 'RetailAnalytics Inc', value: 84000, duration: 18, terms: 'Quarterly billing, auto-renewal, performance guarantees' },
                { customer: 'Global Finance Group', value: 150000, duration: 36, terms: 'Annual contract, volume discounts, dedicated support' }
            ],
            'Top 3 Customers Revenue Share (%)': '35',

            // Section J: Expense Allocation
            'Expense Allocation': {
                tech: 35,
                marketing: 20,
                sales: 25,
                management: 10,
                operations: 10,
                other: 0
            },

            // Section K: Exit Strategy
            'Exit Type': 'Acquisition',
            'Exit Timeline': '3-5 years',
            'Target Valuation': '150000000',
            'Target Buyer Profile': 'Strategic Acquirer',

            // Section L: Self-Reported Risks
            'Top Risk #1': 'Market competition from established enterprise analytics vendors (Tableau, PowerBI, Looker) who have significantly larger market share and brand recognition. These competitors could replicate our AI features or acquire similar startups. Mitigation: Focus on superior AI accuracy, faster implementation times, and building deep customer relationships through exceptional service.',
            'Risk #1 Category': 'Market',
            'Top Risk #2': 'Technical scalability challenges as we onboard larger enterprise clients with massive data volumes. Our current infrastructure may require significant upgrades to handle Fortune 500 scale deployments. This could impact performance and customer satisfaction if not addressed proactively. Mitigation: Investing in cloud infrastructure optimization and hiring senior DevOps engineers.',
            'Risk #2 Category': 'Technology',
            'Top Risk #3': 'Evolving data privacy regulations (GDPR, CCPA, emerging AI regulations) could require substantial changes to our data processing and storage methods. New AI-specific regulations could impact our core algorithms. Compliance costs may increase significantly. Mitigation: Maintaining active legal counsel, building privacy-by-design architecture, and staying ahead of regulatory trends.',
            'Risk #3 Category': 'Regulatory'
        }
    },
    {
        user: {
            email: 'contact@greenenergy.com',
            startup_name: 'GreenEnergy Dynamics',
            contact_name: 'David Martinez',
            code: 'GREEN2024'
        },
        answers: {
            // Section A: Basic Info
            'Startup Name': 'GreenEnergy Dynamics',
            'Website': 'https://greenenergydynamics.com',
            'Industry/Sector': 'Clean Energy',
            'Year Founded': '2021',
            'Number of Employees': '26-50',
            'Founders\' LinkedIn Profiles': 'https://linkedin.com/in/david-martinez-ceo, https://linkedin.com/in/emily-rodriguez-cto',

            // Section B: Offering & Product
            'Description of Offering(s)': 'GreenEnergy Dynamics manufactures next-generation solar panel systems with integrated battery storage for residential and commercial properties. Our proprietary technology increases energy conversion efficiency by 25% compared to traditional panels while reducing installation costs by 40%. We provide end-to-end solutions including design, installation, monitoring, and maintenance. Our smart energy management system optimizes power usage and storage based on consumption patterns and weather forecasts. We target environmentally conscious homeowners and businesses looking to reduce energy costs and carbon footprint. Our competitive advantage lies in our patented nano-coating technology that maintains peak efficiency even in low-light conditions.',
            'Startup Stage': 'Growth',

            // Section C: Market & Geography
            'Primary Geographic Markets': ['USA', 'Germany', 'Spain'],
            'Other Markets (Active/Planned)': ['Italy', 'France', 'Japan'],
            'Go-to-Market Motion': 'Channel Partners',

            // Section D: Regulatory & Compliance
            'Regulatory Bodies': ['UL Certification', 'IEC Standards', 'EPA', 'EU Energy Directives'],
            'Compliance Readiness': 'Compliant',

            // Section E: IP
            'IP Applicable?': 'Yes',
            'IP Type': 'Patent',
            'IP Status': 'Granted',
            'IP Jurisdictions': 'USA, EU, Japan',
            'IP Reference/Link': 'https://patents.google.com/patent/US987654321',

            // Section F: Unit Economics
            'Revenue Model': 'Product Sales',
            'Expected CAC (Customer Acquisition Cost)': '3500',
            'Expected LTV (Lifetime Value)': '28000',
            'Currency': 'USD',

            // Section G: Market Sizing
            'TAM (Total Addressable Market)': '180000000000',
            'SAM (Serviceable Addressable Market)': '25000000000',
            'SOM (Serviceable Obtainable Market)': '800000000',
            'Market Size Currency': 'USD',
            'Data Sources': 'International Energy Agency (IEA) Solar Market Report 2024, Bloomberg New Energy Finance, Internal market research on residential solar adoption',
            'Source Type': 'Government Report',

            // Section H: Revenue & Growth
            'Revenue Status': 'Revenue-generating',
            'Current MRR/ARR': '420000',
            'Revenue Currency': 'USD',
            'MoM Growth Rate (Last 6-12 Months)': [
                { month: 'Jan 2025', rate: 8 },
                { month: 'Feb 2025', rate: 10 },
                { month: 'Mar 2025', rate: 12 },
                { month: 'Apr 2025', rate: 9 },
                { month: 'May 2025', rate: 11 },
                { month: 'Jun 2025', rate: 13 },
                { month: 'Jul 2025', rate: 10 },
                { month: 'Aug 2025', rate: 14 },
                { month: 'Sep 2025', rate: 11 },
                { month: 'Oct 2025', rate: 12 },
                { month: 'Nov 2025', rate: 15 },
                { month: 'Dec 2025', rate: 13 }
            ],

            // Section I: Customer Contracts
            'Customer Contracts': [
                { customer: 'SunnyVale Residential Complex', value: 450000, duration: 12, terms: 'Project-based, milestone payments, 2-year warranty' },
                { customer: 'EcoMart Retail Chain', value: 680000, duration: 18, terms: 'Multi-location rollout, performance guarantees, maintenance contract' },
                { customer: 'GreenTech Office Park', value: 320000, duration: 12, terms: 'Turnkey installation, monitoring service included' }
            ],
            'Top 3 Customers Revenue Share (%)': '42',

            // Section J: Expense Allocation
            'Expense Allocation': {
                tech: 25,
                marketing: 15,
                sales: 20,
                management: 12,
                operations: 25,
                other: 3
            },

            // Section K: Exit Strategy
            'Exit Type': 'IPO',
            'Exit Timeline': '5-7 years',
            'Target Valuation': '500000000',
            'Target Buyer Profile': 'Public Markets',

            // Section L: Self-Reported Risks
            'Top Risk #1': 'Supply chain dependencies on rare earth materials and semiconductor components from limited global suppliers. Recent chip shortages and geopolitical tensions have caused production delays and cost increases. A major supply disruption could halt manufacturing for months. Mitigation: Diversifying supplier base across multiple countries, maintaining 6-month inventory buffer for critical components, and exploring alternative materials.',
            'Risk #1 Category': 'Operations',
            'Top Risk #2': 'Regulatory changes in renewable energy incentives and subsidies across different markets. Government policy shifts could significantly impact customer demand and project economics. Recent changes in some EU countries have already affected sales forecasts. Mitigation: Geographic diversification, building products that remain competitive even without subsidies, and active government relations.',
            'Risk #2 Category': 'Regulatory',
            'Top Risk #3': 'High capital requirements for inventory and manufacturing capacity expansion. Hardware business requires significant upfront investment before revenue realization. Cash flow management is critical as we scale. Mitigation: Securing strategic partnerships with manufacturers, exploring equipment financing, and implementing just-in-time inventory practices where possible.',
            'Risk #3 Category': 'Financial'
        }
    },
    {
        user: {
            email: 'info@healthtech-innovations.com',
            startup_name: 'HealthTech Innovations',
            contact_name: 'Dr. Priya Patel',
            code: 'HEALTH2024'
        },
        answers: {
            // Section A: Basic Info
            'Startup Name': 'HealthTech Innovations',
            'Website': 'https://healthtech-innovations.io',
            'Industry/Sector': 'Healthcare SaaS',
            'Year Founded': '2020',
            'Number of Employees': '51-100',
            'Founders\' LinkedIn Profiles': 'https://linkedin.com/in/dr-priya-patel-ceo, https://linkedin.com/in/james-thompson-cto',

            // Section B: Offering & Product
            'Description of Offering(s)': 'HealthTech Innovations provides a comprehensive telemedicine and patient management platform for healthcare providers. Our HIPAA-compliant solution enables virtual consultations, electronic health records (EHR) integration, prescription management, and patient engagement tools. We serve hospitals, clinics, and private practices, helping them expand access to care while reducing operational costs. Our platform supports multi-specialty workflows and integrates with major EHR systems like Epic and Cerner. Key differentiators include our AI-powered symptom checker, automated appointment scheduling, and robust analytics dashboard that helps providers optimize patient outcomes and practice efficiency.',
            'Startup Stage': 'Scaling',

            // Section C: Market & Geography
            'Primary Geographic Markets': ['USA', 'Canada'],
            'Other Markets (Active/Planned)': ['UK', 'Singapore', 'UAE'],
            'Go-to-Market Motion': 'Sales-Led',

            // Section D: Regulatory & Compliance
            'Regulatory Bodies': ['HIPAA', 'FDA (Class II Medical Device)', 'GDPR', 'SOC 2 Type II'],
            'Compliance Readiness': 'Compliant',

            // Section E: IP
            'IP Applicable?': 'Yes',
            'IP Type': 'Patent',
            'IP Status': 'Granted',
            'IP Jurisdictions': 'USA, EU',
            'IP Reference/Link': 'https://patents.google.com/patent/US555666777',

            // Section F: Unit Economics
            'Revenue Model': 'Subscription',
            'Expected CAC (Customer Acquisition Cost)': '12000',
            'Expected LTV (Lifetime Value)': '85000',
            'Currency': 'USD',

            // Section G: Market Sizing
            'TAM (Total Addressable Market)': '95000000000',
            'SAM (Serviceable Addressable Market)': '18000000000',
            'SOM (Serviceable Obtainable Market)': '1200000000',
            'Market Size Currency': 'USD',
            'Data Sources': 'Grand View Research Telemedicine Market Report 2024, American Medical Association Digital Health Survey, McKinsey Healthcare IT Analysis',
            'Source Type': 'Analyst Report',

            // Section H: Revenue & Growth
            'Revenue Status': 'Revenue-generating',
            'Current MRR/ARR': '3200000',
            'Revenue Currency': 'USD',
            'MoM Growth Rate (Last 6-12 Months)': [
                { month: 'Jan 2025', rate: 6 },
                { month: 'Feb 2025', rate: 7 },
                { month: 'Mar 2025', rate: 8 },
                { month: 'Apr 2025', rate: 7 },
                { month: 'May 2025', rate: 9 },
                { month: 'Jun 2025', rate: 8 },
                { month: 'Jul 2025', rate: 10 },
                { month: 'Aug 2025', rate: 9 },
                { month: 'Sep 2025', rate: 11 },
                { month: 'Oct 2025', rate: 10 },
                { month: 'Nov 2025', rate: 12 },
                { month: 'Dec 2025', rate: 11 }
            ],

            // Section I: Customer Contracts
            'Customer Contracts': [
                { customer: 'Metro Health System', value: 850000, duration: 36, terms: 'Enterprise license, annual payments, dedicated support, SLA 99.9% uptime' },
                { customer: 'Regional Medical Group', value: 420000, duration: 24, terms: 'Multi-clinic deployment, quarterly billing, training included' },
                { customer: 'CareFirst Physicians Network', value: 380000, duration: 24, terms: 'Per-provider pricing, monthly billing, integration support' },
                { customer: 'HealthPlus Urgent Care', value: 290000, duration: 12, terms: 'Pilot program, monthly billing, expansion option' }
            ],
            'Top 3 Customers Revenue Share (%)': '28',

            // Section J: Expense Allocation
            'Expense Allocation': {
                tech: 30,
                marketing: 18,
                sales: 22,
                management: 15,
                operations: 12,
                other: 3
            },

            // Section K: Exit Strategy
            'Exit Type': 'Acquisition',
            'Exit Timeline': '4-6 years',
            'Target Valuation': '400000000',
            'Target Buyer Profile': 'Strategic Acquirer',

            // Section L: Self-Reported Risks
            'Top Risk #1': 'Stringent healthcare regulations and compliance requirements create high barriers and ongoing costs. Any compliance breach could result in severe penalties and loss of customer trust. FDA medical device classification changes could require extensive re-certification. Mitigation: Dedicated compliance team, regular third-party audits, maintaining certifications ahead of requirements, and building compliance into product development lifecycle.',
            'Risk #1 Category': 'Regulatory',
            'Top Risk #2': 'Data security and privacy risks inherent in handling sensitive patient health information. A data breach would be catastrophic for reputation and could result in massive fines and lawsuits. Cybersecurity threats are constantly evolving. Mitigation: Enterprise-grade security infrastructure, regular penetration testing, cyber insurance, incident response plan, and encryption at rest and in transit.',
            'Risk #2 Category': 'Technology',
            'Top Risk #3': 'Market competition from large established healthcare IT vendors (Epic, Cerner, Athenahealth) with significant resources and existing customer relationships. These competitors are increasingly investing in telemedicine capabilities. Mitigation: Focus on superior user experience, faster implementation, better customer support, and targeting underserved mid-market segment.',
            'Risk #3 Category': 'Market'
        }
    },
    {
        user: {
            email: 'team@finflow.io',
            startup_name: 'FinFlow Systems',
            contact_name: 'Alex Johnson',
            code: 'FINFLOW2024'
        },
        answers: {
            // Section A: Basic Info
            'Startup Name': 'FinFlow Systems',
            'Website': 'https://finflow.io',
            'Industry/Sector': 'FinTech',
            'Year Founded': '2019',
            'Number of Employees': '76-100',
            'Founders\' LinkedIn Profiles': 'https://linkedin.com/in/alex-johnson-ceo, https://linkedin.com/in/maria-garcia-cfo',

            // Section B: Offering & Product
            'Description of Offering(s)': 'FinFlow Systems provides an automated accounts payable and receivable platform for small and medium-sized businesses. Our solution streamlines invoice processing, payment workflows, cash flow forecasting, and vendor management. Using AI and machine learning, we automatically extract data from invoices, match them to purchase orders, route for approval, and schedule payments. Our platform integrates with major accounting systems (QuickBooks, Xero, NetSuite) and banking partners to enable seamless financial operations. We help businesses reduce manual data entry by 90%, improve payment accuracy, optimize working capital, and gain real-time visibility into cash flow. Our target market is SMBs with 10-500 employees across various industries.',
            'Startup Stage': 'Scaling',

            // Section C: Market & Geography
            'Primary Geographic Markets': ['USA', 'UK', 'Australia'],
            'Other Markets (Active/Planned)': ['Canada', 'New Zealand', 'Ireland'],
            'Go-to-Market Motion': 'Product-Led Growth',

            // Section D: Regulatory & Compliance
            'Regulatory Bodies': ['PCI DSS', 'SOC 2 Type II', 'GDPR', 'FinCEN (AML/KYC)'],
            'Compliance Readiness': 'Compliant',

            // Section E: IP
            'IP Applicable?': 'Yes',
            'IP Type': 'Trade Secret',
            'IP Status': 'Protected',
            'IP Jurisdictions': 'USA, UK, Australia',
            'IP Reference/Link': 'Proprietary ML algorithms for invoice processing and fraud detection',

            // Section F: Unit Economics
            'Revenue Model': 'Subscription',
            'Expected CAC (Customer Acquisition Cost)': '2800',
            'Expected LTV (Lifetime Value)': '42000',
            'Currency': 'USD',

            // Section G: Market Sizing
            'TAM (Total Addressable Market)': '28000000000',
            'SAM (Serviceable Addressable Market)': '7500000000',
            'SOM (Serviceable Obtainable Market)': '650000000',
            'Market Size Currency': 'USD',
            'Data Sources': 'Deloitte AP Automation Market Study 2024, Forrester SMB Finance Software Report, PayStream Advisors Industry Research',
            'Source Type': 'Analyst Report',

            // Section H: Revenue & Growth
            'Revenue Status': 'Revenue-generating',
            'Current MRR/ARR': '4800000',
            'Revenue Currency': 'USD',
            'MoM Growth Rate (Last 6-12 Months)': [
                { month: 'Jan 2025', rate: 14 },
                { month: 'Feb 2025', rate: 16 },
                { month: 'Mar 2025', rate: 15 },
                { month: 'Apr 2025', rate: 18 },
                { month: 'May 2025', rate: 17 },
                { month: 'Jun 2025', rate: 19 },
                { month: 'Jul 2025', rate: 16 },
                { month: 'Aug 2025', rate: 20 },
                { month: 'Sep 2025', rate: 18 },
                { month: 'Oct 2025', rate: 21 },
                { month: 'Nov 2025', rate: 19 },
                { month: 'Dec 2025', rate: 22 }
            ],

            // Section I: Customer Contracts
            'Customer Contracts': [
                { customer: 'BuildRight Construction', value: 48000, duration: 24, terms: 'Annual subscription, auto-renewal, standard SLA' },
                { customer: 'TechSupply Distributors', value: 72000, duration: 36, terms: 'Multi-year discount, quarterly billing, premium support' },
                { customer: 'MediEquip Solutions', value: 36000, duration: 12, terms: 'Monthly subscription, integration support included' },
                { customer: 'FreshFoods Wholesale', value: 60000, duration: 24, terms: 'Annual billing, custom workflows, dedicated CSM' },
                { customer: 'ProServices Group', value: 42000, duration: 24, terms: 'Annual subscription, standard terms' }
            ],
            'Top 3 Customers Revenue Share (%)': '18',

            // Section J: Expense Allocation
            'Expense Allocation': {
                tech: 28,
                marketing: 25,
                sales: 20,
                management: 12,
                operations: 13,
                other: 2
            },

            // Section K: Exit Strategy
            'Exit Type': 'Acquisition',
            'Exit Timeline': '3-5 years',
            'Target Valuation': '250000000',
            'Target Buyer Profile': 'Strategic Acquirer',

            // Section L: Self-Reported Risks
            'Top Risk #1': 'Dependence on integrations with third-party accounting systems and banking partners. Changes to their APIs or business models could disrupt our service. Loss of a major integration partner would impact significant portion of customer base. Mitigation: Maintaining relationships with multiple partners, building redundancy into integrations, and developing proprietary accounting capabilities.',
            'Risk #1 Category': 'Technology',
            'Top Risk #2': 'Financial services regulatory landscape is complex and varies by jurisdiction. New regulations around payment processing, data handling, or AML/KYC could require significant compliance investments. Regulatory changes could also create competitive advantages for traditional financial institutions. Mitigation: Proactive regulatory monitoring, strong legal and compliance team, and partnering with regulated financial institutions.',
            'Risk #2 Category': 'Regulatory',
            'Top Risk #3': 'Customer churn risk in competitive SMB software market where switching costs are relatively low. Economic downturns could lead to budget cuts and cancellations. SMBs have higher failure rates than enterprises. Mitigation: Focus on product stickiness through deep integrations, demonstrating clear ROI, excellent customer success programs, and expanding into larger mid-market accounts.',
            'Risk #3 Category': 'Market'
        }
    }
];

let processedCount = 0;

// Process each company sequentially
function processNextCompany(index) {
    if (index >= testCompanies.length) {
        console.log('\n✅ All test data created successfully!\n');
        console.log(`Total submissions created: ${processedCount}\n`);
        console.log('You can now:');
        console.log('  1. View submissions in the admin panel');
        console.log('  2. Compare multiple startups');
        console.log('  3. Test the ranking functionality\n');
        console.log(`Admin Panel: http://localhost:3000/admin/submissions.html\n`);
        process.exit(0);
        return;
    }

    const company = testCompanies[index];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${company.user.startup_name}`);
    console.log(`${'='.repeat(60)}\n`);

    db.serialize(() => {
        // Create startup user
        db.run(
            'INSERT INTO startup_users (email, startup_name, contact_name, status, created_by, last_login_at) VALUES (?, ?, ?, ?, ?, ?)',
            [company.user.email, company.user.startup_name, company.user.contact_name, 'Locked', 1, new Date().toISOString()],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        console.log('⚠️  User already exists, updating...');
                        db.get('SELECT id FROM startup_users WHERE email = ?', [company.user.email], (err, user) => {
                            if (user) {
                                createSubmission(user.id, company, index);
                            }
                        });
                    } else {
                        console.error('❌ Error creating user:', err);
                        process.exit(1);
                    }
                    return;
                }

                const userId = this.lastID;
                console.log(`✓ Created user: ${company.user.startup_name}(ID: ${userId})`);
                console.log(`  Email: ${company.user.email}`);
                console.log(`  Contact: ${company.user.contact_name}\n`);

                // Create invite code
                const codeHash = bcrypt.hashSync(company.user.code, 10);
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);

                db.run(
                    'INSERT INTO invite_codes (startup_user_id, code_hash, expires_at, consumed_at) VALUES (?, ?, ?, ?)',
                    [userId, codeHash, expiresAt.toISOString(), new Date().toISOString()],
                    (err) => {
                        if (err) {
                            console.error('⚠️  Warning: Could not create invite code:', err.message);
                        } else {
                            console.log(`✓ Created invite code: ${company.user.code}\n`);
                        }
                    }
                );

                // Create submission
                createSubmission(userId, company, index);
            }
        );
    });
}

function createSubmission(userId, company, companyIndex) {
    db.get('SELECT id FROM survey_versions WHERE is_active = 1', [], (err, version) => {
        if (err || !version) {
            console.error('❌ Error: No active survey version found');
            process.exit(1);
        }

        const versionId = version.id;

        db.all(
            'SELECT * FROM questions WHERE survey_version_id = ? ORDER BY order_index',
            [versionId],
            (err, questions) => {
                if (err) {
                    console.error('❌ Error loading questions:', err);
                    process.exit(1);
                }

                // Parse JSON fields
                questions.forEach(q => {
                    if (q.options_json) q.options = JSON.parse(q.options_json);
                    if (q.scoring_rules_json) q.scoring_rules = JSON.parse(q.scoring_rules_json);
                });

                console.log(`✓ Loaded ${questions.length} questions\n`);

                // Calculate scores
                console.log('📊 Calculating risk scores...\n');
                const scoringEngine = new ScoringEngine(company.answers, questions);
                const scores = scoringEngine.calculateRiskScore();

                console.log('=== RISK ASSESSMENT RESULTS ===\n');
                console.log(`Overall Risk Score: ${scores.totalRiskScore.toFixed(2)}`);
                console.log(`Risk Band: ${scores.riskBand}`);
                console.log(`Decision: ${scores.decision}\n`);

                console.log('Section Scores:');
                Object.keys(scores.sectionScores).forEach(section => {
                    console.log(`  ${section}: ${scores.sectionScores[section].toFixed(2)}`);
                });

                console.log('\nKPI Scores:');
                Object.keys(scores.kpiScores).forEach(kpi => {
                    console.log(`  ${kpi}: ${scores.kpiScores[kpi].toFixed(2)}`);
                });
                console.log('\n================================\n');

                // Insert submission
                db.run(
                    `INSERT INTO survey_submissions
        (startup_user_id, survey_version_id, answers_json, submitted_at, total_risk_score, risk_band, decision, section_risk_scores_json, kpi_scores_json)
           VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        userId,
                        versionId,
                        JSON.stringify(company.answers),
                        new Date().toISOString(),
                        scores.totalRiskScore,
                        scores.riskBand,
                        scores.decision,
                        JSON.stringify(scores.sectionScores),
                        JSON.stringify(scores.kpiScores)
                    ],
                    function (err) {
                        if (err) {
                            console.error('❌ Error creating submission:', err);
                            process.exit(1);
                        }

                        console.log(`✓ Created submission(ID: ${this.lastID}) \n`);
                        processedCount++;

                        // Process next company
                        processNextCompany(companyIndex + 1);
                    }
                );
            }
        );
    });
}

// Start processing from first company
processNextCompany(0);
