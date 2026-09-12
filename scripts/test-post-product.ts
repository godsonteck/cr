import { signToken } from '../api/_auth.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const token = signToken({
    sub: '787c8cb1-da0c-4b68-bf04-6b2f4c3a2be6',
    email: 'admin@crcosmetics.com',
    role: 'admin',
    adminRole: 'Super Admin',
    adminName: 'Store Administrator'
  });

  console.log('Testing POST to https://cosmeticse.vercel.app/api/products...');
  const start = Date.now();

  const payload = {
    name: "Test Product " + Date.now(),
    brand: "CR Cosmetics",
    department: "beauty",
    category: "body-care",
    categoryLabel: "BODY CARE",
    price: 120,
    unit: "Standard Pack",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80"],
    description: "A test product for latency and saving check.",
    highlights: ["Original and authentic", "Quality inspected"],
    inStock: true,
    isPublished: true,
    stockCount: 6,
    options: [],
    variants: [],
    origin: "",
    rating: "5.0",
    reviewCount: 0,
    details: { howToUse: "", ingredients: "", benefits: "" }
  };

  try {
    const res = await fetch('https://cosmeticse.vercel.app/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const duration = Date.now() - start;
    console.log(`HTTP ${res.status} in ${duration}ms`);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
