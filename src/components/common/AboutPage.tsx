import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import logoImg from '../../assets/logo.jpeg';

export const AboutPage: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <div className="overflow-x-hidden bg-[#f7f1ed] text-[#2a211f] dark:bg-[var(--bg-main)] dark:text-[var(--text-primary)]">
      <section className="border-b border-[#dfd0c8] dark:border-[var(--border-color)]">
        <div className="mx-auto max-w-4xl px-5 pb-14 pt-7 sm:px-8 sm:pb-20 sm:pt-10">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a6b59] dark:text-[var(--accent)]">
            <span>About CR</span>
            <span>Beauty &amp; essentials</span>
          </div>

          <div className="mt-10 flex flex-col items-center text-center sm:mt-14">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-black p-5 shadow-[0_12px_0_#dfcfc5] sm:h-48 sm:w-48 sm:p-7">
              <img src={storeSettings.storeLogo || logoImg} onError={(event) => { event.currentTarget.src = logoImg; }} alt={`${storeSettings.storeName} logo`} className="h-full w-full rounded-full object-contain" />
            </div>
            <p className="mt-10 max-w-2xl font-serif text-3xl leading-[1.05] tracking-[-0.04em] sm:text-5xl">The things you need. The things that make you feel good.</p>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#705d56] dark:text-[var(--text-muted)] sm:text-base">{storeSettings.storeName} is a Ghanaian online shop for cosmetics, skincare, fragrance, personal care, groceries, and everyday essentials.</p>
            <Link to="/shop" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2a211f] px-5 text-sm font-bold text-[#fffaf7] transition hover:bg-[#a9664e] dark:bg-[var(--text-primary)] dark:text-[var(--bg-card)]">Browse the shop <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a9664e] dark:text-[var(--accent)]">A note from us</p>
        <div className="mt-5 grid gap-8 sm:grid-cols-[0.7fr_1.3fr] sm:gap-14">
          <h2 className="font-serif text-3xl leading-tight tracking-[-0.04em] sm:text-4xl">We made CR because shopping for everyday life should feel less scattered.</h2>
          <div className="space-y-5 text-sm leading-8 text-[#705d56] dark:text-[var(--text-muted)] sm:text-base">
            <p>Sometimes it is a cleanser. Sometimes it is a body lotion, a fragrance, a bag of rice, or the household thing you meant to pick up yesterday.</p>
            <p>We wanted those decisions to have one home: a place where you can see what is available, understand what you are buying, and get on with your day.</p>
            <p>We are a small team, so the way we work is simple. We choose useful products, keep the details honest, prepare orders carefully, and stay reachable when you need us.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dfd0c8] bg-[#eee3dc] dark:border-[var(--border-color)] dark:bg-[var(--bg-soft)]">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-18">
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
            <div><p className="text-2xl font-serif text-[#a9664e] dark:text-[var(--accent)]">01</p><h3 className="mt-4 font-serif text-xl">Beauty</h3><p className="mt-2 text-sm leading-6 text-[#705d56] dark:text-[var(--text-muted)]">Skincare, makeup, fragrance, body care, and tools for the routines you already have.</p></div>
            <div><p className="text-2xl font-serif text-[#a9664e] dark:text-[var(--accent)]">02</p><h3 className="mt-4 font-serif text-xl">Essentials</h3><p className="mt-2 text-sm leading-6 text-[#705d56] dark:text-[var(--text-muted)]">Groceries, household care, and practical items for the rest of the day.</p></div>
            <div><p className="text-2xl font-serif text-[#a9664e] dark:text-[var(--accent)]">03</p><h3 className="mt-4 font-serif text-xl">Care</h3><p className="mt-2 text-sm leading-6 text-[#705d56] dark:text-[var(--text-muted)]">Delivery across Ghana and a real person to reach by phone, email, or WhatsApp.</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4"><MessageCircle className="mt-1 h-5 w-5 shrink-0 text-[#a9664e] dark:text-[var(--accent)]" /><p className="max-w-md font-serif text-2xl leading-tight sm:text-3xl">Have a question, a suggestion, or a product you want us to find?</p></div>
          <Link to="/contact" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#a9664e] hover:underline dark:text-[var(--accent)]">Talk to us <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
};
