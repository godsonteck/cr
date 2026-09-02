# CR Cosmetics & Essential

A Vite + React storefront for beauty and grocery essentials with a secure admin backend, PostgreSQL persistence via Drizzle, and Vercel Serverless APIs.

## Features

- Product storefront with category and search-driven browsing
- Customer auth and order checkout flow
- Admin portal with inventory, orders, settings, and product management
- Secure JWT authentication and admin route protection
- Transactional order creation with stock validation
- Vercel-friendly API layer and sitemap generation

## Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS v4
- Drizzle ORM
- Neon Postgres
- Vercel Serverless Functions
- bcryptjs + jsonwebtoken

## Prerequisites

- Node.js 20+
- npm
- A Neon Postgres database
- A Vercel project (optional for deployment)

## Local setup

1. Install dependencies:

   npm install

2. Copy the environment template:

   cp .env.example .env.local

3. Fill in the required values in `.env.local`:

   - DATABASE_URL
   - JWT_SECRET
   - ADMIN_EMAIL
   - ADMIN_INITIAL_PIN
   - APP_URL (for local or production URLs)
   - GOOGLE_CLIENT_ID (server-side Google OAuth client ID)
   - VITE_GOOGLE_CLIENT_ID (the same Google OAuth client ID exposed to the Vite frontend)
   - PAYSTACK_SECRET_KEY (server-side Paystack secret key)
   - VITE_PAYSTACK_PUBLIC_KEY (Paystack public key exposed to the Vite frontend)

4. Push the schema to your database:

   npm run db:push

5. Seed the catalog and admin data:

   npm run db:seed

6. Start the app locally:

   npm run dev

The app should run on http://localhost:3000.

## Admin login

After the seed step, the admin account is created from the `ADMIN_INITIAL_PIN` environment variable. Use the seeded email and the same pin to sign in through the admin portal.

## Google customer sign-in

1. In Google Cloud Console, create an OAuth 2.0 Client ID with application type **Web application**.
2. Add `http://localhost:3000` and your Vercel production URL to **Authorized JavaScript origins**. Add any custom production domain too.
3. Set both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` to that client ID. `GOOGLE_CLIENT_ID` is used by the Vercel API to verify Google credentials; `VITE_GOOGLE_CLIENT_ID` renders the Google button in the browser.
4. Run `npm run db:push` and redeploy Vercel after setting the variables.

Google customers are created or matched by their verified Google email in Neon and receive the same JWT session as password-based customers. A Google account starts with an empty phone field so it can be completed later from the customer profile.

## Paystack checkout

Paystack is the only online payment option at checkout. It opens Paystack Inline for card and supported mobile-money channels, verifies the transaction server-side, and creates the order only after the transaction is confirmed as successful. Set both Paystack variables in local and Vercel environments, then redeploy. Never expose `PAYSTACK_SECRET_KEY` in frontend code.

## Useful scripts

- `npm run build` — TypeScript check and production build
- `npm run lint` — strict TypeScript validation
- `npm run db:generate` — generate Drizzle migrations
- `npm run db:push` — apply schema changes
- `npm run db:seed` — populate products, settings, promo codes, and admin session
- `npm run sitemap:generate` — generate the public sitemap.xml file locally

## Vercel deployment

1. Import the repository into Vercel.
2. Add the same environment variables used in `.env.local` to the Vercel project settings.
3. Set `APP_URL` to your production domain such as `https://your-app.vercel.app`.
4. Ensure `DATABASE_URL` points to the Neon Postgres instance used by the app.
5. Redeploy.

The project includes a Vercel rewrite for `/sitemap.xml` to the API route `/api/sitemap`.

## Security notes

- JWT secrets must be set in production and should be long random values.
- Admin and customer routes enforce auth checks on the server side.
- Order creation is performed within a transaction to prevent stock oversells.
- Sensitive environment values should never be committed to the repository.

## Project structure

- `api/` — Vercel serverless API endpoints
- `src/` — app frontend and shared logic
- `scripts/` — database migration and seed scripts
- `public/` — static assets and robots.txt
- `drizzle/` — generated schema metadata

## Notes

The storefront and admin UI are designed to work with the current database schema and secure API layer. If you add new data models, regenerate and apply migrations before deployment.
