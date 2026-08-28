import { Product, DepartmentConfig, CategoryConfig } from '../types';

export const DEPARTMENTS: DepartmentConfig[] = [
  {
    id: 'beauty',
    slug: 'beauty',
    name: 'BEAUTY & SKINCARE',
    tagline: 'Refined Skincare, Haircare & Luxury Fragrances',
    description: 'Explore dermatologically formulated skincare, high-pigment cosmetics, body care and signature scents curated for radiant skin.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'groceries',
    slug: 'groceries',
    name: 'GROCERIES & ESSENTIALS',
    tagline: 'Fresh Staples, Pantry Essentials & Everyday Household',
    description: 'Quality rice, cooking oils, daily provisions, refreshing beverages, and trusted household hygiene delivered directly to your doorstep.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'
  }
];

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
  'Royal Umbrella',
  'Gino',
  'Frytol',
  'Ideal Milk',
  'Milky Magic',
  'Ariel',
  'Dettol',
  'CR Exclusive'
];

export const CATEGORIES_CONFIG: CategoryConfig[] = [
  // BEAUTY CATEGORIES
  {
    id: 'skincare',
    slug: 'skincare',
    name: 'SKINCARE',
    department: 'beauty',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
    description: 'Targeted serums, hydrators, sunscreen and barrier restore creams'
  },
  {
    id: 'makeup',
    slug: 'makeup',
    name: 'MAKEUP',
    department: 'beauty',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    description: 'High-pigment palettes, foundations, lip glosses & powders'
  },
  {
    id: 'fragrances',
    slug: 'fragrances',
    name: 'FRAGRANCES',
    department: 'beauty',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    description: 'Designer perfumes, Eau de Parfum & luxury body mists'
  },
  {
    id: 'body-care',
    slug: 'body-care',
    name: 'BODY CARE',
    department: 'beauty',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    description: 'Nourishing lotions, natural butters, body scrubs & washes'
  },
  {
    id: 'beauty-tools',
    slug: 'beauty-tools',
    name: 'BEAUTY TOOLS',
    department: 'beauty',
    image: 'https://images.unsplash.com/photo-1587754256282-a11d04e3472d?auto=format&fit=crop&w=600&q=80',
    description: 'Pro makeup brushes, blenders, sponges & application accessories'
  },

  // GROCERY CATEGORIES
  {
    id: 'rice-grains',
    slug: 'rice-grains',
    name: 'RICE & GRAINS',
    department: 'groceries',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    description: 'Jasmine rice, perfumed rice, local grains & staples'
  },
  {
    id: 'cooking-oils',
    slug: 'cooking-oils',
    name: 'COOKING OILS',
    department: 'groceries',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    description: 'Pure vegetable oil, sunflower oil & premium palm olein'
  },
  {
    id: 'seasoning-spices',
    slug: 'seasoning-spices',
    name: 'SEASONING & PANTRY',
    department: 'groceries',
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=600&q=80',
    description: 'Tomato paste, spice mixes, stock cubes, salt & sauces'
  },
  {
    id: 'beverages',
    slug: 'beverages',
    name: 'BEVERAGES & MILK',
    department: 'groceries',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    description: 'Evaporated milk, cocoa powders, fruit juices, tea & coffee'
  },
  {
    id: 'household-care',
    slug: 'household-care',
    name: 'HOUSEHOLD CARE',
    department: 'groceries',
    image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80',
    description: 'Washing powders, antiseptics, dishwashing liquids & cleaners'
  },
  {
    id: 'daily-essentials',
    slug: 'daily-essentials',
    name: 'DAILY ESSENTIALS',
    department: 'groceries',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    description: 'Bath soaps, tissue papers, hygiene wipes & family care bundles'
  }
];

