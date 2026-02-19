# PWA Order System - Architecture Documentation

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                     (React PWA Frontend)                     │
│  - Order Form Component                                      │
│  - Input Validation                                          │
│  - Offline Support                                           │
│  - Installable (manifest.json + service worker)             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTPS POST /api/submit-order
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   NETLIFY FUNCTIONS                          │
│                  (Serverless Backend)                        │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  submit-order.js (Main Handler)               │          │
│  │  1. Validates request                         │          │
│  │  2. Saves to Supabase                         │          │
│  │  3. Generates PDF                             │          │
│  │  4. Sends email via Resend                    │          │
│  └──────────────────────────────────────────────┘          │
└───────────────────────────┬─────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────┐   ┌──────────────┐   ┌────────────────┐
│  SUPABASE   │   │  PDF LIBRARY │   │  RESEND API    │
│ (PostgreSQL)│   │  (pdf-lib)   │   │ (Email Service)│
│             │   │              │   │                │
│ - users     │   │ - Generate   │   │ - Send email   │
│ - orders    │   │   invoice    │   │ - Attach PDF   │
│ - items     │   │ - Format data│   │                │
└─────────────┘   └──────────────┘   └────────────────┘
```

## Technology Stack

### Frontend
- **React 18** with Vite for fast builds
- **PWA Features**: Service Worker, Manifest, Offline support
- **Form Handling**: Controlled components with validation
- **State Management**: React hooks (useState, useEffect)

### Backend (Serverless)
- **Netlify Functions**: Serverless runtime (AWS Lambda under the hood)
- **Node.js 18+**: Runtime environment

### Database
- **Supabase**: Open-source PostgreSQL with REST API
- **Tables**: users, orders, order_items

### Services
- **Resend**: Transactional email API
- **pdf-lib**: PDF generation library

## Data Flow

1. **User Fills Form**
   - Name, email, mobile
   - Selects items (name, price, quantity)
   - Frontend validates inputs

2. **Form Submission**
   - React app calls `/api/submit-order`
   - Data sent as JSON POST request
   - API keys never exposed to frontend

3. **Netlify Function Processing**
   - Validates request body
   - Creates/finds user in Supabase
   - Saves order with items
   - Generates PDF invoice
   - Sends email with PDF attachment

4. **Response to User**
   - Success: Confirmation message + order ID
   - Error: User-friendly error message

## Security Considerations

### Environment Variables (Never in Frontend)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `RESEND_API_KEY`

### Best Practices
- Input sanitization on backend
- SQL injection prevention via Supabase client
- Rate limiting (Netlify built-in)
- HTTPS only
- CORS configuration
- Email validation
- Phone number validation

## Database Schema

```sql
-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  order_date TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

-- order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);
```

## Scalability & Limits

### Free Tier Limits (MVP)
- **Netlify Functions**: 125K requests/month
- **Supabase**: 500MB database, 2GB bandwidth
- **Resend**: 100 emails/day (3,000/month)

### For ~100 Users/Month
- Well within all free tier limits
- No infrastructure costs
- Auto-scaling handled by Netlify

## Next Steps for WhatsApp Integration

### Option 1: Twilio API
```javascript
// In netlify function, after email sent
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

await client.messages.create({
  from: 'whatsapp:+14155238886',
  to: `whatsapp:${userMobile}`,
  body: `Order confirmed! ID: ${orderId}. Total: $${total}`
});
```

### Option 2: WhatsApp Business API
- Requires business verification
- More features (buttons, media)
- Higher costs

### Implementation Steps
1. Add `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` to env vars
2. Install `twilio` package
3. Create separate function or extend `submit-order.js`
4. Send notification after order creation
5. Handle delivery status webhooks

## Deployment Checklist

- [ ] Create Netlify account
- [ ] Create Supabase project
- [ ] Create Resend account
- [ ] Set environment variables in Netlify UI
- [ ] Push code to GitHub
- [ ] Connect GitHub repo to Netlify
- [ ] Run database migrations
- [ ] Test end-to-end flow
- [ ] Enable HTTPS (automatic)
- [ ] Test PWA installation on mobile/desktop
