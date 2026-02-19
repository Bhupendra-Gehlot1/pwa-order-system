import { useState } from 'react';
import { validateOrderForm, sanitizeInput } from '../utils/validation';
import { submitOrder } from '../services/api';
import './OrderForm.css';

function OrderForm() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    items: []
  });

  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    itemName: '',
    price: '',
    quantity: '1'
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /**
   * Handle input changes for user info
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: sanitizeInput(value)
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Handle input changes for current item
   */
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize input based on field type
    let sanitizedValue = value;
    
    if (name === 'price') {
      // Only allow numbers and one decimal point
      sanitizedValue = value.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const parts = sanitizedValue.split('.');
      if (parts.length > 2) {
        sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
      }
      // Limit decimal places to 2
      if (parts.length === 2 && parts[1].length > 2) {
        sanitizedValue = parts[0] + '.' + parts[1].substring(0, 2);
      }
    } else if (name === 'quantity') {
      // Only allow positive integers
      sanitizedValue = value.replace(/[^0-9]/g, '');
    } else if (name === 'itemName') {
      // Remove potentially dangerous characters but allow normal text
      sanitizedValue = value.replace(/[<>]/g, '');
    }
    
    setCurrentItem(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  /**
   * Add item to the order
   */
  const addItem = (e) => {
    e.preventDefault();

    // Validate and sanitize item name
    const itemName = currentItem.itemName.trim();
    if (!itemName || itemName.length < 2) {
      alert('Please enter a valid item name (at least 2 characters)');
      return;
    }

    // Validate and parse price
    const priceValue = currentItem.price.toString().trim();
    if (!priceValue) {
      alert('Please enter a valid price');
      return;
    }

    const parsedPrice = parseFloat(priceValue);
    if (isNaN(parsedPrice) || parsedPrice <= 0 || !isFinite(parsedPrice)) {
      alert('Please enter a valid price (must be a positive number)');
      return;
    }

    // Validate and parse quantity
    const quantityValue = currentItem.quantity.toString().trim();
    if (!quantityValue) {
      alert('Please enter a valid quantity');
      return;
    }

    const parsedQuantity = parseInt(quantityValue, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0 || !isFinite(parsedQuantity) || parsedQuantity.toString() !== quantityValue) {
      alert('Please enter a valid quantity (must be a positive whole number)');
      return;
    }

    // Additional validation: check for reasonable limits
    if (parsedPrice > 1000000) {
      alert('Price is too high. Please enter a valid price.');
      return;
    }

    if (parsedQuantity > 10000) {
      alert('Quantity is too high. Please enter a valid quantity.');
      return;
    }

    // Sanitize item name to prevent XSS and ensure it's safe
    const sanitizedName = itemName.replace(/[<>]/g, '').substring(0, 200);

    // Add item to list
    const newItem = {
      itemName: sanitizedName,
      price: Math.round(parsedPrice * 100) / 100, // Round to 2 decimal places
      quantity: parsedQuantity
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset current item
    setCurrentItem({
      itemName: '',
      price: '',
      quantity: '1'
    });

    // Clear items error if it exists
    if (errors.items) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  };

  /**
   * Remove item from order
   */
  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  /**
   * Calculate total amount
   */
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0).toFixed(2);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setSubmitError('');
    setSubmitSuccess(false);

    // Validate form
    const validation = validateOrderForm(formData);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Submit to backend
    setIsSubmitting(true);

    try {
      const response = await submitOrder(formData);

      // Success
      setSubmitSuccess(true);
      setSubmitError('');

      // Show success message
      alert(`Order submitted successfully!\n\nOrder ID: ${response.orderId}\n\nAn email invoice has been sent to ${formData.email}`);

      // Reset form
      setFormData({
        name: '',
        email: '',
        mobile: '',
        items: []
      });

    } catch (error) {
      // Error handling
      console.error('Order submission error:', error);
      setSubmitError(error.message || 'Failed to submit order. Please try again.');
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="order-form-container">
      <div className="order-form-card">
        <h2 className="form-title">Create New Order</h2>

        {/* Success Message */}
        {submitSuccess && (
          <div className="alert alert-success">
            <strong>Success!</strong> Your order has been submitted and an email invoice has been sent.
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="alert alert-error">
            <strong>Error:</strong> {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* User Information Section */}
          <section className="form-section">
            <h3 className="section-title">Customer Information</h3>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="john@example.com"
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="mobile" className="form-label">
                Mobile Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className={`form-input ${errors.mobile ? 'input-error' : ''}`}
                placeholder="+1 (234) 567-8900"
                disabled={isSubmitting}
              />
              {errors.mobile && <span className="error-message">{errors.mobile}</span>}
            </div>
          </section>

          {/* Items Section */}
          <section className="form-section">
            <h3 className="section-title">Order Items</h3>

            {/* Add Item Form */}
            <div className="add-item-container">
              <div className="form-row">
                <div className="form-group flex-2">
                  <label htmlFor="itemName" className="form-label">Item Name</label>
                  <input
                    type="text"
                    id="itemName"
                    name="itemName"
                    value={currentItem.itemName}
                    onChange={handleItemChange}
                    className="form-input"
                    placeholder="Product name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="price" className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={currentItem.price}
                    onChange={handleItemChange}
                    className="form-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max="1000000"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="quantity" className="form-label">Qty</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={currentItem.quantity}
                    onChange={handleItemChange}
                    className="form-input"
                    placeholder="1"
                    min="1"
                    max="10000"
                    step="1"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group flex-0">
                  <label className="form-label">&nbsp;</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {errors.items && (
              <div className="error-message">
                {Array.isArray(errors.items) ? (
                  <ul>
                    {errors.items.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                ) : (
                  errors.items
                )}
              </div>
            )}

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="items-list">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>₹{item.price.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="btn-remove"
                            disabled={isSubmitting}
                            aria-label="Remove item"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan="3"><strong>Total</strong></td>
                      <td><strong>₹{calculateTotal()}</strong></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {formData.items.length === 0 && (
              <div className="empty-state">
                <p>No items added yet. Add items to your order above.</p>
              </div>
            )}
          </section>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting || formData.items.length === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Processing Order...
                </>
              ) : (
                'Submit Order & Send Invoice'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;
