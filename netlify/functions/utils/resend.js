/**
 * Email Service Utility (Nodemailer + Gmail SMTP)
 * Handles sending emails with PDF attachments via Gmail
 */

import nodemailer from 'nodemailer';

// Initialize transporter (singleton pattern)
let transporter = null;

/**
 * Get or create Nodemailer transporter
 * @returns {Object} - Nodemailer transporter instance
 */
const getTransporter = () => {
  if (!transporter) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      throw new Error('Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.');
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return transporter;
};

/**
 * Generate HTML email template for order confirmation
 * @param {Object} orderData - Order data
 * @param {string} logoBase64 - Base64 encoded logo (optional)
 * @returns {string} - HTML email content
 */
const generateOrderEmailHTML = (orderData, logoBase64) => {
  const itemsHTML = orderData.items
    .map(
      (item, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#FDFAF6' : '#ffffff'};">
        <td style="padding: 14px 16px; border-bottom: 1px solid #E8E2D6; color: #333333; font-size: 14px;">${item.itemName}</td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #E8E2D6; text-align: center; color: #555555; font-size: 14px;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #E8E2D6; text-align: center; color: #555555; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #E8E2D6; text-align: right; font-weight: 600; color: #1B2A5B; font-size: 14px;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const logoHTML = logoBase64
    ? `<img src="cid:company-logo" alt="SS Clothes Sumerpur" style="width: 60px; height: 60px; object-fit: contain;" />`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - SS Clothes Sumerpur</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', Times, serif; background-color: #F5F2ED;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F2ED; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="620" cellpadding="0" cellspacing="0" style="background-color: #ffffff; overflow: hidden; border: 1px solid #E0DCD1;">

              <!-- Top Gold Accent Bar -->
              <tr>
                <td style="background-color: #C5A55A; height: 5px; font-size: 0; line-height: 0;">&nbsp;</td>
              </tr>

              <!-- Header with Logo -->
              <tr>
                <td style="background-color: #1B2A5B; padding: 30px 40px; text-align: center;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        ${logoHTML ? `
                        <div style="margin-bottom: 12px;">
                          ${logoHTML}
                        </div>
                        ` : ''}
                        <h1 style="margin: 0; color: #C5A55A; font-size: 22px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase; font-family: Georgia, 'Times New Roman', Times, serif;">SS Clothes, Sumerpur</h1>
                        <p style="margin: 6px 0 0; color: #8B9DC3; font-size: 11px; letter-spacing: 2px; font-style: italic;">An Address of Elegance</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Decorative Gold Divider -->
              <tr>
                <td style="padding: 0; text-align: center; background-color: #ffffff;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 20px 40px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="border-bottom: 1px solid #E8E2D6; height: 1px; font-size: 0;">&nbsp;</td>
                            <td style="width: 40px; text-align: center; color: #C5A55A; font-size: 14px; font-family: Georgia, serif;">&#9670;</td>
                            <td style="border-bottom: 1px solid #E8E2D6; height: 1px; font-size: 0;">&nbsp;</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Order Confirmation Title -->
              <tr>
                <td style="padding: 20px 40px 10px; text-align: center;">
                  <h2 style="margin: 0; color: #1B2A5B; font-size: 20px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; font-family: Georgia, 'Times New Roman', Times, serif;">Order Confirmation</h2>
                </td>
              </tr>

              <!-- Greeting & Message -->
              <tr>
                <td style="padding: 10px 40px 25px;">
                  <p style="margin: 0 0 16px; font-size: 15px; color: #333333; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    Dear <strong style="color: #1B2A5B;">${orderData.userName}</strong>,
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #555555; line-height: 1.8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    Thank you for your order. Your order has been confirmed and your invoice is attached to this email.
                  </p>
                </td>
              </tr>

              <!-- Order Info Cards -->
              <tr>
                <td style="padding: 0 40px 25px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FDFAF6; border: 1px solid #E8E2D6;">
                    <tr>
                      <td style="padding: 20px; border-right: 1px solid #E8E2D6; width: 33%; text-align: center;">
                        <div style="color: #C5A55A; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; margin-bottom: 6px; font-family: -apple-system, sans-serif;">Order ID</div>
                        <div style="color: #1B2A5B; font-size: 15px; font-weight: 600; font-family: -apple-system, sans-serif;">${orderData.orderId}</div>
                      </td>
                      <td style="padding: 20px; border-right: 1px solid #E8E2D6; width: 34%; text-align: center;">
                        <div style="color: #C5A55A; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; margin-bottom: 6px; font-family: -apple-system, sans-serif;">Order Date</div>
                        <div style="color: #1B2A5B; font-size: 15px; font-weight: 600; font-family: -apple-system, sans-serif;">${new Date(orderData.orderDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</div>
                      </td>
                      <td style="padding: 20px; width: 33%; text-align: center;">
                        <div style="color: #C5A55A; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; margin-bottom: 6px; font-family: -apple-system, sans-serif;">Total Amount</div>
                        <div style="color: #1B2A5B; font-size: 20px; font-weight: 700; font-family: -apple-system, sans-serif;">₹${orderData.totalAmount.toFixed(2)}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items Section Label -->
              <tr>
                <td style="padding: 0 40px 8px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color: #C5A55A; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; font-family: -apple-system, sans-serif;">Order Items</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items Table -->
              <tr>
                <td style="padding: 0 40px 25px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #E8E2D6; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #1B2A5B;">
                        <th style="padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 600; color: #C5A55A; text-transform: uppercase; letter-spacing: 1px; font-family: -apple-system, sans-serif;">Item</th>
                        <th style="padding: 12px 16px; text-align: center; font-size: 10px; font-weight: 600; color: #C5A55A; text-transform: uppercase; letter-spacing: 1px; font-family: -apple-system, sans-serif;">Price</th>
                        <th style="padding: 12px 16px; text-align: center; font-size: 10px; font-weight: 600; color: #C5A55A; text-transform: uppercase; letter-spacing: 1px; font-family: -apple-system, sans-serif;">Qty</th>
                        <th style="padding: 12px 16px; text-align: right; font-size: 10px; font-weight: 600; color: #C5A55A; text-transform: uppercase; letter-spacing: 1px; font-family: -apple-system, sans-serif;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHTML}
                    </tbody>
                    <tfoot>
                      <tr style="background-color: #1B2A5B;">
                        <td colspan="3" style="padding: 14px 16px; text-align: right; font-weight: 600; color: #C5A55A; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; font-family: -apple-system, sans-serif;">Total</td>
                        <td style="padding: 14px 16px; text-align: right; font-weight: 700; color: #ffffff; font-size: 16px; font-family: -apple-system, sans-serif;">₹${orderData.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </td>
              </tr>

              <!-- Message -->
              <tr>
                <td style="padding: 0 40px 15px;">
                  <p style="margin: 0 0 12px; font-size: 14px; color: #555555; line-height: 1.8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    We're thrilled to have you as our valued customer. Your order is being processed with care, and we'll ensure everything meets our high standards.
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #555555; line-height: 1.8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    If you have any questions, please don't hesitate to reach out.
                  </p>
                </td>
              </tr>

              <!-- Thank You -->
              <tr>
                <td style="padding: 5px 40px 25px;">
                  <p style="margin: 0; font-size: 15px; color: #1B2A5B; font-weight: 600; font-family: Georgia, 'Times New Roman', Times, serif; font-style: italic;">
                    Thank you for choosing SS Clothes Sumerpur.
                  </p>
                </td>
              </tr>

              <!-- Decorative Gold Divider -->
              <tr>
                <td style="padding: 0 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-bottom: 1px solid #E8E2D6; height: 1px; font-size: 0;">&nbsp;</td>
                      <td style="width: 40px; text-align: center; color: #C5A55A; font-size: 14px; font-family: Georgia, serif;">&#9670;</td>
                      <td style="border-bottom: 1px solid #E8E2D6; height: 1px; font-size: 0;">&nbsp;</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1B2A5B; padding: 30px 40px; text-align: center; margin-top: 15px;">
                  <!-- Gold top line -->
                  <div style="border-top: 2px solid #C5A55A; margin: -30px -40px 20px; padding: 0;"></div>

                  <p style="margin: 0 0 10px; font-size: 14px; color: #C5A55A; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; font-family: Georgia, 'Times New Roman', Times, serif;">
                    SS Clothes, Sumerpur
                  </p>
                  <p style="margin: 0 0 12px; font-size: 12px; color: #8B9DC3; line-height: 1.7; font-family: -apple-system, sans-serif;">
                    06, Ground Floor, Pushprishi Arcade<br>
                    Arya Samaj Road, Sumerpur – 306902
                  </p>
                  <p style="margin: 0 0 20px;">
                    <a href="https://instagram.com/ss__clothessumerpur" style="color: #C5A55A; text-decoration: none; font-size: 12px; letter-spacing: 0.5px; font-family: -apple-system, sans-serif;">@ss__clothessumerpur</a>
                  </p>
                  <p style="margin: 0; font-size: 10px; color: #5A6B8A; border-top: 1px solid #2A3D6B; padding-top: 15px; letter-spacing: 0.5px; font-family: -apple-system, sans-serif;">
                    &copy; ${new Date().getFullYear()} SS Clothes Sumerpur. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Generate plain text version of email (fallback for non-HTML clients)
 * @param {Object} orderData - Order data
 * @returns {string} - Plain text email content
 */
const generateOrderEmailText = (orderData) => {
  const itemsList = orderData.items
    .map((item) => `- ${item.itemName}: ₹${item.price.toFixed(2)} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  return `
SS CLOTHES, SUMERPUR
An Address of Elegance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORDER CONFIRMATION

Dear ${orderData.userName},

Thank you for your order. Your order has been confirmed and your invoice is attached to this email.

Order Details:
━━━━━━━━━━━━━━
Order ID: ${orderData.orderId}
Order Date: ${new Date(orderData.orderDate).toLocaleDateString()}
Total Amount: ₹${orderData.totalAmount.toFixed(2)}

Order Items:
${itemsList}

Total: ₹${orderData.totalAmount.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
We're thrilled to have you as our valued customer. Your order is being processed with care.

If you have any questions, please don't hesitate to reach out.

Thank you for choosing SS Clothes Sumerpur.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SS Clothes, Sumerpur
06, Ground Floor, Pushprishi Arcade
Arya Samaj Road, Sumerpur – 306902
Instagram: @ss__clothessumerpur

© ${new Date().getFullYear()} SS Clothes Sumerpur
  `.trim();
};

/**
 * Send order confirmation email with PDF attachment
 * @param {Object} emailData - Email data
 * @param {string} emailData.to - Recipient email
 * @param {Object} emailData.orderData - Order data
 * @param {string} emailData.pdfBase64 - PDF attachment as base64
 * @param {string} emailData.pdfFilename - PDF filename
 * @returns {Promise<Object>} - Email send result
 */
export const sendOrderConfirmationEmail = async (emailData) => {
  const transport = getTransporter();
  // Use FROM_EMAIL if set, otherwise fall back to GMAIL_USER
  const fromEmail = process.env.FROM_EMAIL || process.env.GMAIL_USER;

  // Try to load logo for email CID embedding
  let logoAttachment = null;
  let logoBase64 = null;
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const possiblePaths = [
      path.resolve('public/icons/logo.png'),
      path.resolve('../../public/icons/logo.png'),
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../public/icons/logo.png'),
      './public/icons/logo.png'
    ];

    for (const logoPath of possiblePaths) {
      try {
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath);
          logoBase64 = logoBuffer.toString('base64');
          logoAttachment = {
            filename: 'logo.png',
            content: logoBuffer,
            cid: 'company-logo'
          };
          break;
        }
      } catch {
        // Try next path
      }
    }
  } catch {
    // Logo loading failed, email will work without it
  }

  try {
    const attachments = [
      {
        filename: emailData.pdfFilename,
        content: emailData.pdfBase64,
        encoding: 'base64'
      }
    ];

    if (logoAttachment) {
      attachments.push(logoAttachment);
    }

    const info = await transport.sendMail({
      from: `SS Clothes Sumerpur <${fromEmail}>`,
      to: emailData.to,
      replyTo: process.env.REPLY_TO_EMAIL || fromEmail,
      subject: `Order Confirmation #${emailData.orderData.orderId.substring(0, 8).toUpperCase()} - SS Clothes Sumerpur`,
      html: generateOrderEmailHTML(emailData.orderData, logoBase64),
      text: generateOrderEmailText(emailData.orderData),
      attachments
    });

    console.log('Email sent successfully:', info.messageId);

    return {
      success: true,
      emailId: info.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