export const PRODUCTS: Product[] = [
  // --- BEAUTY: SKINCARE ---
  {
    id: 'the-ordinary-niacinamide',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    department: 'beauty',
    category: 'skincare',
    categoryLabel: 'Facial Serum',
    price: 120.0,
    unit: '30ml Dropper Bottle',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'High-strength vitamin and mineral blemish formula. Niacinamide (Vitamin B3) reduces the appearance of skin blemishes and congestion, balanced with Zinc PCA to visibly regulate sebum activity.',
    highlights: ['Controls excess oil & sebum', 'Visibly minimizes pores', 'Reduces appearance of blemishes', '100% Authentic formula'],
    badge: 'Bestseller',
    inStock: true,
    stockCount: 48,
    rating: 5.0,
    reviewCount: 128,
    routineStep: 'treat',
    skinType: ['Oily', 'Combination', 'Normal'],
    skinConcern: ['Acne & Blemishes', 'Large Pores', 'Oil Control'],
    details: {
      howToUse: 'Apply to entire face morning and evening before heavier creams.',
      ingredients: 'Aqua (Water), Niacinamide 10%, Pentylene Glycol, Zinc PCA 1%, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum.',
      benefits: 'Clarifies skin texture, controls shine, and supports skin barrier balance.'
    }
  },
  {
    id: 'cerave-moisturising-cream',
    name: 'Moisturising Cream',
    brand: 'CeraVe',
    department: 'beauty',
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
    routineStep: 'hydrate',
    skinType: ['Dry', 'Normal', 'Sensitive'],
    skinConcern: ['Dryness', 'Damaged Barrier', 'Dehydration'],
    details: {
      howToUse: 'Apply liberally as often as needed, or as directed by a physician.',
      ingredients: 'Aqua, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Ceramide NP, Ceramide AP, Ceramide EOP, Hyaluronic Acid.',
      benefits: 'Deeply restores the protective skin barrier and seals in moisture.'
    }
  },
  {
    id: 'cosrx-snail-mucin-essence',
    name: 'Advanced Snail 96 Mucin Power Essence',
    brand: 'COSRX',
    department: 'beauty',
    category: 'skincare',
    categoryLabel: 'Hydrating Essence',
    price: 135.0,
    originalPrice: 150.0,
    discountBadge: '-10%',
    unit: '100ml Pump Bottle',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Formulated with 96.3% Snail Secretion Filtrate, this lightweight essence absorbs quickly into skin to repair damaged skin barrier, diminish dark spots, and impart a glass-skin glow.',
    highlights: ['96.3% Snail Secretion Filtrate', 'Intense hydration & glass skin finish', 'Fades hyperpigmentation & marks', 'Hypoallergenic'],
    badge: 'Sale',
    inStock: true,
    stockCount: 22,
    rating: 5.0,
    reviewCount: 58,
    routineStep: 'treat',
    skinType: ['All Skin Types', 'Dry', 'Sensitive'],
    skinConcern: ['Dehydration', 'Hyperpigmentation', 'Texture'],
    details: {
      howToUse: 'After cleansing and toning, apply a small amount on your entire face. Gently pat using fingertips.',
      ingredients: 'Snail Secretion Filtrate 96.3%, Betaine, Butylene Glycol, 1,2-Hexanediol, Sodium Hyaluronate, Panthenol, Arginine.',
      benefits: 'Plumps dehydrated skin and accelerates barrier healing.'
    }
  },

  // --- BEAUTY: FRAGRANCES ---
  {
    id: 'la-vie-est-belle-eau-de-parfum',
    name: 'La Vie Est Belle Eau de Parfum',
    brand: 'La Vie Est Belle',
    department: 'beauty',
    category: 'fragrances',
    categoryLabel: 'Luxury Perfume',
    price: 650.0,
    unit: '100ml Spray Bottle',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'An iconic, luminous fragrance celebrating the beauty of life. Opens with sweet pear and blackberry, blossoms with precious iris and jasmine, and settles into warm vanilla and patchouli.',
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
    id: 'chanel-coco-mademoiselle',
    name: 'Coco Mademoiselle Eau de Parfum',
    brand: 'Chanel',
    department: 'beauty',
    category: 'fragrances',
    categoryLabel: 'Haute Parfumerie',
    price: 980.0,
    originalPrice: 1100.0,
    discountBadge: '-11%',
    unit: '100ml Eau de Parfum',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'An amber fragrance with a strong personality, yet surprisingly fresh. Sparks of fresh orange awaken the senses, followed by clear accords of Grasse jasmine and May rose.',
    highlights: ['Ultra luxury signature scent', 'Top notes of Vibrant Orange & Bergamot', 'Heart of Jasmine & Turkish Rose', 'Base of Patchouli, Vetiver & White Musk'],
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

  // --- BEAUTY: BODY CARE & TOOLS ---
  {
    id: 'dove-body-lotion-hydrating',
    name: 'Body Lotion (Hydrating)',
    brand: 'Dove',
    department: 'beauty',
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
    routineStep: 'hydrate',
    details: {
      howToUse: 'Massage gently into clean, dry skin daily after bathing.',
      ingredients: 'Water, Glycerin, Stearic Acid, Glycol Stearate, Dimethicone, Shea Butter, NutriDUO Complex.',
      benefits: 'Silky smooth skin that glows with lasting hydration.'
    }
  },
  {
    id: 'luxury-pro-makeup-brush-set',
    name: '12-Piece Masterclass Studio Makeup Brush Set',
    brand: 'CR Exclusive',
    department: 'beauty',
    category: 'beauty-tools',
    categoryLabel: 'Brush Collection',
    price: 150.0,
    originalPrice: 190.0,
    discountBadge: '-20%',
    unit: '12-Piece Set with Leather Pouch',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Handcrafted ultra-soft synthetic vegan bristles with ergonomic rose gold ferrules. Includes foundation buffing brush, contour brush, blending brushes, and precision liner tools.',
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

  // --- GROCERIES: RICE & GRAINS ---
  {
    id: 'royal-umbrella-perfumed-jasmine-rice-5kg',
    name: 'Royal Umbrella Thai Perfumed Jasmine Rice',
    brand: 'Royal Umbrella',
    department: 'groceries',
    category: 'rice-grains',
    categoryLabel: 'Jasmine Rice',
    price: 195.0,
    unit: '5kg Bag',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
    ],
    description: '100% genuine Thai Fragrant Jasmine Rice. Renowned for its natural floral aroma, soft tender texture, and long white grains. Perfect for Jollof, fried rice, and plain steamed rice.',
    highlights: ['100% Grade A Thai Jasmine Rice', 'Naturally fragrant and soft texture', 'Cleaned & triple-sorted', 'Ideal for Jollof and family meals'],
    badge: 'Bestseller',
    inStock: true,
    stockCount: 120,
    rating: 5.0,
    reviewCount: 142,
    packSize: '5kg Bag',
    storageInfo: 'Store in a cool, dry place away from direct sunlight.',
    shelfLife: '24 Months',
    variants: [
      { id: 'ru-5kg', name: '5kg Bag', price: 195.0, inStock: true },
      { id: 'ru-25kg', name: '25kg Sack', price: 920.0, inStock: true }
    ],
    details: {
      howToUse: 'Rinse rice gently once before cooking. Use 1.25 cups of water per 1 cup of rice.',
      ingredients: '100% Long Grain Thai Jasmine Rice.',
      benefits: 'Delivers fragrant, fluffy, non-sticky rice dishes every single time.'
    }
  },

  // --- GROCERIES: COOKING OILS ---
  {
    id: 'frytol-pure-vegetable-oil-5l',
    name: 'Frytol Premium Pure Vegetable Oil',
    brand: 'Frytol',
    department: 'groceries',
    category: 'cooking-oils',
    categoryLabel: 'Cooking Oil',
    price: 175.0,
    unit: '5 Litre Jar',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Fortified with Vitamin A, Frytol Pure Vegetable Oil is refined to perfection for healthy everyday cooking, deep frying, roasting, and stews. Cholesterol-free.',
    highlights: ['Fortified with Vitamin A', 'Cholesterol-Free', 'High smoke point for crisp frying', 'Clear & neutral flavor'],
    badge: 'Popular',
    inStock: true,
    stockCount: 85,
    rating: 4.9,
    reviewCount: 88,
    packSize: '5 Litres',
    storageInfo: 'Store at room temperature in dark cabinet.',
    shelfLife: '18 Months',
    variants: [
      { id: 'fry-1l', name: '1 Litre Bottle', price: 42.0, inStock: true },
      { id: 'fry-5l', name: '5 Litre Jar', price: 175.0, inStock: true }
    ],
    details: {
      howToUse: 'Ideal for deep frying, sautéing, baking, and stew bases.',
      ingredients: '100% Refined Palm Olein, Vitamin A Palmitate.',
      benefits: 'Keeps food crisp without absorbing excess grease.'
    }
  },

  // --- GROCERIES: SEASONING & PANTRY ---
  {
    id: 'gino-max-tomato-paste-70g-pack',
    name: 'Gino Max Tomato Paste (Pack of 10)',
    brand: 'Gino',
    department: 'groceries',
    category: 'seasoning-spices',
    categoryLabel: 'Tomato Paste',
    price: 45.0,
    unit: '10 Sachets x 70g',
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Rich, concentrated double tomato paste crafted from ripe tomatoes. Gives Ghanaian stews, soups, and Jollof rich natural red color and deep savory flavor.',
    highlights: ['Deep natural tomato red color', 'Double concentrate formula', 'Convenient 70g single-use sachets', 'No artificial colors'],
    badge: 'Bestseller',
    inStock: true,
    stockCount: 150,
    rating: 4.9,
    reviewCount: 110,
    packSize: '10 x 70g Sachets',
    storageInfo: 'Keep in cool dry pantry.',
    shelfLife: '12 Months',
    details: {
      howToUse: 'Add directly into hot oil when frying onion base for stews and soups.',
      ingredients: 'Concentrated Tomato Paste (28-30% Brix), Salt.',
      benefits: 'Gives Jollof rice and tomato stews rich authentic color and body.'
    }
  },

  // --- GROCERIES: BEVERAGES & MILK ---
  {
    id: 'ideal-evaporated-milk-full-cream-pack',
    name: 'Ideal Full Cream Evaporated Milk (Pack of 6)',
    brand: 'Ideal Milk',
    department: 'groceries',
    category: 'beverages',
    categoryLabel: 'Evaporated Milk',
    price: 68.0,
    unit: '6 Cans x 160g',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Ghana’s favorite full cream evaporated milk. Creamy, rich, and fortified with essential vitamins D and Calcium. Perfect for morning tea, porridge, Milo, and baking.',
    highlights: ['Full cream rich taste', 'Fortified with Vitamin D & Calcium', '6 Easy-open cans pack', 'Classic household favorite'],
    badge: 'Bestseller',
    inStock: true,
    stockCount: 90,
    rating: 5.0,
    reviewCount: 164,
    packSize: '6 Cans x 160g',
    storageInfo: 'Store unopened cans in cool place. Refrigerate after opening.',
    shelfLife: '12 Months',
    details: {
      howToUse: 'Pour into hot tea, cocoa, oats, or use in dessert preparations.',
      ingredients: 'Whole Cow’s Milk, Stabilizer (E339), Vitamin D3.',
      benefits: 'Rich, velvety creaminess for daily breakfasts.'
    }
  },

  // --- GROCERIES: HOUSEHOLD CARE ---
  {
    id: 'ariel-automatic-washing-powder-3kg',
    name: 'Ariel Complete Clean Washing Powder',
    brand: 'Ariel',
    department: 'groceries',
    category: 'household-care',
    categoryLabel: 'Laundry Detergent',
    price: 110.0,
    unit: '3kg Bag',
    image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Advanced stain removal detergent engineered to dissolve tough grease and dirt in a single wash. Leaves clothes smelling fresh with long-lasting scent.',
    highlights: ['1-Wash Tough Stain Removal', 'Protects fabric fibers & colors', 'Fresh clean fragrance', 'Suitable for hand and machine washing'],
    badge: 'Popular',
    inStock: true,
    stockCount: 65,
    rating: 4.8,
    reviewCount: 79,
    packSize: '3kg Bag',
    storageInfo: 'Keep bag closed tightly in a dry utility area.',
    shelfLife: '24 Months',
    details: {
      howToUse: 'Dissolve 1 scoop in water for handwashing or add directly to washing machine dispenser.',
      ingredients: 'Anionic Surfactants, Oxygen-based Bleaching Agents, Enzymes, Perfume.',
      benefits: 'Brightens whites and removes stubborn stains easily.'
    }
  },

  // --- GROCERIES: DAILY ESSENTIALS ---
  {
    id: 'dettol-antiseptic-disinfectant-liquid-750ml',
    name: 'Dettol Antiseptic Disinfectant Liquid',
    brand: 'Dettol',
    department: 'groceries',
    category: 'daily-essentials',
    categoryLabel: 'Antiseptic Liquid',
    price: 85.0,
    unit: '750ml Bottle',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Trusted antibacterial antiseptic liquid that kills 99.9% of germs. Essential for first aid, personal bathing hygiene, laundry disinfection, and surface cleaning.',
    highlights: ['Kills 99.9% of germs & bacteria', 'Multi-purpose household protection', 'Proven medical disinfectant', 'Iconic fresh pine scent'],
    badge: 'Bestseller',
    inStock: true,
    stockCount: 110,
    rating: 5.0,
    reviewCount: 195,
    packSize: '750ml Bottle',
    storageInfo: 'Store below 30°C in original container.',
    shelfLife: '36 Months',
    details: {
      howToUse: 'Dilute in water before bathing, laundering clothes, or wiping household surfaces.',
      ingredients: 'Chloroxylenol (4.8% w/v), Terpineol, Isopropyl Alcohol, Castor Oil Soap.',
      benefits: 'Complete 360-degree germ defense for the entire family.'
    }
  }
];
