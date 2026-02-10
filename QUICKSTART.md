# Quick Start Guide - Startup Investment Risk Assessment Platform

## 🚀 Getting Started

Your application is now running at **http://localhost:3000**

## 📋 Step-by-Step Demo

### Step 1: Admin Login
1. Open your browser and navigate to: **http://localhost:3000/admin/login.html**
2. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. You'll be redirected to the Admin Dashboard

### Step 2: Create a Startup User
1. From the dashboard, click **"Startup Users"** in the navigation
2. Click the **"➕ Create New User"** button
3. Fill in the form:
   - **Email**: `test@startup.com` (required)
   - **Startup Name**: `TechVenture Inc.` (optional)
   - **Contact Name**: `John Doe` (optional)
4. Click **"Create & Generate Code"**
5. A modal will appear with:
   - **One-Time Code**: e.g., `ABC12345` (8 characters)
   - **Invite Link**: e.g., `http://localhost:3000/startup/login?token=...`
6. **Copy both** - you'll need them for the next step

### Step 3: Startup User Login
1. Open a new browser tab (or incognito window)
2. Navigate to: **http://localhost:3000/startup/login.html**
   - OR click the invite link you copied
3. Enter:
   - **Email**: `test@startup.com`
   - **Code**: The 8-character code you copied
4. Click **"Access Assessment"**

### Step 4: Complete the Assessment
1. You'll see a multi-section form with 12 sections (A-L)
2. Fill out the required fields (marked with *)
3. Navigate between sections using:
   - **Section navigation** on the left
   - **Next/Previous** buttons at the bottom
4. Your progress is:
   - **Auto-saved** every 10 seconds
   - **Manually saved** with the "💾 Save Draft" button
5. Watch the **progress bar** update as you complete fields

#### Sample Data for Quick Testing:

**Section A: Basic Info**
- Startup Name: TechVenture Inc.
- Website: https://techventure.com
- Industry: Technology
- Year Founded: 2022
- Employees: 6-10

**Section B: Offering & Product**
- Description: (Enter 300+ characters describing your product)
- Stage: Beta

**Section C: Market & Geography**
- Primary Markets: USA, Canada
- Go-to-Market: Product-Led Growth (PLG)

**Section D: Regulatory**
- Regulatory Bodies: GDPR, SEC
- Compliance Readiness: In Progress

**Section E: IP**
- IP Applicable: Yes
- Type: Patent
- Status: Filed

**Section F: Unit Economics**
- Revenue Model: Subscription
- CAC: 500
- LTV: 2000
- Currency: USD

**Section G: Market Sizing**
- TAM: 10000000000
- SAM: 1000000000
- SOM: 100000000
- Currency: USD
- Source Type: Analyst Report

**Section H: Revenue**
- Revenue Status: Revenue-generating
- Current MRR/ARR: 50000

**Section I: Contracts**
- Top 3 Revenue Share: 25

**Section J: Expense Allocation**
- Tech: 40
- Marketing: 25
- Sales: 15
- Management: 10
- Operations: 10

**Section K: Exit Strategy**
- Exit Type: Acquisition
- Timeline: 3-5 years
- Target Valuation: 50000000

**Section L: Self-Reported Risks**
- Risk #1: (100+ chars about market competition)
- Category: Market
- Risk #2: (100+ chars about technology challenges)
- Category: Technology
- Risk #3: (100+ chars about regulatory changes)
- Category: Regulatory

### Step 5: Submit Assessment
1. After completing all sections, click **"Submit Assessment"**
2. Confirm the submission (you cannot edit after this)
3. You'll be redirected to the **Results Page**

### Step 6: View Results
1. On the results page, you'll see:
   - **Overall Risk Score** (0-100)
   - **Risk Band** (Low/Medium/High)
   - **Investment Decision** recommendation
   - **Section Scores** breakdown
   - **KPI Scores** for key risk indicators

### Step 7: Admin Review (Switch Back to Admin)
1. Go back to the admin tab
2. Navigate to **"Submissions"**
3. You'll see the submitted assessment
4. Click **"View Details"** to see full breakdown
5. Go to **"Compare & Rank"** to see rankings

## 🎯 Key Features to Test

### Admin Features
- ✅ Create multiple startup users
- ✅ Resend invite codes
- ✅ Disable/Enable users
- ✅ View all submissions
- ✅ Compare startups side-by-side
- ✅ View survey questions

### Startup Features
- ✅ Secure one-time code login
- ✅ Multi-section assessment form
- ✅ Auto-save functionality
- ✅ Progress tracking
- ✅ Form validation
- ✅ Results visualization

## 📊 Understanding Risk Scores

### Overall Risk Score (0-100)
- **0-30**: Low Risk → Strong investment candidate
- **31-60**: Medium Risk → Proceed with caution
- **61-100**: High Risk → Not recommended

### Section Weights
Each section contributes to the overall score:
- Product & Stage: 15%
- Market & Geography: 15%
- Regulatory: 15%
- IP: 5%
- Unit Economics: 15%
- Market Sizing: 10%
- Revenue & Growth: 15%
- Customers: 5%
- Exit/Financial: 5%

### Key KPIs
- **Regulatory Risk**: Compliance burden
- **Unit Economics**: LTV/CAC ratio
- **Growth Stability**: Revenue consistency
- **Customer Concentration**: Dependency risk
- **Execution Complexity**: Geographic spread
- **Exit Clarity**: Exit strategy definition

## 🔧 Troubleshooting

### Server Not Running?
```powershell
cd "c:/Users/Sumit Roy/.gemini/antigravity/playground/phantom-space"
npm start
```

### Database Issues?
Delete `server/database.db` and restart - it will auto-seed.

### Login Issues?
- Admin: `admin` / `admin123`
- Startup: Use the email and code from admin panel

### Port Already in Use?
Edit `server/app.js` and change `PORT` to 3001 or another available port.

## 📱 Browser Compatibility
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 (Limited support)

## 🎨 Design Features
- Premium dark theme
- Glassmorphism effects
- Smooth animations
- Responsive layout
- Color-coded risk indicators
- Real-time progress tracking

## 📞 Support
For questions or issues, refer to the main README.md file.

---

**Enjoy testing your Startup Investment Risk Assessment Platform!** 🚀
