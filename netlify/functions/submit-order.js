/**
 * Netlify Function: Submit Order
 * Main serverless function that handles order submission
 *
 * Flow:
 * 1. Validate request
 * 2. Save user to database (upsert)
 * 3. Create order in database
 * 4. Save order items
 * 5. Generate PDF invoice
 * 6. Send email with PDF attachment
 * 7. Return success response
 */

import { upsertUser, createOrder, createOrderItems, updateOrderStatus } from './utils/supabase.js';
import { generateInvoicePDF, generatePDFFilename, pdfToBase64 } from './utils/pdf-generator.js';
import { sendOrderConfirmationEmail } from './utils/resend.js';

/**
 * Validate request body
 * @param {Object} body - Request body
 * @returns {Object} - Validation result
 */
const validateRequest = (body) => {
  const errors = [];

  // Validate user data
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push('Invalid name');
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    errors.push('Invalid email');
  }

  if (!body.mobile || typeof body.mobile !== 'string' || body.mobile.length < 10) {
    errors.push('Invalid mobile number');
  }

  // Validate items
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('At least one item is required');
  } else {
    body.items.forEach((item, index) => {
      if (!item.itemName || typeof item.itemName !== 'string') {
        errors.push(`Item ${index + 1}: Invalid item name`);
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        errors.push(`Item ${index + 1}: Invalid price`);
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Invalid quantity`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Calculate total amount from items
 * @param {Array} items - Order items
 * @returns {number} - Total amount
 */
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

/**
 * Sanitize input to prevent XSS and injection attacks
 * @param {string} input - Input string
 * @returns {string} - Sanitized string
 */
const sanitize = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '').slice(0, 500);
};

/**
 * Main handler function
 * @param {Object} event - Netlify function event
 * @returns {Object} - HTTP response
 */
export const handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // In production, set this to your domain
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: 'Method not allowed',
        message: 'Only POST requests are accepted'
      })
    };
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid request',
          message: 'Request body must be valid JSON'
        })
      };
    }

    // Validate request
    const validation = validateRequest(requestBody);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Validation failed',
          errors: validation.errors
        })
      };
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitize(requestBody.name),
      email: sanitize(requestBody.email.toLowerCase()),
      mobile: sanitize(requestBody.mobile),
      items: requestBody.items.map(item => ({
        itemName: sanitize(item.itemName),
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity)
      }))
    };

    // Calculate total
    const totalAmount = calculateTotal(sanitizedData.items);

    console.log('Processing order for:', sanitizedData.email);

    // Step 1: Create/update user in database
    const userId = await upsertUser({
      name: sanitizedData.name,
      email: sanitizedData.email,
      mobile: sanitizedData.mobile
    });

    console.log('User upserted:', userId);

    // Step 2: Create order
    const orderId = await createOrder(userId, totalAmount);

    console.log('Order created:', orderId);

    // Step 3: Create order items
    await createOrderItems(orderId, sanitizedData.items);

    console.log('Order items created');

    // Step 4: Generate PDF invoice
    const pdfData = {
      orderId: orderId.substring(0, 8).toUpperCase(), // Short ID for display
      orderDate: new Date().toISOString(),
      userName: sanitizedData.name,
      userEmail: sanitizedData.email,
      userMobile: sanitizedData.mobile,
      items: sanitizedData.items,
      totalAmount
    };

    const pdfBytes = await generateInvoicePDF(pdfData);
    const pdfBase64 = pdfToBase64(pdfBytes);
    const pdfFilename = generatePDFFilename(orderId.substring(0, 8));

    console.log('PDF generated:', pdfFilename);

    // Step 5: Send email with PDF attachment
    const emailResult = await sendOrderConfirmationEmail({
      to: sanitizedData.email,
      orderData: pdfData,
      pdfBase64,
      pdfFilename
    });

    console.log('Email sent:', emailResult.emailId);

    // Step 6: Update order status to completed
    await updateOrderStatus(orderId, 'completed');

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Order submitted successfully',
        orderId: orderId.substring(0, 8).toUpperCase(),
        emailSent: true,
        emailId: emailResult.emailId,
        totalAmount
      })
    };

  } catch (error) {
    // Log error for debugging
    console.error('Error processing order:', error);

    // Determine error status code
    let statusCode = 500;
    let errorMessage = 'An error occurred while processing your order';

    // Handle specific errors
    if (error.message.includes('Supabase')) {
      errorMessage = 'Database error. Please try again later.';
    } else if (error.message.includes('email')) {
      errorMessage = 'Failed to send email. Order was saved but email delivery failed.';
      statusCode = 202; // Accepted but not fully completed
    } else if (error.message.includes('PDF')) {
      errorMessage = 'Failed to generate invoice PDF.';
    }

    // Return error response
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: 'Order processing failed',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      })
    };
  }
};
