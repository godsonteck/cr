'use client';

import React, { useState } from 'react';

export default function Accordion({ items = [], allowMultiple = false, defaultOpenIndex = 0 }) {
  const [openIndices, setOpenIndices] = useState(
    defaultOpenIndex !== null ? [defaultOpenIndex] : []
  );

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenIndices((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndices((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className="accordion-root">
      {items.map((item, index) => {
        const isOpen = openIndices.includes(index);
        return (
          <div key={index} className={`accordion-item ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="accordion-trigger"
              onClick={() => toggleItem(index)}
              aria-expanded={isOpen}
            >
              <span className="accordion-title">{item.title}</span>
              <span className="accordion-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="accordion-content">
                <div className="accordion-inner">{item.content}</div>
              </div>
            )}
          </div>
        );
      })}
      <style jsx>{`
        .accordion-root {
          border-top: 1px solid var(--color-border-light);
        }
        .accordion-item {
          border-bottom: 1px solid var(--color-border-light);
        }
        .accordion-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) 0;
          text-align: left;
          background: none;
          border: none;
          color: var(--color-text);
          font-weight: var(--weight-medium);
          font-size: var(--text-base);
          cursor: pointer;
        }
        .accordion-trigger:hover {
          color: var(--color-primary);
        }
        .accordion-icon {
          display: flex;
          align-items: center;
          color: var(--color-text-secondary);
        }
        .accordion-content {
          padding-bottom: var(--space-4);
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
          animation: fadeIn var(--duration-fast) var(--ease-out);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
