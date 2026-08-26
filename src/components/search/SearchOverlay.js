'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/context/SearchContext';
import { formatPrice } from '@/utils/formatPrice';

export default function SearchOverlay() {
  const router = useRouter();
  const {
    isOpen,
    query,
    results,
    recentSearches,
    setQuery,
    closeSearch,
    saveRecentSearch,
    clearRecentSearches,
  } = useSearch();

  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('scroll-locked');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.classList.remove('scroll-locked');
    }
    return () => document.body.classList.remove('scroll-locked');
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSearch]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query);
    closeSearch();
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    saveRecentSearch(tag);
  };

  const handleProductClick = (slug) => {
    saveRecentSearch(query);
    closeSearch();
    router.push(`/shop/${slug}`);
  };

  return (
    <div className="search-overlay-root" role="dialog" aria-modal="true" aria-label="Search">
      <div className="search-backdrop" onClick={closeSearch} />
      <div className="search-panel">
        <div className="container container-narrow">
          {/* Search Header Form */}
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-box">
              <svg className="search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search skincare, groceries, face wash, rice, coffee..."
                className="search-main-input"
                aria-label="Search query"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="search-clear-btn"
                  aria-label="Clear input"
                >
                  &times;
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={closeSearch}
              className="search-cancel-btn"
            >
              Cancel
            </button>
          </form>

          {/* Quick Suggestions & Recent Searches */}
          {!query && (
            <div className="search-suggestions-area">
              {recentSearches.length > 0 && (
                <div className="suggestion-section">
                  <div className="suggestion-head">
                    <span className="section-title">Recent Searches</span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="clear-recent-btn"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="pill-group">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleTagClick(term)}
                        className="search-tag-pill"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="suggestion-section">
                <span className="section-title">Popular Categories</span>
                <div className="pill-group">
                  <button type="button" onClick={() => handleTagClick('Face')} className="search-tag-pill">
                    ✨ Face Cleanser & Creams
                  </button>
                  <button type="button" onClick={() => handleTagClick('Pantry')} className="search-tag-pill">
                    🛒 Rice & Cooking Oils
                  </button>
                  <button type="button" onClick={() => handleTagClick('Beverages')} className="search-tag-pill">
                    ☕ Coffee & Ghanaian Cocoa
                  </button>
                  <button type="button" onClick={() => handleTagClick('Body')} className="search-tag-pill">
                    🧴 Shea Butter & Lotions
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Search Results */}
          {query.trim() && (
            <div className="search-results-area">
              <div className="results-count-bar">
                <span>{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</span>
                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="view-all-results-btn"
                  >
                    View in Full Catalogue →
                  </button>
                )}
              </div>

              {results.length === 0 ? (
                <div className="no-results-box">
                  <p className="no-results-msg">No products found matching "{query}"</p>
                  <p className="no-results-sub">Try searching for broader keywords like "serum", "oil", "rice", or "soap".</p>
                </div>
              ) : (
                <div className="results-grid">
                  {results.slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="search-result-card"
                    >
                      <div className={`result-thumb ${product.category === 'skincare' ? 'thumb-sk' : 'thumb-gr'}`}>
                        <span>{product.category === 'skincare' ? '✨' : '🛒'}</span>
                      </div>
                      <div className="result-info">
                        <div className="result-name">{product.name}</div>
                        <div className="result-category">{product.subcategory || product.category}</div>
                        <div className="result-price">{formatPrice(product.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .search-overlay-root {
          position: fixed;
          inset: 0;
          z-index: var(--z-modal);
          display: flex;
          flex-direction: column;
        }
        .search-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          animation: fadeIn var(--duration-fast) var(--ease-out);
        }
        .search-panel {
          position: relative;
          z-index: 1;
          background: var(--color-surface);
          padding-top: var(--space-6);
          padding-bottom: var(--space-8);
          box-shadow: var(--shadow-xl);
          max-height: 85vh;
          overflow-y: auto;
          animation: slideDown var(--duration-normal) var(--ease-out);
        }
        .search-form {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }
        .search-input-box {
          flex: 1;
          display: flex;
          align-items: center;
          position: relative;
          background: var(--color-bg-alt);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 0 var(--space-4);
          transition: border-color var(--duration-fast);
        }
        .search-input-box:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-subtle);
        }
        .search-icon {
          color: var(--color-text-secondary);
          flex-shrink: 0;
          margin-right: var(--space-3);
        }
        .search-main-input {
          width: 100%;
          height: 52px;
          border: none;
          background: transparent;
          font-size: var(--text-md);
          color: var(--color-text);
          outline: none;
        }
        .search-clear-btn {
          font-size: 20px;
          color: var(--color-text-tertiary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0 4px;
        }
        .search-cancel-btn {
          background: none;
          border: none;
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: var(--space-2);
        }
        .search-cancel-btn:hover {
          color: var(--color-text);
        }
        .search-suggestions-area {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
        .suggestion-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .suggestion-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .section-title {
          font-size: var(--text-xs);
          font-weight: var(--weight-bold);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
          color: var(--color-text-secondary);
        }
        .clear-recent-btn {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          background: none;
          border: none;
          cursor: pointer;
        }
        .clear-recent-btn:hover {
          color: var(--color-error);
        }
        .pill-group {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .search-tag-pill {
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-full);
          background-color: var(--color-bg-alt);
          border: 1px solid var(--color-border);
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          color: var(--color-text);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .search-tag-pill:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background-color: var(--color-surface);
        }
        .search-results-area {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .results-count-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          padding-bottom: var(--space-2);
          border-bottom: 1px solid var(--color-border-light);
        }
        .view-all-results-btn {
          background: none;
          border: none;
          color: var(--color-primary);
          font-weight: var(--weight-semibold);
          font-size: var(--text-xs);
          cursor: pointer;
        }
        .results-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-3);
        }
        @media (min-width: 640px) {
          .results-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .search-result-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-light);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .search-result-card:hover {
          border-color: var(--color-primary);
          background-color: var(--color-bg-alt);
        }
        .result-thumb {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .thumb-sk {
          background-color: var(--color-primary-subtle);
        }
        .thumb-gr {
          background-color: var(--color-secondary-subtle);
        }
        .result-info {
          flex: 1;
        }
        .result-name {
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          color: var(--color-text);
          line-height: 1.3;
        }
        .result-category {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }
        .result-price {
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: var(--color-text);
          margin-top: 2px;
        }
        .no-results-box {
          padding: var(--space-8) 0;
          text-align: center;
        }
        .no-results-msg {
          font-weight: var(--weight-semibold);
          color: var(--color-text);
          margin-bottom: var(--space-1);
        }
        .no-results-sub {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
