# Startup Investment Risk Assessment Platform

A comprehensive web application for assessing startup investment risk with detailed scoring algorithms, admin management, and startup user portals.

## 🚀 Features

### Admin Features
- **Dashboard**: Overview of all startup users, submissions, and statistics
- **Startup User Management**: Create users, generate one-time codes, manage invites
- **Submissions Viewer**: View detailed risk assessments and scores
- **Compare & Rank**: Compare multiple startups side-by-side
- **Survey Builder**: Manage questions, weights, and scoring rules
- **Audit Logging**: Track all admin actions

### Startup User Features
- **Secure Login**: One-time code authentication
- **Multi-Section Assessment**: 12 comprehensive sections (A-L)
- **Auto-Save**: Drafts saved automatically every 10 seconds
- **Progress Tracking**: Visual progress indicators
- **Risk Score Calculation**: Automatic scoring based on complex algorithms
- **Results Dashboard**: Detailed breakdown of risk scores and KPIs

## 📊 Scoring System

The platform calculates risk scores (0-100, higher = riskier) across multiple dimensions:

### Section Weights
- **Product & Stage (B)**: 15%
- **Market & Geography (C)**: 15%
- **Regulatory & Compliance (D)**: 15%
- **IP (E)**: 5%
- **Unit Economics (F)**: 15%
- **Market Sizing (G)**: 10%
- **Revenue & Growth (H)**: 15%
- **Customers & Contracts (I)**: 5%
- **Exit + Financial + Self Risks (J+K+L)**: 5%

### Risk Bands
- **0-30**: Low Risk → "Strong candidate for investment"
- **31-60**: Medium Risk → "Proceed with caution"
- **61-100**: High Risk → "Not recommended unless risks resolved"

### Key KPIs
- Regulatory Risk
- Unit Economics
- Growth Stability
- Customer Concentration
- Execution Complexity
- Exit Clarity

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **Database**: SQLite
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Authentication**: Session-based with bcrypt
- **Design**: Premium dark theme with glassmorphism

## 📦 Installation

1. **Install Dependencies**:
   ```powershell
   npm install
   ```

2. **Start Server**:
   ```powershell
   npm start
   ```

3. **Access Application**:
   - Admin Panel: http://localhost:3000/admin/login.html
   - Startup Login: http://localhost:3000/startup/login.html

## 🔐 Default Credentials

**Admin Login**:
- Username: `admin`
- Password: `admin123`

## 📝 Usage Guide

### For Admins

1. **Login** to admin panel with default credentials
2. **Create Startup User**:
   - Navigate to "Startup Users"
   - Click "Create New User"
   - Enter email (required), startup name, and contact name
   - Copy the generated one-time code and invite link
   - Share with the startup

3. **View Submissions**:
   - Navigate to "Submissions"
   - View detailed risk scores, section breakdowns, and KPIs
   - Export data as needed

4. **Compare Startups**:
   - Navigate to "Compare & Rank"
   - Select multiple startups
   - View side-by-side comparison
   - Rank by overall risk or specific KPIs

### For Startup Users

1. **Login** using email and one-time code
2. **Complete Assessment**:
   - Fill out all 12 sections (A-L)
   - Answers auto-save every 10 seconds
   - Use "Save Draft" to manually save
   - Track progress with the progress bar

3. **Review & Submit**:
   - Review all answers
   - Validate required fields
   - Submit final assessment

4. **View Results**:
   - See overall risk score and band
   - View section-by-section breakdown
   - Understand key risk drivers
   - Download PDF summary (if implemented)

## 📂 Project Structure

```
/
├── server/
│   ├── app.js                 # Express server
│   ├── config/
│   │   └── database.js        # Database schema
│   ├── routes/
│   │   ├── admin.js           # Admin API routes
│   │   ├── startup.js         # Startup API routes
│   │   └── api.js             # Shared routes
│   ├── utils/
│   │   ├── scoring.js         # Risk scoring engine
│   │   └── auth.js            # Authentication utilities
│   └── seed.js                # Database seed data
├── public/
│   ├── css/
│   │   └── styles.css         # Main stylesheet
│   ├── admin/                 # Admin HTML pages
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   └── startup-users.html
│   └── startup/               # Startup HTML pages
│       └── login.html
├── package.json
└── README.md
```

## 🔬 Assessment Sections

### Section A: Basic Info
- Startup name, website, industry
- Year founded, employees
- Founders' LinkedIn profiles

### Section B: Offering & Product
- Product description (min 300 chars)
- Startup stage (Idea → Scale-up)

### Section C: Market & Geography
- Primary and secondary markets
- Go-to-market strategy

### Section D: Regulatory & Compliance
- Regulatory bodies (SEC, FDA, GDPR, etc.)
- Compliance readiness

### Section E: IP (Patents/Trademarks)
- IP applicability and status
- Jurisdictions and references

### Section F: Revenue Model & Unit Economics
- Revenue model
- CAC and LTV

### Section G: Market Sizing
- TAM, SAM, SOM
- Data sources and quality

### Section H: Revenue & Growth
- Revenue status (pre-revenue or generating)
- MRR/ARR and growth rates

### Section I: Customer Contracts
- Contract details
- Customer concentration

### Section J: 3-Year Expense Plans
- Allocation across categories
- Tech, Marketing, Sales, Management, Operations

### Section K: Exit Strategy
- Exit type and timeline
- Target valuation and buyers

### Section L: Self-Reported Risks
- Top 3 risks with categories
- Market, Tech, Regulatory, Team, Financial

## 🎨 Design Features

- **Premium Dark Theme**: Modern, professional appearance
- **Glassmorphism**: Frosted glass effects on cards
- **Smooth Animations**: Fade-in, slide-in, and hover effects
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Custom Typography**: Inter font family
- **Color-Coded Risk Bands**: Visual risk indicators
- **Progress Indicators**: Real-time progress tracking

## 🔒 Security Features

- **Password Hashing**: bcrypt for admin passwords
- **Code Hashing**: One-time codes hashed with bcrypt
- **Session Management**: Secure session cookies
- **Role-Based Access**: Admin vs. Startup user separation
- **Code Expiry**: 7-day expiration on invite codes
- **Audit Logging**: All admin actions logged
- **Status Management**: Lock submissions after completion

## 📊 Database Schema

### Tables
- `admins`: Admin user accounts
- `startup_users`: Startup user accounts
- `invite_codes`: One-time authentication codes
- `survey_versions`: Survey configuration versions
- `questions`: Survey questions and scoring rules
- `survey_drafts`: In-progress assessments
- `survey_submissions`: Completed assessments with scores
- `audit_log`: Admin action history
- `risk_config`: Risk threshold configuration

## 🚧 Future Enhancements

- [ ] PDF export for submission results
- [ ] Email integration for invite sending
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Custom branding per admin
- [ ] API for third-party integrations
- [ ] Bulk user import
- [ ] Advanced filtering and search
- [ ] Data visualization charts
- [ ] Export to Excel/CSV

## 📄 License

This project is proprietary software for investment risk assessment.

## 👥 Support

For support or questions, contact your system administrator.

---

**Built with ❤️ for better investment decisions**
