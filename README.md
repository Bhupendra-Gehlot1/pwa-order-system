# 📦 PWA Order Management System

A modern Progressive Web Application (PWA) built with React that allows users to create orders and receive instant email invoices with PDF attachments. Built entirely on serverless architecture with no traditional backend.

## 🚀 Features

- ✅ **Progressive Web App** - Installable on desktop and mobile devices
- ✅ **Offline Support** - Service worker with offline fallback
- ✅ **Real-time Form Validation** - Client-side validation for better UX
- ✅ **Serverless Architecture** - No backend server required (Netlify Functions)
- ✅ **PDF Invoice Generation** - Automatic PDF creation for each order
- ✅ **Email Notifications** - Sends email with PDF attachment via Resend API
- ✅ **PostgreSQL Database** - Powered by Supabase (open-source Firebase alternative)
- ✅ **Responsive Design** - Works seamlessly on all devices
- ✅ **Production Ready** - Security best practices, input sanitization, error handling

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **PWA Plugin** - Service worker and manifest generation
- **CSS3** - Custom styling with CSS variables

### Backend (Serverless)
- **Netlify Functions** - Serverless functions (AWS Lambda)
- **Node.js 18+** - Runtime environment

### Services
- **Supabase** - PostgreSQL database with REST API
- **Resend** - Transactional email API
- **pdf-lib** - PDF generation library

## 📁 Project Structure

```
pwa-order-system/
├── public/
│   ├── icons/                    # PWA icons (192x192, 512x512)
│   ├── manifest.json             # PWA manifest
│   └── offline.html              # Offline fallback page
├── src/
│   ├── components/
│   │   ├── OrderForm.jsx         # Main order form component
│   │   └── OrderForm.css         # Form styles
│   ├── services/
│   │   └── api.js                # API client for backend calls
│   ├── utils/
│   │   └── validation.js         # Form validation utilities
│   ├── App.jsx                   # Root component
│   ├── App.css                   # App styles
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── netlify/
│   └── functions/
│       ├── submit-order.js       # Main serverless function
│       ├── utils/
│       │   ├── supabase.js       # Database operations
│       │   ├── resend.js         # Email service
│       │   └── pdf-generator.js  # PDF generation
│       └── package.json          # Functions dependencies
├── database-schema.sql           # Supabase database schema
├── netlify.toml                  # Netlify configuration
├── vite.config.js                # Vite configuration
├── package.json                  # Frontend dependencies
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Git
- A Netlify account (free tier)
- A Supabase account (free tier)
- A Resend account (free tier - 100 emails/day)

### 2. Clone the Repository

```bash
git clone <your-repo-url>
cd pwa-order-system
```

### 3. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Netlify Functions dependencies
cd netlify/functions
npm install
cd ../..
```

### 4. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to **SQL Editor** and run the `database-schema.sql` file
4. Go to **Settings → API** and copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Service Role Key (secret key, never commit this!)

### 5. Set Up Resend

