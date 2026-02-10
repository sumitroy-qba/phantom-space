const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
function initializeDatabase() {
    db.serialize(() => {
        // Admin users table
        db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Startup users table
        db.run(`
      CREATE TABLE IF NOT EXISTS startup_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        startup_name TEXT,
        contact_name TEXT,
        status TEXT DEFAULT 'Invited',
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login_at DATETIME,
        FOREIGN KEY (created_by) REFERENCES admins(id)
      )
    `);

        // Invite codes table
        db.run(`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startup_user_id INTEGER NOT NULL,
        code_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        consumed_at DATETIME,
        resent_count INTEGER DEFAULT 0,
        is_valid BOOLEAN DEFAULT 1,
        FOREIGN KEY (startup_user_id) REFERENCES startup_users(id)
      )
    `);

        // Survey versions table
        db.run(`
      CREATE TABLE IF NOT EXISTS survey_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 0,
        notes TEXT,
        section_weights TEXT
      )
    `);

        // Questions table
        db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        survey_version_id INTEGER NOT NULL,
        section TEXT NOT NULL,
        label TEXT NOT NULL,
        type TEXT NOT NULL,
        options_json TEXT,
        required BOOLEAN DEFAULT 0,
        weight REAL DEFAULT 1.0,
        scoring_rules_json TEXT,
        order_index INTEGER,
        FOREIGN KEY (survey_version_id) REFERENCES survey_versions(id)
      )
    `);

        // Survey drafts table
        db.run(`
      CREATE TABLE IF NOT EXISTS survey_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startup_user_id INTEGER NOT NULL,
        survey_version_id INTEGER NOT NULL,
        answers_json TEXT,
        progress_meta_json TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (startup_user_id) REFERENCES startup_users(id),
        FOREIGN KEY (survey_version_id) REFERENCES survey_versions(id)
      )
    `);

        // Survey submissions table
        db.run(`
      CREATE TABLE IF NOT EXISTS survey_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startup_user_id INTEGER NOT NULL,
        survey_version_id INTEGER NOT NULL,
        answers_json TEXT NOT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_risk_score REAL,
        risk_band TEXT,
        decision TEXT,
        section_risk_scores_json TEXT,
        kpi_scores_json TEXT,
        FOREIGN KEY (startup_user_id) REFERENCES startup_users(id),
        FOREIGN KEY (survey_version_id) REFERENCES survey_versions(id)
      )
    `);

        // Audit log table
        db.run(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_admin_id INTEGER,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        diff_json TEXT,
        FOREIGN KEY (actor_admin_id) REFERENCES admins(id)
      )
    `);

        // Risk thresholds configuration
        db.run(`
      CREATE TABLE IF NOT EXISTS risk_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        survey_version_id INTEGER NOT NULL,
        low_max REAL DEFAULT 30,
        medium_max REAL DEFAULT 60,
        low_decision TEXT DEFAULT 'Strong candidate for investment (subject to diligence)',
        medium_decision TEXT DEFAULT 'Proceed with caution; require mitigations',
        high_decision TEXT DEFAULT 'Not recommended unless major risks resolved',
        FOREIGN KEY (survey_version_id) REFERENCES survey_versions(id)
      )
    `);

        console.log('Database schema initialized successfully');
    });
}

module.exports = { db, initializeDatabase };
