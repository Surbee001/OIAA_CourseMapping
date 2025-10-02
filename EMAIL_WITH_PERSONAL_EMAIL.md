# ✉️ Email Setup with Your Personal Email

## 🎯 Problem & Solution

### The Problem:
You **cannot** send emails "from" `h.mroue@ajman.ac.ae` using Resend (or any third-party email service) because:
- Ajman University owns the `@ajman.ac.ae` domain
- Email authentication protocols (SPF, DKIM, DMARC) prevent spoofing
- Only Ajman's email servers can send from `@ajman.ac.ae` addresses

### The Solution:
Use **Reply-To** header! Emails are sent "from" Resend's domain, but when recipients click "Reply," it goes to **your personal email**.

---

## 📧 How It Works

### **Current Setup:**

#### **Student Emails:**
```
From: OIAA Course Mapping <onboarding@resend.dev>
Reply-To: h.mroue@ajman.ac.ae
To: student@ajman.ac.ae
```

**What students see:**
- Email appears from "OIAA Course Mapping"
- When they click "Reply," it opens a new email to **h.mroue@ajman.ac.ae**
- They never see `onboarding@resend.dev` in the reply field

#### **Admin Emails:**
```
From: OIAA Course Mapping <onboarding@resend.dev>
Reply-To: student@ajman.ac.ae (the student who submitted)
To: international@ajman.ac.ae
```

**What admins see:**
- Email appears from "OIAA Course Mapping"
- When they click "Reply," it goes directly to the **student's email**
- Makes responding to applications super easy

---

## 🎨 Design Updates

Your emails now match the website aesthetic:

### **Colors:**
- Background: `#f5f5f5` (surface-subtle)
- Cards: `#ffffff` (surface)
- Text: `#111111` (ink)
- Muted text: `#666666` (muted)
- Borders: `#dcdcdc` (border)

### **Typography:**
- Clean, minimal font stack
- Font weight: 500 (medium) for headings
- Letter spacing: `-0.02em` for titles
- Uppercase labels with `0.08em` spacing

### **Design Elements:**
- Subtle borders instead of shadows
- 8px border radius (matching website)
- Info boxes with light gray background
- Clean table layouts
- Minimalist icon style

---

## 🚀 Alternative Solutions

If you need more control, here are other options:

### **Option 1: Current Setup (Recommended)**
✅ **Pros:**
- Works immediately
- No domain setup needed
- Students can reply to your personal email
- Free (3k emails/month)

⚠️ **Cons:**
- "From" shows `onboarding@resend.dev` (but hidden in most email clients)
- Not branded with Ajman domain

---

### **Option 2: Use Your Personal Gmail/Outlook**
Set up SMTP with your personal email:

```typescript
// Using nodemailer with Gmail
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your.personal@gmail.com',
    pass: 'app-specific-password' // Not your regular password!
  }
});
```

✅ **Pros:**
- Emails truly come from your email
- No Resend needed

⚠️ **Cons:**
- Gmail daily limit: 500 emails/day
- Need to enable "Less secure app access" or app-specific password
- Slower sending
- No delivery tracking

---

### **Option 3: Custom Subdomain (Best for Production)**
Register a subdomain like `exchange.oiaa-system.com`:

1. **Register domain:** Namecheap, GoDaddy (~$12/year)
2. **Verify in Resend:** Add DNS records
3. **Update code:**
   ```typescript
   const FROM_EMAIL = "OIAA <noreply@exchange.oiaa-system.com>";
   ```

✅ **Pros:**
- Professional branded emails
- Full control
- Better deliverability
- Looks official

⚠️ **Cons:**
- Costs $12-15/year
- Takes 1-2 days to set up
- Need DNS access

**Example domains:**
- `exchange-oiaa.com`
- `oiaa-portal.com`
- `ajman-exchange.com`

---

### **Option 4: Ask Ajman IT for SMTP Credentials**
Request official SMTP access from Ajman IT:

```
To: IT Support
Subject: SMTP Access for Exchange Application System

I'm building an automated system for the International Office 
to manage exchange applications. Can I get SMTP credentials 
for sending automated emails from international@ajman.ac.ae?
```

✅ **Pros:**
- Official Ajman email address
- Fully branded
- Most professional

