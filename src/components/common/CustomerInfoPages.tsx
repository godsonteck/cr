import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getWhatsAppUrl } from '../../lib/whatsapp';

const PageShell: React.FC<{ eyebrow: string; title: string; intro: string; children: React.ReactNode }> = ({ eyebrow, title, intro, children }) => (
  <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
    <header className="max-w-2xl">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">{eyebrow}</p>
      <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.03em] text-[var(--text-primary)] sm:text-5xl">{title}</h1>
      <p className="mt-5 text-sm leading-7 text-[var(--text-muted)] sm:text-base">{intro}</p>
    </header>
    <div className="mt-10 space-y-5">{children}</div>
  </div>
);

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-7">
    <h2 className="font-serif text-xl text-[var(--text-primary)] sm:text-2xl">{title}</h2>
    <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--text-muted)]">{children}</div>
  </section>
);

export const FeedbackPage: React.FC = () => {
  const { storeSettings } = useStore();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submitFeedback = (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating || !message.trim()) return;
    const text = `Hello ${storeSettings.storeName} team, I would like to share feedback.\n\nRating: ${rating}/5\nFeedback: ${message.trim()}`;
    window.open(getWhatsAppUrl(storeSettings.whatsappNumber, text), '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  return (
    <PageShell
      eyebrow="Your voice matters"
      title="Tell us how we are doing."
      intro="A short note helps us improve the products, delivery, and service we offer every day."
    >
      {sent ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />
          <h2 className="mt-3 font-serif text-2xl text-[var(--text-primary)]">Thank you for sharing.</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Your feedback window has opened in WhatsApp so our team can respond directly.</p>
          <button type="button" onClick={() => { setSent(false); setRating(0); setMessage(''); }} className="mt-5 text-xs font-bold text-[var(--accent)] hover:underline">Send another note</button>
        </div>
      ) : (
        <form onSubmit={submitFeedback} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-7">
          <fieldset>
            <legend className="text-sm font-bold text-[var(--text-primary)]">How was your experience?</legend>
            <div className="mt-3 flex gap-2" aria-label="Rating out of five">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} star${value === 1 ? '' : 's'}`} className="rounded-lg p-1 transition hover:bg-[var(--bg-soft)]">
                  <Star className={`h-7 w-7 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-[var(--border-color)]'}`} />
                </button>
              ))}
            </div>
          </fieldset>
          <label className="mt-6 block text-sm font-bold text-[var(--text-primary)]" htmlFor="feedback-message">Your feedback</label>
          <textarea id="feedback-message" required value={message} onChange={(event) => setMessage(event.target.value)} rows={6} placeholder="What worked well? What could be better?" className="mt-2 w-full resize-y rounded-xl border border-[var(--border-color)] bg-[var(--bg-soft)] px-3.5 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
          <button type="submit" disabled={!rating || !message.trim()} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--text-primary)] px-5 text-sm font-bold text-[var(--bg-card)] transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-45">
            <MessageCircle className="h-4 w-4" /> Share feedback
          </button>
        </form>
      )}
    </PageShell>
  );
};

export const TermsPage: React.FC = () => (
  <PageShell eyebrow="Store terms" title="Terms of Service" intro="These terms explain the simple rules for using our website, placing orders, and contacting our team.">
    <InfoSection title="Using the store"><p>By using this website, you agree to provide accurate information, use the store lawfully, and keep your account details secure. We may update product details, prices, availability, or these terms when needed.</p></InfoSection>
    <InfoSection title="Orders and payment"><p>An order is confirmed after the items, delivery details, and payment method have been reviewed. Prices are shown in Ghana cedis unless stated otherwise. An item may become unavailable before dispatch; if that happens, we will contact you about a suitable alternative or refund.</p></InfoSection>
    <InfoSection title="Products and content"><p>We work to keep product descriptions, images, prices, and stock information accurate. Colour, packaging, and availability may vary slightly. Product content is provided for shopping guidance and does not replace professional medical advice.</p></InfoSection>
    <InfoSection title="Contact"><p>Questions about an order or these terms can be sent through our <Link className="font-bold text-[var(--accent)] hover:underline" to="/contact">Contact page</Link> or WhatsApp support.</p></InfoSection>
  </PageShell>
);

export const PrivacyPage: React.FC = () => (
  <PageShell eyebrow="Your information" title="Privacy Policy" intro="We collect only the information needed to process orders, provide support, and improve your experience with the store.">
    <InfoSection title="Information we use"><p>When you browse or shop, we may receive your name, email, phone number, delivery address, order details, and messages you send to our team. Payment details are handled by our payment partners; we do not store complete card or mobile money credentials.</p></InfoSection>
    <InfoSection title="How we use it"><p>We use this information to confirm and deliver orders, provide account features, respond to support requests, send relevant store updates, prevent fraud, and improve our products and service.</p></InfoSection>
    <InfoSection title="Your choices"><p>You may request access to, correction of, or deletion of your account information, subject to records we must retain for legal or operational reasons. You can also manage notification preferences from your account settings.</p></InfoSection>
    <InfoSection title="Keeping information safe"><p>We use reasonable technical and organisational safeguards and limit access to information needed to operate the store. No online service can guarantee absolute security, so please contact us promptly if you notice unusual account activity.</p></InfoSection>
  </PageShell>
);

export const DeliveryReturnsPage: React.FC = () => {
  const { storeSettings } = useStore();
  return (
    <PageShell eyebrow="Order care" title="Delivery & Returns" intro="Clear delivery expectations and a straightforward process when an order does not arrive as expected.">
      <InfoSection title="Delivery"><p>Delivery timing depends on your location and the method selected at checkout. Accra express orders are usually same-day or next-day, standard Greater Accra delivery is typically 24–48 hours, and other regions usually take 2–3 business days. Store pickup is available for eligible orders.</p><p>We use the phone number and address supplied at checkout to coordinate delivery. Please make sure someone is available to receive the order or include useful delivery notes.</p></InfoSection>
      <InfoSection title="Damaged, incorrect, or missing items"><p>Contact us within 48 hours of delivery through WhatsApp or the <Link className="font-bold text-[var(--accent)] hover:underline" to="/contact">Contact page</Link>. Include your order number and clear photos where relevant. We will review the issue and arrange a replacement, exchange, or refund where appropriate.</p></InfoSection>
      <InfoSection title="Returns and hygiene"><p>For hygiene and safety, opened skincare, cosmetics, fragrance, and personal-care products may not be eligible for return unless they arrived damaged, faulty, or incorrect. Unused items should remain sealed and in their original condition while we review the request.</p></InfoSection>
      <InfoSection title="Need help now?"><div className="flex flex-wrap items-center gap-3"><ShieldCheck className="h-5 w-5 text-[var(--accent)]" /><span>Our customer team can help with your order at {storeSettings.storePhone || 'our support line'}.</span><Link className="font-bold text-[var(--accent)] hover:underline" to="/support">Visit support</Link></div></InfoSection>
    </PageShell>
  );
};
