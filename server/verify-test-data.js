const { db } = require('./config/database');

console.log('Verifying test data...\n');

db.get('SELECT COUNT(*) as count FROM survey_submissions', (err, row) => {
    if (err) {
        console.error('Error:', err);
        process.exit(1);
    }

    console.log(`✓ Total submissions in database: ${row.count}\n`);

    db.get('SELECT * FROM startup_users WHERE email = "demo@innovatetech.com"', (err, user) => {
        if (err) {
            console.error('Error:', err);
            process.exit(1);
        }

        if (user) {
            console.log('✓ Test User Found:');
            console.log(`  ID: ${user.id}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Startup Name: ${user.startup_name}`);
            console.log(`  Contact: ${user.contact_name}`);
            console.log(`  Status: ${user.status}\n`);

            db.get('SELECT * FROM survey_submissions WHERE startup_user_id = ?', [user.id], (err, submission) => {
                if (err) {
                    console.error('Error:', err);
                    process.exit(1);
                }

                if (submission) {
                    console.log('✓ Submission Found:');
                    console.log(`  ID: ${submission.id}`);
                    console.log(`  Risk Score: ${submission.total_risk_score}`);
                    console.log(`  Risk Band: ${submission.risk_band}`);
                    console.log(`  Decision: ${submission.decision}`);
                    console.log(`  Submitted: ${submission.submitted_at}\n`);
                    console.log('✅ All test data verified successfully!\n');
                } else {
                    console.log('⚠️  No submission found for test user\n');
                }

                process.exit(0);
            });
        } else {
            console.log('⚠️  Test user not found\n');
            process.exit(0);
        }
    });
});