⚠️ **Cons:**
- Requires IT approval (slow process)
- May not be allowed for automated systems
- Complicated setup

---

## 📊 Comparison Table

| Solution | Cost | Setup Time | Professional Look | Reliability | Recommendation |
|----------|------|------------|-------------------|-------------|----------------|
| **Resend + Reply-To** | Free | ✅ Done | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Use Now** |
| Personal Gmail | Free | 1 hour | ⭐⭐ | ⭐⭐⭐ | Testing only |
| Custom Domain | $12/year | 1-2 days | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Production** |
| Ajman SMTP | Free | 1-2 weeks | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | If approved |

---

## 🎯 Recommended Path

### **Phase 1: Now (Current Setup)**
Use Resend with Reply-To:
- ✅ Already configured
- ✅ Students reply to your email
- ✅ Free and reliable
- ⚠️ "From" shows Resend domain (minor issue)

### **Phase 2: Before Selling/Production**
Get a custom domain:
1. Register `oiaa-exchange.com` ($12/year)
2. Verify in Resend (30 mins)
3. Update `FROM_EMAIL` in code
4. Now emails look fully professional

### **Phase 3: After University Adoption** (Optional)
Request official Ajman SMTP:
- Fully branded with `@ajman.ac.ae`
- Most professional option
- Only if IT allows automated systems

---

## 🔧 How to Change Email in Code

Your personal email is in one place:

**File:** `src/lib/resendClient.ts`

```typescript
const REPLY_TO_EMAIL = "h.mroue@ajman.ac.ae"; // Change this
```

**To update:**
1. Edit this line
2. Restart dev server
3. All emails will reply to new address

---

## 🧪 Testing Reply-To

1. **Submit a test application**
2. **Check your inbox** (student email)
3. **Click "Reply"** in the email
4. **Verify:** Reply goes to `h.mroue@ajman.ac.ae` ✅

**Most email clients** (Gmail, Outlook, Apple Mail) respect Reply-To headers perfectly.

---

## 💡 Pro Tip: Improve Deliverability

Even with Resend's test domain, you can improve how emails look:

### **In Gmail/Outlook:**
Students will see:
```
OIAA Course Mapping
via onboarding@resend.dev
```

The "via" is small and gray - most users won't notice it.

### **To Remove "via":**
You need your own verified domain (Option 3 above).

---

## 📱 What Recipients See

### **Desktop Email Client:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From: OIAA Course Mapping
To: Me
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Email content]

[Reply] [Forward]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

When they click **[Reply]**, it opens:
```
To: h.mroue@ajman.ac.ae
Subject: Re: Exchange Application Received
```

✅ **Perfect!** They never see `onboarding@resend.dev` in the reply.

---

## 🚨 Common Questions

### **Q: Can students see my personal email?**
A: Only if they click "Reply" or view email headers (rare).

### **Q: Will emails go to spam?**
A: Resend has excellent deliverability. Test by sending to Gmail/Outlook.

### **Q: Can I change the sender name?**
A: Yes! Edit `FROM_EMAIL`:
```typescript
const FROM_EMAIL = "Your Name <onboarding@resend.dev>";
```

### **Q: What if I want to use a different reply-to email?**
A: Just change `REPLY_TO_EMAIL` in `resendClient.ts`.

### **Q: Can I reply from my personal email to students?**
A: Yes! Admin notification emails set reply-to as the student's email. Click reply and it goes to them.

---

## 📝 Summary

### ✅ **What's Working:**
- Emails send from Resend
- Students reply to **h.mroue@ajman.ac.ae**
- Admins reply directly to students
- Professional HTML design matching website
- PDF attachments included
- Free tier (3k emails/month)

### 🎨 **Design Updates:**
- Colors match website (#111111, #666666, #f5f5f5, #dcdcdc)
- Clean minimal borders
- Professional typography
- Subtle info boxes

### 🚀 **Ready to Use:**
- Just submit an application to test
- Reply-to is already configured
- Production-ready for internal use

### 💰 **For Selling to Universities:**
- Invest $12/year in custom domain
- Makes emails look 100% professional
- Worth it for credibility

---

**Bottom line:** Your current setup is perfect for testing and internal use. When you're ready to sell this to universities, spend $12 on a custom domain to make it fully professional. 🎯
