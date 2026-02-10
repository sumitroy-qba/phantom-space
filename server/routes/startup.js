const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { verifyCode, isExpired, parseInviteToken } = require('../utils/auth');
const ScoringEngine = require('../utils/scoring');

// Middleware to check startup authentication
function requireStartup(req, res, next) {
    if (req.session && req.session.startupUserId) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Startup login with one-time code
router.post('/api/login', (req, res) => {
    const { email, code, token } = req.body;

    let loginEmail = email;
    let loginCode = code;

    // Parse token if provided
    if (token) {
        const parsed = parseInviteToken(token);
        if (parsed) {
            loginEmail = parsed.email;
            loginCode = parsed.code;
        }
    }

    if (!loginEmail || !loginCode) {
        return res.status(400).json({ error: 'Email and code are required' });
    }

    // Find user
    db.get('SELECT * FROM startup_users WHERE email = ?', [loginEmail], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.status === 'Disabled') {
            return res.status(403).json({ error: 'Account is disabled' });
        }

        // Find valid invite code
        db.get(
            'SELECT * FROM invite_codes WHERE startup_user_id = ? AND is_valid = 1 ORDER BY created_at DESC LIMIT 1',
            [user.id],
            (err, inviteCode) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!inviteCode) {
                    return res.status(401).json({ error: 'No valid invite code found' });
                }

                if (isExpired(inviteCode.expires_at)) {
                    return res.status(401).json({ error: 'Invite code has expired' });
                }

                if (!verifyCode(loginCode, inviteCode.code_hash)) {
                    return res.status(401).json({ error: 'Invalid code' });
                }

                // Mark code as consumed on first login
                if (!inviteCode.consumed_at) {
                    db.run(
                        'UPDATE invite_codes SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [inviteCode.id]
                    );

                    db.run(
                        'UPDATE startup_users SET status = ?, last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
                        ['Active', user.id]
                    );
                } else {
                    db.run(
                        'UPDATE startup_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [user.id]
                    );
                }

                // Create session
                req.session.startupUserId = user.id;
                req.session.startupEmail = user.email;

                res.json({
                    success: true,
                    userId: user.id,
                    email: user.email,
                    startupName: user.startup_name,
                    status: user.status
                });
            }
        );
    });
});

// Startup logout
router.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Check startup session
router.get('/api/check-session', (req, res) => {
    if (req.session && req.session.startupUserId) {
        db.get('SELECT * FROM startup_users WHERE id = ?', [req.session.startupUserId], (err, user) => {
            if (err || !user) {
                return res.json({ authenticated: false });
            }

            res.json({
                authenticated: true,
                userId: user.id,
                email: user.email,
                startupName: user.startup_name,
                status: user.status
            });
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Get active survey for startup
router.get('/api/survey', requireStartup, (req, res) => {
    db.get('SELECT * FROM survey_versions WHERE is_active = 1', [], (err, version) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!version) {
            return res.status(404).json({ error: 'No active survey available' });
        }

        db.all(
            'SELECT * FROM questions WHERE survey_version_id = ? ORDER BY order_index',
            [version.id],
            (err, questions) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                // Parse JSON fields
                questions.forEach(q => {
                    if (q.options_json) q.options = JSON.parse(q.options_json);
                    if (q.scoring_rules_json) q.scoring_rules = JSON.parse(q.scoring_rules_json);
                });

                version.questions = questions;
                res.json(version);
            }
        );
    });
});

// Get or create draft
router.get('/api/draft', requireStartup, (req, res) => {
    const userId = req.session.startupUserId;

    db.get(
        'SELECT * FROM survey_drafts WHERE startup_user_id = ? ORDER BY updated_at DESC LIMIT 1',
        [userId],
        (err, draft) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (draft) {
                draft.answers = JSON.parse(draft.answers_json || '{}');
                draft.progress = JSON.parse(draft.progress_meta_json || '{}');
                return res.json(draft);
            }

            // Create new draft with active version
            db.get('SELECT id FROM survey_versions WHERE is_active = 1', [], (err, version) => {
                if (err || !version) {
                    return res.status(500).json({ error: 'No active survey version' });
                }

                db.run(
                    'INSERT INTO survey_drafts (startup_user_id, survey_version_id, answers_json, progress_meta_json) VALUES (?, ?, ?, ?)',
                    [userId, version.id, '{}', '{}'],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to create draft' });
                        }

                        res.json({
                            id: this.lastID,
                            startup_user_id: userId,
                            survey_version_id: version.id,
                            answers: {},
                            progress: {},
                            updated_at: new Date().toISOString()
                        });
                    }
                );
            });
        }
    );
});

