/**
 * API Service
 * Handles all communication with Netlify Functions (backend)
 */

const API_BASE_URL = '/api'; // Proxied to /.netlify/functions via Netlify config

/**
 * Submit order to backend
 * @param {Object} orderData - Order data including user info and items
 * @returns {Promise<Object>} - Response from backend
 */
export const submitOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submit-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    // Parse response
    const data = await response.json();

    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to submit order');
    }

    return data;
  } catch (error) {
    // Network errors or fetch failures
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your internet connection.');
    }

    // Re-throw other errors
    throw error;
  }
};

/**
 * Check API health (optional - for monitoring)
 * @returns {Promise<Object>} - Health status
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    return { status: 'unavailable', error: error.message };
  }
};

/**
 * Generic API call wrapper with retry logic
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries
 * @returns {Promise<Object>} - Response data
 */
export const apiCall = async (endpoint, options = {}, retries = 3) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    // Retry logic for network errors
    if (retries > 0 && error.message === 'Failed to fetch') {
      console.log(`Retrying... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      return apiCall(endpoint, options, retries - 1);
    }

    throw error;
  }
};
