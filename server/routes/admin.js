const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../config/database');
const { generateOneTimeCode, hashCode, generateExpiryDate, generateInviteLink } = require('../utils/auth');

// Middleware to check admin authentication
function requireAdmin(req, res, next) {
    if (req.session && req.session.adminId) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Admin login
router.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.adminId = admin.id;
        req.session.username = admin.username;

        res.json({ success: true, username: admin.username });
    });
});

// Admin logout
router.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Check admin session
router.get('/api/check-session', (req, res) => {
    if (req.session && req.session.adminId) {
        res.json({ authenticated: true, username: req.session.username });
    } else {
        res.json({ authenticated: false });
    }
});

// Get all startup users
router.get('/api/startup-users', requireAdmin, (req, res) => {
    const query = `
    SELECT 
      su.*,
      ic.code_hash,
      ic.expires_at,
      ic.consumed_at,
      ic.is_valid,
      (SELECT COUNT(*) FROM survey_submissions WHERE startup_user_id = su.id) as submission_count,
      (SELECT COUNT(*) FROM survey_drafts WHERE startup_user_id = su.id) as draft_count,
      ss.total_risk_score,
      ss.risk_band,
      ss.submitted_at as submission_date
    FROM startup_users su
    LEFT JOIN invite_codes ic ON su.id = ic.startup_user_id AND ic.is_valid = 1
    LEFT JOIN (
        SELECT startup_user_id, total_risk_score, risk_band, submitted_at, MAX(id)
        FROM survey_submissions
        GROUP BY startup_user_id
    ) ss ON su.id = ss.startup_user_id
    ORDER BY su.created_at DESC
  `;

    db.all(query, [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(users);
    });
});

// Create startup user
router.post('/api/startup-users', requireAdmin, (req, res) => {
    const { email, startup_name, contact_name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const code = generateOneTimeCode();
    const codeHash = hashCode(code);
    const expiresAt = generateExpiryDate(7);

    db.serialize(() => {
        db.run(
            'INSERT INTO startup_users (email, startup_name, contact_name, status, created_by) VALUES (?, ?, ?, ?, ?)',
            [email, startup_name, contact_name, 'Invited', req.session.adminId],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: 'Database error' });
                }

                const userId = this.lastID;

                db.run(
                    'INSERT INTO invite_codes (startup_user_id, code_hash, expires_at) VALUES (?, ?, ?)',
                    [userId, codeHash, expiresAt],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to create invite code' });
                        }

                        const inviteLink = generateInviteLink(email, code);

                        // Log audit
                        db.run(
                            'INSERT INTO audit_log (actor_admin_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
                            [req.session.adminId, 'CREATE_STARTUP_USER', 'startup_user', userId]
                        );

                        res.json({
                            success: true,
                            userId,
                            code, // Return code for manual sharing
                            inviteLink,
                            expiresAt
                        });
                    }
                );
            }
        );
    });
});

// Resend invite (regenerate code)
router.post('/api/startup-users/:id/resend', requireAdmin, (req, res) => {
    const userId = req.params.id;

    const newCode = generateOneTimeCode();
    const codeHash = hashCode(newCode);
    const expiresAt = generateExpiryDate(7);

    db.serialize(() => {
        // Invalidate old codes
        db.run('UPDATE invite_codes SET is_valid = 0 WHERE startup_user_id = ?', [userId]);

        // Create new code
        db.run(
            'INSERT INTO invite_codes (startup_user_id, code_hash, expires_at, resent_count) VALUES (?, ?, ?, 1)',
            [userId, codeHash, expiresAt],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create new code' });
                }

                db.get('SELECT email FROM startup_users WHERE id = ?', [userId], (err, user) => {
                    if (err || !user) {
                        return res.status(500).json({ error: 'User not found' });
                    }

                    const inviteLink = generateInviteLink(user.email, newCode);

                    // Log audit
                    db.run(
                        'INSERT INTO audit_log (actor_admin_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
                        [req.session.adminId, 'RESEND_INVITE', 'startup_user', userId]
                    );

                    res.json({
                        success: true,
                        code: newCode,
                        inviteLink,
                        expiresAt
                    });
                });
            }
        );
    });
});

