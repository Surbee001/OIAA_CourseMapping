# 🚀 Deployment Instructions

## Step 1: Push to GitHub

### Option A: Using the Batch Script (Easiest)
1. Double-click `DEPLOY_TO_GITHUB.bat` in Windows Explorer
2. Wait for it to complete
3. If Git is not installed, download from: https://git-scm.com/

### Option B: Manual Commands
Open **Git Bash** (or PowerShell with Git installed) and run:

```bash
# Initialize repository
git init

# Add all files
git add .

# Commit with message
git commit -m "feat: Production-ready Course Mapping System with enterprise security"

# Set main branch
git branch -M main

# Add remote repository
git remote add origin https://github.com/Surbee001/OIAA_CourseMapping.git

# Push to GitHub
git push -u origin main
```

### If you get "remote already exists" error:
```bash
git remote remove origin
git remote add origin https://github.com/Surbee001/OIAA_CourseMapping.git
git push -u origin main
```

### If you get authentication error:
- Use GitHub Personal Access Token instead of password
- Get token from: https://github.com/settings/tokens
- When prompted for password, paste your token

---

## Step 2: Deploy to Vercel

### 1. Go to Vercel
Visit: https://vercel.com/new

### 2. Import Repository
- Click **"Import Git Repository"**
- Select **"OIAA_CourseMapping"**
- Click **"Import"**

### 3. Add Environment Variables
**BEFORE clicking Deploy**, scroll down to "Environment Variables" section.

Open `VERCEL_ENV_READY.txt` and copy this block:

```
ADMIN_EMAIL=h.mroue@ajman.ac.ae
ADMIN_PASSWORD=OI@a25
RESEND_API_KEY=re_jZbc9WMP_BUZy1UrEKUDShkB94BTPv7vE
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL_RECIPIENT=h.mroue@ajman.ac.ae
NODE_ENV=production
```

**How to add in Vercel:**

**Option 1: One by one**
- Click "Add" for each variable
- Name: `ADMIN_EMAIL`, Value: `h.mroue@ajman.ac.ae`
- Name: `ADMIN_PASSWORD`, Value: `OI@a25`
- (Continue for all 6 variables)

**Option 2: Bulk paste** (if available)
- Look for "Paste .env" or "Bulk add" button
- Paste all 6 lines at once

**Apply to:** Select all environments (Production, Preview, Development)

### 4. Deploy
- Click **"Deploy"** button
- Wait 2-3 minutes for build
- Your app will be live at: `https://your-project.vercel.app`

---

## Step 3: Test Your Deployment

1. **Visit your live site**
   - Go to the URL Vercel provides
   - Verify the homepage loads

2. **Test Admin Login**
   - Navigate to: `https://your-project.vercel.app/adminlogin`
   - Email: `h.mroue@ajman.ac.ae`
   - Password: `OI@a25`

3. **Test Application Submission**
   - Fill out the student wizard
   - Submit a test application
   - Check admin panel to see it

4. **Test Email Notifications**
   - Submit an application
   - Check if emails are sent
   - Review Resend dashboard: https://resend.com/emails

5. **Verify Security Features**
   - Try logging in 6 times with wrong password (should be rate limited)
   - Check browser DevTools → Application → Cookies (should see secure cookies)
   - Try submitting 11 applications in an hour (should be rate limited)

---

## Step 4: Custom Domain (Optional)

1. Go to your Vercel project
2. Navigate to: **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

---

## Troubleshooting

### Issue: Git not found
**Solution:** Install Git from https://git-scm.com/downloads

### Issue: Authentication failed
**Solution:** Use GitHub Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo` (all)
4. Use token as password when pushing

### Issue: Remote already exists
**Solution:** Remove and re-add
```bash
git remote remove origin
git remote add origin https://github.com/Surbee001/OIAA_CourseMapping.git
git push -u origin main
```

### Issue: Vercel build fails
**Solution:** Check environment variables
- Ensure all 6 variables are added
- Check for typos in variable names
- Redeploy after fixing

### Issue: Emails not sending
**Solution:** Check Resend configuration
- Verify API key is correct
- Check Resend dashboard for errors
- Ensure `onboarding@resend.dev` is in your Resend account

---

## What's Included in This Deployment

✅ **Security Features:**
- XSS Protection with CSP headers
- Rate limiting on login and submissions
- Secure cookies (HTTPS only in production)
- Input validation and CGPA range checking

✅ **Functionality:**
- Student application wizard
- Admin dashboard
- Email notifications
- Draft save/restore
- Status tracking
- Course mapping evaluation

✅ **Documentation:**
- Security assessment
- Deployment guides
- Environment variable templates

---

## Files Reference

- **`VERCEL_ENV_READY.txt`** - Copy-paste ready environment variables
- **`DEPLOY_TO_GITHUB.bat`** - Automated Git deployment script
- **`VERCEL_DEPLOYMENT.md`** - Detailed deployment guide
- **`DEPLOYMENT_READY.md`** - Production readiness checklist
- **`SECURITY_NOTES.md`** - Security documentation

---

## Support

- **GitHub Issues**: https://github.com/Surbee001/OIAA_CourseMapping/issues
- **Vercel Documentation**: https://vercel.com/docs
- **Resend Documentation**: https://resend.com/docs

---

**Status**: ✅ Ready to Deploy  
**Last Updated**: October 2025

🚀 **Let's deploy!**

