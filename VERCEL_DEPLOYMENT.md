# Vercel Deployment Guide

## Environment Variables for Vercel

When deploying to Vercel, you need to set the following environment variables in your project settings.

### Required Environment Variables

Navigate to your Vercel project → **Settings** → **Environment Variables** and add:

#### 1. Admin Credentials

**Variable Name:** `ADMIN_EMAIL`  
**Value:** `international@ajman.ac.ae` _(or your preferred admin email)_  
**Apply to:** Production, Preview, Development

**Variable Name:** `ADMIN_PASSWORD`  
**Value:** `your_secure_password_here` _(⚠️ Use a strong, unique password)_  
**Apply to:** Production, Preview, Development

#### 2. Email Service (Resend)

**Variable Name:** `RESEND_API_KEY`  
**Value:** `re_your_resend_api_key_here`  
**Apply to:** Production, Preview

> Get your Resend API key from [resend.com/api-keys](https://resend.com/api-keys)

**Variable Name:** `RESEND_FROM_EMAIL`  
**Value:** `no-reply@yourdomain.com`  
**Apply to:** Production, Preview

**Variable Name:** `ADMIN_EMAIL_RECIPIENT`  
**Value:** `international@ajman.ac.ae` _(admin email to receive notifications)_  
**Apply to:** Production, Preview

#### 3. Node Environment

**Variable Name:** `NODE_ENV`  
**Value:** `production`  
**Apply to:** Production only

> This enables secure cookies and other production optimizations

---

## Quick Copy-Paste Format for Vercel

You can paste these directly into Vercel's environment variables section:

```
ADMIN_EMAIL=international@ajman.ac.ae
ADMIN_PASSWORD=YourSecurePassword123!
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=no-reply@yourdomain.com
ADMIN_EMAIL_RECIPIENT=international@ajman.ac.ae
NODE_ENV=production
```

---

## Security Recommendations

### ⚠️ Before Deploying:

1. **Change the Admin Password**
   - Use a strong password with at least 12 characters
   - Include uppercase, lowercase, numbers, and special characters
   - Example: `Aj!mAn2025$SecurePass`

2. **Verify Domain for Email**
   - Set up your domain in Resend
   - Verify DNS records
   - Use a proper domain email instead of personal email

3. **Enable Vercel Access Control** (Optional)
   - Consider enabling Vercel's password protection for preview deployments
   - Available in Project Settings → Deployment Protection

---

## Deployment Steps

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Production-ready deployment with security improvements"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository: `OIAA_CourseMapping`

3. **Configure Environment Variables**
   - Before deploying, click "Environment Variables"
   - Add all variables listed above
   - Ensure they're applied to the correct environments

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your site will be live at `https://your-project.vercel.app`

5. **Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

---

## Post-Deployment Checklist

- [ ] Verify admin login works with new credentials
- [ ] Test student application submission
- [ ] Verify email notifications are sent
- [ ] Check that status page works correctly
- [ ] Test draft save/restore functionality
- [ ] Confirm rate limiting is working (try 6 login attempts)
- [ ] Verify secure cookies are enabled (check in browser DevTools)
- [ ] Test on mobile devices
- [ ] Review error logs in Vercel dashboard

---

## Monitoring & Maintenance

### Vercel Dashboard
- **Analytics**: Monitor visitor traffic and performance
- **Logs**: Check runtime logs for errors
- **Deployments**: View deployment history and rollback if needed

### Email Monitoring
- Check Resend dashboard for email delivery status
- Monitor bounce rates and delivery issues

### Security Monitoring
- Review login attempts in application logs
- Monitor rate limit hits
- Check for unusual activity patterns

---

## Troubleshooting

### Issue: Admin Login Fails
**Solution:** 
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` are correctly set
- Check they're applied to the right environment
- Redeploy after changing environment variables

### Issue: Emails Not Sending
**Solution:**
- Verify `RESEND_API_KEY` is correct
- Check domain is verified in Resend
- Review Resend dashboard for errors
- Ensure `RESEND_FROM_EMAIL` uses verified domain

### Issue: Cookies Not Working
**Solution:**
- Verify `NODE_ENV=production` is set
- Check that your domain uses HTTPS (required for secure cookies)
- Clear browser cache and cookies

### Issue: Rate Limiting Too Aggressive
**Solution:**
- Adjust rate limits in `src/middleware.ts`
- Modify `RATE_LIMITS` configuration
- Redeploy application

---

## Database Migration (Future Enhancement)

For production scale, consider migrating from file-based storage to a database:

**Recommended Options:**
- **Vercel Postgres** - Native integration
- **MongoDB Atlas** - Free tier available
- **Supabase** - Open-source alternative with generous free tier

**Environment Variables Needed:**
```
DATABASE_URL=postgresql://username:password@host:port/database
```

---

## Support & Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Last Updated:** October 2025  
**Deployment Status:** Production Ready ✅

