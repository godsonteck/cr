import React from 'react';
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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../common/UIPrimitives';

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

export const AboutPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-6 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C86D51]">CR Cosmetics &amp; Essentials</span>
        <h1 className="font-serif text-4xl tracking-[-0.06em] text-[var(--text-primary)] sm:text-6xl">
          Products for your everyday routine.
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
          CR Cosmetics &amp; Essentials is an online shop for beauty, personal care, and household essentials. Browse the catalog, choose what suits you, and place your order in a few steps.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#F5F0EB] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6F4B3D] dark:bg-stone-800 dark:text-stone-200">
            <Sparkles className="h-3.5 w-3.5" />
            What we do
          </div>

          <div className="space-y-5 text-sm leading-7 text-[var(--text-muted)]">
            <p>
              We bring together skincare, cosmetics, fragrances, personal care, and household products so you can handle everyday shopping in one place.
            </p>
            <p>
              Product pages show the available details, options, prices, and stock. Orders are placed through checkout and supported by our customer care team.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">What we carry</h2>
          <ul className="mt-5 space-y-4 text-sm text-[var(--text-muted)]">
            {['Skincare and treatment products', 'Makeup and beauty tools', 'Fragrances and personal care', 'Household and daily essentials'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#C86D51]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {values.map((value) => (
          <div key={value.title} className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            <h3 className="text-lg font-serif text-[var(--text-primary)]">{value.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{value.copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C86D51]">Ready to shop?</p>
            <h2 className="mt-2 font-serif text-3xl text-[var(--text-primary)]">Explore your next favorite essential.</h2>
          </div>
          <Link to="/shop">
            <Button variant="secondary" className="gap-2 rounded-full px-4 py-2.5">
              Browse products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const SupportPage: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C86D51]">Customer care</span>
        <h1 className="font-serif text-4xl tracking-[-0.05em] text-[var(--text-primary)] sm:text-6xl">Support that keeps your order moving.</h1>
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
            href={`https://wa.me/${storeSettings.whatsappNumber || '233592153306'}`}
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
              href={`https://wa.me/${storeSettings.whatsappNumber || '233592153306'}`}
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

export const ContactPage: React.FC = () => <SupportPage />;
