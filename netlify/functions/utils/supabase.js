/**
 * Supabase Client Utility
 * Handles all database operations using Supabase (PostgreSQL)
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (singleton pattern)
let supabaseClient = null;

/**
 * Get or create Supabase client
 * @returns {Object} - Supabase client instance
 */
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabaseClient;
};

/**
 * Create or find user by email
 * @param {Object} userData - User data (name, email, mobile)
 * @returns {Promise<string>} - User ID
 */
export const upsertUser = async (userData) => {
  const supabase = getSupabaseClient();

  try {
    // Check if user exists by email
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (user doesn't exist)
      throw findError;
    }

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: userData.name,
          mobile: userData.mobile
        })
        .eq('id', existingUser.id);

      if (updateError) throw updateError;

      return existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      return newUser.id;
    }
  } catch (error) {
    console.error('Error upserting user:', error);
    throw new Error('Failed to save user data');
  }
};

/**
 * Create order in database
 * @param {string} userId - User ID
 * @param {number} totalAmount - Total order amount
 * @returns {Promise<string>} - Order ID
 */
export const createOrder = async (userId, totalAmount) => {
  const supabase = getSupabaseClient();

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) throw error;

    return order.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
};

/**
 * Create order items in database
 * @param {string} orderId - Order ID
 * @param {Array} items - Array of order items
 * @returns {Promise<void>}
 */
export const createOrderItems = async (orderId, items) => {
  const supabase = getSupabaseClient();

  try {
    // Transform items for database insertion
    const orderItems = items.map(item => ({
      order_id: orderId,
      item_name: item.itemName,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }));

    const { error } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating order items:', error);
    throw new Error('Failed to save order items');
  }
};

/**
 * Get complete order details (for email generation)
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Complete order with user and items
 */
export const getOrderDetails = async (orderId) => {
  const supabase = getSupabaseClient();

  try {
    // Get order with user details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        users (
          name,
          email,
          mobile
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return {
      ...order,
      items
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw new Error('Failed to fetch order details');
  }
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status (e.g., 'completed', 'failed')
 * @returns {Promise<void>}
 */
export const updateOrderStatus = async (orderId, status) => {
  const supabase = getSupabaseClient();

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating order status:', error);
    // Don't throw - this is non-critical
  }
};
