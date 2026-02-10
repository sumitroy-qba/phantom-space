const { db } = require('./config/database');
const ScoringEngine = require('./utils/scoring');

/**
 * SIMPLIFIED Test: Verify Weight Changes Affect Risk Scoring
 * 
 * This test changes the weight of "Description of Offering(s)" in Section B
 * and verifies that the section score and overall risk score change accordingly.
 */

async function runSimpleWeightTest() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST: Weight Change Impact on Risk Scoring');
    console.log('='.repeat(60) + '\n');

    try {
        // Step 1: Get questions
        const questions = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM questions WHERE survey_version_id = 1 ORDER BY order_index', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Find test question in Section B
        const testQuestion = questions.find(q => q.section === 'B' && q.label === 'Description of Offering(s)');

        console.log(`📝 Test Question: "${testQuestion.label}"`);
        console.log(`   Section: ${testQuestion.section}`);
        console.log(`   Original Weight: ${testQuestion.weight}\n`);

        // Create minimal valid answers (using actual question labels)
        const answers = {};
        questions.forEach(q => {
            // Provide minimal answers to avoid errors
            if (q.label === 'Description of Offering(s)') {
                // Short description = higher risk (60 points)
                answers[q.label] = 'Short description';
            } else if (q.label === 'Startup Stage') {
                answers[q.label] = 'Seed';
            } else if (q.label === 'Primary Geographic Markets') {
                answers[q.label] = ['USA'];
            } else if (q.label === 'Regulatory Bodies') {
                answers[q.label] = [];
            } else if (q.label === 'Compliance Readiness') {
                answers[q.label] = 'In Progress';
            } else if (q.label === 'IP Applicable?') {
                answers[q.label] = 'No';
            } else if (q.label === 'Expected LTV (Lifetime Value)') {
                answers[q.label] = '10000';
            } else if (q.label === 'Expected CAC (Customer Acquisition Cost)') {
                answers[q.label] = '5000';
            } else if (q.label === 'TAM (Total Addressable Market)') {
                answers[q.label] = '1000000';
            } else if (q.label === 'SAM (Serviceable Addressable Market)') {
                answers[q.label] = '500000';
            } else if (q.label === 'SOM (Serviceable Obtainable Market)') {
                answers[q.label] = '100000';
            } else if (q.label === 'Revenue Status') {
                answers[q.label] = 'Pre-revenue';
            } else if (q.label === 'Customer Contracts') {
                answers[q.label] = []; // Empty array to avoid errors
            } else if (q.label === 'Top 3 Customers Revenue Share (%)') {
                answers[q.label] = '0';
            } else if (q.label === 'Exit Type') {
                answers[q.label] = 'Acquisition';
            } else if (q.label === 'Exit Timeline') {
                answers[q.label] = '3-5 years';
            }
        });

        // BASELINE: Calculate with original weight
        console.log('📊 BASELINE Calculation (Original Weight)...\n');
        const baselineEngine = new ScoringEngine(answers, questions);
        const baseline = baselineEngine.calculateRiskScore();

        console.log(`   Overall Risk Score: ${baseline.totalRiskScore.toFixed(2)}`);
        console.log(`   Section B Score:    ${baseline.sectionScores.B.toFixed(2)}`);
        console.log(`   Risk Band:          ${baseline.riskBand}\n`);

        // CHANGE WEIGHT: Increase by 10x
        const newWeight = testQuestion.weight * 10;
        console.log(`🔧 Changing Weight...`);
        console.log(`   From: ${testQuestion.weight}`);
        console.log(`   To:   ${newWeight} (10x increase)\n`);

        await new Promise((resolve, reject) => {
            db.run('UPDATE questions SET weight = ? WHERE id = ?', [newWeight, testQuestion.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Reload questions
        const updatedQuestions = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM questions WHERE survey_version_id = 1 ORDER BY order_index', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // NEW SCORE: Calculate with increased weight
        console.log('📊 NEW Calculation (Increased Weight)...\n');
        const newEngine = new ScoringEngine(answers, updatedQuestions);
        const newScore = newEngine.calculateRiskScore();

        console.log(`   Overall Risk Score: ${newScore.totalRiskScore.toFixed(2)}`);
        console.log(`   Section B Score:    ${newScore.sectionScores.B.toFixed(2)}`);
        console.log(`   Risk Band:          ${newScore.riskBand}\n`);

        // COMPARISON
        const overallChange = newScore.totalRiskScore - baseline.totalRiskScore;
        const sectionChange = newScore.sectionScores.B - baseline.sectionScores.B;
        const percentChange = ((overallChange / baseline.totalRiskScore) * 100);

        console.log('='.repeat(60));
        console.log('📈 RESULTS');
        console.log('='.repeat(60) + '\n');

        console.log(`Overall Risk Score Change: ${overallChange > 0 ? '+' : ''}${overallChange.toFixed(2)} (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%)`);
        console.log(`Section B Score Change:    ${sectionChange > 0 ? '+' : ''}${sectionChange.toFixed(2)}\n`);

        // Restore original weight
        await new Promise((resolve, reject) => {
            db.run('UPDATE questions SET weight = ? WHERE id = ?', [testQuestion.weight, testQuestion.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('✓ Original weight restored\n');

        // VERDICT
        console.log('='.repeat(60));
        if (Math.abs(sectionChange) > 0.01) {
            console.log('✅ TEST PASSED - Weight Changes DO Affect Scoring!');
            console.log('='.repeat(60) + '\n');
            console.log('Key Findings:');
            console.log(`• Increasing question weight from ${testQuestion.weight} to ${newWeight}`);
            console.log(`• Changed Section B score by ${Math.abs(sectionChange).toFixed(2)} points`);
            console.log(`• Changed overall risk score by ${Math.abs(overallChange).toFixed(2)} points`);
            console.log(`\nConclusion: The scoring engine correctly recalculates`);
            console.log(`risk scores when question weights are modified.`);
        } else {
            console.log('❌ TEST FAILED - No Score Change Detected');
            console.log('='.repeat(60));
        }
        console.log('\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
    } finally {
        db.close();
    }
}

runSimpleWeightTest();
