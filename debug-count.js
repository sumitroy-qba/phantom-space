const { db } = require('./server/config/database');

db.serialize(() => {
    db.get('SELECT COUNT(*) as sub_count FROM survey_submissions', (err, row) => {
        if (err) console.error(err);
        else console.log('Total Submissions:', row.sub_count);
    });

    db.get("SELECT COUNT(*) as user_count FROM startup_users WHERE status IN ('Assessment Completed', 'Submitted')", (err, row) => {
        if (err) console.error(err);
        else console.log('Users with status Submitted/Completed:', row.user_count);
    });

    db.all("SELECT id, startup_name, status, (SELECT COUNT(*) FROM survey_submissions WHERE startup_user_id = startup_users.id) as actual_submissions FROM startup_users", (err, rows) => {
        if (err) console.error(err);
        else {
            console.log('\n--- Discrepancy Check ---');
            rows.forEach(r => {
                if (r.actual_submissions > 0 && r.status !== 'Assessment Completed' && r.status !== 'Submitted') {
                    console.log(`MISMATCH: ${r.startup_name} (ID: ${r.id}) has ${r.actual_submissions} submissions but status is '${r.status}'`);
                }
            });
        }
    });
});
