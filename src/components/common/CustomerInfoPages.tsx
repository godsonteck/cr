import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, ShieldCheck, Star, ThumbsUp } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../lib/api';

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
  const [reviews, setReviews] = useState<Array<{
    id: string;
    rating: number;
    title?: string | null;
    comment: string;
    authorName: string;
    verifiedPurchase: boolean;
    helpfulCount: number;
    date: string;
    productName?: string | null;
    productImage?: string | null;
    productBrand?: string | null;
  }>>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async (isActive: () => boolean = () => true) => {
    try {
      const response = await api.get<{ reviews: typeof reviews; stats: typeof stats }>('/reviews?public=true');
      if (isActive()) {
        setReviews(response.reviews || []);
        setStats(response.stats || { averageRating: 0, totalReviews: 0 });
      }
    } catch {
      if (isActive()) setReviews([]);
    } finally {
      if (isActive()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void loadReviews(() => active);

    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadReviews(() => active);
    }, 15000);

    let reviewChannel: BroadcastChannel | null = null;
    try {
      reviewChannel = new BroadcastChannel('cr_reviews_channel');
      reviewChannel.onmessage = () => void loadReviews(() => active);
    } catch {
      reviewChannel = null;
    }

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      reviewChannel?.close();
    };
  }, [loadReviews]);

  return (
    <PageShell
      eyebrow="Customer feedback"
      title="What customers are saying."
      intro={`Real words from people who have ordered from ${storeSettings.storeName}. Product feedback, delivery experiences, and small reasons to come back.`}
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-subtle)]">Overall customer rating</p><div className="mt-2 flex items-center gap-3"><span className="font-serif text-4xl text-[var(--text-primary)]">{stats.averageRating ? stats.averageRating.toFixed(1) : '--'}</span><div><div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(value => <Star key={value} className={`h-4 w-4 ${value <= Math.round(stats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-[var(--border-color)]'}`} />)}</div><p className="mt-1 text-xs text-[var(--text-muted)]">{stats.totalReviews} published {stats.totalReviews === 1 ? 'review' : 'reviews'}</p></div></div></div>
        <Link to="/shop" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--text-primary)] px-4 text-xs font-bold text-[var(--bg-card)] transition hover:bg-[var(--accent)]">Shop customer favourites</Link>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center text-sm text-[var(--text-muted)]">Loading customer feedback...</div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3"><div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(value => <Star key={value} className={`h-4 w-4 ${value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-[var(--border-color)]'}`} />)}</div><time className="text-[10px] text-[var(--text-subtle)]">{new Date(review.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</time></div>
              {review.title && <h2 className="mt-4 font-serif text-xl text-[var(--text-primary)]">{review.title}</h2>}
              <p className="mt-3 flex-1 text-sm leading-7 text-[var(--text-muted)]">“{review.comment}”</p>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--border-color)] pt-4"><div><p className="text-xs font-bold text-[var(--text-primary)]">{review.authorName || 'CR customer'}</p>{review.verifiedPurchase && <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Verified purchase</p>}</div>{review.productName && <div className="flex max-w-[48%] items-center gap-2 text-right">{review.productImage && <img src={review.productImage} alt="" className="h-8 w-8 rounded-lg object-cover" />}<span className="line-clamp-2 text-[10px] font-semibold text-[var(--text-subtle)]">{review.productName}</span></div>}</div>
              {review.helpfulCount > 0 && <p className="mt-3 inline-flex items-center gap-1 text-[10px] text-[var(--text-subtle)]"><ThumbsUp className="h-3 w-3" /> {review.helpfulCount} found this helpful</p>}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center"><MessageCircle className="mx-auto h-7 w-7 text-[var(--accent)]" /><h2 className="mt-3 font-serif text-2xl text-[var(--text-primary)]">The first customer stories are on their way.</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Browse the shop and discover what people will be talking about next.</p></div>
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
