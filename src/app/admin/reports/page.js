'use client';

import React, { useState, useEffect } from 'react';
import { getOperationalDashboardSummary } from '@/services/reportingService';
import { getAllOrders } from '@/services/orderEngine';
import { getAllProductsAdmin } from '@/services/productService';
import { formatPrice } from '@/utils/formatPrice';
import Link from 'next/link';

export default function SimpleAdminReportsPage() {
  // Redirect to settings/reports tab
  if (typeof window !== 'undefined') {
    window.location.replace('/admin/settings');
  }
  return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#7A6E73' }}>
      Redirecting to Reports...
    </div>
  );
}
