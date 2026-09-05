import React, { useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../common/UIPrimitives';
import { getWhatsAppUrl } from '../../lib/whatsapp';

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
    question: 'How quickly do you deliver?',
    answer: 'Orders are prepared and dispatched as quickly as possible. Express delivery may also be available for time-sensitive orders.',
  },
  {
    question: 'Do you process Mobile Money orders?',
    answer: 'Yes. We support secure Mobile Money payment options, and our support team can guide you through any order or confirmation questions.',
  },
  {
    question: 'Can I collect my order in person?',
    answer: 'Yes. Store pickup is available for eligible orders. Please contact our support team to confirm collection details and order readiness.',
  },
  {
    question: 'What if my item arrives damaged or incorrect?',
    answer: 'Reach out to us right away with your order number and a photo of the issue. We will guide you on replacement, refund, or corrective delivery options.',
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

export const AboutPage: React.FC = () => {
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
                CR Cosmetics began with a familiar problem: finding good everyday products should not require a long list of tabs, calls, and trips across town.
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


export const SupportPage: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C86D51]">Customer care</span>
        <h1 className="mx-auto max-w-4xl font-serif text-3xl leading-tight tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">Support that keeps your order moving.</h1>
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

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.75rem] border border-[#E6DFD7] bg-white p-6 text-center dark:border-[#36322E] dark:bg-[#1C1917]">
          <Phone className="mx-auto h-6 w-6 text-[#C86D51]" />
          <h4 className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">Customer line</h4>
          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{storeSettings.storePhone || '+233 59 215 3306'}</p>
        </div>

        <div className="rounded-[1.75rem] border border-[#E6DFD7] bg-white p-6 text-center dark:border-[#36322E] dark:bg-[#1C1917]">
          <MessageCircle className="mx-auto h-6 w-6 text-[#25D366]" />
          <h4 className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">WhatsApp</h4>
          <a
            href={getWhatsAppUrl(storeSettings.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-sm font-semibold text-[#25D366] hover:underline"
          >
            Chat with us
          </a>
        </div>

        <div className="rounded-[1.75rem] border border-[#E6DFD7] bg-white p-6 text-center dark:border-[#36322E] dark:bg-[#1C1917]">
          <Mail className="mx-auto h-6 w-6 text-[#C86D51]" />
          <h4 className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">Email</h4>
          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{storeSettings.storeEmail}</p>
        </div>

        <div className="rounded-[1.75rem] border border-[#E6DFD7] bg-white p-6 text-center dark:border-[#36322E] dark:bg-[#1C1917]">
          <MapPin className="mx-auto h-6 w-6 text-[#C86D51]" />
          <h4 className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">Store</h4>
          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{storeSettings.storeAddress}</p>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-full bg-[#F5F0EB] p-2 text-[#C86D51] dark:bg-stone-800">
              <HelpCircle className="h-4 w-4" />
            </div>
            <h2 className="font-serif text-3xl text-[var(--text-primary)]">Frequently asked questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-[var(--border-color)] bg-white/40 p-4 dark:bg-stone-900/50">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8">
          <h2 className="font-serif text-3xl text-[var(--text-primary)]">Need a quick answer?</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            For order updates, payment confirmation, or general support, send us a message and our team will respond as quickly as possible.
          </p>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-start gap-3 text-[var(--text-muted)]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#C86D51]" />
              <span>Friendly, human support from a real customer care team.</span>
            </div>
            <div className="flex items-start gap-3 text-[var(--text-muted)]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#C86D51]" />
              <span>Fast guidance for delivery updates, complaints, and product concerns.</span>
            </div>
            <div className="flex items-start gap-3 text-[var(--text-muted)]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#C86D51]" />
              <span>Convenient WhatsApp support for shoppers and repeat customers.</span>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={getWhatsAppUrl(storeSettings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" className="w-full justify-center gap-2 rounded-full px-4 py-2.5">
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </Button>
            </a>
            <Link to="/shop">
              <Button variant="outline" className="w-full justify-center gap-2 rounded-full px-4 py-2.5">
                Continue shopping
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C86D51]">Contact CR Cosmetics and Essential</span>
        <h1 className="mt-3 max-w-3xl font-serif text-3xl leading-tight tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">Let&apos;s help you find what you need.</h1>
        <p className="mt-5 text-sm leading-7 text-[var(--text-muted)] sm:text-base">Reach the team for product questions, order changes, delivery guidance, or anything else about your shopping experience.</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <a href={`tel:${storeSettings.storePhone || '+233592153306'}`} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 transition hover:border-[#C86D51]">
          <Phone className="h-6 w-6 text-[#C86D51]" />
          <h2 className="mt-5 text-sm font-extrabold text-[var(--text-primary)]">Call us</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{storeSettings.storePhone || '+233 59 215 3306'}</p>
        </a>
        <a href={`mailto:${storeSettings.storeEmail}`} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 transition hover:border-[#C86D51]">
          <Mail className="h-6 w-6 text-[#C86D51]" />
          <h2 className="mt-5 text-sm font-extrabold text-[var(--text-primary)]">Email us</h2>
          <p className="mt-2 break-words text-sm text-[var(--text-muted)]">{storeSettings.storeEmail}</p>
        </a>
          <a href={getWhatsAppUrl(storeSettings.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 transition hover:border-[#25D366]">
          <MessageCircle className="h-6 w-6 text-[#25D366]" />
          <h2 className="mt-5 text-sm font-extrabold text-[var(--text-primary)]">WhatsApp</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Chat with customer care</p>
        </a>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <MapPin className="mt-1 h-5 w-5 flex-none text-[#C86D51]" />
          <div><h2 className="text-sm font-extrabold text-[var(--text-primary)]">Visit or receive delivery</h2><p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{storeSettings.storeAddress || 'Accra, Ghana'}</p></div>
        </div>
      </div>
    </div>
  );
};
