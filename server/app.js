const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { db, initializeDatabase } = require('./config/database');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({
    secret: 'startup-risk-assessment-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Import routes
const adminRoutes = require('./routes/admin');
const startupRoutes = require('./routes/startup');
const apiRoutes = require('./routes/api');

// Use routes
app.use('/admin', adminRoutes);
app.use('/startup', startupRoutes);
app.use('/api', apiRoutes);

// Root redirect
app.get('/', (req, res) => {
    res.redirect('/admin/login.html');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database and start server
initializeDatabase();

// Check if we need to seed
db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
    if (!err && row.count === 0) {
        console.log('Database is empty, seeding...');
        seedDatabase();
    }
});

app.listen(PORT, () => {
    console.log(`\n✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Admin panel: http://localhost:${PORT}/admin/login.html`);
    console.log(`✓ Startup login: http://localhost:${PORT}/startup/login.html\n`);
});

module.exports = app;
