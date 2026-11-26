import React, { useEffect, useMemo, useState } from 'react';
import { Check, MessageSquare, Search, Trash2, X } from 'lucide-react';
import { useReviews } from '../../../context/ReviewsContext';
import { useStore } from '../../../context/StoreContext';
import { useAlert } from '../../../context/AlertContext';
import { api } from '../../../lib/api';
import { ProductReview } from '../../../types';

const fieldClass = 'neu-input';

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
  const visibleReviews = (reviews || []).filter(review => {
    const haystack = `${review?.authorName || ''} ${review?.title || ''} ${review?.comment || ''} ${productNames.get(review?.productId) || ''}`.toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.toLowerCase());
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
      <div className="flex flex-col gap-4 border-b border-stone-200/60 dark:border-white/5 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-sunken-sm mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B27A52] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B27A52] dark:text-[#d49970]">Reviews</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1E1719] dark:text-stone-100">Customer reviews</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500 dark:text-stone-400">Read customer feedback, publish reviews, and reply to questions.</p>
        </div>
        <span className="clay-badge clay-badge-warning py-1.5 px-3 text-xs font-bold">{pendingCount} pending</span>
      </div>

      <div className="clay-card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input className={`${fieldClass} pl-10`} placeholder="Search reviews, customers, or products" value={query} onChange={event => setQuery(event.target.value)} />
          </label>
          <select className={`${fieldClass} sm:w-48 cursor-pointer`} value={filter} onChange={event => setFilter(event.target.value as typeof filter)}>
            <option value="all">All reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Published</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="clay-card p-12 text-center text-sm text-stone-500">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-[#B27A52] mb-3" />
            Loading reviews...
          </div>
        )}
        {!loading && visibleReviews.map(review => (
          <article key={review.id} className="clay-card-interactive p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-[#B27A52] dark:text-[#d49970]">{productNames.get(review.productId) || 'Product removed'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2.5">
                  <span className="font-bold font-serif text-stone-900 dark:text-stone-100">{review.authorName}</span>
                  <span className="text-amber-500 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  <span className={`clay-badge text-[10px] ${review.isApproved ? 'clay-badge-success' : 'clay-badge-warning'}`}>{review.isApproved ? 'Published' : 'Pending'}</span>
                </div>
                <h2 className="mt-2 font-bold text-stone-900 dark:text-stone-100 text-base">{review.title || 'Customer review'}</h2>
                <p className="mt-1.5 text-sm leading-6 text-stone-600 dark:text-stone-300">{review.comment}</p>
                {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {review.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block neu-sunken p-1 rounded-xl">
                        <img src={img} alt={`Review photo ${i + 1}`} className="h-14 w-14 rounded-lg object-cover hover:opacity-80 transition" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {!review.isApproved && (
                  <button className="clay-btn-primary py-1.5 px-3 text-xs" onClick={() => void approve(review, true)}>
                    <Check className="h-3.5 w-3.5" /> Publish
                  </button>
                )}
                {review.isApproved && (
                  <button className="clay-btn-secondary py-1.5 px-3 text-xs text-amber-700 dark:text-amber-300" onClick={() => void approve(review, false)}>
                    <X className="h-3.5 w-3.5" /> Unpublish
                  </button>
                )}
                <button className="clay-card-sm p-2 text-stone-400 hover:text-rose-600 transition" aria-label="Delete review" onClick={() => void remove(review)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row pt-3 border-t border-stone-200/50 dark:border-white/5">
              <input className={`${fieldClass} text-xs`} placeholder={review.adminReply || 'Reply publicly to this customer...'} value={replyDrafts[review.id] || ''} onChange={event => setReplyDrafts(previous => ({ ...previous, [review.id]: event.target.value }))} />
              <button className="clay-btn-primary py-2 px-4 text-xs shrink-0" onClick={() => void saveReply(review)}>
                <MessageSquare className="h-3.5 w-3.5" /> Reply
              </button>
            </div>
            {review.adminReply && (
              <div className="mt-2.5 neu-sunken-sm p-2.5 text-xs text-stone-600 dark:text-stone-300">
                <span className="font-bold text-[#B27A52]">Public staff response:</span> {review.adminReply}
              </div>
            )}
          </article>
        ))}
        {!loading && visibleReviews.length === 0 && (
          <div className="clay-card p-12 text-center text-sm text-stone-500">
            No reviews match this view.
          </div>
        )}
      </div>
    </div>
  );
};
