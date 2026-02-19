# 📁 Folder Structure

Complete visual guide to the project structure.

```
pwa-order-system/
│
├── 📚 DOCUMENTATION (Start Here!)
│   ├── README.md                          # Main documentation - READ FIRST
│   ├── PROJECT_SUMMARY.md                 # Quick overview and reference
│   ├── ARCHITECTURE.md                    # Technical architecture & data flow
│   ├── DEPLOYMENT.md                      # Step-by-step deployment guide
│   ├── SECURITY.md                        # Security best practices
│   ├── WHATSAPP.md                        # WhatsApp integration guide
│   └── FOLDER_STRUCTURE.md                # This file
│
├── 🗄️ DATABASE
│   └── database-schema.sql                # PostgreSQL schema for Supabase
│                                          # Run this in Supabase SQL Editor
│
├── ⚙️ CONFIGURATION
│   ├── package.json                       # Frontend dependencies & scripts
│   │                                      # - react, react-dom
│   │                                      # - vite, @vitejs/plugin-react
│   │                                      # - vite-plugin-pwa
│   │
│   ├── vite.config.js                     # Vite build configuration
│   │                                      # - PWA plugin setup
│   │                                      # - Service worker generation
│   │                                      # - Dev server proxy
│   │
│   ├── netlify.toml                       # Netlify deployment config
│   │                                      # - Build settings
│   │                                      # - Functions directory
│   │                                      # - Redirects & headers
│   │
│   ├── .env.example                       # Environment variables template
│   │                                      # Copy to .env and fill in values
│   │
│   ├── .gitignore                         # Git ignore rules
│   │                                      # - node_modules/
│   │                                      # - .env
│   │                                      # - dist/
│   │
│   └── setup.sh                           # Automated setup script
│                                          # Run: ./setup.sh
│
├── 🌐 PUBLIC (Static Assets)
│   ├── index.html                         # HTML entry point
│   │                                      # - PWA meta tags
│   │                                      # - Manifest link
│   │                                      # - Root div
│   │
│   ├── manifest.json                      # PWA manifest
│   │                                      # - App name, icons, theme
│   │                                      # - Display mode, shortcuts
│   │
│   ├── offline.html                       # Offline fallback page
│   │                                      # Shown when user is offline
│   │
│   └── icons/                             # PWA icons
│       ├── icon-192x192.png              # 192x192 icon (required)
│       ├── icon-512x512.png              # 512x512 icon (required)
│       └── README.md                      # Icon generation guide
│
├── ⚛️ REACT FRONTEND (src/)
│   │
│   ├── main.jsx                           # Application entry point
│   │                                      # - ReactDOM.render()
│   │                                      # - Service worker registration
│   │                                      # - PWA install prompt handling
│   │
│   ├── index.css                          # Global styles
│   │                                      # - CSS variables (colors, spacing)
│   │                                      # - Reset styles
│   │                                      # - Utility classes
│   │
│   ├── App.jsx                            # Root component
│   │                                      # - Online/offline detection
│   │                                      # - Header, main, footer
│   │                                      # - OrderForm wrapper
│   │
│   ├── App.css                            # App component styles
│   │                                      # - Header gradient
│   │                                      # - Offline banner
│   │                                      # - Responsive layout
│   │
│   ├── 🧩 components/
│   │   ├── OrderForm.jsx                  # Main order form component
│   │   │                                  # - User info inputs
│   │   │                                  # - Dynamic items management
│   │   │                                  # - Form validation
│   │   │                                  # - API submission
│   │   │                                  # - Success/error handling
│   │   │
│   │   └── OrderForm.css                  # Form styles
│   │                                      # - Input styles
│   │                                      # - Button styles
│   │                                      # - Table styles
│   │                                      # - Responsive breakpoints
│   │
│   ├── 🔌 services/
│   │   └── api.js                         # API client service
│   │                                      # - submitOrder() function
│   │                                      # - Fetch wrapper with retry
│   │                                      # - Error handling
│   │
│   └── 🛠️ utils/
│       └── validation.js                  # Form validation utilities
│                                          # - validateEmail()
│                                          # - validateMobile()
│                                          # - validateName()
│                                          # - validateItems()
│                                          # - sanitizeInput()
│
└── ☁️ SERVERLESS BACKEND (netlify/functions/)
    │
    ├── package.json                       # Function dependencies
    │                                      # - @supabase/supabase-js
    │                                      # - resend
    │                                      # - pdf-lib
    │
    ├── submit-order.js                    # Main serverless function
    │                                      # 📍 Entry point: handler()
    │                                      #
    │                                      # Flow:
    │                                      # 1. Validate request
    │                                      # 2. Sanitize inputs
    │                                      # 3. Upsert user (Supabase)
    │                                      # 4. Create order
    │                                      # 5. Create order items
    │                                      # 6. Generate PDF invoice
    │                                      # 7. Send email with PDF
    │                                      # 8. Return success response
    │                                      #
    │                                      # Environment Variables Required:
    │                                      # - SUPABASE_URL
    │                                      # - SUPABASE_SERVICE_KEY
    │                                      # - RESEND_API_KEY
    │                                      # - FROM_EMAIL
    │                                      # - REPLY_TO_EMAIL
    │
    └── 🛠️ utils/
        │
        ├── supabase.js                    # Database operations
        │                                  # - getSupabaseClient()
        │                                  # - upsertUser()
        │                                  # - createOrder()
        │                                  # - createOrderItems()
        │                                  # - getOrderDetails()
        │                                  # - updateOrderStatus()
        │
        ├── resend.js                      # Email service
        │                                  # - sendOrderConfirmationEmail()
        │                                  # - generateOrderEmailHTML()
        │                                  # - generateOrderEmailText()
        │                                  # - sendTestEmail()
        │
        └── pdf-generator.js               # PDF generation
                                           # - generateInvoicePDF()
                                           # - generatePDFFilename()
                                           # - pdfToBase64()
```

