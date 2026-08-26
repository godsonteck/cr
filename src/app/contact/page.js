'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/utils/constants';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Phase 2: POST to API
    setSubmitted(true);
  };

  return (
    <div style={{ paddingTop: 'var(--header-h)', minHeight: '100vh' }}>
      <div className="contact-layout">
        {/* ── Left: Info ── */}
        <div>
          <p className="section-label" style={{ marginBottom: 'var(--space-5)' }}>Get in touch</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 6vw, 5.5rem)',
            fontWeight: 'var(--weight-light)',
            color: 'var(--warm-white)',
            letterSpacing: 'var(--tracking-tight)',
            lineHeight: 0.95,
            marginBottom: 'var(--space-10)',
          }}>
            We'd love to<br />
            <em style={{ fontStyle: 'italic', color: 'var(--burgundy)' }}>hear from you</em>
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {[
              {
                label: 'Visit Us',
                value: 'Near Galaxy International School\nBotwe, Accra, Ghana',
              },
              {
                label: 'Call or WhatsApp',
                value: '+233 59 215 3306 (059 215 3306)',
                href: 'https://wa.me/233592153306',
              },
              {
                label: 'Email',
                value: 'hello@crcosmetics.gh',
                href: 'mailto:hello@crcosmetics.gh',
              },
              {
                label: 'Opening Hours',
                value: 'Mon–Sat: 8am – 8pm\nSun: 10am – 6pm',
              },
            ].map(({ label, value, href }) => (
              <div key={label}>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-widest)',
                  color: 'var(--text-faint)',
                  marginBottom: 'var(--space-2)',
                }}>
                  {label}
                </p>
                {href ? (
                  <a href={href} style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--warm-white)',
                    textDecoration: 'none',
                    whiteSpace: 'pre-line',
                    transition: 'color var(--dur-fast)',
                  }}
                    onMouseEnter={e => e.target.style.color = 'var(--burgundy)'}
                    onMouseLeave={e => e.target.style.color = 'var(--warm-white)'}
                  >
                    {value}
                  </a>
                ) : (
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--warm-white)', whiteSpace: 'pre-line' }}>
                    {value}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Social links */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-10)', flexWrap: 'wrap' }}>
            {[
              { label: 'Instagram', href: 'https://instagram.com' },
              { label: 'Facebook', href: 'https://facebook.com' },
              { label: 'TikTok', href: 'https://tiktok.com' },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="footer-social__link" style={{ width: 'auto', padding: '0 var(--space-4)' }}>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div>
          {submitted ? (
            <div style={{
              background: 'var(--mist)',
              border: '1px solid var(--mist-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-12)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-5)',
            }}>
              <span style={{ fontSize: '3rem' }}>✦</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--warm-white)' }}>
                Message Received
              </h2>
              <p style={{ color: 'var(--text-dim)', maxWidth: '36ch', lineHeight: 'var(--leading-relaxed)' }}>
                Thank you for reaching out! We'll get back to you within 24 hours.
              </p>
              <Link href="/shop" className="btn btn-primary btn-sm">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div style={{
              background: 'var(--mist)',
              border: '1px solid var(--mist-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(2rem, 4vw, 3rem)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--warm-white)',
                marginBottom: 'var(--space-8)',
              }}>
                Send a Message
              </h2>

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-name">Name</label>
                      <input
                        className="input"
                        id="contact-name"
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-email">Email</label>
                      <input
                        className="input"
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-subject">Subject</label>
                    <select
                      className="input"
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                    >
                      <option value="">Select a topic</option>
                      <option value="order">Order Enquiry</option>
                      <option value="product">Product Question</option>
                      <option value="delivery">Delivery</option>
                      <option value="return">Returns</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-message">Message</label>
                    <textarea
                      className="input"
                      id="contact-message"
                      name="message"
                      rows={5}
                      placeholder="How can we help you?"
                      value={form.message}
                      onChange={handleChange}
                      required
                      style={{ resize: 'vertical', minHeight: '140px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    id="contact-submit"
                    disabled={!form.name || !form.email || !form.message}
                  >
                    Send Message
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
