# 📱 WhatsApp Integration Guide

Step-by-step guide to add WhatsApp notifications to your order management system.

## Table of Contents

1. [Overview](#overview)
2. [Option 1: Twilio API (Recommended)](#option-1-twilio-api-recommended)
3. [Option 2: WhatsApp Business API](#option-2-whatsapp-business-api)
4. [Implementation](#implementation)
5. [Message Templates](#message-templates)
6. [Testing](#testing)
7. [Production Considerations](#production-considerations)

---

## Overview

WhatsApp integration allows you to send order confirmation messages directly to customers' WhatsApp numbers.

### Use Cases

- Order confirmation
- Order status updates
- Delivery notifications
- Customer support
- Marketing messages (with opt-in)

### Comparison

| Feature | Twilio | WhatsApp Business API |
|---------|--------|----------------------|
| Setup Time | 10 minutes | 2-4 weeks |
| Cost | $0.005/message | $0.005-0.012/message |
| Features | Basic text, media | Rich media, buttons, templates |
| Verification | None | Business verification required |
| Best For | MVP, small scale | Enterprise, large scale |

---

## Option 1: Twilio API (Recommended)

### Prerequisites

- Twilio account (free trial: $15 credit)
- WhatsApp-enabled phone number (for receiving messages)

### Step 1: Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your email and phone number
4. You'll receive $15 free credit

### Step 2: Set Up WhatsApp Sandbox

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see a sandbox phone number: `+1 415 523 8886`
3. Follow the instructions to join the sandbox:
   - Send a WhatsApp message to `+1 415 523 8886`
   - Message format: `join [your-sandbox-name]`
   - Example: `join yellow-tiger`
4. You'll receive a confirmation message

### Step 3: Get API Credentials

1. Go to **Account** → **API keys & tokens**
2. Copy:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)

### Step 4: Install Twilio SDK

```bash
cd netlify/functions
npm install twilio
cd ../..
```

### Step 5: Add Environment Variables

Add to Netlify environment variables:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Step 6: Create WhatsApp Service

Create `netlify/functions/utils/whatsapp.js`:

```javascript
/**
 * WhatsApp Service using Twilio
 */

import twilio from 'twilio';

// Initialize Twilio client
let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    twilioClient = twilio(accountSid, authToken);
  }

  return twilioClient;
};

/**
 * Send WhatsApp message
 * @param {string} to - Recipient phone number (e.g., +1234567890)
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Message result
 */
export const sendWhatsAppMessage = async (to, message) => {
  const client = getTwilioClient();

  try {
    // Format phone number for WhatsApp
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER;

    const result = await client.messages.create({
      from: whatsappFrom,
      to: whatsappTo,
      body: message
    });

    console.log('WhatsApp message sent:', result.sid);

    return {
      success: true,
      messageId: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
};

/**
 * Send WhatsApp message with media
 * @param {string} to - Recipient phone number
 * @param {string} message - Message content
 * @param {string} mediaUrl - URL of image/video/PDF
 * @returns {Promise<Object>} - Message result
 */
export const sendWhatsAppMediaMessage = async (to, message, mediaUrl) => {
  const client = getTwilioClient();

  try {
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER;

    const result = await client.messages.create({
      from: whatsappFrom,
      to: whatsappTo,
      body: message,
      mediaUrl: [mediaUrl]  // Array of media URLs
    });

    console.log('WhatsApp media message sent:', result.sid);

    return {
      success: true,
      messageId: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('Error sending WhatsApp media message:', error);
    throw error;
  }
};

/**
 * Format order confirmation message
 * @param {Object} orderData - Order details
 * @returns {string} - Formatted message
 */
export const formatOrderConfirmation = (orderData) => {
  const itemsList = orderData.items
    .map((item, idx) => `${idx + 1}. ${item.itemName} - $${item.price.toFixed(2)} x ${item.quantity}`)
    .join('\n');

  return `
🎉 *Order Confirmed!*

Thank you for your order, ${orderData.userName}!

📦 *Order Details:*
Order ID: ${orderData.orderId}
Date: ${new Date(orderData.orderDate).toLocaleDateString()}

🛒 *Items:*
${itemsList}

💰 *Total: $${orderData.totalAmount.toFixed(2)}*

✅ We've sent a detailed invoice to your email: ${orderData.userEmail}

If you have any questions, please reply to this message.

Thank you for choosing us! 🙏
  `.trim();
};
```

### Step 7: Update submit-order Function

Edit `netlify/functions/submit-order.js` to include WhatsApp:

```javascript
// Add import at top
import { sendWhatsAppMessage, formatOrderConfirmation } from './utils/whatsapp.js';

// After email is sent successfully (around line 150):
try {
  const emailResult = await sendOrderConfirmationEmail({
    to: sanitizedData.email,
    orderData: pdfData,
    pdfBase64,
    pdfFilename
  });

  console.log('Email sent:', emailResult.emailId);

  // NEW: Send WhatsApp notification
  try {
    const whatsappMessage = formatOrderConfirmation(pdfData);
    const whatsappResult = await sendWhatsAppMessage(
      sanitizedData.mobile,
      whatsappMessage
    );
    console.log('WhatsApp sent:', whatsappResult.messageId);
  } catch (whatsappError) {
    // Don't fail the entire order if WhatsApp fails
    console.error('WhatsApp notification failed:', whatsappError);
  }

  // ... rest of the code
}
```

### Step 8: Test

1. Deploy to Netlify
2. Submit a test order
3. Use a WhatsApp-enabled phone number (that joined the sandbox)
4. Check WhatsApp for the message

---

## Option 2: WhatsApp Business API

### Overview

The official WhatsApp Business API provides more features but requires business verification.

### Features

- Message templates (pre-approved messages)
- Rich media (images, videos, documents)
- Interactive buttons and lists
- Contact cards
- Location sharing
- Read receipts
- Typing indicators

### Requirements

1. **Facebook Business Manager** account
2. **Business verification** (2-4 weeks)
3. **Phone number** dedicated to WhatsApp Business
4. **Use case approval** from WhatsApp
5. **Message templates** must be pre-approved

### Providers

You can't access WhatsApp Business API directly. Use a provider:

- **Twilio** (easiest, pay-per-message)
- **MessageBird**
- **Vonage (Nexmo)**
- **InfoBip**
- **360Dialog** (official partner)

### Setup with Twilio (WhatsApp Business)

1. **Upgrade from Sandbox**:
   - In Twilio Console, go to **Messaging** → **WhatsApp**
   - Click **Get started with WhatsApp Business API**
   - Follow the verification process

2. **Submit Business Profile**:
   - Business name
   - Business description
   - Business category
   - Business website
   - Business address
   - Proof of business (documents)

3. **Wait for Approval** (2-4 weeks)

4. **Create Message Templates**:
   - Go to **Messaging** → **Content Editor**
   - Create templates (must be approved before use)
   - Example template:
     ```
     Your order {{1}} has been confirmed! Total: ${{2}}.
     We've sent an invoice to {{3}}.
     ```

5. **Use Templates in Code**:
   ```javascript
   await client.messages.create({
     from: 'whatsapp:+14155238886',
     to: 'whatsapp:+1234567890',
     contentSid: 'HXxxxxxxxxxxxxxxxxxxxxx',  // Template SID
     contentVariables: JSON.stringify({
       1: orderId,
       2: totalAmount,
       3: userEmail
     })
   });
   ```

---

## Implementation

### Full Implementation Example

`netlify/functions/utils/whatsapp.js`:

```javascript
import twilio from 'twilio';

let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
};

export const sendOrderConfirmationWhatsApp = async (orderData) => {
  const client = getTwilioClient();

  const message = `
🎉 *Order Confirmed!*

Hi ${orderData.userName},

Your order has been confirmed!

📋 *Order ID:* ${orderData.orderId}
📅 *Date:* ${new Date(orderData.orderDate).toLocaleDateString()}

🛒 *Items:*
${orderData.items.map((item, i) =>
  `${i + 1}. ${item.itemName} - $${item.price} x ${item.quantity}`
).join('\n')}

💰 *Total: $${orderData.totalAmount.toFixed(2)}*

📧 Invoice sent to: ${orderData.userEmail}

Thank you for your order! 🙏
  `.trim();

  try {
    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${orderData.userMobile}`,
      body: message
    });

    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('WhatsApp error:', error);
    throw error;
  }
};
```

---

## Message Templates

### Order Confirmation

```
🎉 *Order Confirmed!*

Hi {{name}},

Order ID: {{orderId}}
Total: ${{total}}

✅ Invoice sent to {{email}}

Thank you! 🙏
```

### Order Shipped

```
📦 *Your Order Has Shipped!*

Hi {{name}},

Your order {{orderId}} is on its way!

🚚 Tracking: {{trackingNumber}}

Expected delivery: {{deliveryDate}}
```

### Order Delivered

```
✅ *Order Delivered!*

Hi {{name}},

Your order {{orderId}} has been delivered!

We hope you love it! 😊

Rate your experience: {{ratingLink}}
```

---

## Testing

### Sandbox Testing (Twilio)

1. Join sandbox (send `join your-code` to sandbox number)
2. Submit test order with your phone number
3. Check WhatsApp for message
4. Verify message formatting

### Production Testing

1. Use a test phone number (not customer-facing)
2. Send test messages throughout the day
3. Monitor delivery rates
4. Check message formatting on different devices
5. Test with international numbers

### Test Checklist

- [ ] Message is delivered within 5 seconds
- [ ] Formatting looks good (bold, emoji)
- [ ] Links work correctly
- [ ] Phone number format is accepted
- [ ] Error handling works (invalid numbers)
- [ ] Messages don't fail order submission
- [ ] Costs are within budget

---

## Production Considerations

### Phone Number Formatting

Always validate and format phone numbers:

```javascript
// Before sending:
const formatPhoneForWhatsApp = (phone) => {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');

  // Add country code if missing (assume US +1)
  if (cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }

  // Add + prefix
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
};
```

### Cost Management

**Twilio Pricing**:
- Sandbox: Free (for testing)
- Production: $0.005 per message (US)
- International: $0.007-0.012 per message

**Budget for 100 orders/month**:
- Cost: 100 × $0.005 = $0.50/month
- Very affordable!

### Rate Limiting

WhatsApp has rate limits:
- Sandbox: ~1 message/second
- Production tier 1: 1,000 messages/24 hours
- Production tier 2: 10,000 messages/24 hours

### Opt-Out Mechanism

Add opt-out instructions:

```javascript
const message = `
Your order confirmed!

...

To stop receiving messages, reply STOP.
`;
```

Handle STOP messages:
```javascript
// In a webhook handler
if (incomingMessage.body.toUpperCase() === 'STOP') {
  // Add user to opt-out list
  await addToOptOutList(phoneNumber);

  await client.messages.create({
    to: phoneNumber,
    from: twilioNumber,
    body: 'You have been unsubscribed from WhatsApp notifications. Reply START to opt back in.'
  });
}
```

### Error Handling

```javascript
try {
  await sendWhatsAppMessage(phone, message);
} catch (error) {
  if (error.code === 21211) {
    // Invalid phone number
    console.log('Invalid phone number:', phone);
  } else if (error.code === 21614) {
    // Unverified 'To' number
    console.log('Number not verified for sandbox');
  } else {
    console.error('WhatsApp error:', error);
  }

  // Don't fail the order - just log the error
}
```

### Monitoring

Track metrics:
- Delivery rate
- Failed messages (and reasons)
- Response times
- Costs per month

Use Twilio's console or integrate with monitoring tools.

---

## Next Steps

1. Set up Twilio sandbox (5 minutes)
2. Test with your own phone number
3. Add to one Netlify function
4. Deploy and test in production
5. Monitor for 1 week
6. Decide if you need WhatsApp Business API (probably not for MVP)

---

## Resources

- [Twilio WhatsApp Quickstart](https://www.twilio.com/docs/whatsapp/quickstart)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Twilio Pricing](https://www.twilio.com/whatsapp/pricing)
- [Message Templates](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates)

---

**Recommendation for MVP**: Start with Twilio sandbox, test with 10-20 orders, then upgrade to production WhatsApp if needed.
