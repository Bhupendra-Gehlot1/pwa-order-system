# 🚀 Getting Started - Quick Guide

**Welcome to your PWA Order Management System!**

This is a 5-minute quick-start guide to get you up and running.

---

## ✅ What You Have

A complete, production-ready Progressive Web Application with:

- ✅ React frontend with form validation
- ✅ Serverless backend (Netlify Functions)
- ✅ PostgreSQL database (Supabase)
- ✅ PDF invoice generation
- ✅ Email service (Resend)
- ✅ PWA capabilities (offline, installable)
- ✅ Complete documentation
- ✅ Security best practices
- ✅ Deployment ready

---

## 🎯 Quick Start (Choose Your Path)

### Path 1: I Want to Deploy to Production NOW (30 minutes)

1. **Read the deployment guide**
   ```bash
   open DEPLOYMENT.md
   ```

2. **Follow it step-by-step**
   - Set up Supabase (5 min)
   - Set up Resend (5 min)
   - Deploy to Netlify (10 min)
   - Test in production (10 min)

### Path 2: I Want to Run Locally First (10 minutes)

1. **Run the setup script**
   ```bash
   ./setup.sh
   ```

2. **Edit the .env file**
   ```bash
   nano .env  # or use your preferred editor
   ```
   Add your API keys:
   - Get SUPABASE_URL and SUPABASE_SERVICE_KEY from [Supabase](https://supabase.com)
   - Get RESEND_API_KEY from [Resend](https://resend.com)

3. **Set up the database**
   - Go to Supabase SQL Editor
   - Run the contents of `database-schema.sql`

4. **Start the development server**
   ```bash
   npm run netlify
   ```

5. **Open your browser**
   ```
   http://localhost:8888
   ```

6. **Test the form**
   - Fill in your details
   - Add some items
   - Submit the order
   - Check your email for the invoice!

### Path 3: I Want to Understand the Code First

1. **Start with the documentation**
   ```bash
   open README.md           # Overview
   open ARCHITECTURE.md     # How it works
   open PROJECT_SUMMARY.md  # Quick reference
   ```

2. **Explore the code**
   - `src/components/OrderForm.jsx` - Main form
   - `netlify/functions/submit-order.js` - Backend logic
   - `netlify/functions/utils/` - Database, email, PDF

3. **Then run locally** (see Path 2 above)

---

## 📚 Documentation Map

**New to the project?**
1. This file (you're here!)
2. `README.md` - Full feature list and setup
3. `PROJECT_SUMMARY.md` - Quick overview
4. `FOLDER_STRUCTURE.md` - Navigate the codebase

**Ready to deploy?**
5. `DEPLOYMENT.md` - Step-by-step deployment

**Want to customize?**
6. `ARCHITECTURE.md` - Understand the design
7. `SECURITY.md` - Security best practices

**Future features?**
8. `WHATSAPP.md` - Add WhatsApp notifications

---

## 🛠️ Essential Commands

```bash
# Development
npm run netlify        # Start local dev server (frontend + functions)
npm run dev            # Start frontend only (no functions)

# Build
npm run build          # Build for production

# Preview production build
npm run preview        # Preview the built app

# Setup (one-time)
./setup.sh             # Automated setup
```

---

## 📋 Pre-Flight Checklist

Before running locally:

- [ ] Node.js 18+ installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] Supabase account created
- [ ] Supabase database schema applied
- [ ] Resend account created
- [ ] API keys obtained
- [ ] `.env` file created and filled
- [ ] Dependencies installed (`./setup.sh`)
- [ ] PWA icons created (optional, can use placeholders)

---

## 🎓 Learning Path

**If you're new to these technologies:**

1. **Progressive Web Apps (PWA)**
   - The app works offline
   - It can be installed on desktop/mobile
   - Service worker caches assets
   - See: `public/manifest.json`, `vite.config.js`

2. **Serverless Functions**
   - No backend server needed
   - Functions run on-demand
   - See: `netlify/functions/submit-order.js`

3. **React Hooks**
   - `useState` for form state
   - `useEffect` for side effects
   - See: `src/components/OrderForm.jsx`

4. **Supabase (PostgreSQL)**
   - Open-source Firebase alternative
   - SQL database with REST API
   - See: `netlify/functions/utils/supabase.js`

5. **PDF Generation**
   - Create PDFs programmatically
   - See: `netlify/functions/utils/pdf-generator.js`

---

## 💡 Common Use Cases

### Use Case 1: Simple Order Form (Current)
✅ **Ready to use!** Just deploy and go.

### Use Case 2: Add WhatsApp Notifications
📚 See `WHATSAPP.md` for integration guide

### Use Case 3: Add Payment Processing
📦 Integrate Stripe:
```javascript
// In submit-order.js, before creating order:
const payment = await stripe.charges.create({
  amount: totalAmount * 100,
  currency: 'usd',
  source: paymentToken
});
```

### Use Case 4: Add User Accounts
🔐 Use Supabase Auth:
```javascript
// In frontend:
const { user } = await supabase.auth.signUp({
  email: userEmail,
  password: userPassword
});
```

### Use Case 5: Multi-Language Support
🌍 Use react-i18next or similar

---

## 🆘 Help! Something's Not Working

### Problem: "Command not found: netlify"
**Solution:**
```bash
npm install -g netlify-cli
```

### Problem: "Supabase credentials not configured"
**Solution:** Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to `.env`

### Problem: "Failed to send email"
**Solution:**
- Check Resend API key is correct
- Verify FROM_EMAIL domain is verified in Resend
- Check you haven't exceeded free tier (100 emails/day)

### Problem: "Database error"
**Solution:**
- Run `database-schema.sql` in Supabase SQL Editor
- Check Supabase project isn't paused (visit dashboard)
- Verify service role key (not anon key)

### Problem: PWA not installing
**Solution:**
- Ensure running on HTTPS (automatic on Netlify)
- Check icons exist in `public/icons/`
- Clear browser cache and try again

### More Help
- Check `README.md` troubleshooting section
- Review `DEPLOYMENT.md` for deployment issues
- Check service status pages (Netlify, Supabase, Resend)

---

## 🎯 Success Metrics

**You'll know it's working when:**

1. ✅ Local dev server runs without errors
2. ✅ Form submits successfully
3. ✅ Email received with PDF attachment
4. ✅ Database records created in Supabase
5. ✅ PWA can be installed
6. ✅ App works offline (shows offline page)
7. ✅ Deployed site is live and accessible
8. ✅ All tests pass

---

## 🚀 Next Steps

**After getting it running:**

1. **Test thoroughly**
   - Submit multiple orders
   - Test on different devices
   - Check email delivery
   - Verify PDF contents

2. **Customize**
   - Change colors in `src/index.css`
   - Modify email template in `netlify/functions/utils/resend.js`
   - Customize PDF in `netlify/functions/utils/pdf-generator.js`
   - Add your logo to PWA icons

3. **Add features**
   - WhatsApp notifications (see `WHATSAPP.md`)
   - Payment processing (Stripe)
   - Admin dashboard
   - Analytics (Google Analytics)

4. **Monitor**
   - Check Netlify function logs
   - Monitor Supabase usage
   - Review Resend email delivery
   - Track costs (should be $0 for MVP!)

5. **Scale**
   - Upgrade services when needed
   - Add CDN for assets
   - Optimize database queries
   - Implement caching

---

## 📞 Need More Help?

**Documentation Files:**
- `README.md` - Comprehensive guide
- `DEPLOYMENT.md` - Deployment help
- `ARCHITECTURE.md` - Technical details
- `SECURITY.md` - Security guidance
- `PROJECT_SUMMARY.md` - Quick reference

**External Resources:**
- [React Docs](https://react.dev)
- [Netlify Docs](https://docs.netlify.com)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Vite Docs](https://vitejs.dev)

---

## 🎉 You're Ready!

Pick your path above and start building!

**Recommended for most users:**
1. Run `./setup.sh`
2. Follow `DEPLOYMENT.md`
3. Deploy to Netlify
4. Test with real orders
5. Customize as needed

**Questions?** Check the documentation files - everything is thoroughly documented!

---

**Last Updated:** February 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
