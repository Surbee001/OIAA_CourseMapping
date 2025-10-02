# 🧪 Email Testing Guide

## ✅ Your Current Status

**Working:**
- ✅ Application submits successfully
- ✅ PDF generated correctly
- ✅ Email code is working
- ✅ Build error fixed

**Issue:**
- ⚠️ Resend won't send to unverified emails in test mode

---

## 🎯 Test with Your Email (Easiest)

### **Step 1: Update Form**
When filling the application form, use:
- **Student Email:** `h.mroue@ajman.ac.ae` (your verified email)
- Fill in all other fields normally

### **Step 2: Submit**
- Submit the application
- Wait ~5 seconds

### **Step 3: Check Inbox**
Check your inbox (`h.mroue@ajman.ac.ae`) for **TWO emails:**
1. **Student Confirmation** - "Exchange Application Received"
2. **Admin Notification** - "New Application: [Your Name]"

Both emails will arrive in the same inbox (perfect for testing!).

### **Step 4: Verify Design**
Open both emails and check:
- ✅ Colors match website (#111111, #f5f5f5, #dcdcdc)
- ✅ Logo displays
- ✅ PDF attachment is included
- ✅ Click "Reply" → Should open email to `h.mroue@ajman.ac.ae` ✅

---

## 🔓 Test with Other Emails (Optional)

### **Add Verified Emails in Resend**

If you want to test with your student email or international office email:

1. **Go to Resend Dashboard:**
   - Visit: https://resend.com/emails/verified-emails
   - Login with your account

2. **Add Email:**
   - Click **"Add Email"**
   - Enter: `202410899@ajmanuni.ac.ae`
   - Click **"Send Verification Email"**

3. **Verify:**
   - Check inbox of that email
   - Click verification link
   - Wait 30 seconds

4. **Repeat for Admin Email:**
   - Add: `international@ajman.ac.ae`
   - Verify it

5. **Update .env.local:**
   ```env
   ADMIN_EMAIL=international@ajman.ac.ae
   ```

6. **Restart Server:**
   ```bash
   npm run dev
   ```

7. **Test Again:**
   - Use any verified email as student email
   - Submit application
   - Check both inboxes

---

## 🏆 For Production (Remove Restrictions)

### **Verify a Custom Domain**

To send emails to **any** recipient without restrictions:

**Option A: Buy Domain ($12/year)**
1. Register domain: `oiaa-exchange.com` on Namecheap/GoDaddy
2. Add to Resend: https://resend.com/domains
3. Add DNS records (SPF, DKIM, DMARC)
4. Wait for verification (~30 mins)
5. Update code:
   ```typescript
   const FROM_EMAIL = "OIAA <noreply@oiaa-exchange.com>";
   ```

**Option B: Use Ajman Domain** (if IT allows)
1. Request from IT: `SMTP credentials for automated system`
2. Or ask to add DNS records for Resend
3. Verify `ajman.ac.ae` subdomain in Resend

---

## 📊 Current Limitations

### **Without Verified Domain:**
✅ Can send to: `h.mroue@ajman.ac.ae` (your account email)
✅ Can send to: Any email you manually verify in Resend dashboard
❌ Cannot send to: Random student emails

### **With Verified Domain:**
✅ Can send to: **Anyone, anywhere** 🌍
✅ Professional sender address
✅ Better deliverability
✅ No restrictions

---

## 🎯 Recommended Testing Flow

### **Phase 1: Test Core Functionality (Now)**
```bash
# Submit with your email as student
Student Email: h.mroue@ajman.ac.ae
Admin Email: h.mroue@ajman.ac.ae (in .env.local)

Result: Both emails arrive in same inbox ✅
```

### **Phase 2: Test with Student Email (Optional)**
```bash
# Verify your student email in Resend
202410899@ajmanuni.ac.ae → Verify in Resend

# Submit with student email
Student Email: 202410899@ajmanuni.ac.ae
Admin Email: h.mroue@ajman.ac.ae

Result: Student gets email, admin gets email ✅
```

### **Phase 3: Production (Before Selling)**
```bash
# Verify custom domain
oiaa-exchange.com → Add to Resend
FROM_EMAIL: "OIAA <noreply@oiaa-exchange.com>"

Result: Can email anyone, looks professional ✅
```

---

## 🔍 Troubleshooting

### **No emails arriving:**
1. Check terminal logs for error messages
2. Verify email in Resend dashboard
3. Check spam folder
4. Confirm API key is correct in `.env.local`

### **PDF not attached:**
- Check terminal logs for PDF generation errors
- Verify `jspdf` is installed: `npm list jspdf`

### **Wrong design:**
- Clear browser cache
- Check `emailTemplates.ts` was updated
- Restart dev server

### **403 Error:**
```
You can only send to your own email address
```
**Fix:** Use `h.mroue@ajman.ac.ae` as student email OR verify other emails in Resend

---

## 📧 What You Should See

### **Terminal Output (Success):**
```
✅ Student email sent successfully: re_abc123xyz
✅ Admin email sent successfully: re_def456uvw
[Course Mapping Application] Emails sent successfully
```

### **Terminal Output (Failed):**
```
❌ Student email failed: { statusCode: 403, message: '...' }
💡 Tip: Add this email to verified emails in Resend dashboard: student@ajman.ac.ae
```

---

## 💡 Pro Tips

1. **For Testing:** Use your personal email for everything
2. **For Demo:** Verify 2-3 test emails in Resend
3. **For Production:** Get a custom domain ($12/year)
4. **For Enterprise:** Request official Ajman SMTP from IT

---

## 🎯 Quick Test Right Now

1. Go to http://localhost:3002
2. Fill form with:
   - **Student Email:** `h.mroue@ajman.ac.ae`
   - All other fields: Your real data
3. Submit
4. Check your inbox (`h.mroue@ajman.ac.ae`)
5. You should see **2 emails** with beautiful design + PDF ✅

---

## ✅ Summary

**Current Setup:**
- ✅ Working perfectly
- ⚠️ Only sends to verified emails (security feature)
- 💡 Use your personal email for testing

**To Remove Restrictions:**
- 🔓 Verify individual emails in Resend (free)
- 🏆 Verify custom domain (best, $12/year)

**You're Ready to Test!** 🚀
