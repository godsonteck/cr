import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProductReview } from '../types';
import { api } from '../lib/api';

interface ReviewsContextType {
  reviews: ProductReview[];
  loading: boolean;
  fetchAllReviews: () => Promise<ProductReview[]>;
  getReviewsForProduct: (productId: string) => Promise<ProductReview[]>;
  getProductRatingStats: (productId: string, defaultRating?: number, defaultCount?: number) => Promise<{
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
  }>;
  addReview: (review: Omit<ProductReview, 'id' | 'date' | 'helpfulCount'>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  replyToReview: (reviewId: string, replyText: string) => Promise<void>;
  markHelpful: (reviewId: string) => Promise<void>;
  clearAllReviews: () => Promise<void>;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);

  const getReviewsForProduct = async (productId: string) => {
    try {
      const data = await api.get<{ reviews: ProductReview[] }>(`/reviews?productId=${productId}&approved=true`);
      return data.reviews;
    } catch (e) {
      console.error('Failed to fetch reviews:', e);
      return [];
    }
  };

  const fetchAllReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ reviews: ProductReview[] }>('/reviews?admin=true');
      const results = data.reviews || [];
      setReviews(results);
      return results;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductRatingStats = useCallback(async (productId: string, defaultRating = 5.0, defaultCount = 0) => {
    try {
      const data = await api.get<{
        reviews: ProductReview[];
        stats: { averageRating: number; totalReviews: number; distribution: Record<number, number> };
      }>(`/reviews?productId=${productId}`);
      return data.stats || {
        averageRating: defaultRating,
        totalReviews: defaultCount,
        distribution: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    } catch (e) {
      return {
        averageRating: defaultRating,
        totalReviews: defaultCount,
        distribution: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
  }, []);

  const addReview = async (reviewData: Omit<ProductReview, 'id' | 'date' | 'helpfulCount'>) => {
    try {
      const newReview = await api.post<ProductReview>('/reviews', reviewData);
      setReviews(prev => [newReview, ...prev]);
    } catch (e) {
      console.error('Failed to add review:', e);
      throw e;
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await api.delete(`/reviews?id=${encodeURIComponent(reviewId)}`);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (e) {
      console.error('Failed to delete review:', e);
      throw e;
    }
  };

  const replyToReview = async (reviewId: string, replyText: string) => {
    try {
      await api.patch(`/reviews?id=${encodeURIComponent(reviewId)}`, { adminReply: replyText });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, adminReply: replyText } : r));
    } catch (e) {
      console.error('Failed to reply to review:', e);
      throw e;
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        await api.patch(`/reviews?id=${encodeURIComponent(reviewId)}`, { helpfulCount: (review.helpfulCount || 0) + 1 });
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r));
      }
    } catch (e) {
      console.error('Failed to mark helpful:', e);
      throw e;
    }
  };

  const clearAllReviews = async () => {
    try {
      await api.delete('/reviews?all=true');
      setReviews([]);
    } catch (e) {
      console.error('Failed to clear reviews:', e);
      throw e;
    }
  };

  return (
    <ReviewsContext.Provider value={{
      reviews,
      loading,
      fetchAllReviews,
      getReviewsForProduct,
      getProductRatingStats,
      addReview,
      deleteReview,
      replyToReview,
      markHelpful,
      clearAllReviews,
    }}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};