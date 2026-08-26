'use client';

import React, { useState } from 'react';

export default function Tabs({ tabs = [], defaultActive = 0, onChange }) {
  const [activeTab, setActiveTab] = useState(defaultActive);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onChange) onChange(index);
  };

  return (
    <div className="tabs-root">
      <div className="tabs-header" role="tablist">
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <button
              key={index}
              role="tab"
              aria-selected={isActive}
              className={`tab-btn ${isActive ? 'tab-active' : ''}`}
              onClick={() => handleTabClick(index)}
            >
              {tab.label}
              {tab.badge !== undefined && <span className="tab-badge">{tab.badge}</span>}
            </button>
          );
        })}
      </div>
      <div className="tab-content" role="tabpanel">
        {tabs[activeTab]?.content}
      </div>
      <style jsx>{`
        .tabs-root {
          width: 100%;
        }
        .tabs-header {
          display: flex;
          gap: var(--space-6);
          border-bottom: 1px solid var(--color-border);
          margin-bottom: var(--space-6);
          overflow-x: auto;
        }
        .tab-btn {
          position: relative;
          padding: var(--space-3) 0;
          font-weight: var(--weight-medium);
          font-size: var(--text-base);
          color: var(--color-text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: color var(--duration-fast);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .tab-btn:hover {
          color: var(--color-text);
        }
        .tab-btn.tab-active {
          color: var(--color-primary);
          font-weight: var(--weight-semibold);
        }
        .tab-btn.tab-active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-primary);
        }
        .tab-badge {
          background: var(--color-bg-alt);
          color: var(--color-text-secondary);
          font-size: var(--text-xs);
          padding: 2px 6px;
          border-radius: var(--radius-full);
        }
        .tab-content {
          animation: fadeIn var(--duration-fast) var(--ease-out);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
