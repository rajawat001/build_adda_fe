import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin, FiLink, FiShoppingCart, FiDollarSign, FiPackage, FiClock } from 'react-icons/fi';
import AdminLayout from '../../../components/admin/Layout';
import api from '../../../services/api';

interface OfflineCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  distributors: Array<{ _id: string; businessName: string; city?: string; phone?: string; email?: string }>;
  linkedUser?: { _id: string; name: string; email: string };
  createdAt: string;
}

interface OrderItem {
  product: { name: string; price: number; image?: string };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
}

interface DistributorOrders {
  distributor: { _id: string; businessName: string; city?: string };
  orders: Order[];
  totalPurchase: number;
  orderCount: number;
}

const statusColors: Record<string, string> = {
  confirmed: '#2563eb',
  processing: '#d97706',
  shipped: '#7c3aed',
  delivered: '#16a34a',
  cancelled: '#dc2626',
  pending: '#6b7280',
};

const OfflineCustomerDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState<OfflineCustomer | null>(null);
  const [distributorWiseOrders, setDistributorWiseOrders] = useState<DistributorOrders[]>([]);
  const [lifetimePurchase, setLifetimePurchase] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchCustomerDetail();
  }, [id]);

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/offline-customers/${id}`);
      const data = res.data;
      setCustomer(data.customer);
      setDistributorWiseOrders(data.distributorWiseOrders || []);
      setLifetimePurchase(data.lifetimePurchase || 0);
      setTotalOrders(data.totalOrders || 0);
    } catch (err) {
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--admin-text-secondary)' }}>Loading...</div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--admin-text-secondary)' }}>Customer not found</p>
          <button className="btn btn-primary" onClick={() => router.back()} style={{ marginTop: 12 }}>Go Back</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page" style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => router.push('/admin/offline-customers')} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>{customer.name}</h1>
            <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.85rem', margin: '2px 0 0' }}>
              Offline Customer since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>

        {/* Top Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border-primary)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Lifetime Purchase</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>{formatCurrency(lifetimePurchase)}</div>
          </div>
          <div style={{ background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border-primary)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Total Orders</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{totalOrders}</div>
          </div>
          <div style={{ background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border-primary)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Linked Distributors</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{customer.distributors.length}</div>
          </div>
          <div style={{ background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border-primary)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Registered User</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
              {customer.linkedUser ? (
                <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiLink size={14} /> {customer.linkedUser.name}
                </span>
              ) : (
                <span style={{ color: 'var(--admin-text-tertiary)' }}>Not linked</span>
              )}
            </div>
          </div>
        </div>

        {/* Customer Info Card */}
        <div style={{ background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border-primary)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--admin-text-secondary)' }}>Customer Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiPhone size={15} style={{ color: 'var(--admin-text-tertiary)' }} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--admin-text-tertiary)' }}>Phone</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{customer.phone}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiMail size={15} style={{ color: 'var(--admin-text-tertiary)' }} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--admin-text-tertiary)' }}>Email</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{customer.email}</div>
              </div>
            </div>
            {customer.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiMapPin size={15} style={{ color: 'var(--admin-text-tertiary)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--admin-text-tertiary)' }}>Location</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {[customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}
                  </div>
                </div>
              </div>
            )}
            {customer.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiMapPin size={15} style={{ color: 'var(--admin-text-tertiary)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--admin-text-tertiary)' }}>Address</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{customer.address}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Distributor-wise Order History */}
        {distributorWiseOrders.length === 0 ? (
          <div style={{ background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border-primary)', borderRadius: 10, padding: 40, textAlign: 'center' }}>
            <FiShoppingCart size={36} style={{ color: 'var(--admin-text-tertiary)', marginBottom: 8 }} />
            <p style={{ color: 'var(--admin-text-secondary)', fontSize: 14 }}>No orders found for this customer</p>
          </div>
        ) : (
          distributorWiseOrders.map((section, sIdx) => (
            <div key={sIdx} style={{ background: 'var(--admin-bg-card)', border: '1px solid var(--admin-border-primary)', borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
              {/* Distributor Header */}
              <div style={{
                padding: '14px 20px',
                background: 'var(--admin-bg-secondary)',
                borderBottom: '1px solid var(--admin-border-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    <FiPackage size={14} style={{ marginRight: 6, verticalAlign: -1 }} />
                    {section.distributor.businessName}
                  </div>
                  {section.distributor.city && (
                    <div style={{ fontSize: 12, color: 'var(--admin-text-secondary)', marginTop: 2 }}>
                      <FiMapPin size={11} style={{ marginRight: 3 }} />{section.distributor.city}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'var(--admin-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orders</div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{section.orderCount}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'var(--admin-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Purchase</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#16a34a' }}>{formatCurrency(section.totalPurchase)}</div>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="table-container" style={{ margin: 0 }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.orders.map(order => (
                      <tr key={order._id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/admin/orders`)}>
                        <td>
                          <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            #{order.orderNumber}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>
                          <FiClock size={11} style={{ marginRight: 3 }} />
                          {formatDate(order.createdAt)}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem' }}>
                            {order.items.slice(0, 2).map((item, i) => (
                              <div key={i} style={{ color: 'var(--admin-text-secondary)' }}>
                                {item.product?.name || 'Product'} x{item.quantity}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div style={{ color: 'var(--admin-text-tertiary)', fontSize: '0.75rem' }}>
                                +{order.items.length - 2} more
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: statusColors[order.orderStatus] || '#6b7280',
                            background: `${statusColors[order.orderStatus] || '#6b7280'}15`,
                            textTransform: 'capitalize'
                          }}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', textTransform: 'capitalize' }}>
                            {order.paymentMethod} — {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default OfflineCustomerDetailPage;