1. Go to [Resend](https://resend.com) and create an account
2. Add and verify your domain (or use their testing domain)
3. Go to **API Keys** and create a new API key
4. Copy the API key (starts with `re_`)

### 6. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=orders@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com
```

### 7. Create PWA Icons

Generate icons or use placeholders:

```bash
# Using ImageMagick (install first: brew install imagemagick)
cd public/icons

# Create simple placeholder icons
convert -size 192x192 xc:#4F46E5 -pointsize 72 -fill white -gravity center -annotate +0+0 "OA" icon-192x192.png
convert -size 512x512 xc:#4F46E5 -pointsize 192 -fill white -gravity center -annotate +0+0 "OA" icon-512x512.png

cd ../..
```

Or use an online tool: https://realfavicongenerator.net/

### 8. Run Locally

```bash
# Start Netlify Dev (runs both frontend and functions)
npm run netlify

# Or run separately:
# Terminal 1: Frontend
npm run dev

# Terminal 2: Functions (in netlify/functions/)
netlify functions:serve
```

Visit `http://localhost:8888`

### 9. Test the Application

1. Fill out the order form with test data
2. Add some items
3. Submit the order
4. Check:
   - Console for logs
   - Supabase dashboard for new records
   - Email inbox for the invoice

## 🚀 Deployment to Netlify

### Option 1: GitHub Integration (Recommended)

1. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [Netlify](https://netlify.com)
3. Click **Add new site → Import an existing project**
4. Select GitHub and authorize
5. Select your repository
6. Netlify will auto-detect the settings from `netlify.toml`
7. Click **Deploy site**

### Option 2: Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize the site
netlify init

# Deploy
netlify deploy --prod
```

### Set Environment Variables in Netlify

1. Go to **Site settings → Environment variables**
2. Add all variables from your `.env` file:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `REPLY_TO_EMAIL`
3. Redeploy the site

## 📊 Database Schema

### Tables

**users**
- `id` (UUID, primary key)
- `name` (text)
- `email` (text, unique)
- `mobile` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**orders**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users)
- `total_amount` (decimal)
- `status` (text: pending, completed, failed, cancelled)
- `order_date` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**order_items**
- `id` (UUID, primary key)
- `order_id` (UUID, foreign key → orders)
- `item_name` (text)
- `price` (decimal)
- `quantity` (integer)
- `subtotal` (decimal)
- `created_at` (timestamp)

## 🔒 Security Considerations

### Implemented Security Measures

- ✅ **Environment Variables** - Sensitive data never exposed to frontend
- ✅ **Input Sanitization** - All user inputs sanitized on backend
- ✅ **SQL Injection Prevention** - Using Supabase client (parameterized queries)
- ✅ **XSS Prevention** - HTML/script tags stripped from inputs
- ✅ **HTTPS Only** - Automatic on Netlify
- ✅ **CORS Configuration** - Controlled access to API endpoints
- ✅ **Rate Limiting** - Built into Netlify Functions (125K/month free tier)
- ✅ **Validation** - Both frontend and backend validation
- ✅ **Error Handling** - Graceful error messages (no stack traces in production)

### Additional Security Recommendations

- [ ] Set specific CORS origin (not `*`) in production
- [ ] Enable Supabase Row Level Security (RLS) policies
- [ ] Add rate limiting per IP address (use Netlify Edge Functions)
- [ ] Implement CAPTCHA for form submission
- [ ] Add request signing/authentication for API calls
- [ ] Monitor logs for suspicious activity

## 📱 PWA Features

### Installation

The app can be installed on:
- **Desktop**: Chrome, Edge, Safari (macOS 14+)
- **Mobile**: Android Chrome, iOS Safari (iOS 16.4+)

Users will see an install prompt when visiting the site.

### Offline Support

- Service worker caches app shell
- Offline fallback page shown when network is unavailable
- API calls fail gracefully with user-friendly messages

### Manifest

- App name, icons, theme color configured
- Standalone display mode (looks like a native app)
- Custom splash screen on mobile

## 🧪 Testing

### Manual Testing Checklist

- [ ] Form validation works (empty fields, invalid email, invalid phone)
- [ ] Items can be added and removed
- [ ] Total calculation is correct
- [ ] Order submission creates database records
- [ ] PDF is generated correctly
- [ ] Email is sent and received
- [ ] Email contains correct order details
- [ ] PDF attachment is valid
- [ ] PWA can be installed
- [ ] Offline page appears when offline
- [ ] Responsive design works on mobile

### Testing Email Flow

For testing, you can:
1. Use your own email
2. Use a test email service like [Mailinator](https://www.mailinator.com/)
3. Check Resend dashboard for email logs

### Testing Database

Check Supabase dashboard:
1. Go to **Table Editor**
2. View `users`, `orders`, and `order_items` tables
3. Verify data is correct

## 📈 Monitoring & Analytics

### Netlify Analytics (Optional - Paid)

Enable in Netlify dashboard for:
- Page views
- Unique visitors
- Bandwidth usage
- Function invocations

### Supabase Logs

View database queries and performance:
1. Go to Supabase dashboard
2. Click **Database → Logs**

### Resend Logs

View email delivery status:
1. Go to Resend dashboard
2. Click **Emails**
3. View sent emails and delivery status

## 🔮 Future Enhancements

### WhatsApp Integration

See `ARCHITECTURE.md` for implementation details.

**Option 1: Twilio (Easiest)**
```javascript
// Add to netlify/functions/submit-order.js
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

await client.messages.create({
  from: 'whatsapp:+14155238886',
  to: `whatsapp:${userMobile}`,
  body: `Order confirmed! ID: ${orderId}. Total: $${totalAmount}`
});
```

**Option 2: WhatsApp Business API** (More features, requires verification)

### Other Potential Features

- [ ] Order status tracking page
- [ ] Admin dashboard for viewing all orders
- [ ] Export orders to CSV/Excel
- [ ] Multiple payment methods integration
- [ ] SMS notifications (Twilio)
- [ ] Push notifications (Web Push API)
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Order history for returning customers
- [ ] Discount codes/promo codes
- [ ] Inventory management
- [ ] Analytics dashboard

## 🐛 Troubleshooting

### "Supabase credentials not configured"
- Check that environment variables are set in Netlify
- Redeploy after adding environment variables

### "Failed to send email"
- Verify Resend API key is correct
- Check that FROM_EMAIL is a verified domain
- Check Resend dashboard for error logs
- Verify you haven't exceeded free tier limit (100 emails/day)

### "Database error"
- Check Supabase is not paused (free tier pauses after 1 week of inactivity)
- Verify database schema is created
- Check Supabase logs for specific error

### PWA not installing
- Ensure site is served over HTTPS (automatic on Netlify)
- Check manifest.json is accessible
- Verify icons exist and are correct size
- Check browser console for errors

### Functions not working locally
- Install dependencies in `netlify/functions/`: `cd netlify/functions && npm install`
- Use `netlify dev` instead of `npm run dev`
- Check `.env` file exists and has correct values

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## 🙋 Support

For issues or questions:
- Check this README first
- Review `ARCHITECTURE.md` for technical details
- Check Netlify Functions logs
- Check Supabase logs
- Check Resend logs

## 🎯 MVP Goal

This project is designed as an MVP for ~100 users/month, staying within free tiers:

- **Netlify**: 125,000 function invocations/month (free)
- **Supabase**: 500MB database, 2GB bandwidth (free)
- **Resend**: 3,000 emails/month (free)

**Estimated costs for 100 orders/month: $0**

---

Built with ❤️ using React, Netlify, Supabase, and Resend.
