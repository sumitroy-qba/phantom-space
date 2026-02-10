const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a random one-time code (8 characters)
 */
function generateOneTimeCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Hash a code for secure storage
 */
function hashCode(code) {
    return bcrypt.hashSync(code, 10);
}

/**
 * Verify a code against its hash
 */
function verifyCode(code, hash) {
    return bcrypt.compareSync(code, hash);
}

/**
 * Generate expiry date (default 7 days from now)
 */
function generateExpiryDate(days = 7) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

/**
 * Check if a date has expired
 */
function isExpired(expiryDate) {
    return new Date(expiryDate) < new Date();
}

/**
 * Generate invite link with token
 */
function generateInviteLink(email, code) {
    const token = Buffer.from(`${email}:${code}`).toString('base64');
    // In production, use actual domain
    return `http://localhost:3000/startup/login?token=${token}`;
}

/**
 * Parse invite token
 */
function parseInviteToken(token) {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [email, code] = decoded.split(':');
        return { email, code };
    } catch (error) {
        return null;
    }
}

/**
 * Generate session token
 */
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    generateOneTimeCode,
    hashCode,
    verifyCode,
    generateExpiryDate,
    isExpired,
    generateInviteLink,
    parseInviteToken,
    generateSessionToken
};
