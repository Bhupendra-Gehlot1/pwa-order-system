# 🚀 Deployment Guide

Complete step-by-step guide to deploy the PWA Order Management System to production.

## Prerequisites Checklist

Before deploying, make sure you have:

- [ ] GitHub account
- [ ] Netlify account (free tier)
- [ ] Supabase account (free tier)
- [ ] Resend account (free tier)
- [ ] Domain name (optional, or use Netlify subdomain)
- [ ] Node.js 18+ installed locally
- [ ] Git installed locally

## Part 1: Set Up Supabase (Database)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click **Sign In** or **Start your project**
3. Sign in with GitHub
4. Click **New Project**
5. Fill in:
   - **Name**: `order-management-pwa`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free
6. Click **Create new project**
7. Wait 2-3 minutes for provisioning

### Step 2: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the `database-schema.sql` file from the project
4. Copy the entire contents
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Wait for "Success. No rows returned"

### Step 3: Get API Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy and save:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **Service Role Key** (the `secret` key, not the `anon` key!)
3. Keep these safe - you'll need them later

### Step 4: Verify Tables Created

1. Go to **Table Editor** (left sidebar)
2. You should see three tables:
   - `users`
   - `orders`
   - `order_items`
3. Click on each to verify the schema is correct

---

## Part 2: Set Up Resend (Email Service)

### Step 1: Create Resend Account

1. Go to https://resend.com
2. Click **Sign Up**
3. Sign up with your email
4. Verify your email address

### Step 2: Add Domain (or use test domain)

**Option A: Use Test Domain (Quick Start)**
1. Resend provides a test domain: `onboarding@resend.dev`
2. You can send emails from this domain for testing
3. Skip to Step 3

**Option B: Add Your Own Domain (Recommended for Production)**
1. In Resend dashboard, click **Domains**
2. Click **Add Domain**
3. Enter your domain name (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides to your domain registrar:
   - DKIM record (TXT)
   - SPF record (TXT)
   - DMARC record (TXT)
5. Wait for DNS propagation (can take up to 24 hours)
6. Click **Verify** in Resend dashboard

### Step 3: Create API Key

1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Fill in:
   - **Name**: `Production API Key`
   - **Permission**: Full Access
   - **Domain**: Select your domain or test domain
4. Click **Create**
5. Copy the API key (starts with `re_`)
6. **IMPORTANT**: Save it immediately - you won't see it again!

### Step 4: Test Email Sending (Optional)

1. Go to **Emails** → **Send Test Email**
2. Send a test email to yourself
3. Verify you receive it

---

## Part 3: Prepare the Code

### Step 1: Clone/Download the Project

```bash
# If you haven't already:
cd ~/Documents/github
ls pwa-order-system  # Verify it exists
```

### Step 2: Install Dependencies

```bash
cd pwa-order-system

# Install frontend dependencies
npm install

# Install function dependencies
cd netlify/functions
npm install
cd ../..
```

### Step 3: Create Icons

```bash
cd public/icons

# Option 1: Using ImageMagick (if installed)
convert -size 192x192 xc:#4F46E5 -pointsize 72 -fill white -gravity center -annotate +0+0 "OA" icon-192x192.png
convert -size 512x512 xc:#4F46E5 -pointsize 192 -fill white -gravity center -annotate +0+0 "OA" icon-512x512.png

# Option 2: Use an online tool
# Go to https://realfavicongenerator.net/ and upload your logo

cd ../..
```

### Step 4: Test Locally (Optional but Recommended)

```bash
# Create .env file
cp .env.example .env

# Edit .env with your credentials (use nano, vim, or any editor)
nano .env
```

Add your credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=orders@yourdomain.com  # Or onboarding@resend.dev for testing
REPLY_TO_EMAIL=support@yourdomain.com
```

Run locally:
```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Run locally
netlify dev
```

Visit `http://localhost:8888` and test the form.

---

## Part 4: Deploy to Netlify

### Step 1: Push to GitHub

```bash
# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - PWA Order Management System"

# Create a new repository on GitHub (go to github.com)
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/pwa-order-system.git

# Push
git branch -M main
git push -u origin main
```

### Step 2: Import to Netlify

1. Go to https://netlify.com
2. Sign up or log in (use GitHub for easier integration)
3. Click **Add new site** → **Import an existing project**
4. Click **Deploy with GitHub**
5. Authorize Netlify to access your GitHub (if first time)
6. Select your repository: `pwa-order-system`
7. Netlify will auto-detect settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
8. Don't click Deploy yet! First, add environment variables...

### Step 3: Configure Environment Variables

1. Before deploying, click **Show advanced**
2. Click **New variable** and add all environment variables:

| Variable Name | Value |
|--------------|-------|
| `SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Your service role key from Supabase |
| `RESEND_API_KEY` | Your API key from Resend (`re_...`) |
| `FROM_EMAIL` | `orders@yourdomain.com` or test domain |
| `REPLY_TO_EMAIL` | `support@yourdomain.com` |
| `NODE_VERSION` | `18` |

3. Click **Deploy [your-site-name]**

### Step 4: Wait for Deployment

1. Netlify will:
   - Install dependencies
   - Build the React app
   - Build the functions
   - Deploy everything
2. This takes ~2-5 minutes
3. Watch the deploy logs for any errors

### Step 5: Verify Deployment

1. Once deployed, click **Open production deploy**
2. Your site will be at: `https://[random-name].netlify.app`
3. Test the form:
   - Fill in your details
   - Add some items
   - Submit the order
4. Check:
   - Email inbox (should receive invoice)
   - Supabase dashboard (should see new records)
   - Netlify function logs (click **Functions** tab)

---

## Part 5: Custom Domain (Optional)

### Step 1: Add Custom Domain in Netlify

1. In Netlify, go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `orders.yourdomain.com`)
4. Click **Verify**
5. Netlify will provide DNS instructions

