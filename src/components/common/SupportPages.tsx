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
  ChevronDown,
  ChevronUp,
  Search,
  Send,
  Clock,
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

export const AboutPage: React.FC = () => {
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
