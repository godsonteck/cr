import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Product } from '../src/types.js';
import {
  adminProductMatchesQuery,
  filterAndSortAdminProducts,
  type AdminCatalogFilters,
} from '../src/lib/adminCatalog.js';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'CeraVe Moisturising Cream',
    brand: 'CeraVe',
    department: 'beauty',
    category: 'skincare',
    categoryLabel: 'Moisturiser',
    price: 25,
    unit: 'Jar',
    image: '',
    images: [],
    description: 'A daily face moisturiser.',
    highlights: ['Vitamin C', 'Hyaluronic acid'],
    inStock: true,
    stockCount: 12,
    isPublished: true,
    rating: 4.8,
    reviewCount: 30,
    ...overrides,
  };
}

const defaultFilters: AdminCatalogFilters = {
  query: '',
  department: 'all',
  category: 'all',
  brand: 'all',
  stock: 'all',
  publication: 'all',
  sort: 'featured',
};

test('admin search covers product details, barcodes, and variations', () => {
  const product = makeProduct({
    barcode: '123456789',
    variants: [{ id: 'variant-1', name: '500ml', price: 25, inStock: true, stockCount: 3, barcode: '987654321' }],
  });

  assert.equal(adminProductMatchesQuery(product, 'cerave vitamin c'), true);
  assert.equal(adminProductMatchesQuery(product, '500ML'), true);
  assert.equal(adminProductMatchesQuery(product, '987654321'), true);
  assert.equal(adminProductMatchesQuery(product, 'hyaluronic-acid'), true);
  assert.equal(adminProductMatchesQuery(product, 'sunscreen'), false);
});

test('admin filters combine department, category, brand, stock, and publication', () => {
  const products = [
    makeProduct({ id: 'match', stockCount: 3 }),
    makeProduct({ id: 'wrong-department', department: 'groceries', category: 'rice-grains', stockCount: 3 }),
    makeProduct({ id: 'wrong-category', category: 'makeup', stockCount: 3 }),
    makeProduct({ id: 'wrong-brand', brand: 'Dove', stockCount: 3 }),
    makeProduct({ id: 'out-of-stock', stockCount: 0 }),
    makeProduct({ id: 'draft', isPublished: false, stockCount: 3 }),
  ];

  const result = filterAndSortAdminProducts(products, {
    ...defaultFilters,
    department: 'beauty',
    category: 'skincare',
    brand: 'CeraVe',
    stock: 'low',
    publication: 'published',
  });

  assert.deepEqual(result.map(product => product.id), ['match']);
});

test('admin sorting orders price, stock, name, and newest without mutating the source', () => {
  const products = [
    makeProduct({ id: 'alpha', name: 'Alpha serum', price: 20, stockCount: 10, createdAt: '2024-01-01T00:00:00.000Z' }),
    makeProduct({ id: 'bravo', name: 'Bravo oil', price: 5, stockCount: 2, createdAt: '2026-01-01T00:00:00.000Z' }),
    makeProduct({ id: 'charlie', name: 'Charlie cream', price: 10, stockCount: 0, createdAt: '2025-01-01T00:00:00.000Z' }),
  ];
  const originalOrder = products.map(product => product.id);

  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, sort: 'featured' }).map(product => product.id), ['alpha', 'bravo', 'charlie']);
  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, sort: 'newest' }).map(product => product.id), ['bravo', 'charlie', 'alpha']);
  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, sort: 'name-asc' }).map(product => product.id), ['alpha', 'bravo', 'charlie']);
  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, sort: 'name-desc' }).map(product => product.id), ['charlie', 'bravo', 'alpha']);
  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, sort: 'price-asc' }).map(product => product.id), ['bravo', 'charlie', 'alpha']);
  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, sort: 'price-desc' }).map(product => product.id), ['alpha', 'charlie', 'bravo']);
  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, sort: 'stock-asc' }).map(product => product.id), ['charlie', 'bravo', 'alpha']);
  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, sort: 'stock-desc' }).map(product => product.id), ['alpha', 'bravo', 'charlie']);
  assert.deepEqual(products.map(product => product.id), originalOrder);
});

test('admin newest sorting keeps stable order for equal or missing dates', () => {
  const products = [
    makeProduct({ id: 'missing-first' }),
    makeProduct({ id: 'dated-first', createdAt: '2026-01-01T00:00:00.000Z' }),
    makeProduct({ id: 'missing-second' }),
    makeProduct({ id: 'dated-second', createdAt: '2026-01-01T00:00:00.000Z' }),
  ];

  assert.deepEqual(
    filterAndSortAdminProducts(products, { ...defaultFilters, sort: 'newest' }).map(product => product.id),
    ['dated-first', 'dated-second', 'missing-first', 'missing-second'],
  );
});

test('admin stock and status filters have distinct results', () => {
  const products = [
    makeProduct({ id: 'available', stockCount: 8, isPublished: true }),
    makeProduct({ id: 'low', stockCount: 4, isPublished: true }),
    makeProduct({ id: 'empty', stockCount: 0, isPublished: false }),
  ];

  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, stock: 'in' }).map(product => product.id), ['available', 'low']);
  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, stock: 'low' }).map(product => product.id), ['low']);
  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, stock: 'out' }).map(product => product.id), ['empty']);
  assert.deepEqual(filterAndSortAdminProducts(products, { ...defaultFilters, publication: 'draft' }).map(product => product.id), ['empty']);
});