### Step 2: Update DNS Records

In your domain registrar (GoDaddy, Namecheap, etc.):

1. Add a CNAME record:
   - **Name**: `orders` (or `@` for root domain)
   - **Value**: `[your-site].netlify.app`
   - **TTL**: 3600
2. Wait for DNS propagation (5 minutes to 24 hours)

### Step 3: Enable HTTPS

1. Netlify automatically provisions SSL certificate (Let's Encrypt)
2. Wait ~5 minutes for HTTPS to be enabled
3. In Netlify, go to **Domain settings**
4. Enable **Force HTTPS**

### Step 4: Update Resend FROM_EMAIL

1. If using a custom domain, update your Resend `FROM_EMAIL`:
   - Go to Netlify **Site settings** → **Environment variables**
   - Edit `FROM_EMAIL` to match your domain
   - Example: `orders@yourdomain.com`
2. Redeploy: **Deploys** → **Trigger deploy** → **Deploy site**

---

## Part 6: Post-Deployment Configuration

### Update CORS (Security)

1. Edit `netlify/functions/submit-order.js`
2. Change line 37:
   ```javascript
   'Access-Control-Allow-Origin': '*'
   ```
   To:
   ```javascript
   'Access-Control-Allow-Origin': 'https://your-custom-domain.com'
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update CORS for production"
   git push
   ```
4. Netlify will auto-deploy

### Enable Netlify Analytics (Optional - $9/month)

1. Go to **Site settings** → **Analytics**
2. Enable Netlify Analytics
3. View traffic, page views, function invocations

### Set Up Monitoring

**Netlify:**
1. Go to **Functions** tab
2. Monitor invocations and errors
3. Check logs for any issues

**Supabase:**
1. Go to **Database** → **Logs**
2. Monitor queries and performance
3. Set up alerts for errors

**Resend:**
1. Go to **Emails** tab
2. Monitor sent emails
3. Check delivery status and bounces

---

## Part 7: Testing in Production

### Checklist

- [ ] Visit the deployed URL
- [ ] Verify PWA install prompt appears
- [ ] Install the PWA on desktop
- [ ] Install the PWA on mobile
- [ ] Test offline mode (turn off wifi, reload)
- [ ] Fill out and submit an order
- [ ] Verify email received with PDF attachment
- [ ] Open PDF and verify it's correct
- [ ] Check Supabase for new records
- [ ] Check Netlify function logs
- [ ] Test on multiple devices (desktop, mobile, tablet)
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)

---

## Part 8: Maintenance

### Monitor Usage (Stay Within Free Tier)

**Netlify (Free Tier Limits):**
- 100GB bandwidth/month
- 125,000 function invocations/month
- 300 build minutes/month

**Supabase (Free Tier Limits):**
- 500MB database storage
- 2GB bandwidth/month
- Pauses after 1 week of inactivity (send a request to wake up)

**Resend (Free Tier Limits):**
- 100 emails/day
- 3,000 emails/month

### Regular Checks

- [ ] Check Netlify usage dashboard weekly
- [ ] Check Supabase usage weekly
- [ ] Check Resend usage weekly
- [ ] Wake up Supabase if it's paused (visit the site to trigger a function)
- [ ] Review error logs monthly
- [ ] Clean up old test data in database

### Backup Database

```sql
-- Run in Supabase SQL Editor to export data
COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM orders) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM order_items) TO STDOUT WITH CSV HEADER;
```

Or use Supabase backup feature:
1. Go to **Database** → **Backups**
2. Enable daily backups (free tier: 7 days retention)

---

## Troubleshooting

### Deployment Fails

**Check build logs:**
1. Go to Netlify **Deploys** tab
2. Click on the failed deploy
3. Read the logs for errors

**Common issues:**
- Missing environment variables → Add in Netlify settings
- Node version mismatch → Set `NODE_VERSION=18` in env vars
- Build timeout → Contact Netlify support or optimize build

### Functions Not Working

**Check function logs:**
1. Go to Netlify **Functions** tab
2. Click on the function
3. View logs

**Common issues:**
- Environment variables not set
- Incorrect Supabase/Resend credentials
- Missing npm packages in `netlify/functions/package.json`

### Email Not Sending

**Check Resend logs:**
1. Go to Resend dashboard
2. Click **Emails**
3. Look for failed sends

**Common issues:**
- FROM_EMAIL domain not verified
- API key invalid or expired
- Rate limit exceeded (100/day on free tier)
- Email marked as spam (check spam folder)

### Database Errors

**Check Supabase logs:**
1. Go to Supabase dashboard
2. Click **Database** → **Logs**

**Common issues:**
- Project paused (inactive for 1 week) → Visit site to wake up
- Service role key incorrect
- Tables not created → Re-run `database-schema.sql`

---

## Next Steps

Once deployed and tested:

1. **Add custom domain** for professional appearance
2. **Set up monitoring** to track usage and errors
3. **Add Google Analytics** for visitor tracking (optional)
4. **Implement WhatsApp notifications** (see ARCHITECTURE.md)
5. **Build admin dashboard** to view all orders
6. **Add payment integration** (Stripe, PayPal)
7. **Scale up** if you exceed free tier limits

---

## Support

If you encounter issues:

1. Check this guide first
2. Review `README.md` for troubleshooting
3. Check service status pages:
   - Netlify: https://www.netlifystatus.com/
   - Supabase: https://status.supabase.com/
   - Resend: https://resend.com/status
4. Review logs in each service
5. Search for similar issues on Stack Overflow

---

**Congratulations! Your PWA is now live! 🎉**
