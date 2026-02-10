const { db } = require('./config/database');
const { generateOneTimeCode, hashCode, generateExpiryDate } = require('./utils/auth');

/**
 * Seed Test data for Startup Users Page
 * - 2 Pending Invites
 * - 2 Active Users
 * - 2 Disabled Users
 */

const users = [
    { email: 'pending1@invite.com', startup: 'Pending Inc', status: 'Invited' },
    { email: 'pending2@invite.com', startup: 'Waiting Room LLC', status: 'Invited' },
    { email: 'active1@startup.com', startup: 'Active Dynamics', status: 'Active' },
    { email: 'active2@startup.com', startup: 'GoGetter Systems', status: 'Active' },
    { email: 'disabledOne@corp.com', startup: 'Closed Doors', status: 'Disabled' },
    { email: 'disabledTwo@corp.com', startup: 'Off Grid', status: 'Disabled' }
];

function seedUsers() {
    console.log('🌱 Seeding status test users...');

    db.serialize(() => {
        users.forEach(u => {
            db.run(`
                INSERT INTO startup_users (email, startup_name, contact_name, status, created_by, created_at)
                VALUES (?, ?, 'Test User', ?, 1, datetime('now'))
            `, [u.email, u.startup, u.status], function (err) {
                if (err) {
                    console.log(`Skipping ${u.email} (maybe exists)`);
                    return;
                }
                const userId = this.lastID;

                // For Invited/Active, create a code
                if (u.status === 'Invited' || u.status === 'Active') {
                    const code = generateOneTimeCode();
                    const hash = hashCode(code);
                    const expiry = generateExpiryDate(7);

                    db.run(`INSERT INTO invite_codes (startup_user_id, code_hash, expires_at, is_valid) VALUES (?, ?, ?, 1)`,
                        [userId, hash, expiry]
                    );
                }

                console.log(`✓ Added ${u.email} (${u.status})`);
            });
        });
    });
}

seedUsers();
