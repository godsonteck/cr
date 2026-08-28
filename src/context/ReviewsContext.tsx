import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductReview } from '../types';

interface ReviewsContextType {
  reviews: ProductReview[];
  getReviewsForProduct: (productId: string) => ProductReview[];
  getProductRatingStats: (productId: string, defaultRating?: number, defaultCount?: number) => {
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>; // 5, 4, 3, 2, 1 star percentages
  };
  addReview: (review: Omit<ProductReview, 'id' | 'date' | 'helpfulCount'>) => void;
  deleteReview: (reviewId: string) => void;
  replyToReview: (reviewId: string, replyText: string) => void;
  markHelpful: (reviewId: string) => void;
  clearAllReviews: () => void;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

const REVIEWS_STORAGE_KEY = 'cr_product_reviews';

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.error(e);
    }
  }, [reviews]);

  const getReviewsForProduct = (productId: string) => {
    if (!Array.isArray(reviews)) return [];
    return reviews.filter(r => r.productId === productId);
  };

  const getProductRatingStats = (productId: string, defaultRating: number = 5.0, defaultCount: number = 0) => {
    const productReviews = (Array.isArray(reviews) ? reviews : []).filter(r => r.productId === productId);
    
    if (productReviews.length === 0) {
      return {
        averageRating: defaultRating,
        totalReviews: defaultCount,
        distribution: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalReviews = productReviews.length;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Number((sum / totalReviews).toFixed(1));

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach(r => {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    });

    const distribution: Record<number, number> = {
      5: Math.round((counts[5] / totalReviews) * 100),
      4: Math.round((counts[4] / totalReviews) * 100),
      3: Math.round((counts[3] / totalReviews) * 100),
      2: Math.round((counts[2] / totalReviews) * 100),
      1: Math.round((counts[1] / totalReviews) * 100)
    };

    return {
      averageRating,
      totalReviews,
      distribution
    };
  };

  const addReview = (reviewData: Omit<ProductReview, 'id' | 'date' | 'helpfulCount'>) => {
    const newReview: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'Just now',
      helpfulCount: 0
    };
    setReviews(prev => [newReview, ...(Array.isArray(prev) ? prev : [])]);
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => (Array.isArray(prev) ? prev.filter(r => r.id !== reviewId) : []));
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    setReviews(prev =>
      (Array.isArray(prev) ? prev : []).map(r => 
        r.id === reviewId ? { ...r, adminReply: replyText } : r
      )
    );
  };

  const markHelpful = (reviewId: string) => {
    setReviews(prev =>
      (Array.isArray(prev) ? prev : []).map(r => 
        r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
      )
    );
  };

  const clearAllReviews = () => {
    setReviews([]);
  };

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  return (
    <ReviewsContext.Provider value={{ 
      reviews: safeReviews, 
      getReviewsForProduct, 
      getProductRatingStats, 
      addReview, 
      deleteReview,
      replyToReview,
      markHelpful,
      clearAllReviews
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
