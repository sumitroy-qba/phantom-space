# Cloud Deployment Guide - Startup Risk Assessment Platform

## Quick Deploy to Render (Free)

### Prerequisites
- GitHub account
- Render account (free at render.com)

### Step 1: Prepare Your Code

1. **Create a `.gitignore` file** (if not exists):
```
node_modules/
database.db
.env
*.log
```

2. **Update `package.json`** to specify Node version:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

3. **Create environment configuration** (optional):
Create a `.env.example` file:
```
PORT=3000
NODE_ENV=production
```

### Step 2: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Startup Risk Assessment Platform"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render

1. **Go to [render.com](https://render.com)** and sign up/login

2. **Click "New +"** → **"Web Service"**

3. **Connect your GitHub repository**

4. **Configure the service:**
   - **Name**: `startup-risk-platform` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Click "Create Web Service"**

6. **Wait for deployment** (2-5 minutes)

7. **Your app will be live at**: `https://startup-risk-platform.onrender.com`

### Step 4: Access Your Application

- **Admin Panel**: `https://YOUR_APP.onrender.com/admin/login.html`
- **Startup Login**: `https://YOUR_APP.onrender.com/startup/login.html`

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

---

## Alternative: Railway Deployment

### Quick Deploy to Railway

1. **Go to [railway.app](https://railway.app)**

2. **Click "Start a New Project"**

3. **Select "Deploy from GitHub repo"**

4. **Select your repository**

5. **Railway auto-detects Node.js** and deploys

6. **Get your URL** from the deployment dashboard

**That's it!** Railway handles everything automatically.

---

## Alternative: DigitalOcean App Platform

### Deploy to DigitalOcean

1. **Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)**

2. **Click "Create" → "Apps"**

3. **Connect your GitHub repository**

4. **Configure:**
   - **Type**: Web Service
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **HTTP Port**: 3000

5. **Choose plan**: Basic ($5/month)

6. **Deploy**

---

## Important Notes

### Database Persistence

⚠️ **SQLite on Cloud Platforms:**
- Most cloud platforms use **ephemeral storage**
- Your database will reset when the app restarts
- For production, consider:
  - **PostgreSQL** (Render offers free tier)
  - **MySQL**
  - **MongoDB**

### For Persistent SQLite:
- **Render**: Use persistent disk (paid feature)
- **Railway**: Volumes for persistence
- **DigitalOcean**: Attach a volume

### Environment Variables

If you need to set environment variables:

**On Render:**
1. Go to your service dashboard
2. Click "Environment"
3. Add variables:
   - `PORT=3000`
   - `NODE_ENV=production`

**On Railway:**
1. Go to your project
2. Click "Variables"
3. Add your variables

### Security Recommendations

Before deploying to production:

1. **Change default admin password**
2. **Use environment variables for secrets**
3. **Enable HTTPS** (automatic on most platforms)
4. **Add rate limiting**
5. **Set up proper CORS**
6. **Use a production database**

---

## Upgrading to PostgreSQL (Recommended for Production)

### Why PostgreSQL?
- ✅ Persistent data
- ✅ Better for production
- ✅ Free tier on Render
- ✅ More reliable

### Migration Steps:

1. **Install PostgreSQL driver:**
```bash
npm install pg
```

2. **Update database configuration** to use PostgreSQL instead of SQLite

3. **Create PostgreSQL database** on Render (free tier available)

4. **Update connection string** in environment variables

---

## Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Render** | 750 hrs/month | $7/month | Testing, demos |
| **Railway** | $5 credit/month | Pay as you go | Quick deploys |
| **Heroku** | None | $5/month | Production apps |
| **DigitalOcean** | None | $5/month | Scalable apps |
| **Vercel** | Free (limited) | $20/month | Frontend-heavy |

---

## Troubleshooting

### App won't start?
- Check build logs in platform dashboard
- Verify `npm start` command works locally
- Check Node.js version compatibility

### Database resets on restart?
- Use persistent storage (paid feature)
- Or migrate to PostgreSQL

### Port issues?
- Make sure your app uses `process.env.PORT`
- Update `server/app.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

---

## Next Steps

1. ✅ Choose a platform (Render recommended for free tier)
2. ✅ Push code to GitHub
3. ✅ Deploy following the guide above
4. ✅ Test your live application
5. ✅ Share the URL with stakeholders

**Your app will be live and accessible from anywhere!** 🚀