---

## 📝 File Purposes at a Glance

### Documentation Files
- **README.md** - Start here! Complete project overview
- **PROJECT_SUMMARY.md** - Quick reference and cheat sheet
- **ARCHITECTURE.md** - How everything works together
- **DEPLOYMENT.md** - How to deploy to production
- **SECURITY.md** - Security best practices
- **WHATSAPP.md** - Add WhatsApp notifications (optional)

### Configuration Files
- **package.json** - Frontend dependencies (React, Vite, PWA)
- **vite.config.js** - Build configuration and PWA setup
- **netlify.toml** - Deployment settings for Netlify
- **.env.example** - Template for environment variables
- **setup.sh** - Automated setup script

### Frontend Files (React)
- **src/main.jsx** - App entry point
- **src/App.jsx** - Root component
- **src/components/OrderForm.jsx** - Main form component
- **src/services/api.js** - API communication layer
- **src/utils/validation.js** - Input validation functions

### Backend Files (Netlify Functions)
- **netlify/functions/submit-order.js** - Main API endpoint
- **netlify/functions/utils/supabase.js** - Database layer
- **netlify/functions/utils/resend.js** - Email layer
- **netlify/functions/utils/pdf-generator.js** - PDF generation layer

### Database
- **database-schema.sql** - Complete database setup (tables, indexes, triggers)

---

## 🔍 Quick Navigation

### I want to...

**...understand the project**
→ Read `README.md` and `ARCHITECTURE.md`

**...set up locally**
→ Run `./setup.sh` or follow `README.md` setup section

**...deploy to production**
→ Follow `DEPLOYMENT.md` step-by-step

**...customize the form**
→ Edit `src/components/OrderForm.jsx`

**...change the email template**
→ Edit `netlify/functions/utils/resend.js`

**...modify the PDF invoice**
→ Edit `netlify/functions/utils/pdf-generator.js`

**...add WhatsApp notifications**
→ Follow `WHATSAPP.md`

**...understand security**
→ Read `SECURITY.md`

**...change database schema**
→ Edit `database-schema.sql` and run in Supabase

**...customize PWA settings**
→ Edit `public/manifest.json` and `vite.config.js`

---

## 📊 Code Organization Principles

### Frontend Structure
```
Components → Services → API
     ↓          ↓
  Validation  Utils
```

- **Components**: UI logic only
- **Services**: API calls, business logic
- **Utils**: Pure functions, validation, helpers

### Backend Structure
```
Handler (submit-order.js)
    ↓
Utils (specialized modules)
    ├── supabase.js (database)
    ├── resend.js (email)
    └── pdf-generator.js (PDF)
```

- **Handler**: Orchestrates the flow
- **Utils**: Reusable, testable modules
- Each util has a single responsibility

---

## 🎨 Styling Organization

```
index.css          # Global styles (variables, reset)
    ↓
App.css            # App-level layout
    ↓
OrderForm.css      # Component-specific styles
```

**CSS Variables** (in `index.css`):
- Colors: `--primary`, `--success`, `--error`, etc.
- Spacing: `--spacing-xs` through `--spacing-2xl`
- Radius: `--radius-sm` through `--radius-xl`
- Shadows: `--shadow-sm` through `--shadow-xl`

---

## 📦 Dependencies Breakdown

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "UI framework",
    "react-dom": "React DOM renderer"
  },
  "devDependencies": {
    "vite": "Build tool & dev server",
    "@vitejs/plugin-react": "React plugin for Vite",
    "vite-plugin-pwa": "PWA generation",
    "netlify-cli": "Local development"
  }
}
```

### Backend (`netlify/functions/package.json`)
```json
{
  "dependencies": {
    "@supabase/supabase-js": "Supabase client (database)",
    "resend": "Email API client",
    "pdf-lib": "PDF generation library"
  }
}
```

---

## 🚀 Development Workflow

```
1. Edit code
   ↓
2. Test locally (npm run netlify)
   ↓
3. Commit to Git
   ↓
4. Push to GitHub
   ↓
5. Netlify auto-deploys
   ↓
6. Test in production
```

---

## 📏 File Sizes (Approximate)

| File | Lines | Purpose |
|------|-------|---------|
| `README.md` | 550 | Main documentation |
| `submit-order.js` | 250 | Main serverless function |
| `OrderForm.jsx` | 350 | Main form component |
| `supabase.js` | 200 | Database operations |
| `pdf-generator.js` | 200 | PDF generation |
| `resend.js` | 250 | Email service |
| `database-schema.sql` | 300 | Database schema |

**Total project**: ~2,500 lines of code + documentation

---

## 🎯 Key Files You'll Edit Most

1. **OrderForm.jsx** - Add/modify form fields
2. **submit-order.js** - Add business logic
3. **pdf-generator.js** - Customize invoice appearance
4. **resend.js** - Customize email template
5. **OrderForm.css** - Change styling

---

**Need help?** See `README.md` or `PROJECT_SUMMARY.md` for detailed explanations!
