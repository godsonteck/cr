'use client';

import React from 'react';
import Link from 'next/link';

const VALUES = [
  {
    icon: '◈',
    title: 'Authenticity',
    desc: 'Every product we carry is 100% genuine, sourced directly from trusted distributors.',
  },
  {
    icon: '◇',
    title: 'Accessibility',
    desc: "Premium skincare and daily essentials shouldn't require a trip to the city. We bring them to Botwe.",
  },
  {
    icon: '◆',
    title: 'Community',
    desc: "We are your neighbours. We care about the people we serve and the community we're part of.",
  },
  {
    icon: '✦',
    title: 'Quality',
    desc: "We curate carefully — only stocking products we'd confidently use ourselves.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ paddingTop: 'var(--header-h)' }}>
      {/* ── Hero ── */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 9rem) var(--container-pad)',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        borderBottom: '1px solid var(--mist-border)',
      }}>
        <p className="section-label" style={{ marginBottom: 'var(--space-5)' }}>Our story</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 8vw, 7rem)',
          fontWeight: 'var(--weight-light)',
          color: 'var(--warm-white)',
          letterSpacing: 'var(--tracking-tight)',
          lineHeight: 0.95,
          maxWidth: '18ch',
          marginBottom: 'var(--space-10)',
        }}>
          Beauty within<br />
          <em style={{ fontStyle: 'italic', color: 'var(--burgundy)' }}>reach</em>
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-12)',
          alignItems: 'start',
        }}>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-dim)', lineHeight: 'var(--leading-relaxed)', maxWidth: '50ch' }}>
            CR Cosmetics & Essentials was born from a simple observation:
            the people of Botwe deserved access to quality skincare and
            everyday groceries — without the long trip to the city.
          </p>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-dim)', lineHeight: 'var(--leading-relaxed)', maxWidth: '50ch', marginTop: 'var(--space-2)' }}>
            Tucked in the heart of Botwe, near Galaxy International School,
            we&apos;ve made it our mission to bring world-class products to
            your neighbourhood. From The Ordinary serums to CeraVe moisturisers,
            from Nescafé to Premium Basmati — all under one roof.
          </p>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{
        padding: 'clamp(4rem, 6vw, 7rem) var(--container-pad)',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        borderBottom: '1px solid var(--mist-border)',
      }} aria-labelledby="values-heading">
        <p className="section-label" style={{ marginBottom: 'var(--space-4)' }}>What we stand for</p>
        <h2 id="values-heading" className="section-title" style={{ marginBottom: 'var(--space-12)' }}>
          Our Values
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          {VALUES.map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--mist)',
              border: '1px solid var(--mist-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}>
              <span style={{ fontSize: '1.5rem', color: 'var(--burgundy)', fontFamily: 'var(--font-mono)' }}>
                {icon}
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--warm-white)', fontWeight: 'var(--weight-medium)' }}>
                {title}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)', lineHeight: 'var(--leading-relaxed)' }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Location ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '400px',
      }} aria-labelledby="location-heading">
        <div style={{
          background: 'var(--burgundy)',
          padding: 'clamp(3rem, 6vw, 6rem)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 'var(--space-5)',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', color: 'rgba(245,240,232,0.6)' }}>
            Find us
          </p>
          <h2 id="location-heading" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 'var(--weight-light)', color: 'var(--warm-white)', lineHeight: 1.1 }}>
            Visit our store in Botwe
          </h2>
          <address style={{ fontStyle: 'normal', fontSize: 'var(--text-base)', color: 'rgba(245,240,232,0.75)', lineHeight: 'var(--leading-relaxed)' }}>
            Near Galaxy International School<br />
            Botwe, Accra<br />
            Ghana
          </address>
          <Link href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)',
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wider)', color: 'rgba(245,240,232,0.6)',
            textDecoration: 'none', borderBottom: '1px solid rgba(245,240,232,0.2)',
            paddingBottom: 'var(--space-2)', width: 'fit-content',
          }}>
            Get in touch →
          </Link>
        </div>
        <div style={{
          background: 'var(--mist)',
          padding: 'clamp(3rem, 6vw, 6rem)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 'var(--space-8)',
        }}>
          {[
            { label: 'Opening Hours', value: 'Mon–Sat: 8am – 8pm\nSun: 10am – 6pm' },
            { label: 'Phone', value: '+233 59 215 3306' },
            { label: 'WhatsApp', value: '059 215 3306' },
            { label: 'Email', value: 'hello@crcosmetics.gh' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', color: 'var(--text-faint)', marginBottom: 'var(--space-2)' }}>
                {label}
              </p>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--warm-white)', whiteSpace: 'pre-line' }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: 'clamp(4rem, 7vw, 7rem) var(--container-pad)',
        textAlign: 'center',
        borderTop: '1px solid var(--mist-border)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 4rem)',
          fontWeight: 'var(--weight-light)', color: 'var(--warm-white)',
          letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-8)',
        }}>
          Ready to shop?
        </h2>
        <Link href="/shop" className="hero__cta-primary">
          Browse All Products
        </Link>
      </section>
    </div>
  );
}