// Save draft
router.post('/api/draft/save', requireStartup, (req, res) => {
    const userId = req.session.startupUserId;
    const { answers, progress } = req.body;

    db.get(
        'SELECT id, survey_version_id FROM survey_drafts WHERE startup_user_id = ? ORDER BY updated_at DESC LIMIT 1',
        [userId],
        (err, draft) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (draft) {
                db.run(
                    'UPDATE survey_drafts SET answers_json = ?, progress_meta_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [JSON.stringify(answers), JSON.stringify(progress), draft.id],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to save draft' });
                        }
                        res.json({ success: true, draftId: draft.id });
                    }
                );
            } else {
                // Create new draft
                db.get('SELECT id FROM survey_versions WHERE is_active = 1', [], (err, version) => {
                    if (err || !version) {
                        return res.status(500).json({ error: 'No active survey version' });
                    }

                    db.run(
                        'INSERT INTO survey_drafts (startup_user_id, survey_version_id, answers_json, progress_meta_json) VALUES (?, ?, ?, ?)',
                        [userId, version.id, JSON.stringify(answers), JSON.stringify(progress)],
                        function (err) {
                            if (err) {
                                return res.status(500).json({ error: 'Failed to save draft' });
                            }
                            res.json({ success: true, draftId: this.lastID });
                        }
                    );
                });
            }
        }
    );
});

// Submit survey
router.post('/api/submit', requireStartup, (req, res) => {
    const userId = req.session.startupUserId;
    const { answers } = req.body;

    // Check if user is locked
    db.get('SELECT status FROM startup_users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (user.status === 'Locked') {
            return res.status(403).json({ error: 'Submission is locked' });
        }

        // Get draft to find version
        db.get(
            'SELECT survey_version_id FROM survey_drafts WHERE startup_user_id = ? ORDER BY updated_at DESC LIMIT 1',
            [userId],
            (err, draft) => {
                if (err || !draft) {
                    return res.status(500).json({ error: 'No draft found' });
                }

                const versionId = draft.survey_version_id;

                // Get questions for scoring
                db.all(
                    'SELECT * FROM questions WHERE survey_version_id = ? ORDER BY order_index',
                    [versionId],
                    (err, questions) => {
                        if (err) {
                            return res.status(500).json({ error: 'Database error' });
                        }

                        // Parse JSON fields
                        questions.forEach(q => {
                            if (q.options_json) q.options = JSON.parse(q.options_json);
                            if (q.scoring_rules_json) q.scoring_rules = JSON.parse(q.scoring_rules_json);
                        });

                        // Calculate scores
                        const scoringEngine = new ScoringEngine(answers, questions);
                        const scores = scoringEngine.calculateRiskScore();

                        // Save submission
                        db.run(
                            `INSERT INTO survey_submissions 
               (startup_user_id, survey_version_id, answers_json, total_risk_score, risk_band, decision, section_risk_scores_json, kpi_scores_json)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                userId,
                                versionId,
                                JSON.stringify(answers),
                                scores.totalRiskScore,
                                scores.riskBand,
                                scores.decision,
                                JSON.stringify(scores.sectionScores),
                                JSON.stringify(scores.kpiScores)
                            ],
                            function (err) {
                                if (err) {
                                    console.error('Submission error:', err);
                                    return res.status(500).json({ error: 'Failed to save submission' });
                                }

                                const submissionId = this.lastID;

                                // Update user status to Submitted and Locked
                                db.run(
                                    'UPDATE startup_users SET status = ? WHERE id = ?',
                                    ['Locked', userId],
                                    (err) => {
                                        if (err) {
                                            console.error('Status update error:', err);
                                        }

                                        res.json({
                                            success: true,
                                            submissionId,
                                            scores
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
});

// Get submission results
router.get('/api/submission', requireStartup, (req, res) => {
    const userId = req.session.startupUserId;

    db.get(
        'SELECT * FROM survey_submissions WHERE startup_user_id = ? ORDER BY submitted_at DESC LIMIT 1',
        [userId],
        (err, submission) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!submission) {
                return res.status(404).json({ error: 'No submission found' });
            }

            submission.answers = JSON.parse(submission.answers_json);
            submission.section_scores = JSON.parse(submission.section_risk_scores_json);
            submission.kpi_scores = JSON.parse(submission.kpi_scores_json);

            res.json(submission);
        }
    );
});

module.exports = router;
