import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUsers, FiSearch, FiPhone, FiMail, FiMapPin, FiLink, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import { motion } from 'framer-motion';
import api from '../../services/api';

interface OfflineCustomer {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  city?: string;
  state?: string;
  distributors: Array<{ _id: string; businessName: string; city?: string }>;
  linkedUser?: { _id: string; name: string; email: string };
  createdAt: string;
}

const OfflineCustomersPage: React.FC = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<OfflineCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 20 };
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/admin/offline-customers', { params });
      setCustomers(res.data?.customers || []);
      setTotalPages(res.data?.meta?.totalPages || (res as any).meta?.totalPages || 1);
      setTotalItems(res.data?.meta?.total || (res as any).meta?.total || 0);
    } catch (err) {
      console.error('Error fetching offline customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Offline Customers</h1>
            <p className="page-subtitle">Customers created by distributors for manual/offline orders</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <StatCard title="Total Offline Customers" value={totalItems} icon={FiUsers} trend={{ value: 0, isPositive: true }} />
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <FiSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-secondary)' }} />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="form-input"
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-secondary)' }}>Loading...</div>
        ) : customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-secondary)' }}>
            <FiUsers size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No offline customers found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Linked Distributors</th>
                  <th>Linked User</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => router.push(`/admin/offline-customer-detail/${c._id}`)}
                    style={{ cursor: 'pointer' }}
                    whileHover={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
                        <FiPhone size={12} /> {c.phone}
                      </span>
                    </td>
                    <td>
                      {c.email ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
                          <FiMail size={12} /> {c.email}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--admin-text-tertiary)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td>{c.city || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {c.distributors.map(d => (
                          <span key={d._id} style={{
                            padding: '2px 8px', background: 'var(--admin-bg-secondary)',
                            borderRadius: 4, fontSize: '0.75rem', fontWeight: 500
                          }}>
                            {d.businessName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {c.linkedUser ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#16a34a' }}>
                          <FiLink size={12} /> {c.linkedUser.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--admin-text-tertiary)', fontSize: '0.8rem' }}>Not linked</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
                      {formatDate(c.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
              <FiChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, color: 'var(--admin-text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OfflineCustomersPage;
