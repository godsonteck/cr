'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { BUSINESS } from '@/utils/constants';

export default function ContactPage() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'order', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      addToast({
        title: 'Missing Fields',
        message: 'Please fill in your name, email, and message.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      addToast({
        title: 'Message Sent',
        message: 'Thank you! We will get back to you shortly.',
        type: 'success',
      });
    }, 600);
  };

  return (
    <div className="cr-contact-page">
      <div className="cr-contact-container">
        {/* ── Page Header ── */}
        <div className="cr-contact-header">
          <span className="cr-contact-eyebrow">CUSTOMER CARE & STORE DESK</span>
          <h1 className="cr-contact-title">Get in Touch with Us</h1>
          <p className="cr-contact-sub">
            Have questions about a skincare formulation, delivery fees, or placing a customized beauty order? We are here to assist.
          </p>
        </div>

        {/* ── 2-Column Contact & Form ── */}
        <div className="cr-contact-grid">
          {/* Left Column: Quick Info */}
          <div className="cr-contact-info-col">
            <div className="cr-info-card">
              <span className="cr-info-icon">📍</span>
              <div>
                <h3 className="cr-info-h">Store Location</h3>
                <p className="cr-info-p">Near Galaxy International School, Botwe, Greater Accra, Ghana</p>
              </div>
            </div>

            <div className="cr-info-card">
              <span className="cr-info-icon">💬</span>
              <div>
                <h3 className="cr-info-h">Instant WhatsApp Order</h3>
                <p className="cr-info-p">Need fast product recommendations or instant order tracking?</p>
                <a
                  href="https://wa.me/233592153306"
                  className="cr-contact-wa-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp: 059 215 3306 →
                </a>
              </div>
            </div>

            <div className="cr-info-card">
              <span className="cr-info-icon">🕒</span>
              <div>
                <h3 className="cr-info-h">Opening Hours</h3>
                <p className="cr-info-p">
                  Monday – Saturday: 8:00 AM – 8:00 PM<br />
                  Sunday: 10:00 AM – 6:00 PM
                </p>
              </div>
            </div>

            <div className="cr-info-card" id="delivery">
              <span className="cr-info-icon">🚚</span>
              <div>
                <h3 className="cr-info-h">Accra Delivery Rates</h3>
                <p className="cr-info-p">
                  • <strong>Botwe & Surroundings:</strong> GHS 15 – GHS 25<br />
                  • <strong>Greater Accra Central:</strong> GHS 25 – GHS 35<br />
                  • <strong>Orders above GHS 300:</strong> FREE Doorstep Delivery
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="cr-contact-form-col">
            <div className="cr-form-wrapper">
              <h2 className="cr-form-title">Send a Direct Message</h2>
              <p className="cr-form-desc">Fill out the details below and our team will respond within a few hours.</p>

              {submitted ? (
                <div className="cr-form-success">
                  <span className="cr-success-icon">✨</span>
                  <h3>Thank you for reaching out!</h3>
                  <p>We have received your message and will respond to {form.email} promptly.</p>
                  <button
                    type="button"
                    className="cr-btn-reset-form"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', phone: '', subject: 'order', message: '' });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="cr-contact-form">
                  <div className="cr-form-row">
                    <div className="cr-field">
                      <label htmlFor="contact-name">Full Name *</label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Akosua Mensah"
                        required
                      />
                    </div>
                    <div className="cr-field">
                      <label htmlFor="contact-phone">Phone / WhatsApp</label>
                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="e.g. 059 215 3306"
                      />
                    </div>
                  </div>

                  <div className="cr-field">
                    <label htmlFor="contact-email">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="cr-field">
                    <label htmlFor="contact-subject">Inquiry Subject</label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                    >
                      <option value="order">Order Inquiry / Delivery Status</option>
                      <option value="skincare">Skincare Product Recommendation</option>
                      <option value="wholesale">Wholesale / Bulk Essentials Inquiry</option>
                      <option value="general">General Store Question</option>
                    </select>
                  </div>

                  <div className="cr-field">
                    <label htmlFor="contact-message">Your Message *</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="How can we help with your skincare or essentials needs?"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="cr-btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending Message...' : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cr-contact-page {
          padding-top: var(--header-h, 74px);
          background: #FAF8F6;
          min-height: 100vh;
          padding-bottom: 5rem;
          font-family: var(--font-primary, sans-serif);
        }

        .cr-contact-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 2.5rem);
        }

        /* ── Header ── */
        .cr-contact-header {
          padding: clamp(3rem, 5vw, 4.5rem) 0 clamp(2rem, 3vw, 3rem);
          border-bottom: 1px solid #EBE2E6;
          margin-bottom: 3rem;
        }

        .cr-contact-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #BE4D6E;
          display: block;
          margin-bottom: 0.5rem;
        }

        .cr-contact-title {
          font-family: var(--font-display, serif);
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: #161114;
          line-height: 1.15;
          margin-bottom: 0.75rem;
        }

        .cr-contact-sub {
          font-size: 1rem;
          color: #6B5B63;
          max-width: 54ch;
          line-height: 1.6;
        }

        /* ── Grid ── */
        .cr-contact-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: clamp(2rem, 4vw, 3.5rem);
          align-items: start;
        }

        /* ── Info Cards ── */
        .cr-contact-info-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .cr-info-card {
          padding: 1.5rem;
          background: #FFFFFF;
          border: 1px solid #EBE2E6;
          border-radius: 10px;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .cr-info-icon {
          font-size: 1.5rem;
          line-height: 1;
        }

        .cr-info-h {
          font-family: var(--font-display, serif);
          font-size: 1.15rem;
          font-weight: 700;
          color: #161114;
          margin-bottom: 0.25rem;
        }

        .cr-info-p {
          font-size: 0.88rem;
          color: #55454C;
          line-height: 1.55;
        }

        .cr-contact-wa-link {
          display: inline-block;
          margin-top: 0.4rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #1E8E49;
          text-decoration: none;
        }

        .cr-contact-wa-link:hover {
          text-decoration: underline;
        }

        /* ── Form Wrapper ── */
        .cr-form-wrapper {
          padding: clamp(1.75rem, 3vw, 2.5rem);
          background: #FFFFFF;
          border: 1px solid #EBE2E6;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(107, 23, 51, 0.04);
        }

        .cr-form-title {
          font-family: var(--font-display, serif);
          font-size: 1.6rem;
          font-weight: 700;
          color: #161114;
          margin-bottom: 0.35rem;
        }

        .cr-form-desc {
          font-size: 0.88rem;
          color: #6B5B63;
          margin-bottom: 1.75rem;
        }

        .cr-contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .cr-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .cr-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .cr-field label {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #3D2D35;
        }

        .cr-field input,
        .cr-field select,
        .cr-field textarea {
          padding: 0.75rem 1rem;
          border: 1.5px solid #D8CAD0;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.9rem;
          color: #161114;
          background: #FAF8F6;
          outline: none;
          transition: border-color 0.2s;
        }

        .cr-field input:focus,
        .cr-field select:focus,
        .cr-field textarea:focus {
          border-color: #6B1733;
          background: #FFFFFF;
        }

        .cr-btn-submit {
          padding: 0.95rem;
          background: #6B1733;
          color: #FFFFFF;
          font-family: inherit;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
          margin-top: 0.5rem;
        }

        .cr-btn-submit:hover:not(:disabled) {
          background: #480E21;
        }

        .cr-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── Success State ── */
        .cr-form-success {
          text-align: center;
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .cr-success-icon {
          font-size: 2.5rem;
        }

        .cr-form-success h3 {
          font-family: var(--font-display, serif);
          font-size: 1.4rem;
          font-weight: 700;
          color: #161114;
        }

        .cr-form-success p {
          font-size: 0.9rem;
          color: #55454C;
          max-width: 34ch;
        }

        .cr-btn-reset-form {
          margin-top: 1rem;
          padding: 0.65rem 1.25rem;
          background: #FAF8F6;
          border: 1px solid #D8CAD0;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.82rem;
          color: #161114;
          cursor: pointer;
        }

        /* ── Breakpoints ── */
        @media (max-width: 900px) {
          .cr-contact-grid {
            grid-template-columns: 1fr;
          }
          .cr-form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
