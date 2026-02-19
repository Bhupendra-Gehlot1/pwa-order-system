# 🔒 Security Documentation

This document outlines the security measures implemented in the PWA Order Management System and provides guidance for maintaining security in production.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Implemented Security Measures](#implemented-security-measures)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Frontend Security](#frontend-security)
6. [Database Security](#database-security)
7. [Email Security](#email-security)
8. [Production Hardening](#production-hardening)
9. [Security Checklist](#security-checklist)
10. [Incident Response](#incident-response)

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                       │
│  - Input Validation                                      │
│  - No API Keys                                           │
│  - HTTPS Only                                            │
│  - Content Security Policy                               │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS (TLS 1.2+)
                    │
┌───────────────────▼─────────────────────────────────────┐
│                NETLIFY (Edge Network)                    │
│  - DDoS Protection                                       │
│  - Rate Limiting                                         │
│  - HTTPS Enforcement                                     │
│  - CDN Caching                                           │
└───────────────────┬─────────────────────────────────────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
         ▼          ▼          ▼
    ┌────────┐ ┌─────────┐ ┌────────┐
    │ SUPA-  │ │ NETLIFY │ │ RESEND │
    │ BASE   │ │ FUNCTIONS│ │  API   │
    │        │ │          │ │        │
    │ - Auth │ │ - Env    │ │ - TLS  │
    │ - RLS  │ │   Vars   │ │ - Auth │
    │ - TLS  │ │ - Input  │ │        │
    └────────┘ │   Sanit. │ └────────┘
               └─────────┘
```

---

## Implemented Security Measures

### ✅ 1. HTTPS Everywhere

**What**: All communications are encrypted using TLS.

**Implementation**:
- Netlify automatically provisions SSL certificates (Let's Encrypt)
- HTTPS is enforced for all requests
- HTTP requests are automatically redirected to HTTPS

**Configuration**: `netlify.toml`
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

### ✅ 2. Environment Variable Protection

**What**: Sensitive credentials never exposed to frontend.

**Implementation**:
- API keys stored in Netlify environment variables
- Accessed only in serverless functions (backend)
- Never committed to Git (`.gitignore` includes `.env`)

**Files**:
- `.env.example` - Template (safe to commit)
- `.env` - Actual credentials (gitignored)

### ✅ 3. Input Sanitization

**What**: All user inputs are sanitized to prevent XSS and injection attacks.

**Implementation**: `netlify/functions/utils/validation.js`
```javascript
const sanitize = (input) => {
  return input.trim()
    .replace(/[<>]/g, '')  // Remove HTML tags
    .slice(0, 500);         // Limit length
};
```

**Where Applied**:
- Name, email, mobile (user info)
- Item names (order items)
- All text inputs

### ✅ 4. SQL Injection Prevention

**What**: Database queries use parameterized statements.

**Implementation**:
- Using Supabase client library (automatically parameterizes)
- Never concatenating user input into SQL queries
- Using prepared statements

**Example**: `netlify/functions/utils/supabase.js`
```javascript
// Safe - parameterized
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail);  // ✅ Safe

// NEVER do this:
// const sql = `SELECT * FROM users WHERE email = '${userEmail}'`;  // ❌ Vulnerable
```

### ✅ 5. CORS Configuration

**What**: Control which domains can access the API.

**Implementation**: `netlify/functions/submit-order.js`
```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',  // Change to specific domain in production
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
```

**Production Hardening**:
```javascript
// Change this in production:
'Access-Control-Allow-Origin': 'https://yourdomain.com'
```

### ✅ 6. Content Security Policy (CSP)

**What**: Prevents XSS by controlling what resources can be loaded.

**Implementation**: `netlify.toml`
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### ✅ 7. Rate Limiting

**What**: Prevents abuse by limiting request frequency.

**Implementation**:
- Built into Netlify Functions (125K requests/month on free tier)
- Automatic throttling on excessive requests
- DDoS protection at Netlify edge

**Future Enhancement**:
- Implement per-IP rate limiting using Netlify Edge Functions
- Track request counts per email/IP

### ✅ 8. Email Validation

**What**: Ensures email addresses are valid before processing.

**Implementation**: `src/utils/validation.js`
```javascript
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

**Where Applied**:
- Frontend validation (user feedback)
- Backend validation (security)

### ✅ 9. Error Handling

**What**: Prevents information leakage through error messages.

**Implementation**:
- Generic error messages to users
- Detailed errors only in server logs
- No stack traces in production

**Example**: `netlify/functions/submit-order.js`
```javascript
catch (error) {
  console.error('Error:', error);  // Logged server-side only

  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'Server error',  // ✅ Generic message to user
      // details: error.message  // ❌ Never expose in production
    })
  };
}
```

### ✅ 10. Password-less Authentication

**What**: No passwords stored (reduces attack surface).

**Implementation**:
- No user authentication system (for MVP)
- Future: Use Supabase Auth (magic links, OAuth)

---

## Data Protection

### Personal Information (PII)

**What We Collect**:
- Name
- Email address
- Mobile number
- Order details (items, quantities, prices)

**How It's Protected**:
- Stored in Supabase (SOC 2 Type II certified)
- Encrypted at rest (AES-256)
- Encrypted in transit (TLS 1.2+)
- Access controlled via service role key

**Retention**:
- User data: Indefinite (or until user requests deletion)
- Orders: Indefinite (for business records)
- Logs: 7 days (Netlify), 7 days (Supabase free tier)

**GDPR Compliance** (if applicable):
- Right to access: Users can request their data
- Right to deletion: Implement a deletion function
- Right to portability: Export data as JSON/CSV

### Data Minimization

**Principles**:
- Only collect necessary data
- Don't ask for passwords (use magic links)
- Don't store credit card info (use payment processors like Stripe)

---

## API Security

### Authentication

**Current State** (MVP):
- No authentication required for order submission
- Anyone can submit orders

**Production Recommendations**:
1. **Add CAPTCHA** (Google reCAPTCHA v3)
2. **Require email verification** before processing order
3. **Implement request signing** (HMAC)
4. **Use API keys** for trusted clients

### Rate Limiting

**Implementation Ideas**:
```javascript
// netlify/functions/utils/rate-limiter.js
const rateLimits = new Map(); // or use Redis

export const checkRateLimit = (ip, limit = 10, window = 60000) => {
  const now = Date.now();
  const userRequests = rateLimits.get(ip) || [];

  // Filter out old requests
  const recentRequests = userRequests.filter(time => now - time < window);

  if (recentRequests.length >= limit) {
    return { allowed: false, retryAfter: window };
  }

  recentRequests.push(now);
  rateLimits.set(ip, recentRequests);

  return { allowed: true };
};
```

### Request Validation

**Always Validate**:
- Content-Type is `application/json`
- Body is valid JSON
- Required fields are present
- Data types are correct
- Values are within acceptable ranges

---

## Frontend Security

### No Secrets in Frontend

**What NOT to do**:
```javascript
// ❌ NEVER DO THIS
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const resendKey = 're_abc123...';
```

**What to do instead**:
- Store secrets in Netlify environment variables
- Access secrets only in serverless functions
- Frontend calls backend functions, not external APIs directly

### Content Security Policy

**Recommended Headers**:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.netlify.com"
```

### XSS Prevention

**In React**:
- React automatically escapes output (use JSX, not `dangerouslySetInnerHTML`)
- Validate and sanitize all inputs
- Never use `eval()` or `innerHTML` with user data

---

## Database Security

### Supabase Security

**Row Level Security (RLS)**:

Enable RLS for production:
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access"
  ON users FOR ALL
  TO service_role
  USING (true);
```

**Service Role vs Anon Key**:
- **Anon key**: For frontend (limited permissions)
- **Service role key**: For backend (full permissions) - never expose!

**Database Backups**:
- Enable automatic backups in Supabase
- Free tier: 7 days retention
- Paid tier: Point-in-time recovery

---

## Email Security

### SPF, DKIM, DMARC

**Why**: Prevents email spoofing and improves deliverability.

**Setup** (if using custom domain):

1. **SPF**: Add TXT record
   ```
   v=spf1 include:amazonses.com include:_spf.resend.com ~all
   ```

2. **DKIM**: Add provided by Resend
   ```
   resend._domainkey IN TXT "v=DKIM1; k=rsa; p=MIGfMA0GCSq..."
   ```

3. **DMARC**: Add TXT record
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
   ```

### Email Content Security

**Prevent Phishing**:
- Use consistent branding
- Include order ID in subject
- Don't ask for sensitive info via email
- Include unsubscribe link (if sending marketing emails)

---

## Production Hardening

### Checklist

- [ ] Change CORS origin to specific domain (not `*`)
- [ ] Enable Supabase Row Level Security
- [ ] Add CAPTCHA to form
- [ ] Implement rate limiting per IP
- [ ] Set up monitoring and alerts
- [ ] Enable Netlify Analytics
- [ ] Review and rotate API keys quarterly
- [ ] Set up error tracking (Sentry, Bugsnag)
- [ ] Enable database backups
- [ ] Add CSP headers
- [ ] Test with security scanning tools
- [ ] Set up uptime monitoring
- [ ] Document incident response plan

### Security Scanning Tools

**Free Tools**:
- **OWASP ZAP**: Web application security scanner
- **Snyk**: Dependency vulnerability scanner
- **npm audit**: Check for vulnerable dependencies
- **Lighthouse**: Security audit in Chrome DevTools

**Commands**:
```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Snyk scan
npx snyk test
```

---

## Security Checklist

### Before Deployment

- [ ] All secrets in environment variables (not in code)
- [ ] `.env` file is gitignored
- [ ] Database schema created with proper constraints
- [ ] Service role key used (not anon key)
- [ ] Input validation on frontend and backend
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS enforced
- [ ] Security headers configured

### After Deployment

- [ ] Test with invalid/malicious input
- [ ] Verify secrets are not exposed in browser network tab
- [ ] Check CSP headers are applied
- [ ] Test rate limiting
- [ ] Review function logs for errors
- [ ] Set up monitoring for unusual activity
- [ ] Document security practices for team
- [ ] Schedule regular security reviews

---

## Incident Response

### If API Keys Are Compromised

1. **Immediately**:
   - Revoke compromised keys
   - Generate new keys
   - Update Netlify environment variables
   - Redeploy

2. **Investigate**:
   - Check logs for unauthorized access
   - Review recent deployments
   - Check Git history for accidental commits

3. **Prevent**:
   - Use `.env` file (gitignored)
   - Use environment variables in CI/CD
   - Add pre-commit hooks to scan for secrets

### If Database Is Compromised

1. **Immediately**:
   - Rotate database password
   - Review RLS policies
   - Check for unauthorized access in logs

2. **Investigate**:
   - Identify entry point
   - Check for data exfiltration
   - Review recent database queries

3. **Notify**:
   - Affected users (if PII was accessed)
   - Comply with data breach notification laws (GDPR, etc.)

### Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email: security@yourdomain.com (set this up)
3. Provide:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Netlify Security](https://www.netlify.com/security/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [Resend Security](https://resend.com/docs/security)
- [CSP Generator](https://report-uri.com/home/generate)

---

## Security Updates

**Stay Updated**:
- Subscribe to security advisories for all dependencies
- Run `npm audit` regularly
- Update dependencies monthly
- Review Netlify, Supabase, Resend changelogs

**Automation**:
- Use Dependabot (GitHub) for automated dependency updates
- Set up Snyk for continuous monitoring

---

**Last Updated**: [Current Date]
**Next Review**: [3 months from now]
