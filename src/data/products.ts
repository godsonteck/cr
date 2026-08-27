import { Product } from '../types';

export const BRANDS_LIST = [
  'All Brands',
  'The Ordinary',
  'CeraVe',
  'COSRX',
  'Dove',
  'La Vie Est Belle',
  'Nivea',
  'Chanel',
  'Estée Lauder',
  'Caudalie',
  'Fenty Beauty',
  'Neutrogena',
  'CR Exclusive'
];

export const CATEGORIES_CONFIG = [
  {
    id: 'makeup',
    name: 'MAKEUP',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    description: 'High-pigment palettes, foundations & powders'
  },
  {
    id: 'skincare',
    name: 'SKINCARE',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
    description: 'Targeted serums, hydrators & sunscreen'
  },
  {
    id: 'fragrances',
    name: 'FRAGRANCES',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    description: 'Designer perfumes & luxury Eau de Parfum'
  },
  {
    id: 'body-care',
    name: 'BODY CARE',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    description: 'Nourishing lotions, butters & body washes'
  },
  {
    id: 'beauty-essentials',
    name: 'BEAUTY ESSENTIALS',
    image: 'https://images.unsplash.com/photo-1587754256282-a11d04e3472d?auto=format&fit=crop&w=600&q=80',
    description: 'Brushes, blenders, sponges & tools'
  },
  {
    id: 'everyday-essentials',
    name: 'EVERYDAY ESSENTIALS',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    description: 'Daily hygiene, soaps & pantry bundles'
  }
];

