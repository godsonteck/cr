'use client';

import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { filterProducts, getPriceRange } from '@/services/productService';
import { SORT_OPTIONS } from '@/utils/constants';

function ShopContent() {
  const params = useSearchParams();
  const router = useRouter();
  const category = params.get('category') || '';
  const subcategory = params.get('subcategory') || '';
  const query = params.get('q') || '';
  const brand = params.get('brand') || '';
  const sort = params.get('sort') || 'default';
  const inStock = params.get('inStock') === 'true';
  const ranges = getPriceRange();
  const [mobileFilters, setMobileFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(Number(params.get('maxPrice')) || ranges.max);
  const products = useMemo(() => filterProducts({ category: category || undefined, subcategory: subcategory || undefined, brand: brand || undefined, query: query || undefined, maxPrice, inStockOnly: inStock || undefined, sortBy: sort }), [category, subcategory, brand, query, maxPrice, inStock, sort]);

  const push = useCallback((changes = {}) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.push(`/shop${next.toString() ? `?${next}` : ''}`);
  }, [params, router]);

  const reset = () => { setMaxPrice(ranges.max); router.push('/shop'); };
  const title = query ? `Results for “${query}”` : subcategory ? subcategory : category === 'skincare' ? 'Beauty & Care' : category === 'groceries' ? 'Everyday Essentials' : 'The CR Edit';
  const Filter = () => <div className="cr-shop-filter"><div className="cr-filter-heading-wrap"><span>REFINE</span><strong>Find your fit</strong></div><button className="cr-filter-reset" onClick={reset}>Reset selection ↗</button><section><h4>Collection</h4>{[['','All products'],['skincare','Beauty & body'],['groceries','Everyday essentials']].map(([v,l]) => <button key={v || 'all'} className={`cr-filter-row${category === v ? ' active' : ''}`} onClick={() => push({ category:v, subcategory:'' })}><span>{l}</span><i>{v==='skincare'?'01':v==='groceries'?'02':'00'}</i></button>)}</section>{category === 'skincare' && <section><h4>Beauty edit</h4>{['Face','Body','Hair','Fragrances'].map(v => <button key={v} className={`cr-filter-row${subcategory === v ? ' active' : ''}`} onClick={() => push({subcategory:subcategory===v?'':v})}><span>{v}</span><i>↗</i></button>)}</section>}{category === 'groceries' && <section><h4>Essentials edit</h4>{['Pantry','Beverages','Snacks','Household'].map(v => <button key={v} className={`cr-filter-row${subcategory === v ? ' active' : ''}`} onClick={() => push({subcategory:subcategory===v?'':v})}><span>{v}</span><i>↗</i></button>)}</section>}<section><h4>Availability</h4><label className="cr-stock-check"><input type="checkbox" checked={inStock} onChange={e => push({inStock:e.target.checked?'true':''})}/><span />In stock only</label></section><section><div className="cr-price-line"><h4>Price ceiling</h4><b>GH₵ {maxPrice}</b></div><input type="range" min={ranges.min} max={ranges.max} step="10" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} onMouseUp={() => push({maxPrice:maxPrice<ranges.max?maxPrice:''})} onTouchEnd={() => push({maxPrice:maxPrice<ranges.max?maxPrice:''})}/><div className="cr-price-extremes"><span>GH₵ {ranges.min}</span><span>GH₵ {ranges.max}</span></div></section></div>;

  return <main className="cr-new-shop"><section className="cr-shop-mast"><div><span>CR COSMETICS &amp; ESSENTIALS / SHOP</span><h1>{title}</h1><p>Authentic beauty, body care and everyday essentials selected for real life in Accra.</p><small>BOTWE · ACCRA &nbsp;•&nbsp; SHOP ONLINE OR VISIT US</small></div></section><div className="cr-shop-body"><aside><Filter/></aside><section className="cr-shop-results"><div className="cr-results-bar"><div><b>{String(products.length).padStart(2,'0')}</b><span> products</span></div><div className="cr-results-controls"><button onClick={() => setMobileFilters(true)}>FILTER +</button><label>SORT <select value={sort} onChange={e => push({sort:e.target.value === 'default' ? '' : e.target.value})}>{SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label></div></div>{products.length ? <div className="cr-new-shop-grid">{products.map(product => <ProductCard key={product.id} product={product}/>)}</div> : <div className="cr-new-empty"><span>CR</span><h2>Nothing here yet.</h2><p>Try another collection, search term or price range.</p><button onClick={reset}>RESET FILTERS ↗</button></div>}</section></div>{mobileFilters && <div className="cr-filter-overlay" onClick={() => setMobileFilters(false)}><div className="cr-filter-sheet" onClick={e => e.stopPropagation()}><div><span>CR EDIT</span><button onClick={() => setMobileFilters(false)}>×</button><h2>Refine your selection</h2></div><Filter/><button className="cr-filter-apply" onClick={() => setMobileFilters(false)}>SHOW {products.length} PRODUCTS</button></div></div>}</main>;
}

export default function ShopPage(){ return <Suspense fallback={<div style={{minHeight:'70vh'}}/>}><ShopContent/></Suspense>; }
