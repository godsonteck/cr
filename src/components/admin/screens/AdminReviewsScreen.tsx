import React, { useEffect, useMemo, useState } from 'react';
import { Check, MessageSquare, Search, Trash2, X } from 'lucide-react';
import { useReviews } from '../../../context/ReviewsContext';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { api } from '../../../lib/api';
import { ProductReview } from '../../../types';

const fieldClass = 'w-full rounded-xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#2a2024] px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#1E1719]';

export const AdminReviewsScreen: React.FC = () => {
  const { reviews, loading, fetchAllReviews, replyToReview, deleteReview } = useReviews();
  const { products } = useStore();
  const { showAlert } = useAlert();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    void fetchAllReviews().catch(() => showAlert('Could not load reviews', 'error'));
  }, [fetchAllReviews, showAlert]);

  const productNames = useMemo(() => new Map(products.map(product => [product.id, product.name])), [products]);
  const visibleReviews = reviews.filter(review => {
    const haystack = `${review.authorName} ${review.title} ${review.comment} ${productNames.get(review.productId) || ''}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'approved' ? review.isApproved : review.isApproved === false);
    return matchesQuery && matchesFilter;
  });

  const approve = async (review: ProductReview, isApproved: boolean) => {
    try {
      await api.patch(`/reviews?id=${encodeURIComponent(review.id)}`, { isApproved });
      await fetchAllReviews();
      showAlert(isApproved ? 'Review approved and published' : 'Review moved to pending', 'success');
    } catch {
      showAlert('Could not update review status', 'error');
    }
  };

  const saveReply = async (review: ProductReview) => {
    const reply = replyDrafts[review.id]?.trim();
    if (!reply) return;
    try {
      await replyToReview(review.id, reply);
      setReplyDrafts(previous => ({ ...previous, [review.id]: '' }));
      showAlert('Reply saved', 'success');
    } catch {
      showAlert('Could not save reply', 'error');
    }
  };

  const remove = async (review: ProductReview) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await deleteReview(review.id);
      showAlert('Review deleted', 'success');
    } catch {
      showAlert('Could not delete review', 'error');
    }
  };

  const pendingCount = reviews.filter(review => review.isApproved === false).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 dark:border-[#2e2428] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B27A52]">Store trust</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#1E1719] dark:text-stone-100">Reviews</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-500 dark:text-stone-400">Moderate customer feedback, publish trusted reviews, and answer questions from one queue.</p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">{pendingCount} pending</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input className={`${fieldClass} pl-10`} placeholder="Search reviews, customers, or products" value={query} onChange={event => setQuery(event.target.value)} />
        </label>
        <select className={`${fieldClass} sm:w-44`} value={filter} onChange={event => setFilter(event.target.value as typeof filter)}>
          <option value="all">All reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Published</option>
        </select>
      </div>

      <div className="space-y-3">
        {loading && <p className="rounded-2xl border border-stone-200 p-8 text-center text-sm text-stone-500">Loading reviews...</p>}
        {!loading && visibleReviews.map(review => (
          <article key={review.id} className="rounded-2xl border border-stone-200 dark:border-[#2e2428] bg-white dark:bg-[#201b1a] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-[#B27A52]">{productNames.get(review.productId) || 'Product removed'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{review.authorName}</span>
                  <span className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${review.isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{review.isApproved ? 'Published' : 'Pending'}</span>
                </div>
                <h2 className="mt-2 font-semibold text-stone-900 dark:text-stone-100">{review.title || 'Customer review'}</h2>
                <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{review.comment}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!review.isApproved && <button className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white" onClick={() => void approve(review, true)}><Check className="h-4 w-4" />Publish</button>}
                {review.isApproved && <button className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 px-3 py-2 text-xs font-bold text-amber-700" onClick={() => void approve(review, false)}><X className="h-4 w-4" />Unpublish</button>}
                <button className="rounded-xl p-2 text-stone-400 hover:bg-red-50 hover:text-red-700" aria-label="Delete review" onClick={() => void remove(review)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input className={fieldClass} placeholder={review.adminReply || 'Reply publicly to this customer'} value={replyDrafts[review.id] || ''} onChange={event => setReplyDrafts(previous => ({ ...previous, [review.id]: event.target.value }))} />
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E1719] px-4 py-2.5 text-sm font-semibold text-white" onClick={() => void saveReply(review)}><MessageSquare className="h-4 w-4" />Reply</button>
            </div>
            {review.adminReply && <p className="mt-2 text-xs text-stone-500">Current reply: {review.adminReply}</p>}
          </article>
        ))}
        {!loading && visibleReviews.length === 0 && <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">No reviews match this view.</p>}
      </div>
    </div>
  );
};
