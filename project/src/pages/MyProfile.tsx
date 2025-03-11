// Payment.tsx
import React, { useState } from 'react';
import './Payment.css';

const Payment: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Payment submitted: $${amount}, Rating: ${rating}`);
    // Add your payment processing logic here
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1 className="payment-title">Payment</h1>
        
        <form onSubmit={handleSubmit} className="payment-form">
          {/* Amount Input */}
          <div className="form-group">
            <label htmlFor="amount" className="form-label">
              Payment Amount
            </label>
            <div className="input-container">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="amount-input"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Rating */}
          <div className="form-group">
            <label className="form-label">Rate the Work</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="star-button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <svg
                    className={`star-icon ${
                      (hoverRating || rating) >= star ? 'filled' : ''
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={!amount || rating === 0}
          >
            Submit Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;