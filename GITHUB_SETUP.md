# GitHub Repository Setup - Visual Guide

## Step 1: Create Repository on GitHub

1. **Go to [github.com](https://github.com)**
2. **Click the "+" icon** in the top-right corner
3. **Select "New repository"**

## Step 2: Configure Repository

Fill in the form:

- **Repository name**: `startup-risk-assessment`
- **Description** (optional): "Startup Investment Risk Assessment Platform"
- **Visibility**: Choose "Public" or "Private"
- **IMPORTANT**: 
  - ❌ **DO NOT** check "Add a README file"
  - ❌ **DO NOT** check "Add .gitignore"
  - ❌ **DO NOT** choose a license yet
  
  *(We already have these files in your project)*

4. **Click "Create repository"**

## Step 3: Copy the Repository URL

After clicking "Create repository", you'll see a page titled:

**"Quick setup — if you've done this kind of thing before"**

### Finding the URL:

Look for a section that says:

```
…or push an existing repository from the command line
```

Below that, you'll see commands like:

```bash
git remote add origin https://github.com/YOUR_USERNAME/startup-risk-assessment.git
git branch -M main
git push -u origin main
```

### The URL to Copy:

The URL is in the first line: `https://github.com/YOUR_USERNAME/startup-risk-assessment.git`

**Example:**
- If your username is `john-doe`
- The URL will be: `https://github.com/john-doe/startup-risk-assessment.git`

### How to Copy:

**Option 1**: At the top of the page, there's a text box with the URL and a **copy button (📋)**
- Click the copy button

**Option 2**: Manually select and copy the URL from the command shown

---

## Step 4: Use the URL in Your Terminal

Now, in your PowerShell terminal, run:

```powershell
# Navigate to your project
cd "c:/Users/Sumit Roy/.gemini/antigravity/playground/phantom-space"

# Add the remote (replace YOUR_URL with the copied URL)
git remote add origin YOUR_URL_HERE

# Example:
# git remote add origin https://github.com/john-doe/startup-risk-assessment.git
```

---

## 🔍 **What the URL Looks Like**

### HTTPS Format (Recommended):
```
https://github.com/YOUR_USERNAME/startup-risk-assessment.git
```

### SSH Format (Alternative):
```
git@github.com:YOUR_USERNAME/startup-risk-assessment.git
```

**Use HTTPS** unless you've already set up SSH keys with GitHub.

---

## ✅ **Complete Commands in Order**

Once you have the URL, run these commands:

```powershell
# 1. Navigate to project
cd "c:/Users/Sumit Roy/.gemini/antigravity/playground/phantom-space"

# 2. Initialize git (if not already done)
git init

# 3. Add all files
git add .

# 4. Commit
git commit -m "Initial commit - Startup Risk Assessment Platform"

# 5. Add remote (use YOUR copied URL)
git remote add origin https://github.com/YOUR_USERNAME/startup-risk-assessment.git

# 6. Set branch name
git branch -M main

# 7. Push to GitHub
git push -u origin main
```

---

## 🚨 **Troubleshooting**

### "Authentication failed"
- GitHub may ask for your username and password
- **Note**: GitHub no longer accepts passwords for Git operations
- You need to create a **Personal Access Token (PAT)**:
  1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Click "Generate new token"
  3. Select scopes: `repo` (full control)
  4. Copy the token
  5. Use the token as your password when Git asks

### "Remote already exists"
If you see this error, run:
```powershell
git remote remove origin
```
Then try adding the remote again.

---

## 📸 **Visual Reference**

After creating the repository, the GitHub page will look like this:

**Top section** (where to copy URL):
```
┌─────────────────────────────────────────────────────┐
│ Quick setup — if you've done this kind of thing...  │
│                                                      │
│ HTTPS  [SSH]                                        │
│ ┌──────────────────────────────────────────┐ [📋]  │
│ │ https://github.com/user/repo.git         │       │
│ └──────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

**Middle section** (commands to use):
```
…or push an existing repository from the command line

git remote add origin https://github.com/user/repo.git
git branch -M main
git push -u origin main
```

---

## ✨ **Next Steps After Pushing**

Once you successfully push to GitHub:

1. ✅ Refresh the GitHub repository page
2. ✅ You should see all your files
3. ✅ Now you're ready to deploy to Render!

---

**Need help with any step? Let me know!**
