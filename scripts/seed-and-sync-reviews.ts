import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;

// These records were placeholder testimonials, not customer-submitted feedback.
// Keep this list so removal is precise and repeatable without touching real reviews.
const PLACEHOLDER_REVIEWS = [
  ['cerave-moisturising-cream', 'Nana Yaa K.', 'Essential for dry Accra harmattan days!'],
  ['cerave-moisturising-cream', 'Esi Frimpong', 'Repairs skin barrier quickly'],
  ['cerave-moisturising-cream', 'Kwesi Mensah', 'Very hydrating, big tub lasts long'],
  ['cosrx-snail-mucin-essence', 'Akosua Boakye', 'Glass skin in a bottle!'],
  ['cosrx-snail-mucin-essence', 'Mavis Tetteh', 'Lightweight and deeply soothing'],
  ['cosrx-snail-mucin-essence', 'Jessica Lamptey', 'Authentic product and fast Accra delivery'],
  ['the-ordinary-niacinamide', 'Ama Boateng', 'Controls oil and refines pores'],
  ['the-ordinary-niacinamide', 'Kofi Owusu', 'Effective for blemishes, use in moderation'],
  ['the-ordinary-niacinamide', 'Selorm Doe', 'Cleared hyperpigmentation'],
  ['la-vie-est-belle-eau-de-parfum', 'Abena Serwaa', 'Luxurious, long-lasting projection'],
  ['la-vie-est-belle-eau-de-parfum', 'Belinda Asare', '100% original designer fragrance'],
  ['luxury-pro-makeup-brush-set', 'Grace Antwi', 'Soft bristles and zero shedding'],
  ['luxury-pro-makeup-brush-set', 'Priscilla Osei', 'Great all-in-one kit with case'],
  ['frytol-pure-vegetable-oil-5l', 'Auntie Mercy D.', 'Top cooking oil for all family meals'],
  ['frytol-pure-vegetable-oil-5l', 'Kwabena A.', 'Fresh stock and same-day delivery'],
  ['ariel-automatic-washing-powder-3kg', 'Comfort Nyarko', 'Stain remover champion'],
  ['ariel-automatic-washing-powder-3kg', 'Emmanuel K.', 'Works very well with front-load machine'],
  ['gino-max-tomato-paste-70g-pack', 'Mama Theresa', 'Rich red color and thick consistency'],
  ['gino-max-tomato-paste-70g-pack', 'Rita Addo', 'Superb for stews and soups'],
  ['ideal-evaporated-milk-full-cream-pack', 'Kwame Baah', 'Creamy and rich for morning tea'],
  ['ideal-evaporated-milk-full-cream-pack', 'Naa Densua', 'Dented-free cans, carefully packed'],
  ['royal-umbrella-perfumed-jasmine-rice-5kg', 'David Annan', 'Aromatic, non-sticky grains'],
  ['royal-umbrella-perfumed-jasmine-rice-5kg', 'Bernice Owusu', 'First grade quality'],
] as const;

async function run() {
  if (!connectionString) throw new Error('No database connection string');
  const sql = postgres(connectionString, { ssl: 'require' });

  let removed = 0;
  for (const [productId, authorName, title] of PLACEHOLDER_REVIEWS) {
    const deleted = await sql`
      DELETE FROM reviews
      WHERE product_id = ${productId} AND author_name = ${authorName} AND title = ${title}
      RETURNING id
    `;
    removed += deleted.length;
  }

  await sql`
    UPDATE products AS product
    SET review_count = COALESCE(stats.count, 0), rating = COALESCE(stats.average_rating, 0.0), updated_at = NOW()
    FROM (
      SELECT products.id, COUNT(reviews.id)::integer AS count,
        COALESCE(ROUND(AVG(reviews.rating)::numeric, 1), 0.0) AS average_rating
      FROM products
      LEFT JOIN reviews ON reviews.product_id = products.id AND reviews.is_approved = true
      GROUP BY products.id
    ) AS stats
    WHERE product.id = stats.id
  `;

  const [published] = await sql`
    SELECT COUNT(*)::integer AS count FROM reviews WHERE is_approved = true
  `;
  console.log(`Removed ${removed} placeholder review${removed === 1 ? '' : 's'} and refreshed product review summaries. Published customer reviews remaining: ${published.count}.`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
