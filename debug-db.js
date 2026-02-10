const { db } = require('./server/config/database');

db.all("SELECT id, startup_user_id, total_risk_score, submitted_at FROM survey_submissions ORDER BY id DESC LIMIT 10", [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log(rows);
    }
});
