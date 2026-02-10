---
description: Startup Investment Risk Assessment Platform - Implementation Plan
---

# Startup Investment Risk Assessment Platform - Implementation Plan

## Technology Stack
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend**: Node.js + Express
- **Database**: SQLite (for simplicity, can migrate to PostgreSQL later)
- **Authentication**: Session-based with one-time codes
- **PDF Generation**: jsPDF or Puppeteer
- **Styling**: Modern, premium design with glassmorphism and animations

## Phase 1: Project Setup & Database Schema
1. Initialize Node.js project with Express
2. Set up SQLite database with all required tables
3. Create database migration/seed scripts
4. Set up project structure (MVC pattern)

## Phase 2: Authentication & User Management
1. Implement admin authentication (simple password-based)
2. Build startup user creation with one-time code generation
3. Implement invite link generation and email placeholder
4. Build startup login flow with code validation
5. Session management and role-based middleware

## Phase 3: Survey System Core
1. Create survey version management
2. Build question CRUD with scoring rules
3. Implement section-based form rendering
4. Auto-save and draft management
5. Progress tracking

## Phase 4: Scoring Engine
1. Implement all question-level risk formulas (A-L sections)
2. Build section score aggregation
3. Calculate overall risk score with weighted sections
4. Compute KPI scores
5. Determine risk band and investment decision

## Phase 5: Admin Dashboard
1. Survey builder interface
2. Weight & threshold editor
3. Startup users management panel
4. Submissions viewer with score breakdown
5. Compare & rank dashboard with filters

## Phase 6: Startup User Interface
1. Login page with one-time code
2. Multi-section assessment form with validation
3. Review & submit page
4. Results page with score breakdown
5. PDF export functionality

## Phase 7: Polish & Security
1. Audit logging for admin actions
2. Input validation and sanitization
3. Error handling and user feedback
4. Responsive design refinement
5. Performance optimization

## File Structure
```
/
├── server/
│   ├── app.js                 # Express app entry point
│   ├── config/
│   │   └── database.js        # Database connection
│   ├── models/               # Database models
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth & validation
│   ├── routes/               # API routes
│   ├── utils/                # Helpers (scoring, crypto)
│   └── database.db           # SQLite database
├── public/
│   ├── css/
│   │   └── styles.css        # Main stylesheet
│   ├── js/
│   │   ├── admin/            # Admin panel scripts
│   │   └── startup/          # Startup user scripts
│   ├── admin/                # Admin HTML pages
│   └── startup/              # Startup HTML pages
├── package.json
└── README.md
```

## Implementation Order
1. Database schema + seed data
2. Express server setup with routes
3. Admin authentication
4. Startup user management (create, invite)
5. Startup login flow
6. Survey form (all sections A-L)
7. Draft save/resume
8. Scoring engine (exact formulas)
9. Submission & lock
10. Admin dashboard (survey builder, submissions, compare)
11. UI polish & responsive design
12. PDF export
13. Audit logging
14. Testing & validation
