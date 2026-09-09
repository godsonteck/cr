import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  RefreshCcw,
  HelpCircle,
  Star,
  Heart,
  Leaf,
  Zap,
  ShoppingBag,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Send,
  Clock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../common/UIPrimitives';
import { getWhatsAppUrl } from '../../lib/whatsapp';
import logoImg from '../../assets/logo.jpeg';

const values = [
  {
    title: 'Browse',
    copy: 'Shop skincare, cosmetics, fragrances, personal care, and household essentials in one catalog.',
  },
  {
    title: 'Choose',
    copy: 'Compare product details, options, prices, and availability before adding an item to your cart.',
  },
  {
    title: 'Order',
    copy: 'Pay securely at checkout, receive your order updates, and contact customer care whenever you need help.',
  },
];

const supportHighlights = [
  {
    icon: Truck,
    title: 'Delivery support',
    description: 'Track your order, confirm delivery windows, and get help with shipping questions.',
  },
  {
    icon: ShieldCheck,
    title: 'Order assistance',
    description: 'Need a change, a product question, or help with payment confirmation? Our team can guide you quickly.',
  },
  {
    icon: RefreshCcw,
    title: 'Returns & exchanges',
    description: 'We help with damaged items, incorrect orders, and product concerns within our care policy.',
  },
];

const faqs = [
  {
    category: 'Delivery',
    question: 'How quickly do you deliver?',
    answer: 'Accra express orders are prepared and dispatched same-day or next-day. Standard deliveries within greater Accra take 24–48 hours, while deliveries to other regions typically take 2–3 business days.',
  },
  {
    category: 'Tracking',
    question: 'How do I track my order progress?',
    answer: 'You can track fulfillment and dispatch live in your Account > Orders & Tracking. Each stage (Confirmed, Processing, Packing Order, Out for Delivery, Delivered) updates automatically, including courier name, phone number, and delivery ETA.',
  },
  {
    category: 'Payment',
    question: 'Do you process Mobile Money & Paystack orders?',
    answer: 'Yes! We support secure online checkout via Paystack with instant verification, as well as MTN MoMo, Telecel Cash, and AT Money.',
  },
  {
    category: 'Pickup',
    question: 'Can I collect my order in person?',
    answer: 'Yes. Store pickup in Accra is available for eligible orders. Select Store Pickup at checkout, or contact customer care on WhatsApp to confirm collection timing.',
  },
  {
    category: 'Returns',
    question: 'What if my item arrives damaged or incorrect?',
    answer: 'Reach out to us on WhatsApp or through our Contact form within 48 hours with your order number and a photo of the item. We will arrange a free exchange, replacement, or refund immediately.',
  },
  {
    category: 'Authenticity',
    question: 'Are all skincare and cosmetic products genuine?',
    answer: '100% authentic. We partner directly with verified distributors and brands. Every batch is inspected for freshness, seal integrity, and genuine origin before dispatch.',
  },
];

/* ─── About Page ──────────────────────────────────────────────────────────── */

const pillars = [
  {
    icon: Heart,
    label: 'A useful edit',
    desc: 'We keep the range focused on products people actually reach for: skincare, beauty, home, and pantry basics.',
    color: 'from-rose-500/20 to-pink-500/10',
    iconColor: 'text-rose-500',
    border: 'border-rose-200/40 dark:border-rose-800/30',
  },
  {
    icon: Leaf,
    label: 'Brands we trust',
    desc: 'We look for familiar brands, clear product details, and dependable value before something joins the shop.',
    color: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-200/40 dark:border-emerald-800/30',
  },
  {
    icon: Zap,
    label: 'Close to home',
    desc: 'We build the service around practical delivery, clear updates, and real human help.',
    color: 'from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-600',
    border: 'border-amber-200/40 dark:border-amber-800/30',
  },
  {
    icon: ShieldCheck,
    label: 'No guesswork',
    desc: 'Prices, availability, payment steps, and order progress should be easy to understand from start to finish.',
    color: 'from-blue-500/20 to-sky-500/10',
    iconColor: 'text-blue-500',
    border: 'border-blue-200/40 dark:border-blue-800/30',
  },
];

