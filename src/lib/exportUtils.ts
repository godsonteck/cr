/**
 * CSV and Report Export Utilities for CR COSMETICS AND ESSENTIALS Admin Platform
 */

import { Product, Order, Customer, InventoryMovement } from '../types';

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        const val = row[header] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProductsCSV(products: Product[]) {
  const data = products.map(p => ({
    ID: p.id,
    Name: p.name,
    Brand: p.brand,
    Department: p.department,
    Category: p.category,
    Price_GHS: p.price.toFixed(2),
    OriginalPrice_GHS: p.originalPrice ? p.originalPrice.toFixed(2) : '',
    StockCount: p.stockCount,
    InStock: p.inStock ? 'Yes' : 'No',
    IsPublished: p.isPublished !== false ? 'Yes' : 'No',
    Rating: p.rating,
    ReviewCount: p.reviewCount,
    Origin: p.origin || '',
    Unit: p.unit || '',
  }));
  exportToCSV('CR_Cosmetics_Products', data);
}

export function exportOrdersCSV(orders: Order[]) {
  const data = orders.map(o => ({
    OrderNumber: o.orderNumber,
    Date: new Date(o.createdAt).toLocaleString('en-GB'),
    CustomerName: o.shippingAddress.fullName,
    CustomerPhone: o.shippingAddress.phone,
    CustomerEmail: o.shippingAddress.email || '',
    City: o.shippingAddress.city,
    Area: o.shippingAddress.area,
    ItemsCount: o.items.length,
    Subtotal_GHS: o.subtotal.toFixed(2),
    ShippingFee_GHS: o.shippingFee.toFixed(2),
    Discount_GHS: o.discount.toFixed(2),
    Total_GHS: o.total.toFixed(2),
    PaymentMethod: o.paymentMethod,
    PaymentStatus: o.paymentStatus,
    DeliveryMethod: o.deliveryMethod,
    Status: o.status,
    AppliedCoupon: o.appliedPromoCode || '',
    CourierName: o.riderInfo?.riderName || '',
    CourierPhone: o.riderInfo?.riderPhone || '',
  }));
  exportToCSV('CR_Cosmetics_Orders', data);
}

export function exportCustomersCSV(customers: Customer[]) {
  const data = customers.map(c => ({
    CustomerID: c.id,
    FullName: c.fullName,
    Phone: c.phone,
    Email: c.email,
    TotalOrders: c.ordersCount,
    TotalSpent_GHS: c.totalSpent.toFixed(2),
    LastOrderDate: c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleString('en-GB') : '',
    CustomerSegment: c.segment,
    Status: c.status,
    City: c.addresses[0]?.city || '',
    Area: c.addresses[0]?.area || '',
    Notes: c.notes || '',
  }));
  exportToCSV('CR_Cosmetics_Customers', data);
}

export function exportStockHistoryCSV(movements: InventoryMovement[]) {
  const data = movements.map(m => ({
    Date: new Date(m.timestamp).toLocaleString('en-GB'),
    ProductID: m.productId,
    ProductName: m.productName,
    PreviousQty: m.previousQuantity,
    Adjustment: m.adjustment > 0 ? `+${m.adjustment}` : m.adjustment,
    NewQty: m.newQuantity,
    Reason: m.reason,
    Actor: m.actor,
    Notes: m.notes || '',
  }));
  exportToCSV('CR_Cosmetics_Stock_Ledger', data);
}