export const PRODUCTS: Product[] = [
  // --- BEST SELLERS (Exactly matching the design) ---
  {
    id: 'the-ordinary-niacinamide',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'skincare',
    categoryLabel: 'Facial Serum',
    price: 120.0,
    unit: '30ml Dropper Bottle',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'High-strength vitamin and mineral blemish formula. Niacinamide (Vitamin B3) is indicated to reduce the appearance of skin blemishes and congestion, balanced with Zinc PCA to visibly regulate sebum activity.',
    highlights: ['Controls excess oil & sebum', 'Visibly minimizes pores', 'Reduces appearance of blemishes', '100% Authentic formula'],
    badge: 'Bestseller',
    inStock: true,
    stockCount: 48,
    rating: 5.0,
    reviewCount: 128,
    details: {
      howToUse: 'Apply to entire face morning and evening before heavier creams.',
      ingredients: 'Aqua (Water), Niacinamide 10%, Pentylene Glycol, Zinc PCA 1%, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum.',
      benefits: 'Clarifies skin texture, controls shine, supports skin barrier.'
    }
  },
  {
    id: 'cerave-moisturising-cream',
    name: 'Moisturising Cream',
    brand: 'CeraVe',
    category: 'skincare',
    categoryLabel: 'Barrier Cream',
    price: 180.0,
    unit: '454g Tub with Pump',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Developed with dermatologists, CeraVe Moisturising Cream delivers 24-hour hydration and helps restore the protective skin barrier with three essential ceramides (1, 3, 6-II) and hyaluronic acid.',
    highlights: ['3 Essential Ceramides', 'MVE Technology for 24hr hydration', 'Fragrance-free & non-comedogenic', 'Suitable for dry to very dry skin'],
    badge: 'Bestseller',
    inStock: true,
    stockCount: 35,
    rating: 5.0,
    reviewCount: 96,
    details: {
      howToUse: 'Apply liberally as often as needed, or as directed by a physician.',
      ingredients: 'Aqua, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Ceramide NP, Ceramide AP, Ceramide EOP, Hyaluronic Acid.',
      benefits: 'Deeply restores the protective skin barrier and seals in moisture.'
    }
  },
  {
    id: 'dove-body-lotion-hydrating',
    name: 'Body Lotion (Hydrating)',
    brand: 'Dove',
    category: 'body-care',
    categoryLabel: 'Body Lotion',
    price: 70.0,
    unit: '400ml Bottle',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Infused with NutriDUO deep care complex, this rich yet fast-absorbing lotion nourishes deep into the surface layers of skin, leaving skin soft, smooth, and radiant for 48 hours.',
    highlights: ['48-Hour Deep Nourishment', 'Fast absorbing, non-sticky', 'Dermatologically tested', 'Enriched with skin natural nutrients'],
    badge: 'Bestseller',
    inStock: true,
    stockCount: 60,
    rating: 5.0,
    reviewCount: 73,
    details: {
      howToUse: 'Massage gently into clean, dry skin daily after bathing.',
      ingredients: 'Water, Glycerin, Stearic Acid, Glycol Stearate, Dimethicone, Shea Butter, NutriDUO Complex.',
      benefits: 'Silky smooth skin that glows with lasting hydration.'
    }
  },
  {
    id: 'la-vie-est-belle-eau-de-parfum',
    name: 'La Vie Est Belle Eau de Parfum',
    brand: 'La Vie Est Belle',
    category: 'fragrances',
    categoryLabel: 'Luxury Perfume',
    price: 650.0,
    unit: '100ml Spray Bottle',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'An iconic, luminous fragrance celebrating the beauty of life. Opens with sweet pear and blackberry, blossoms with precious iris and jasmine, and settles into warm vanilla, praline, and patchouli.',
    highlights: ['Long-lasting sillage (12+ hours)', 'Notes of Iris, Praline, Vanilla & Patchouli', '100% Original sealed luxury bottle', 'Signature crystal smile glass bottle'],
    badge: 'Bestseller',
    inStock: true,
    stockCount: 14,
    rating: 5.0,
    reviewCount: 58,
    details: {
      howToUse: 'Spritz onto pulse points: wrists, inner elbows, base of the neck and behind earlobes.',
      ingredients: 'Alcohol, Parfum (Fragrance), Aqua (Water), Linalool, Benzyl Salicylate, Limonene, Coumarin.',
      benefits: 'An irresistible aura of refined elegance and warmth.'
    }
  },
  {
    id: 'cosrx-snail-mucin-essence',
    name: 'Advanced Snail 96 Mucin Power Essence',
    brand: 'COSRX',
    category: 'skincare',
    categoryLabel: 'Hydrating Essence',
    price: 135.0,
    originalPrice: 150.0,
    discountBadge: '-10%',
    unit: '100ml Pump Bottle',
    image: 'https://images.unsplash.com/photo-1608248597359-216694602f37?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248597359-216694602f37?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Formulated with 96.3% Snail Secretion Filtrate, this lightweight essence absorbs quickly into the skin to repair damaged skin, diminish dark spots, soothe irritation, and impart a glass-skin glow.',
    highlights: ['96.3% Snail Secretion Filtrate', 'Intense hydration & glass skin finish', 'Fades hyperpigmentation & acne marks', 'Cruelty-free & hypoallergenic'],
    badge: 'Sale',
    inStock: true,
    stockCount: 22,
    rating: 5.0,
    reviewCount: 58,
    details: {
      howToUse: 'After cleansing and toning, apply a small amount on your entire face. Gently pat using fingertips to aid absorption.',
      ingredients: 'Snail Secretion Filtrate 96.3%, Betaine, Butylene Glycol, 1,2-Hexanediol, Sodium Polyacrylate, Phenoxyethanol, Sodium Hyaluronate, Allantoin, Carbomer, Panthenol, Arginine.',
      benefits: 'Plumps dehydrated skin and accelerates barrier healing.'
    }
  },
  {
    id: 'nivea-soft-cream',
    name: 'Soft Refreshing Moisture Cream',
    brand: 'Nivea',
    category: 'body-care',
    categoryLabel: 'Multi-use Cream',
    price: 35.0,
    unit: '200ml Tub',
    image: 'https://images.unsplash.com/photo-1607006314144-84d720c2fb75?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1607006314144-84d720c2fb75?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'An invigorating, fast-absorbing moisturizing cream with Jojoba Oil and Vitamin E. Lightweight and refreshing, perfect for everyday face, hand, and body care.',
    highlights: ['With Jojoba Oil & Vitamin E', 'Fast absorbing, zero greasiness', 'Daily moisture for face, hands & body', 'Dermatologically approved'],
    badge: 'Bestseller',
    inStock: true,
    stockCount: 80,
    rating: 5.0,
    reviewCount: 112,
    details: {
      howToUse: 'Apply gently on clean skin whenever moisture is needed.',
      ingredients: 'Aqua, Glycerin, Paraffinum Liquidum, Myristyl Alcohol, Butylene Glycol, Jojoba Seed Oil, Tocopheryl Acetate (Vitamin E).',
      benefits: 'Instant refreshing hydration at an affordable price.'
    }
  },

  // --- LUXURY HERO & FEATURED SELECTIONS ---
  {
    id: 'chanel-coco-mademoiselle',
    name: 'Coco Mademoiselle Eau de Parfum',
    brand: 'Chanel',
    category: 'fragrances',
    categoryLabel: 'Haute Parfumerie',
    price: 980.0,
    originalPrice: 1100.0,
    unit: '100ml Eau de Parfum',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'An amber fragrance with a strong personality, yet surprisingly fresh. Sparks of fresh orange awaken the senses. The clear, sensual heart reveals transparent accords of Grasse jasmine and May rose.',
    highlights: ['Ultra luxury signature scent', 'Top notes of Vibrant Orange, Mandarin & Bergamot', 'Heart of Jasmine & Turkish Rose', 'Base of Patchouli, Vetiver & White Musk'],
    badge: 'CR Exclusive',
    inStock: true,
    stockCount: 8,
    rating: 5.0,
    reviewCount: 42,
    details: {
      howToUse: 'Spray the Eau de Parfum with a broad and gentle sweep across skin or inside clothing.',
      ingredients: 'Alcohol, Parfum (Fragrance), Aqua, Limonene, Linalool, Coumarin, Citronellol.',
      benefits: 'Unrivaled sophistication and prestige.'
    }
  },
  {
    id: 'estee-lauder-advanced-night-repair',
    name: 'Advanced Night Repair Synchronized Multi-Recovery',
    brand: 'Estée Lauder',
    category: 'skincare',
    categoryLabel: 'Anti-Aging Serum',
    price: 520.0,
    unit: '50ml Dropper Bottle',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Deep-penetrating night repair serum with Chronolux Power Signal Technology. Fast visible repair, youthful firmness, 72-hour moisture, and 8-hour antioxidant power.',
    highlights: ['Number 1 Night Repair Serum in the world', 'Reduces fine lines & boosts firmness', '72-Hour Hyaluronic Acid Hydration', 'Oil-free and non-comedogenic'],
    badge: 'CR Exclusive',
    inStock: true,
    stockCount: 15,
    rating: 4.9,
    reviewCount: 88,
    details: {
      howToUse: 'Apply one full dropper morning and night onto clean face before your moisturizer.',
      ingredients: 'Bifida Ferment Lysate, PEG-8, Propanediol, Bis-PEG-18 Methyl Ether Dimethyl Silane, Sodium Hyaluronate, Caffeine.',
      benefits: 'Wakes up radiant, rested, and visibly recharged skin.'
    }
  },
  {
    id: 'caudalie-resveratrol-lift-cream',
    name: 'Resveratrol-Lift Firming Cashmere Cream',
    brand: 'Caudalie',
    category: 'skincare',
    categoryLabel: 'Firming Moisturizer',
    price: 340.0,
    unit: '50ml Glass Jar',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Corrects wrinkles and firms skin. In one step, skin is nourished, smoothed, and visibly plumped. Powered by patented combination of Resveratrol, Hyaluronic Acid, and Vegan Collagen booster.',
    highlights: ['Patented Vine Resveratrol + Vegan Collagen', '98% natural origin ingredients', 'Ultra-sensory cashmere texture', 'Eco-friendly refillable jar'],
    badge: 'CR Exclusive',
    inStock: true,
    stockCount: 12,
    rating: 4.9,
    reviewCount: 39,
    details: {
      howToUse: 'Apply in the morning to face and neck, alone or after your serum.',
      ingredients: 'Aqua, Coco-Caprylate, Glycerin, Silica, Butylene Glycol, Resveratrol, Sodium Hyaluronate, Vegan Collagen Extract.',
      benefits: 'Firms contours and imparts an ageless velvet softness.'
    }
  },

  // --- MAKEUP & BEAUTY ESSENTIALS ---
  {
    id: 'luxury-pro-makeup-brush-set',
    name: '12-Piece Masterclass Studio Makeup Brush Set',
    brand: 'Beauty Essentials',
    category: 'beauty-essentials',
    categoryLabel: 'Brush Collection',
    price: 150.0,
    originalPrice: 190.0,
    discountBadge: '-20%',
    unit: '12-Piece Set with Leather Pouch',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Handcrafted ultra-soft synthetic vegan bristles with ergonomic champagne rose gold ferrules. Includes foundation buffing brush, contour brush, blending brushes, and precision liner tools.',
    highlights: ['Cruelty-free premium synthetic hairs', 'Zero shedding guarantee', 'Includes travel pouch', 'Flawless blending for liquids & powders'],
    badge: 'New In',
    inStock: true,
    stockCount: 25,
    rating: 4.8,
    reviewCount: 64,
    details: {
      howToUse: 'Use specific brushes for foundation, contour, eye blending, and setting powders.',
      ingredients: 'Ultra-Fine Synthetic Nanofiber, Recycled Aluminum Ferrules, Natural Wooden Handles.',
      benefits: 'Effortless professional blend with zero streaks.'
    }
  },
  {
    id: 'fenty-gloss-bomb-universal',
    name: 'Gloss Bomb Universal Lip Luminizer',
    brand: 'Fenty Beauty',
    category: 'makeup',
    categoryLabel: 'Lip Gloss',
    price: 165.0,
    unit: '9ml Tube (Fenty Glow)',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'The ultimate, gotta-have-it lip gloss with explosive shine that feels as good as it looks. Enriched with conditioning Shea Butter for kissably soft lips in universal nude-rose shimmers.',
    highlights: ['Universal flattering shimmer', 'Conditioning Shea Butter formula', 'Addictive peach-vanilla scent', 'Non-sticky cushion wand'],
    badge: 'Popular',
    inStock: true,
    stockCount: 30,
    rating: 5.0,
    reviewCount: 140,
    details: {
      howToUse: 'Wear alone or layer over lipstick as the finishing touch to your glow.',
      ingredients: 'Polybutene, Octyldodecanol, Butyrospermum Parkii (Shea) Butter, Silica Dimethyl Silylate, Tocopherol.',
      benefits: 'Super juicy, fuller-looking lips with zero stickiness.'
    }
  },
  {
    id: 'beauty-sponge-duo-blender',
    name: 'Precision Teardrop Beauty Blending Sponge (Duo Pack)',
    brand: 'Beauty Essentials',
    category: 'beauty-essentials',
    categoryLabel: 'Applicators',
    price: 40.0,
    unit: '2-Pack Sponges',
    image: 'https://images.unsplash.com/photo-1587754256282-a11d04e3472d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587754256282-a11d04e3472d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Latex-free hydrophilic foam sponge that doubles in size when damp. Delivers seamless, airbrushed coverage for foundations, concealers, and baking powders.',
    highlights: ['Latex-free, ultra-soft bounce', 'Expands in water to prevent makeup absorption', 'Teardrop tip for under-eye precision'],
    badge: 'Popular',
    inStock: true,
    stockCount: 95,
    rating: 4.8,
    reviewCount: 77,
    details: {
      howToUse: 'Wet sponge with water, squeeze out excess in a towel, then bounce gently across skin with foundation.',
      ingredients: 'Hydrophilic Polyurethane Foam (Latex Free).',
      benefits: 'Airbrushed finish with minimal product waste.'
    }
  },

  // --- EVERYDAY ESSENTIALS & GIFT BUNDLES ---
  {
    id: 'cr-exclusive-luxury-gift-hamper',
    name: 'CR Signature Luxury Care & Beauty Gift Hamper',
    brand: 'CR Exclusive',
    category: 'everyday-essentials',
    categoryLabel: 'Gift Collection',
    price: 420.0,
    originalPrice: 480.0,
    discountBadge: '-12%',
    unit: 'Luxury Gift Box Set',
    image: 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'The ultimate bespoke gifting set packaged in our signature CR black ribbon box with gold foil branding. Includes pure whipped shea butter, black soap luxury bar, hydrating body milk, scented candle, and luxury face oil.',
    highlights: ['Signature gold foil CR presentation box', 'Full-size luxury essentials', 'Perfect for birthdays, anniversaries & bridal gifts', 'Complimentary gift card message'],
    badge: 'CR Exclusive',
    inStock: true,
    stockCount: 10,
    rating: 5.0,
    reviewCount: 31,
    details: {
      howToUse: 'Unbox the luxury collection and indulge in a complete spa care regimen.',
      ingredients: 'Curated blend of premium skincare, aromatics, and daily luxuries.',
      benefits: 'Pure pampering indulgence delivered directly to your doorstep.'
    }
  },
  {
    id: 'everyday-hygiene-family-basket',
    name: 'Family Everyday Essentials & Hygiene Basket',
    brand: 'Everyday Essentials',
    category: 'everyday-essentials',
    categoryLabel: 'Pantry & Hygiene',
    price: 180.0,
    unit: 'Multi-Item Care Basket',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Everything your household needs in one quick order: Dettol antiseptic liquid, Geisha soaps, Colgate toothpaste, Nivea soft cream, and wet wipes in a sturdy wicker presentation basket.',
    highlights: ['Great value household bundle', 'Essential daily hygiene staples', 'Dispatched same-day across Accra'],
    badge: 'Popular',
    inStock: true,
    stockCount: 40,
    rating: 4.9,
    reviewCount: 89,
    details: {
      howToUse: 'Store in bathroom and vanity for complete family hygiene.',
      ingredients: 'Household hygiene essentials from trusted global brands.',
      benefits: 'Convenient 1-click replenishment of everyday essentials.'
    }
  }
];