const categories = [
  { label: 'Skin', emoji: '✦', description: 'Cleansers, treatments, moisturisers, and SPF.' },
  { label: 'Beauty', emoji: '◌', description: 'Makeup, brushes, tools, and everyday colour.' },
  { label: 'Scent', emoji: '⌁', description: 'Fragrance, body mists, and roll-ons.' },
  { label: 'Body & Hair', emoji: '○', description: 'Simple care for the routines you already have.' },
  { label: 'Pantry', emoji: '＋', description: 'Rice, oils, spices, and useful household staples.' },
  { label: 'Daily care', emoji: '□', description: 'The practical essentials that keep a home moving.' },
];

const stats = [
  { value: 'Simple', label: 'Shopping without the noise', icon: MapPin },
  { value: 'Beauty', label: 'At the heart of the shop', icon: Sparkles },
  { value: 'Daily', label: 'Essentials when you need them', icon: ShoppingBag },
  { value: 'Human', label: 'Support when it matters', icon: MessageCircle },
];

const LegacyAboutPage: React.FC = () => {
  const { storeSettings } = useStore();
  const heroBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroBgRef.current) {
        const scrollY = window.scrollY;
        heroBgRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[var(--bg-main)] overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[72vh] flex items-center overflow-hidden">
        {/* Parallax background */}
        <div
          ref={heroBgRef}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform',
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#1A0F0A]/90 via-[#1A0F0A]/70 to-transparent dark:from-black/95 dark:via-black/70" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#1A0F0A]/60 via-transparent to-transparent" />

        <div className="relative z-20 mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C86D51]/40 bg-[#C86D51]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E89070] backdrop-blur-sm mb-6">
              <Sparkles className="h-3 w-3" />
              Beauty, care, and everyday life
            </div>
            <h1 className="font-serif text-4xl leading-[1.12] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
              The things you<br />
              <span className="text-[#E89070]">reach for.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
              A considered shop for skincare, beauty, fragrance, and the everyday essentials that make life a little easier.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#C86D51] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#C86D51]/30 transition hover:bg-[#B05D41] hover:shadow-[#C86D51]/40">
                  Explore the shop <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link to="/beauty">
                <button className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                  See the beauty edit
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────────── */}
      <section className="border-y border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border-color)] md:grid-cols-4 md:divide-y-0">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2 py-8 px-4 text-center group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F0EB] text-[#C86D51] transition group-hover:bg-[#C86D51] group-hover:text-white dark:bg-stone-800 dark:group-hover:bg-[#C86D51]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-serif text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{value}</span>
                <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left: text */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F0EB] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6F4B3D] dark:bg-stone-800 dark:text-stone-200 mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Our story
            </div>
            <h2 className="font-serif text-3xl leading-tight tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
              A small shop with<br />a practical point of view.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--text-muted)] sm:text-base">
              <p>
                {storeSettings.storeName} began with a familiar problem: finding good everyday products should not require a long list of tabs, calls, and trips across town.
              </p>
              <p>
                So we built one straightforward place for the things people use, replace, and give as gifts — from a dependable moisturiser to the pantry item you forgot to pick up.
              </p>
              <p>
                We are still close enough to listen. The shop changes as customers ask better questions, find new favourites, and tell us what is missing.
              </p>
            </div>
            <ul className="mt-8 space-y-3">
              {[
                'A focused range instead of endless browsing',
                'Clear product information before you buy',
                'Delivery arranged around where you are',
                'A real team to contact when something is unclear',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#C86D51]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: image mosaic */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <div className="space-y-3 lg:space-y-4">
              <div className="overflow-hidden rounded-2xl aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80"
                  alt="Skincare products"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>
              <div className="overflow-hidden rounded-2xl aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"
                  alt="Groceries and essentials"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>
            </div>
            <div className="space-y-3 pt-8 lg:space-y-4 lg:pt-10">
              <div className="overflow-hidden rounded-2xl aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80"
                  alt="Makeup and cosmetics"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>
              <div className="overflow-hidden rounded-2xl aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80"
                  alt="Fragrances"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILLARS ──────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--bg-soft)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C86D51]">What we care about</span>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">
              Less noise. Better choices.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ icon: Icon, label, desc, color, iconColor, border }) => (
              <div
                key={label}
                className={`group relative overflow-hidden rounded-3xl border ${border} bg-gradient-to-br ${color} p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 dark:bg-black/30 ${iconColor} shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE CARRY ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 sm:py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C86D51]">Categories</span>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">
              Start with what you need.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
            Move between beauty and essentials without losing the simplicity of a good, focused shop.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ label, emoji, description }) => (
            <Link to="/shop" key={label}>
              <div className="group flex items-start gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 transition hover:border-[#C86D51]/50 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#F5F0EB] text-2xl dark:bg-stone-800 transition group-hover:scale-110">
                  {emoji}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[#C86D51] transition">{label}</h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── VISIT & CONTACT ──────────────────────────────────────────────────── */}
      <section className="border-y border-[var(--border-color)] bg-[var(--bg-card)] py-14 sm:py-18">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C86D51]">Find your way around</span>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">Everything in one place.</h2>
            <nav className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-semibold text-[var(--text-muted)]">
              <Link to="/shop" className="transition hover:text-[var(--accent)]">Shop everything</Link>
              <Link to="/beauty" className="transition hover:text-[var(--accent)]">Beauty</Link>
              <Link to="/groceries" className="transition hover:text-[var(--accent)]">Daily essentials</Link>
              <Link to="/support" className="transition hover:text-[var(--accent)]">Support</Link>
              <Link to="/contact" className="transition hover:text-[var(--accent)]">Contact us</Link>
            </nav>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C86D51]">Talk to the team</span>
            <div className="mt-5 space-y-3 text-sm text-[var(--text-muted)]">
              <a href={`tel:${storeSettings.storePhone}`} className="flex items-start gap-3 transition hover:text-[var(--accent)]">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#C86D51]" />
                <span>{storeSettings.storePhone}</span>
              </a>
              <a href={`mailto:${storeSettings.storeEmail}`} className="flex items-start gap-3 transition hover:text-[var(--accent)]">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#C86D51]" />
                <span className="break-all">{storeSettings.storeEmail}</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C86D51]" />
                <span>{storeSettings.storeAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="bg-[var(--bg-soft)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C86D51]">Shopping here</span>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">
              Keep it simple.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value, idx) => (
              <div key={value.title} className="relative rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-7">
                {/* Step number */}
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C86D51] text-xs font-black text-white shadow-md shadow-[#C86D51]/30">
                    {idx + 1}
                  </span>
                  {idx < values.length - 1 && (
                    <div className="hidden md:block absolute top-11 left-[calc(100%-1rem)] w-8 border-t-2 border-dashed border-[#C86D51]/30 z-10" />
                  )}
                </div>
                <h3 className="font-serif text-xl text-[var(--text-primary)]">{value.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{value.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&w=1600&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        <div className="absolute inset-0 bg-[#1A0F0A]/85 dark:bg-black/90" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <Star className="mx-auto mb-4 h-8 w-8 text-[#E89070]" />
          <h2 className="font-serif text-3xl leading-tight tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
            Find something good<br />
            <span className="text-[#E89070]">for your everyday.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
            Take a look around, choose what fits your routine, and we will take care of the rest.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/shop">
              <button className="inline-flex items-center gap-2 rounded-full bg-[#C86D51] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#C86D51]/30 transition hover:bg-[#B05D41]">
                <ShoppingBag className="h-4 w-4" />
                Browse the shop
              </button>
            </Link>
            <Link to="/beauty">
              <button className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                Shop beauty <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};


const PreviousAboutPage: React.FC = () => {
  const { storeSettings } = useStore();

  const promises = [
    { number: '01', title: 'Authentic products', copy: 'We focus on original beauty, personal-care, grocery, and home essentials from trusted supply channels.' },
    { number: '02', title: 'Clear choices', copy: 'Product details, prices, options, and availability stay visible before you commit to an order.' },
    { number: '03', title: 'Local delivery', copy: `We coordinate delivery from ${storeSettings.storeAddress || 'our Accra hub'} with updates that are easy to follow.` },
  ];

  return (
    <div className="overflow-x-hidden bg-[var(--bg-main)]">
      <section className="border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:px-8 lg:py-24">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">About {storeSettings.storeName}</p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.05] tracking-[-0.045em] text-[var(--text-primary)] sm:text-6xl">
              Beauty on one side.<br />Essentials on the other.<br /><span className="text-[var(--accent)]">One easy order.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
              {storeSettings.storeName} brings the products around your routine into one practical shop: skincare and fragrance, personal care and pantry basics, delivered with clear communication from checkout to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--text-primary)] px-5 text-sm font-bold text-[var(--bg-card)] transition hover:bg-[var(--accent)]">
                Shop the edit <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/delivery-returns" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-color)] px-5 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                Delivery details
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-[#201716] p-5 text-white sm:p-7">
            <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border border-[#E89070]/30" />
            <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full border border-[#E89070]/20" />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E89070]">The CR edit</p>
              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-4 border-b border-white/15 pb-5">
                  <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#E89070]" />
                  <div><p className="font-serif text-xl">Routine first</p><p className="mt-1 text-sm leading-6 text-white/65">Products chosen for how people actually use them, not just how they look on a shelf.</p></div>
                </div>
                <div className="flex items-start gap-4 border-b border-white/15 pb-5">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#E89070]" />
                  <div><p className="font-serif text-xl">Close to home</p><p className="mt-1 text-sm leading-6 text-white/65">A Ghanaian shopping experience with delivery options and direct support from a real team.</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-[#E89070]" />
                  <div><p className="font-serif text-xl">Human when needed</p><p className="mt-1 text-sm leading-6 text-white/65">Questions do not disappear into a form. We are available on WhatsApp, phone, and email.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Why this store exists</p>
            <h2 className="mt-3 max-w-md font-serif text-3xl leading-tight tracking-[-0.035em] text-[var(--text-primary)] sm:text-4xl">The useful things should be easy to find.</h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-[var(--text-muted)] sm:text-base">
            <p>Beauty shopping and everyday shopping often live in separate places. One tab for a cleanser, another trip for household basics, and a string of messages to confirm whether something is actually available.</p>
            <p>CR is built to reduce that friction. You can move from skincare to groceries, compare what matters, save your routine, and place one order with one delivery conversation.</p>
            <p>That is the standard we use when we add products and improve the store: does this make a customer&apos;s next order clearer, more useful, or easier to complete?</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border-color)] bg-[var(--bg-soft)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Our standard</p><h2 className="mt-3 font-serif text-3xl tracking-[-0.035em] text-[var(--text-primary)] sm:text-4xl">What you can expect from us.</h2></div>
            <Link to="/feedback" className="inline-flex items-center gap-1 text-sm font-bold text-[var(--accent)] hover:underline">Tell us how we are doing <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--border-color)] sm:grid-cols-3">
            {promises.map((promise) => (
              <div key={promise.number} className="bg-[var(--bg-card)] p-5 sm:p-7">
                <span className="text-xs font-black text-[var(--accent)]">{promise.number}</span>
                <h3 className="mt-8 font-serif text-xl text-[var(--text-primary)]">{promise.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{promise.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-8 rounded-3xl bg-[var(--text-primary)] p-6 text-[var(--bg-card)] sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E89070]">Start here</p><h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">Find the next thing your routine needs.</h2><p className="mt-3 text-sm leading-6 text-white/65">Browse the beauty edit, shop daily essentials, or ask our team for a recommendation.</p></div>
          <div className="flex shrink-0 flex-wrap gap-3"><Link to="/shop" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#C86D51] px-5 text-sm font-bold text-white transition hover:bg-[#B05D41]">Browse shop <ArrowRight className="h-4 w-4" /></Link><Link to="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-bold text-white transition hover:bg-white/10">Talk to us</Link></div>
        </div>
      </section>
    </div>
  );
};


export const AboutPage: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <div className="overflow-x-hidden bg-[#f5eee9] text-[#241c1a] dark:bg-[var(--bg-main)] dark:text-[var(--text-primary)]">
      <section className="border-b border-[#d9c9c0] dark:border-[var(--border-color)]">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 lg:pb-24">
          <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8d6555] dark:text-[var(--accent)]">
            <span>CR / About</span>
            <span className="hidden sm:inline">Beauty &amp; essentials, Ghana</span>
          </div>
          <div className="mt-8 grid gap-10 lg:mt-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-20">
            <div className="order-2 lg:order-1">
              <p className="max-w-sm font-serif text-lg leading-7 text-[#8d6555] dark:text-[var(--text-muted)] sm:text-xl">A considered shelf for skin, scent, and the everyday.</p>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.94] tracking-[-0.06em] text-[#241c1a] dark:text-[var(--text-primary)] sm:text-7xl lg:text-8xl">
                For the shelf,<br /><em className="font-normal text-[#a9664e] dark:text-[var(--accent)]">and the skin.</em>
              </h1>
              <p className="mt-8 max-w-xl text-sm leading-7 text-[#665550] dark:text-[var(--text-muted)] sm:text-base">
                {storeSettings.storeName} is a Ghanaian retail business for authentic cosmetics, skincare, fragrance, personal care, groceries, and everyday essentials. We bring these categories together online so customers can discover products, place one order, and arrange delivery without moving between different shops.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/shop" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#241c1a] px-5 text-sm font-bold text-[#fff9f5] transition hover:bg-[#a9664e] dark:bg-[var(--text-primary)] dark:text-[var(--bg-card)]">
                  Have a look around <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/feedback" className="inline-flex min-h-11 items-center rounded-full border border-[#c9b5aa] px-5 text-sm font-bold text-[#6b4c40] transition hover:border-[#a9664e] hover:text-[#a9664e] dark:border-[var(--border-color)] dark:text-[var(--text-muted)]">Leave us a note</Link>
              </div>
            </div>
            <div className="relative order-1 lg:order-2 lg:pb-3">
              <div className="relative overflow-hidden rounded-[2rem] bg-black shadow-[14px_16px_0_#e3d2c7] dark:bg-black dark:shadow-none">
                <div className="flex aspect-[4/5] items-center justify-center p-5 sm:p-8">
                  <img src={storeSettings.storeLogo || logoImg} onError={(event) => { event.currentTarget.src = logoImg; }} alt={`${storeSettings.storeName} logo`} className="h-full w-full rounded-full object-contain" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-16 sm:p-7 sm:pt-20"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f2b393]">Our business</p><p className="mt-2 max-w-xs font-serif text-2xl leading-tight text-white">Cosmetics, care, and essentials in one place.</p></div>
              </div>
              <div className="absolute -bottom-5 -left-4 rotate-[-5deg] border border-[#d8c4b8] bg-[#fffaf6] px-4 py-3 shadow-md dark:border-[var(--border-color)] dark:bg-[var(--bg-card)] sm:-left-8"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9664e] dark:text-[var(--accent)]">CR / with care</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a9664e] dark:text-[var(--accent)]">What the business does</p>
            <h2 className="mt-4 max-w-sm font-serif text-3xl leading-tight tracking-[-0.04em] sm:text-4xl">A retail business built around useful choices.</h2>
          </div>
          <div className="max-w-2xl space-y-5 text-sm leading-8 text-[#665550] dark:text-[var(--text-muted)] sm:text-base">
            <p>We source and present products across two connected parts of everyday life: beauty and personal care, plus groceries and household essentials. Customers can browse by department, compare product information, and shop across both in one storefront.</p>
            <p>Our work continues after the catalogue. We coordinate payments, order preparation, delivery across Ghana, and customer support through phone, email, and WhatsApp. The goal is a dependable service, not just a full-looking website.</p>
            <p>We do not believe a bigger catalogue automatically makes a better shop. We would rather make the products we carry easier to understand, easier to order, and worth returning for.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d9c9c0] bg-[#eee2da] dark:border-[var(--border-color)] dark:bg-[var(--bg-soft)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a9664e] dark:text-[var(--accent)]">What lives here</p><h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] sm:text-4xl">A shelf, not a warehouse.</h2></div>
            <span className="max-w-xs text-sm leading-6 text-[#76615a] dark:text-[var(--text-muted)]">A focused edit for skin, scent, care, and the practical bits of home.</span>
          </div>
          <div className="mt-10 divide-y divide-[#d3bfb4] border-y border-[#d3bfb4] dark:divide-[var(--border-color)] dark:border-[var(--border-color)]">
            {[
              ['01', 'Skin & routine', 'Cleansers, treatments, moisturisers, and SPF for the routine you are building now.', '/beauty'],
              ['02', 'Beauty & scent', 'Makeup, tools, fragrances, and body care for the days you want a little more.', '/beauty'],
              ['03', 'Everyday essentials', 'Groceries, household care, and useful basics for the days that simply need to work.', '/groceries'],
            ].map(([number, title, copy, href]) => (
              <Link key={number} to={href} className="group grid gap-3 py-6 sm:grid-cols-[4rem_0.7fr_1fr_auto] sm:items-center sm:gap-6">
                <span className="text-xs font-bold text-[#a9664e] dark:text-[var(--accent)]">{number}</span>
                <h3 className="font-serif text-2xl text-[#302320] transition group-hover:text-[#a9664e] dark:text-[var(--text-primary)]">{title}</h3>
                <p className="max-w-md text-sm leading-6 text-[#76615a] dark:text-[var(--text-muted)]">{copy}</p>
                <ArrowRight className="h-5 w-5 text-[#a9664e] transition group-hover:translate-x-1 dark:text-[var(--accent)]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-start lg:gap-24">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a9664e] dark:text-[var(--accent)]">A CR order, in real life</p>
            <h2 className="mt-4 max-w-lg font-serif text-4xl leading-tight tracking-[-0.045em] sm:text-5xl">From “I need this” to “it is here.”</h2>
            <div className="mt-10 space-y-0">
              {[
                ['Choose', 'Browse the edit, check the details, and add what makes sense for your routine.'],
                ['Confirm', 'We receive your order, check the essentials, and keep the delivery conversation clear.'],
                ['Receive', 'Your order travels across Ghana and arrives with updates you can actually follow.'],
              ].map(([title, copy], index) => (
                <div key={title} className="relative flex gap-5 pb-8 last:pb-0">
                  <div className="relative flex flex-col items-center"><span className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#a9664e] text-xs font-bold text-white">{index + 1}</span>{index < 2 && <span className="absolute top-8 h-full w-px bg-[#d8c4b8] dark:bg-[var(--border-color)]" />}</div>
                  <div className="pt-1"><h3 className="font-serif text-xl">{title}</h3><p className="mt-1 max-w-md text-sm leading-6 text-[#76615a] dark:text-[var(--text-muted)]">{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-l-2 border-[#a9664e] pl-6 sm:pl-8"><MessageCircle className="h-6 w-6 text-[#a9664e] dark:text-[var(--accent)]" /><blockquote className="mt-5 font-serif text-3xl leading-tight tracking-[-0.03em] text-[#302320] dark:text-[var(--text-primary)]">“The best shops make the next decision feel easier.”</blockquote><p className="mt-6 text-sm leading-6 text-[#76615a] dark:text-[var(--text-muted)]">That is what we are working towards, one product, one delivery, and one conversation at a time.</p><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9664e] dark:text-[var(--accent)]">The CR team · Ghana</p></div>
        </div>
      </section>

      <section className="bg-[#241c1a] text-[#fff9f5] dark:bg-[var(--bg-card)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 px-4 py-14 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e89a79]">Now you know us</p><h2 className="mt-3 max-w-xl font-serif text-3xl leading-tight sm:text-4xl">Come in for one thing. Leave with a better routine.</h2></div>
          <div className="flex flex-wrap gap-3"><Link to="/shop" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c86d51] px-5 text-sm font-bold text-white hover:bg-[#b45d45]">Shop now <ArrowRight className="h-4 w-4" /></Link><Link to="/contact" className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-sm font-bold text-white hover:bg-white/10">Talk to us</Link></div>
        </div>
      </section>
    </div>
  );
};


export const SupportPage: React.FC = () => {
  const { storeSettings } = useStore();
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0, 1]);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const categories = ['All', 'Delivery', 'Tracking', 'Payment', 'Returns', 'Authenticity'];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const supportPhone = storeSettings.storePhone || '+233 59 215 3306';
  const supportEmail = storeSettings.storeEmail || 'support@cr-cosmetics.com';
  const supportAddress = storeSettings.storeAddress || 'Accra, Ghana';

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C86D51]">Customer care</span>
        <h1 className="mx-auto max-w-4xl font-serif text-3xl leading-tight tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">
          Support that keeps your order moving.
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
          We are here to help with product questions, order updates, delivery coordination, and shopping support before and after checkout.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {supportHighlights.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            <div className="mb-4 inline-flex rounded-full bg-[#F5F0EB] p-3 text-[#C86D51] dark:bg-stone-800">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-serif text-[var(--text-primary)]">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{description}</p>
          </div>
        ))}
      </div>

      {/* Quick Reach Cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <a href={`tel:${String(supportPhone || '').replace(/\s+/g, '')}`} className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-center transition hover:border-[#C86D51] hover:shadow-sm">
          <Phone className="mx-auto h-6 w-6 text-[#C86D51]" />
          <h4 className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">Customer line</h4>
          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{supportPhone}</p>
        </a>

        <a
          href={getWhatsAppUrl(storeSettings.whatsappNumber, 'Hello CR Cosmetics team, I would like some assistance with my shopping/order.')}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-center transition hover:border-[#25D366] hover:shadow-sm"
        >
          <MessageCircle className="mx-auto h-6 w-6 text-[#25D366]" />
          <h4 className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">WhatsApp Support</h4>
          <p className="mt-2 text-sm font-semibold text-[#25D366]">Chat with Customer Care</p>
        </a>

        <a href={`mailto:${supportEmail}`} className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-center transition hover:border-[#C86D51] hover:shadow-sm">
          <Mail className="mx-auto h-6 w-6 text-[#C86D51]" />
          <h4 className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">Email</h4>
          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)] break-all">{supportEmail}</p>
        </a>

        <div className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-center">
          <MapPin className="mx-auto h-6 w-6 text-[#C86D51]" />
          <h4 className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">Store Location</h4>
          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{supportAddress}</p>
        </div>
      </div>

      {/* Interactive FAQ & Help Section */}
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#F5F0EB] p-2 text-[#C86D51] dark:bg-stone-800">
                <HelpCircle className="h-4 w-4" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[var(--text-primary)]">Frequently asked questions</h2>
            </div>
          </div>

          {/* FAQ Search & Category Filter */}
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search questions (e.g. delivery, tracking, payment)..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#1C1719] pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#C86D51]"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    selectedCategory === cat
                      ? 'bg-[#C86D51] text-white'
                      : 'border border-[var(--border-color)] bg-[var(--bg-soft)] text-[var(--text-muted)] hover:border-[#C86D51]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion FAQ Items */}
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndices.includes(idx);
                return (
                  <div
                    key={faq.question}
                    className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white/50 dark:bg-stone-900/40 transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="flex w-full items-center justify-between p-4 text-left font-bold text-sm text-[var(--text-primary)] hover:text-[#C86D51] transition"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-[#C86D51]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-stone-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs leading-6 text-[var(--text-muted)] border-t border-[var(--border-color)]/60 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="py-6 text-center text-xs text-[var(--text-muted)]">
                No matching questions found. Contact our team below and we will help you!
              </p>
            )}
          </div>
        </div>

        {/* Quick Assistance Card */}
        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-3xl text-[var(--text-primary)]">Need a quick answer?</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              For immediate order status checks, payment confirmation, or product suggestions, send us a direct message.
            </p>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-start gap-3 text-[var(--text-muted)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#C86D51] shrink-0" />
                <span>Direct WhatsApp contact with prompt dispatch updates.</span>
              </div>
              <div className="flex items-start gap-3 text-[var(--text-muted)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#C86D51] shrink-0" />
                <span>Fast guidance for delivery scheduling, order changes, and returns.</span>
              </div>
              <div className="flex items-start gap-3 text-[var(--text-muted)]">
                <Clock className="mt-0.5 h-4 w-4 text-[#C86D51] shrink-0" />
                <span>Support hours: Mon – Sat, 8:00 AM – 7:00 PM GMT.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={getWhatsAppUrl(storeSettings.whatsappNumber, 'Hello CR Cosmetics care team, I need help with an order.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="secondary" className="w-full justify-center gap-2 rounded-full px-4 py-3 font-bold bg-[#25D366] text-white hover:bg-[#1EBE5D]">
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </Button>
            </a>
            <Link to="/contact" className="flex-1">
              <Button variant="outline" className="w-full justify-center gap-2 rounded-full px-4 py-3 font-bold">
                Send an Inquiry
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { storeSettings } = useStore();
  const [fullName, setFullName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [inquiryType, setInquiryType] = useState('Order Status & Delivery');
  const [message, setMessage] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const supportPhone = storeSettings.storePhone || '+233 59 215 3306';
  const supportEmail = storeSettings.storeEmail || 'support@cr-cosmetics.com';
  const supportAddress = storeSettings.storeAddress || 'Accra, Ghana';

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedMsg = `*New Customer Inquiry*\n\n*Name:* ${fullName || 'Customer'}\n*Contact:* ${contactInfo || 'Not provided'}\n*Inquiry Type:* ${inquiryType}\n${orderNumber ? `*Order #:* ${orderNumber}\n` : ''}\n*Message:*\n${message || 'Hello, I need assistance.'}`;
    const url = getWhatsAppUrl(storeSettings.whatsappNumber, formattedMsg);
    window.open(url, '_blank');
    setSubmittedMessage(true);
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !contactInfo || !message) return;
    setSubmittedMessage(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C86D51]">Contact {storeSettings.storeName}</span>
        <h1 className="mt-3 max-w-3xl font-serif text-3xl leading-tight tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">
          Let&apos;s help you find what you need.
        </h1>
        <p className="mt-5 text-sm leading-7 text-[var(--text-muted)] sm:text-base">
          Reach the team for product questions, order changes, delivery guidance, or anything else about your shopping experience.
        </p>
      </div>

      {/* Contact Channels */}
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <a href={`tel:${String(supportPhone || '').replace(/\s+/g, '')}`} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 transition hover:border-[#C86D51] hover:shadow-sm">
          <Phone className="h-6 w-6 text-[#C86D51]" />
          <h2 className="mt-5 text-sm font-extrabold text-[var(--text-primary)]">Call us</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{supportPhone}</p>
        </a>
        <a href={`mailto:${supportEmail}`} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 transition hover:border-[#C86D51] hover:shadow-sm">
          <Mail className="h-6 w-6 text-[#C86D51]" />
          <h2 className="mt-5 text-sm font-extrabold text-[var(--text-primary)]">Email us</h2>
          <p className="mt-2 break-words text-sm text-[var(--text-muted)]">{supportEmail}</p>
        </a>
        <a
          href={getWhatsAppUrl(storeSettings.whatsappNumber, 'Hello CR Cosmetics care team, I have an inquiry.')}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 transition hover:border-[#25D366] hover:shadow-sm"
        >
          <MessageCircle className="h-6 w-6 text-[#25D366]" />
          <h2 className="mt-5 text-sm font-extrabold text-[var(--text-primary)]">WhatsApp</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Chat with customer care</p>
        </a>
      </div>

      {/* Interactive Contact & Inquiry Form */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="font-serif text-2xl text-[var(--text-primary)]">Send us a message</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Fill out this form and our support team will respond promptly.
            </p>
          </div>

          {submittedMessage ? (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-6 text-center space-y-3">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h3 className="font-bold text-emerald-800 dark:text-emerald-200">Thank you! Your message was received.</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Our customer team is reviewing your message and will reach out to you shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmittedMessage(false);
                  setMessage('');
                }}
                className="mt-3 inline-block text-xs font-bold text-emerald-800 underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleDirectSubmit} className="space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-[var(--text-primary)] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#1C1719] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#C86D51]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--text-primary)] mb-1">Phone or Email *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0592153306 or email"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#1C1719] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#C86D51]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-[var(--text-primary)] mb-1">Inquiry Topic</label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#1C1719] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#C86D51]"
                  >
                    <option value="Order Status & Delivery">Order Status & Delivery</option>
                    <option value="Payment Confirmation">Payment Confirmation</option>
                    <option value="Return or Exchange">Return or Exchange</option>
                    <option value="Product Advice">Product Advice</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[var(--text-primary)] mb-1">Order # (if applicable)</label>
                  <input
                    type="text"
                    placeholder="e.g. CR-GH-5819"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#1C1719] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#C86D51]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-primary)] mb-1">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us how we can help you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#1C1719] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#C86D51]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleWhatsAppSubmit}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[#25D366]/20 transition hover:bg-[#1EBE5D]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat via WhatsApp
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#C86D51] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[#C86D51]/20 transition hover:bg-[#B05D41]"
                >
                  <Send className="h-4 w-4" />
                  Submit Inquiry
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Location / Hours Info Card */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8 space-y-4">
            <div className="flex items-start gap-4">
              <MapPin className="mt-1 h-5 w-5 flex-none text-[#C86D51]" />
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Visit or receive delivery</h3>
                <p className="mt-1 text-xs leading-6 text-[var(--text-muted)]">{supportAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-2 border-t border-[var(--border-color)]">
              <Clock className="mt-1 h-5 w-5 flex-none text-[#C86D51]" />
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Operating Hours</h3>
                <p className="mt-1 text-xs leading-6 text-[var(--text-muted)]">
                  Monday – Friday: 8:00 AM – 7:00 PM<br />
                  Saturday: 9:00 AM – 6:00 PM<br />
                  Sunday: WhatsApp & online dispatch inquiries only
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-2 border-t border-[var(--border-color)]">
              <Truck className="mt-1 h-5 w-5 flex-none text-[#C86D51]" />
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Delivery coverage</h3>
                <p className="mt-1 text-xs leading-6 text-[var(--text-muted)]">
                  Accra Express delivery same day. Nationwide delivery across all regions in Ghana.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
