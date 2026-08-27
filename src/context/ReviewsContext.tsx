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
}

const INITIAL_REVIEWS: ProductReview[] = [
  // The Ordinary Niacinamide
  {
    id: 'rev-ord-1',
    productId: 'ord-niacinamide-10',
    authorName: 'Akosua M.',
    rating: 5,
    date: '2 days ago',
    title: 'Cleared my breakouts in 2 weeks!',
    comment: 'Authentic product! I was skeptical at first because there are so many fake Ordinary serums around Accra, but this one is 100% genuine. My blemishes have faded significantly.',
    verifiedPurchase: true,
    skinType: 'Oily / Acne-Prone',
    helpfulCount: 14
  },
  {
    id: 'rev-ord-2',
    productId: 'ord-niacinamide-10',
    authorName: 'Eunice K.',
    rating: 5,
    date: '1 week ago',
    title: 'Controls oil under Accra heat',
    comment: 'A staple in my morning routine. Non-sticky and keeps my T-zone matte throughout the working day in East Legon.',
    verifiedPurchase: true,
    skinType: 'Combination Skin',
    helpfulCount: 9
  },
  {
    id: 'rev-ord-3',
    productId: 'ord-niacinamide-10',
    authorName: 'Nana Ama T.',
    rating: 4,
    date: '3 weeks ago',
    title: 'Very effective, fast delivery to Tema',
    comment: 'Delivered the very same afternoon. Product texture and packaging are original.',
    verifiedPurchase: true,
    skinType: 'Normal Skin',
    helpfulCount: 5
  },

  // CeraVe Moisturising Cream
  {
    id: 'rev-cer-1',
    productId: 'cerave-moisturising-cream',
    authorName: 'Dr. Kwesi D.',
    rating: 5,
    date: '4 days ago',
    title: 'Best barrier repair cream available',
    comment: 'Rich, non-comedogenic, and excellent for restoring compromised skin barrier. The 454g tub lasts for months.',
    verifiedPurchase: true,
    skinType: 'Dry & Sensitive',
    helpfulCount: 19
  },
  {
    id: 'rev-cer-2',
    productId: 'cerave-moisturising-cream',
    authorName: 'Abena Osei',
    rating: 5,
    date: '2 weeks ago',
    title: 'Great hydration for whole family',
    comment: 'Leaves the skin feeling smooth without any oily residue. Works wonders after evening baths.',
    verifiedPurchase: true,
    skinType: 'Dry Skin',
    helpfulCount: 8
  },

  // COSRX Snail Mucin
  {
    id: 'rev-cosrx-1',
    productId: 'cosrx-snail-mucin-96',
    authorName: 'Serwaa B.',
    rating: 5,
    date: 'Yesterday',
    title: 'Unreal glass skin glow!',
    comment: 'If you want that plump hydrated Korean glass skin in Ghana, this is the Holy Grail. Authentic batch with verifiable barcode.',
    verifiedPurchase: true,
    skinType: 'Dehydrated Skin',
    helpfulCount: 22
  },

  // La Vie Est Belle
  {
    id: 'rev-perf-1',
    productId: 'lancome-la-vie-est-belle',
    authorName: 'Gifty Mensah',
    rating: 5,
    date: '5 days ago',
    title: 'Long-lasting signature scent',
    comment: 'Sprayed it in the morning and could still smell the sweet praline and iris notes in the evening. Got so many compliments at church.',
    verifiedPurchase: true,
    skinType: 'Perfume Enthusiast',
    helpfulCount: 16
  },

  // Dove Body Lotion
  {
    id: 'rev-dove-1',
    productId: 'dove-nourishing-body-lotion',
    authorName: 'Adwoa Frimpong',
    rating: 5,
    date: '1 week ago',
    title: 'Super soft skin every day',
    comment: 'Deep nourishment that absorbs instantly. Great value for everyday essential body care.',
    verifiedPurchase: true,
    skinType: 'All Skin Types',
    helpfulCount: 7
  },

  // Fenty Lip Oil
  {
    id: 'rev-fenty-1',
    productId: 'fenty-gloss-bomb-fenty-glow',
    authorName: 'Korkor A.',
    rating: 5,
    date: '3 days ago',
    title: 'Ultimate juicy lips',
    comment: 'The shimmer and shine is top tier. Non-sticky and smells like peach vanilla!',
    verifiedPurchase: true,
    skinType: 'Lip Care Lover',
    helpfulCount: 11
  }
];

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem('cr_product_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cr_product_reviews', JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  const getReviewsForProduct = (productId: string) => {
    if (!Array.isArray(reviews)) return [];
    return reviews.filter(r => r.productId === productId);
  };

  const getProductRatingStats = (productId: string, defaultRating: number = 5.0, defaultCount: number = 24) => {
    const productReviews = (Array.isArray(reviews) ? reviews : []).filter(r => r.productId === productId);
    
    if (productReviews.length === 0) {
      return {
        averageRating: defaultRating,
        totalReviews: defaultCount,
        distribution: { 5: 85, 4: 12, 3: 3, 2: 0, 1: 0 }
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

  const safeReviews = Array.isArray(reviews) ? reviews : INITIAL_REVIEWS;

  return (
    <ReviewsContext.Provider value={{ 
      reviews: safeReviews, 
      getReviewsForProduct, 
      getProductRatingStats, 
      addReview, 
      deleteReview,
      replyToReview,
      markHelpful 
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