// Update startup user status
router.patch('/api/startup-users/:id', requireAdmin, (req, res) => {
    const userId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['Invited', 'Active', 'Submitted', 'Locked', 'Disabled'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    db.run(
        'UPDATE startup_users SET status = ? WHERE id = ?',
        [status, userId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            // Log audit
            db.run(
                'INSERT INTO audit_log (actor_admin_id, action, entity_type, entity_id, diff_json) VALUES (?, ?, ?, ?, ?)',
                [req.session.adminId, 'UPDATE_STATUS', 'startup_user', userId, JSON.stringify({ status })]
            );

            res.json({ success: true });
        }
    );
});

// Get all submissions
router.get('/api/submissions', requireAdmin, (req, res) => {
    const query = `
    SELECT 
      ss.*,
      su.email,
      su.startup_name,
      su.contact_name,
      sv.notes as version_notes
    FROM survey_submissions ss
    JOIN startup_users su ON ss.startup_user_id = su.id
    JOIN survey_versions sv ON ss.survey_version_id = sv.id
    ORDER BY ss.submitted_at DESC
  `;

    db.all(query, [], (err, submissions) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        // Parse JSON fields
        submissions.forEach(sub => {
            sub.answers = JSON.parse(sub.answers_json);
            sub.section_scores = JSON.parse(sub.section_risk_scores_json);
            sub.kpi_scores = JSON.parse(sub.kpi_scores_json);
        });

        res.json(submissions);
    });
});

// Get single submission details
router.get('/api/submissions/:id', requireAdmin, (req, res) => {
    const query = `
    SELECT 
      ss.*,
      su.email,
      su.startup_name,
      su.contact_name,
      sv.notes as version_notes
    FROM survey_submissions ss
    JOIN startup_users su ON ss.startup_user_id = su.id
    JOIN survey_versions sv ON ss.survey_version_id = sv.id
    WHERE ss.id = ?
  `;

    db.get(query, [req.params.id], (err, submission) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        submission.answers = JSON.parse(submission.answers_json);
        submission.section_scores = JSON.parse(submission.section_risk_scores_json);
        submission.kpi_scores = JSON.parse(submission.kpi_scores_json);

        // Get questions for this version
        db.all(
            'SELECT * FROM questions WHERE survey_version_id = ? ORDER BY order_index',
            [submission.survey_version_id],
            (err, questions) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                submission.questions = questions;
                res.json(submission);
            }
        );
    });
});

// Get active survey version
router.get('/api/survey-version/active', requireAdmin, (req, res) => {
    db.get('SELECT * FROM survey_versions WHERE is_active = 1', [], (err, version) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!version) {
            return res.status(404).json({ error: 'No active survey version' });
        }

        db.all(
            'SELECT * FROM questions WHERE survey_version_id = ? ORDER BY order_index',
            [version.id],
            (err, questions) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                version.questions = questions;
                res.json(version);
            }
        );
    });
});

// Update question
router.patch('/api/questions/:id', requireAdmin, (req, res) => {
    const questionId = req.params.id;
    const { label, weight, required, options_json, scoring_rules_json } = req.body;

    const updates = [];
    const values = [];

    if (label !== undefined) {
        updates.push('label = ?');
        values.push(label);
    }
    if (weight !== undefined) {
        updates.push('weight = ?');
        values.push(weight);
    }
    if (required !== undefined) {
        updates.push('required = ?');
        values.push(required ? 1 : 0);
    }
    if (options_json !== undefined) {
        updates.push('options_json = ?');
        values.push(JSON.stringify(options_json));
    }
    if (scoring_rules_json !== undefined) {
        updates.push('scoring_rules_json = ?');
        values.push(JSON.stringify(scoring_rules_json));
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
    }

    values.push(questionId);

    db.run(
        `UPDATE questions SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            // Log audit
            db.run(
                'INSERT INTO audit_log (actor_admin_id, action, entity_type, entity_id, diff_json) VALUES (?, ?, ?, ?, ?)',
                [req.session.adminId, 'UPDATE_QUESTION', 'question', questionId, JSON.stringify(req.body)]
            );

            res.json({ success: true });
        }
    );
});

// Get audit log
router.get('/api/audit-log', requireAdmin, (req, res) => {
    const query = `
    SELECT 
      al.*,
      a.username as actor_username
    FROM audit_log al
    LEFT JOIN admins a ON al.actor_admin_id = a.id
    ORDER BY al.timestamp DESC
    LIMIT 100
  `;

    db.all(query, [], (err, logs) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(logs);
    });
});

module.exports = router;
