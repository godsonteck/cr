'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/utils/formatPrice';
import { BUSINESS } from '@/utils/constants';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { addToast } = useToast();

  // Active step: 1 = Contact, 2 = Delivery, 3 = Payment
  const [activeStep, setActiveStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    deliveryMethod: 'doorstep', // 'doorstep' | 'pickup'
    area: 'Botwe',
    address: '',
    gpsLandmark: '',
    deliveryNotes: '',
    paymentMethod: 'momo', // 'momo' | 'card' | 'cash'
    momoNetwork: 'mtn', // 'mtn' | 'telecel' | 'at'
    momoNumber: '',
  });

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  const deliveryFee = formData.deliveryMethod === 'pickup' ? 0 : subtotal >= 300 ? 0 : 25;
  const calculatedDiscount = promoApplied ? subtotal * 0.1 : 0;
  const calculatedTotal = Math.max(0, subtotal + deliveryFee - calculatedDiscount);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    if (promoCode.trim().toUpperCase() === 'WELCOME10' || promoCode.trim().toUpperCase() === 'GLOW10') {
      setPromoApplied(true);
      addToast({
        title: 'Promo Applied!',
        message: '10% discount has been applied to your order.',
        type: 'success',
      });
    } else {
      addToast({
        title: 'Invalid Code',
        message: 'Try code "WELCOME10" for 10% off.',
        type: 'error',
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step >= 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Please enter your full name';
      if (!formData.phone.trim()) {
        newErrors.phone = 'Please enter your phone number';
      } else if (formData.phone.trim().replace(/\D/g, '').length < 9) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Please enter your email address for your receipt';
      }
    }
    if (step >= 2 && formData.deliveryMethod === 'doorstep') {
      if (!formData.address.trim()) {
        newErrors.address = 'Please enter your delivery street address or landmark';
      }
    }
    if (step >= 3 && formData.paymentMethod === 'momo') {
      if (!formData.momoNumber.trim()) {
        newErrors.momoNumber = 'Please enter your Mobile Money wallet number';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (targetStep) => {
    if (validateStep(activeStep)) {
      setActiveStep(targetStep);
      window.scrollTo({ top: 140, behavior: 'smooth' });
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // Prepare items for API
      const apiItems = items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: apiItems,
          deliveryMethod: formData.deliveryMethod,
          paymentMethod: formData.paymentMethod,
          paymentNetwork: formData.momoNetwork === 'mtn' ? 'MTN MoMo' : formData.momoNetwork === 'telecel' ? 'Telecel Cash' : 'AT Money',
          momoWalletNumber: formData.momoNumber,
          discountAmount: calculatedDiscount,
          promoCode: promoApplied ? promoCode : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not complete order. Please review your cart.');
      }

      setOrderConfirmed({
        orderId: data.order.orderNumber,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: items.map(({ product, quantity }) => ({
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
          },
          quantity,
        })),
        subtotal,
        deliveryFee,
        discount: calculatedDiscount,
        total: data.order.total,
        customer: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          deliveryMethod: formData.deliveryMethod,
          area: formData.area,
          address: formData.address,
          paymentMethod: formData.paymentMethod,
          momoNetwork: formData.momoNetwork === 'mtn' ? 'MTN MoMo' : formData.momoNetwork === 'telecel' ? 'Telecel Cash' : 'AT Money',
        },
        orderStatus: data.order.orderStatus,
        paymentStatus: data.order.paymentStatus,
      });

      clearCart();
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setIsSubmitting(false);
      addToast({
        title: 'Order Placement Error',
        message: err.message || 'Could not complete order. Please review your cart.',
        type: 'error',
      });
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 01: ORDER SUCCESS SCREEN
  // ═══════════════════════════════════════════════════════════
  if (orderConfirmed) {
    return (
      <div className="confirmation-page-root">
        <div className="container confirmation-container">
          <div className="confirmation-luxe-card">
            <div className="conf-celebration-head">
              <div className="conf-check-orb">✓</div>
              <span className="conf-subtitle-pill">ORDER COMPLETED SUCCESSFULLY</span>
              <h1 className="conf-main-title">Thank You, {orderConfirmed.customer.fullName.split(' ')[0]}!</h1>
              <p className="conf-intro-text">
                Your order <strong className="order-id-txt">#{orderConfirmed.orderId}</strong> has been received and is being prepared with care at our Botwe storefront.
              </p>
            </div>

            <div className="receipt-summary-grid">
              <div className="receipt-pane">
                <h3 className="pane-title">Fulfillment Details</h3>
                <div className="receipt-info-rows">
                  <div className="r-row">
                    <span className="r-label">Customer:</span>
                    <strong className="r-val">{orderConfirmed.customer.fullName}</strong>
                  </div>
                  <div className="r-row">
                    <span className="r-label">Contact Phone:</span>
                    <strong className="r-val">{orderConfirmed.customer.phone}</strong>
                  </div>
                  <div className="r-row">
                    <span className="r-label">Email Receipt:</span>
                    <strong className="r-val">{orderConfirmed.customer.email}</strong>
                  </div>
                  <div className="r-row">
                    <span className="r-label">Fulfillment Mode:</span>
                    <strong className="r-val highlight-mode">
                      {orderConfirmed.customer.deliveryMethod === 'pickup'
                        ? `🏬 Free Store Pickup (${BUSINESS.location})`
                        : `🚚 Express Doorstep Dispatch (${orderConfirmed.customer.area})`}
                    </strong>
                  </div>
                  {orderConfirmed.customer.deliveryMethod === 'doorstep' && (
                    <div className="r-row">
                      <span className="r-label">Street / Landmark:</span>
                      <strong className="r-val">{orderConfirmed.customer.address}</strong>
                    </div>
                  )}
                  <div className="r-row">
                    <span className="r-label">Payment Mode:</span>
                    <strong className="r-val uppercase">
                      {orderConfirmed.customer.paymentMethod === 'momo'
                        ? `📱 Mobile Money (${orderConfirmed.customer.momoNetwork.toUpperCase()})`
                        : orderConfirmed.customer.paymentMethod === 'card'
                        ? '💳 Debit / Credit Card'
                        : '💵 Cash on Delivery'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="receipt-pane">
                <h3 className="pane-title">Items Ordered ({orderConfirmed.items.length})</h3>
                <div className="ordered-items-list">
                  {orderConfirmed.items.map((item) => (
                    <div key={item.product.id} className="ordered-item-row">
                      <img src={item.product.image} alt={item.product.name} className="ordered-thumb" />
                      <div className="ordered-details">
                        <div className="ordered-name">{item.product.name}</div>
                        <div className="ordered-meta">Qty: {item.quantity} • {formatPrice(item.product.price)}</div>
                      </div>
                      <div className="ordered-line-price">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="receipt-totals-table">
                  <div className="total-r-row">
                    <span>Subtotal:</span>
                    <span>{formatPrice(orderConfirmed.subtotal)}</span>
                  </div>
                  <div className="total-r-row">
                    <span>Delivery:</span>
                    <span>{orderConfirmed.deliveryFee === 0 ? 'FREE' : formatPrice(orderConfirmed.deliveryFee)}</span>
                  </div>
                  {orderConfirmed.discount > 0 && (
                    <div className="total-r-row discount-row">
                      <span>Promo Discount:</span>
                      <span>-{formatPrice(orderConfirmed.discount)}</span>
                    </div>
                  )}
                  <div className="total-r-row grand-total-row">
                    <span>Total Amount Paid:</span>
                    <span className="grand-val">{formatPrice(orderConfirmed.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="conf-actions-group">
              <Link href="/account/orders" className="btn-conf-solid">
                Track Order Status →
              </Link>
              <Link href="/shop" className="btn-conf-outline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
          .confirmation-page-root {
            background-color: #FAF8F9;
            padding: 48px 0 80px;
            min-height: 80vh;
          }
          .confirmation-container {
            max-width: 840px;
          }
          .confirmation-luxe-card {
            background: #FFFFFF;
            border: 1px solid #EBE4E7;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 16px 40px rgba(141, 75, 93, 0.08);
          }
          @media (max-width: 640px) {
            .confirmation-luxe-card {
              padding: 24px 16px;
            }
          }
          .conf-celebration-head {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 32px;
          }
          .conf-check-orb {
            width: 64px;
            height: 64px;
            border-radius: var(--radius-full);
            background: linear-gradient(135deg, #8D4B5D 0%, #B86B7E 100%);
            color: #FFFFFF;
            font-size: 28px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            box-shadow: 0 8px 20px rgba(141, 75, 93, 0.3);
          }
          .conf-subtitle-pill {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.5px;
            color: #8D4B5D;
            background: #FAF0F2;
            padding: 4px 14px;
            border-radius: var(--radius-full);
            margin-bottom: 8px;
          }
          .conf-main-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 30px;
            font-weight: 700;
            color: #1F1D2B;
            margin-bottom: 8px;
          }
          .conf-intro-text {
            font-size: 13.5px;
            color: #6E6875;
            max-width: 500px;
            line-height: 1.5;
          }
          .order-id-txt {
            color: #8D4B5D;
          }
          .receipt-summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 32px;
          }
          @media (max-width: 768px) {
            .receipt-summary-grid {
              grid-template-columns: 1fr;
            }
          }
          .receipt-pane {
            background: #FAF8F9;
            border: 1px solid #EDE5E8;
            border-radius: 14px;
            padding: 20px;
          }
          .pane-title {
            font-size: 12.5px;
            font-weight: 700;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            color: #1F1D2B;
            margin-bottom: 14px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ECE3E6;
          }
          .receipt-info-rows {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .r-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
          }
          .r-label {
            color: #7A747E;
          }
          .r-val {
            color: #1F1D2B;
            text-align: right;
            max-width: 60%;
          }
          .highlight-mode {
            color: #8D4B5D;
          }
          .ordered-items-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-height: 180px;
            overflow-y: auto;
            margin-bottom: 14px;
          }
          .ordered-item-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .ordered-thumb {
            width: 36px;
            height: 36px;
            border-radius: 6px;
            object-fit: cover;
            border: 1px solid #EAE3E6;
          }
          .ordered-details {
            flex: 1;
            min-width: 0;
          }
          .ordered-name {
            font-size: 11.5px;
            font-weight: 600;
            color: #1F1D2B;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .ordered-meta {
            font-size: 10.5px;
            color: #88818C;
          }
          .ordered-line-price {
            font-size: 11.5px;
            font-weight: 700;
            color: #1F1D2B;
          }
          .receipt-totals-table {
            border-top: 1px dashed #DDD4D8;
            padding-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .total-r-row {
            display: flex;
            justify-content: space-between;
            font-size: 11.5px;
            color: #6E6875;
          }
          .discount-row {
            color: #2E7D32;
            font-weight: 600;
          }
          .grand-total-row {
            font-size: 13.5px;
            font-weight: 800;
            color: #1F1D2B;
            padding-top: 6px;
            border-top: 1px solid #ECE3E6;
          }
          .grand-val {
            color: #8D4B5D;
            font-size: 15px;
          }
          .conf-actions-group {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn-conf-solid {
            background-color: #8D4B5D;
            color: #FFFFFF;
            font-size: 12px;
            font-weight: 700;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
          }
          .btn-conf-outline {
            border: 1px solid #D0C6CA;
            color: #1F1D2B;
            font-size: 12px;
            font-weight: 600;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 02: EMPTY CART GUARD
  // ═══════════════════════════════════════════════════════════
  if (items.length === 0) {
    return (
      <div className="container empty-checkout-wrap">
        <div className="empty-checkout-box">
          <div className="empty-cart-icon">🛍️</div>
          <h2 className="heading-2">Your Shopping Bag is Empty</h2>
          <p className="empty-cart-sub">
            Add your favourite skincare formulations or everyday grocery essentials to proceed to checkout.
          </p>
          <Link href="/shop" className="btn-explore-store">
            Explore Store Catalogue →
          </Link>
        </div>
        <style jsx>{`
          .empty-checkout-wrap {
            padding: 80px 16px;
            max-width: 600px;
            text-align: center;
          }
          .empty-checkout-box {
            background: #FFFFFF;
            border: 1px solid #ECE4E7;
            border-radius: 16px;
            padding: 48px 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .empty-cart-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .empty-cart-sub {
            font-size: 14px;
            color: #6E6875;
            margin: 8px 0 24px;
          }
          .btn-explore-store {
            background-color: #8D4B5D;
            color: #FFFFFF;
            font-size: 13px;
            font-weight: 700;
            padding: 12px 28px;
            border-radius: 6px;
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 03: SPLIT-SCREEN LUXURY CHECKOUT
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="checkout-page-root">
      <div className="container checkout-container">
        <div className="checkout-top-head">
          <div className="checkout-brand-row">
            <span>🔒</span>
            <span>256-BIT ENCRYPTED LUXURY CHECKOUT</span>
          </div>
          <h1 className="checkout-title">Express Checkout</h1>
        </div>

        {/* 3-Step Navigation */}
        <div className="checkout-steps-nav">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`step-nav-btn ${activeStep === 1 ? 'active' : activeStep > 1 ? 'completed' : ''}`}
          >
            <span className="step-num">{activeStep > 1 ? '✓' : '1'}</span>
            <span className="step-txt">Contact Info</span>
          </button>
          <div className="step-nav-divider" />
          <button
            type="button"
            onClick={() => validateStep(1) && setActiveStep(2)}
            className={`step-nav-btn ${activeStep === 2 ? 'active' : activeStep > 2 ? 'completed' : ''}`}
          >
            <span className="step-num">{activeStep > 2 ? '✓' : '2'}</span>
            <span className="step-txt">Fulfillment</span>
          </button>
          <div className="step-nav-divider" />
          <button
            type="button"
            onClick={() => validateStep(2) && setActiveStep(3)}
            className={`step-nav-btn ${activeStep === 3 ? 'active' : ''}`}
          >
            <span className="step-num">3</span>
            <span className="step-txt">Payment</span>
          </button>
        </div>

        {/* 2-Column Split Grid */}
        <div className="checkout-split-grid">
          {/* Left Column: Forms */}
          <div className="checkout-forms-column">
            <form onSubmit={handleSubmitOrder} className="luxe-checkout-form">
              {/* STEP 1: CONTACT INFO */}
              {activeStep === 1 && (
                <div className="form-step-card">
                  <div className="step-card-header">
                    <h2 className="step-heading">1. Customer Contact Details</h2>
                    <p className="step-desc">We will use this info to send your order receipt and delivery updates.</p>
                  </div>

                  <div className="fields-stack">
                    <div className="input-group">
                      <label className="field-label">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Ama Serwaa"
                        className={`luxe-input ${errors.fullName ? 'has-error' : ''}`}
                      />
                      {errors.fullName && <span className="field-err">{errors.fullName}</span>}
                    </div>

                    <div className="fields-row-2">
                      <div className="input-group">
                        <label className="field-label">Phone / WhatsApp Number *</label>
                        <div className="phone-input-wrap">
                          <span className="phone-prefix">🇬🇭 +233</span>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="055 123 4567"
                            className={`luxe-input phone-field ${errors.phone ? 'has-error' : ''}`}
                          />
                        </div>
                        {errors.phone && <span className="field-err">{errors.phone}</span>}
                      </div>

                      <div className="input-group">
                        <label className="field-label">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          className={`luxe-input ${errors.email ? 'has-error' : ''}`}
                        />
                        {errors.email && <span className="field-err">{errors.email}</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNextStep(2)}
                      className="btn-continue-step"
                    >
                      Continue to Fulfillment →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: FULFILLMENT & DELIVERY */}
              {activeStep === 2 && (
                <div className="form-step-card">
                  <div className="step-card-header">
                    <h2 className="step-heading">2. Delivery & Fulfillment Method</h2>
                    <p className="step-desc">Select doorstep dispatch across Greater Accra or free in-store pickup in Botwe.</p>
                  </div>

                  <div className="fulfillment-options-grid">
                    <label className={`fulfillment-card ${formData.deliveryMethod === 'doorstep' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="doorstep"
                        checked={formData.deliveryMethod === 'doorstep'}
                        onChange={handleChange}
                        className="radio-sr"
                      />
                      <div className="f-icon">🚚</div>
                      <div className="f-info">
                        <strong className="f-title">Express Doorstep Delivery</strong>
                        <span className="f-sub">Greater Accra dispatch to your home or office</span>
                      </div>
                      <span className="f-price-tag">
                        {subtotal >= 300 ? 'FREE (Orders 300+)' : 'GHS 25.00'}
                      </span>
                    </label>

                    <label className={`fulfillment-card ${formData.deliveryMethod === 'pickup' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={formData.deliveryMethod === 'pickup'}
                        onChange={handleChange}
                        className="radio-sr"
                      />
                      <div className="f-icon">🏬</div>
                      <div className="f-info">
                        <strong className="f-title">Complimentary Store Pickup</strong>
                        <span className="f-sub">Botwe, near Galaxy International School</span>
                      </div>
                      <span className="f-price-tag free-tag">FREE</span>
                    </label>
                  </div>

                  {formData.deliveryMethod === 'doorstep' && (
                    <div className="doorstep-fields-wrap">
                      <div className="input-group">
                        <label className="field-label">Delivery Area / Neighborhood</label>
                        <select
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          className="luxe-select"
                        >
                          <option value="Botwe">Botwe / School Junction (Same Day)</option>
                          <option value="Madina">Madina (Same Day)</option>
                          <option value="East Legon">East Legon (Same Day)</option>
                          <option value="Adenta">Adenta (Same Day)</option>
                          <option value="Airport Residential">Airport Residential</option>
                          <option value="Cantonments">Cantonments / Labone</option>
                          <option value="Spintex">Spintex Road</option>
                          <option value="Osu">Osu / Ridge</option>
                          <option value="Tema">Tema / Community</option>
                          <option value="Other Accra">Other Greater Accra</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label className="field-label">Street Address & Landmark *</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="e.g. Hse 42, near Galaxy International School or Shell Station"
                          className={`luxe-input ${errors.address ? 'has-error' : ''}`}
                        />
                        {errors.address && <span className="field-err">{errors.address}</span>}
                      </div>

                      <div className="input-group">
                        <label className="field-label">GhanaPost GPS Digital Address (Optional)</label>
                        <input
                          type="text"
                          name="gpsLandmark"
                          value={formData.gpsLandmark}
                          onChange={handleChange}
                          placeholder="e.g. GD-123-4567"
                          className="luxe-input"
                        />
                      </div>
                    </div>
                  )}

                  {formData.deliveryMethod === 'pickup' && (
                    <div className="pickup-location-box">
                      <span className="pin-icon">📍</span>
                      <div>
                        <strong>CR Cosmetics & Essentials Storefront</strong>
                        <p>Botwe, near Galaxy International School, Accra, Ghana</p>
                        <span className="pickup-hours-pill">🕒 Mon – Sat: 9:00 AM – 8:00 PM</span>
                      </div>
                    </div>
                  )}

                  <div className="step-actions-row">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="btn-back-step"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNextStep(3)}
                      className="btn-continue-step"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT METHOD */}
              {activeStep === 3 && (
                <div className="form-step-card">
                  <div className="step-card-header">
                    <h2 className="step-heading">3. Payment & Security</h2>
                    <p className="step-desc">Select your preferred payment channel. All transactions are protected by 256-bit encryption.</p>
                  </div>

                  <div className="payment-options-grid">
                    {/* Mobile Money */}
                    <label className={`payment-card ${formData.paymentMethod === 'momo' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="momo"
                        checked={formData.paymentMethod === 'momo'}
                        onChange={handleChange}
                        className="radio-sr"
                      />
                      <div className="pay-card-head">
                        <div className="pay-icon">📱</div>
                        <div>
                          <strong className="pay-title">Mobile Money (Ghana)</strong>
                          <span className="pay-sub">MTN MoMo, Telecel Cash, AT Money</span>
                        </div>
                      </div>
                      <div className="momo-logos-row">
                        <span className="network-pill mtn">MTN</span>
                        <span className="network-pill telecel">Telecel</span>
                        <span className="network-pill at">AT</span>
                      </div>
                    </label>

                    {/* Card */}
                    <label className={`payment-card ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                        className="radio-sr"
                      />
                      <div className="pay-card-head">
                        <div className="pay-icon">💳</div>
                        <div>
                          <strong className="pay-title">Debit / Credit Card</strong>
                          <span className="pay-sub">Visa & Mastercard</span>
                        </div>
                      </div>
                      <div className="momo-logos-row">
                        <span className="card-brand-pill visa">VISA</span>
                        <span className="card-brand-pill mc">Mastercard</span>
                      </div>
                    </label>

                    {/* Cash */}
                    <label className={`payment-card ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                        className="radio-sr"
                      />
                      <div className="pay-card-head">
                        <div className="pay-icon">💵</div>
                        <div>
                          <strong className="pay-title">Cash / Card on Delivery</strong>
                          <span className="pay-sub">Pay safely when order arrives</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* MoMo Input Details */}
                  {formData.paymentMethod === 'momo' && (
                    <div className="momo-inputs-box">
                      <div className="input-group">
                        <label className="field-label">Select Network</label>
                        <div className="momo-networks-tabs">
                          {['mtn', 'telecel', 'at'].map((net) => (
                            <button
                              key={net}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, momoNetwork: net }))}
                              className={`momo-tab-btn ${formData.momoNetwork === net ? 'active' : ''}`}
                            >
                              {net.toUpperCase()} {net === 'mtn' ? 'MoMo' : 'Cash'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="input-group">
                        <label className="field-label">Mobile Money Phone Number *</label>
                        <input
                          type="tel"
                          name="momoNumber"
                          value={formData.momoNumber}
                          onChange={handleChange}
                          placeholder="e.g. 024 123 4567"
                          className={`luxe-input ${errors.momoNumber ? 'has-error' : ''}`}
                        />
                        {errors.momoNumber && <span className="field-err">{errors.momoNumber}</span>}
                      </div>
                    </div>
                  )}

                  <div className="step-actions-row">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="btn-back-step"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-submit-order"
                    >
                      {isSubmitting ? 'Securing Order...' : `Complete Order • ${formatPrice(calculatedTotal)}`}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="checkout-summary-column">
            <div className="sticky-summary-card">
              <div className="summary-head">
                <h3 className="summary-title">Order Summary</h3>
                <span className="summary-items-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="summary-items-scroll">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="summary-item-card">
                    <div className="summary-thumb-wrap">
                      <img src={product.image} alt={product.name} className="summary-thumb-img" />
                      <span className="item-qty-badge">{quantity}</span>
                    </div>
                    <div className="summary-item-info">
                      <div className="s-brand">{product.brand}</div>
                      <div className="s-name">{product.name}</div>
                    </div>
                    <div className="summary-item-price">
                      {formatPrice(product.price * quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleApplyPromo} className="summary-promo-form">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Discount code (e.g. WELCOME10)"
                  className="promo-input"
                />
                <button type="submit" className="btn-apply-promo">
                  Apply
                </button>
              </form>

              <div className="summary-breakdown">
                <div className="b-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="b-row">
                  <span>Delivery:</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <strong className="free-txt">FREE</strong>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="b-row discount-row">
                    <span>10% Promo Discount:</span>
                    <span>-{formatPrice(calculatedDiscount)}</span>
                  </div>
                )}
                <div className="b-row total-row">
                  <span>Grand Total:</span>
                  <span className="grand-price">{formatPrice(calculatedTotal)}</span>
                </div>
              </div>

              <div className="summary-trust-footer">
                <div className="trust-badge-item">
                  <span>🛡️</span>
                  <span>100% Genuine Distributor Sourcing</span>
                </div>
                <div className="trust-badge-item">
                  <span>📍</span>
                  <span>Direct Dispatch from Botwe, Ghana</span>
                </div>
                <div className="trust-badge-item">
                  <span>🔒</span>
                  <span>256-Bit Encrypted Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkout-page-root {
          background-color: #FAF8F9;
          padding: 36px 0 80px;
          min-height: 85vh;
        }
        .checkout-container {
          max-width: 1160px;
        }
        .checkout-top-head {
          margin-bottom: 24px;
        }
        .checkout-brand-row {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #8D4B5D;
          margin-bottom: 6px;
        }
        .checkout-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 32px;
          font-weight: 700;
          color: #1F1D2B;
        }

        /* 3-Step Navigation */
        .checkout-steps-nav {
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #ECE4E7;
          border-radius: 12px;
          padding: 8px 16px;
          margin-bottom: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .step-nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 14px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .step-nav-btn.active {
          background: #FAF0F2;
        }
        .step-num {
          width: 22px;
          height: 22px;
          border-radius: var(--radius-full);
          background: #EAE3E6;
          color: #7A7276;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .step-nav-btn.active .step-num {
          background: #8D4B5D;
          color: #FFFFFF;
        }
        .step-nav-btn.completed .step-num {
          background: #2E7D32;
          color: #FFFFFF;
        }
        .step-txt {
          font-size: 12px;
          font-weight: 700;
          color: #1F1D2B;
        }
        .step-nav-divider {
          flex: 1;
          height: 1px;
          background: #ECE4E7;
          margin: 0 12px;
        }

        /* 2-Column Split Grid */
        .checkout-split-grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 36px;
          align-items: flex-start;
        }
        @media (max-width: 1024px) {
          .checkout-split-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Left Column Card */
        .form-step-card {
          background: #FFFFFF;
          border: 1px solid #ECE4E7;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
        }
        @media (max-width: 640px) {
          .form-step-card {
            padding: 20px 16px;
          }
        }
        .step-card-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #F0E8EB;
        }
        .step-heading {
          font-size: 18px;
          font-weight: 700;
          color: #1F1D2B;
          margin-bottom: 4px;
        }
        .step-desc {
          font-size: 12px;
          color: #6E6875;
          line-height: 1.4;
        }

        /* Form Inputs */
        .fields-stack {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .fields-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .fields-row-2 {
            grid-template-columns: 1fr;
          }
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #2D2926;
        }
        .luxe-input {
          height: 44px;
          padding: 0 14px;
          border: 1px solid #DCD4D7;
          border-radius: 6px;
          font-size: 13px;
          color: #1F1D2B;
          background: #FFFFFF;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .luxe-input:focus {
          outline: none;
          border-color: #8D4B5D;
          box-shadow: 0 0 0 3px rgba(141, 75, 93, 0.12);
        }
        .luxe-input.has-error {
          border-color: #D32F2F;
        }
        .field-err {
          font-size: 11px;
          color: #D32F2F;
          font-weight: 500;
        }
        .phone-input-wrap {
          display: flex;
          align-items: center;
          border: 1px solid #DCD4D7;
          border-radius: 6px;
          overflow: hidden;
          background: #FFFFFF;
        }
        .phone-prefix {
          padding: 0 12px;
          font-size: 12px;
          font-weight: 700;
          color: #6E6875;
          background: #FAF7F8;
          border-right: 1px solid #EAE3E6;
          height: 44px;
          display: flex;
          align-items: center;
        }
        .phone-field {
          flex: 1;
          border: none;
        }

        /* Fulfillment Options */
        .fulfillment-options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 20px;
        }
        @media (max-width: 640px) {
          .fulfillment-options-grid {
            grid-template-columns: 1fr;
          }
        }
        .fulfillment-card {
          border: 1.5px solid #E2D9DC;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #FFFFFF;
        }
        .fulfillment-card.selected {
          border-color: #8D4B5D;
          background: #FAF2F4;
          box-shadow: 0 4px 14px rgba(141, 75, 93, 0.08);
        }
        .radio-sr {
          position: absolute;
          opacity: 0;
        }
        .f-icon {
          font-size: 24px;
        }
        .f-title {
          font-size: 13px;
          font-weight: 700;
          color: #1F1D2B;
        }
        .f-sub {
          font-size: 11px;
          color: #6E6875;
          line-height: 1.3;
        }
        .f-price-tag {
          font-size: 11px;
          font-weight: 800;
          color: #8D4B5D;
          margin-top: 4px;
        }
        .f-price-tag.free-tag {
          color: #2E7D32;
        }

        /* Doorstep Fields */
        .doorstep-fields-wrap {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #FAF8F9;
          border: 1px solid #ECE4E7;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 24px;
        }
        .luxe-select {
          height: 44px;
          padding: 0 12px;
          border: 1px solid #DCD4D7;
          border-radius: 6px;
          font-size: 13px;
          background: #FFFFFF;
          color: #1F1D2B;
        }

        /* Pickup Location Box */
        .pickup-location-box {
          display: flex;
          gap: 12px;
          background: #FAF8F9;
          border: 1px solid #ECE4E7;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 24px;
        }
        .pin-icon {
          font-size: 24px;
        }
        .pickup-hours-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: #8D4B5D;
          margin-top: 4px;
        }

        /* Payment Options */
        .payment-options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .payment-card {
          border: 1.5px solid #E2D9DC;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          background: #FFFFFF;
          transition: all 0.2s ease;
        }
        .payment-card.selected {
          border-color: #8D4B5D;
          background: #FAF2F4;
        }
        .pay-card-head {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pay-icon {
          font-size: 22px;
        }
        .pay-title {
          font-size: 13px;
          font-weight: 700;
          color: #1F1D2B;
        }
        .pay-sub {
          font-size: 11px;
          color: #6E6875;
          display: block;
        }
        .momo-logos-row {
          display: flex;
          gap: 6px;
        }
        .network-pill {
          font-size: 9px;
          font-weight: 800;
          padding: 3px 6px;
          border-radius: 4px;
          color: #FFFFFF;
        }
        .network-pill.mtn { background: #FFCC00; color: #000000; }
        .network-pill.telecel { background: #E60000; }
        .network-pill.at { background: #0044AA; }
        .card-brand-pill {
          font-size: 9px;
          font-weight: 800;
          padding: 3px 6px;
          border-radius: 4px;
          color: #FFFFFF;
        }
        .card-brand-pill.visa { background: #1A1F71; }
        .card-brand-pill.mc { background: #EB001B; }

        /* MoMo Inputs Box */
        .momo-inputs-box {
          background: #FAF8F9;
          border: 1px solid #ECE4E7;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .momo-networks-tabs {
          display: flex;
          gap: 8px;
        }
        .momo-tab-btn {
          flex: 1;
          height: 36px;
          background: #FFFFFF;
          border: 1px solid #DCD4D7;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .momo-tab-btn.active {
          background: #8D4B5D;
          color: #FFFFFF;
          border-color: #8D4B5D;
        }

        /* Buttons */
        .btn-continue-step {
          width: 100%;
          height: 48px;
          background-color: #8D4B5D;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .btn-continue-step:hover {
          background-color: #743746;
        }
        .step-actions-row {
          display: flex;
          gap: 12px;
        }
        .btn-back-step {
          height: 48px;
          padding: 0 20px;
          background: transparent;
          border: 1px solid #D0C6CA;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #1F1D2B;
          cursor: pointer;
        }
        .btn-submit-order {
          flex: 1;
          height: 48px;
          background-color: #8D4B5D;
          color: #FFFFFF;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(141, 75, 93, 0.3);
          transition: background-color 0.2s ease;
        }
        .btn-submit-order:hover {
          background-color: #743746;
        }

        /* Right Column Sticky Card */
        .sticky-summary-card {
          position: sticky;
          top: 100px;
          background: #FFFFFF;
          border: 1px solid #ECE4E7;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }
        .summary-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #F0E8EB;
          margin-bottom: 16px;
        }
        .summary-title {
          font-size: 15px;
          font-weight: 700;
          color: #1F1D2B;
        }
        .summary-items-count {
          font-size: 12px;
          color: #7A747E;
        }
        .summary-items-scroll {
          max-height: 240px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 18px;
        }
        .summary-item-card {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .summary-thumb-wrap {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;
          background: #F8F5F6;
          border: 1px solid #ECE4E7;
          flex-shrink: 0;
        }
        .summary-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .item-qty-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #8D4B5D;
          color: #FFFFFF;
          font-size: 9px;
          font-weight: 800;
          width: 16px;
          height: 16px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .summary-item-info {
          flex: 1;
          min-width: 0;
        }
        .s-brand {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #8D4B5D;
        }
        .s-name {
          font-size: 12px;
          font-weight: 600;
          color: #1F1D2B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .summary-item-price {
          font-size: 12.5px;
          font-weight: 700;
          color: #1F1D2B;
        }

        /* Promo Input */
        .summary-promo-form {
          display: flex;
          gap: 6px;
          margin-bottom: 18px;
          padding-top: 14px;
          border-top: 1px dashed #E2D9DC;
        }
        .promo-input {
          flex: 1;
          height: 38px;
          padding: 0 12px;
          border: 1px solid #DCD4D7;
          border-radius: 6px;
          font-size: 12px;
        }
        .btn-apply-promo {
          height: 38px;
          padding: 0 14px;
          background: #8D4B5D;
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        /* Financial Breakdown */
        .summary-breakdown {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 14px 0;
          border-top: 1px solid #F0E8EB;
          border-bottom: 1px solid #F0E8EB;
        }
        .b-row {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          color: #6E6875;
        }
        .free-txt {
          color: #2E7D32;
        }
        .discount-row {
          color: #2E7D32;
          font-weight: 600;
        }
        .total-row {
          font-size: 15px;
          font-weight: 800;
          color: #1F1D2B;
          padding-top: 6px;
        }
        .grand-price {
          color: #8D4B5D;
          font-size: 18px;
        }

        /* Trust Footer */
        .summary-trust-footer {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 11px;
          color: #7A747E;
        }
        .trust-badge-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>
    </div>
  );
}
