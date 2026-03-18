import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/Layout';
import api from '../../services/api';
import { FiSearch, FiToggleLeft, FiToggleRight, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface Distributor {
  _id: string;
  businessName: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  isActive: boolean;
  isApproved: boolean;
  tempDisabled: boolean;
  tempDisabledAt: string | null;
  tempDisabledReason: string | null;
  tempEnabledAt: string | null;
  planType: string;
  createdAt: string;
}

const DistributorStatusPage = () => {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ distributor: Distributor; action: 'disable' | 'enable' } | null>(null);
  const [disableReason, setDisableReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDistributors = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await api.get('/admin/distributors', { params });
      let data = response.data.distributors || [];

      // Client-side filter by status
      if (statusFilter === 'disabled') {
        data = data.filter((d: Distributor) => d.tempDisabled);
      } else if (statusFilter === 'active') {
        data = data.filter((d: Distributor) => !d.tempDisabled && d.isActive);
      }

      setDistributors(data);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching distributors:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchDistributors(), 300);
    return () => clearTimeout(debounce);
  }, [fetchDistributors]);

  const handleToggleDisable = async () => {
    if (!showConfirm) return;
    const { distributor, action } = showConfirm;

    try {
      setActionLoading(distributor._id);
      await api.put(`/admin/distributors/${distributor._id}/toggle-disable`, {
        action,
        reason: action === 'disable' ? disableReason : undefined
      });
      await fetchDistributors();
      setShowConfirm(null);
      setDisableReason('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const disabledCount = distributors.filter(d => d.tempDisabled).length;

  return (
    <AdminLayout title="Distributor Status" requiredPermission="distributors.view">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ cursor: 'pointer', border: statusFilter === 'all' ? '2px solid #667eea' : undefined }} onClick={() => setStatusFilter('all')}>
          <div className="stat-card-title">All Distributors</div>
          <div className="stat-card-value">{distributors.length}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', border: statusFilter === 'active' ? '2px solid #10b981' : undefined }} onClick={() => setStatusFilter('active')}>
          <div className="stat-card-icon" style={{ background: '#d1fae5', color: '#059669', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-card-title">Active</div>
          <div className="stat-card-value" style={{ color: '#059669' }}>{distributors.filter(d => !d.tempDisabled && d.isActive).length}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', border: statusFilter === 'disabled' ? '2px solid #ef4444' : undefined }} onClick={() => setStatusFilter('disabled')}>
          <div className="stat-card-icon" style={{ background: '#fee2e2', color: '#dc2626', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiAlertCircle />
          </div>
          <div className="stat-card-title">Disabled</div>
          <div className="stat-card-value" style={{ color: '#dc2626' }}>{disabledCount}</div>
        </div>
      </div>

      {/* Search */}
      <div className="data-table-wrapper">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="table-title">Manage Distributor Status</h3>
          <div style={{ position: 'relative', minWidth: '280px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by name, email, phone, city..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.813rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Business</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.813rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.813rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>City</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.813rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Plan</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontSize: '0.813rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontSize: '0.813rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Loading...</td></tr>
              ) : distributors.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No distributors found</td></tr>
              ) : (
                distributors.map((d) => (
                  <tr key={d._id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' }}>{d.businessName}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{d.name}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ color: '#4b5563', fontSize: '0.85rem' }}>{d.email}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{d.phone}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#4b5563', fontSize: '0.85rem' }}>{d.city}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: d.planType === 'subscription' ? '#dbeafe' : d.planType === 'commission' ? '#fef3c7' : '#f3f4f6',
                        color: d.planType === 'subscription' ? '#1d4ed8' : d.planType === 'commission' ? '#92400e' : '#6b7280'
                      }}>
                        {d.planType === 'none' ? 'No Plan' : d.planType.charAt(0).toUpperCase() + d.planType.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                      {d.tempDisabled ? (
                        <div>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#fee2e2', color: '#dc2626' }}>
                            Disabled
                          </span>
                          {d.tempDisabledAt && (
                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                              <FiClock style={{ verticalAlign: 'middle', marginRight: '2px' }} size={10} />
                              {formatDistanceToNow(new Date(d.tempDisabledAt), { addSuffix: true })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#d1fae5', color: '#059669' }}>
                          Active
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setShowConfirm({ distributor: d, action: d.tempDisabled ? 'enable' : 'disable' });
                          setDisableReason('');
                        }}
                        disabled={actionLoading === d._id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.813rem',
                          color: 'white',
                          background: d.tempDisabled
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          opacity: actionLoading === d._id ? 0.6 : 1
                        }}
                      >
                        {d.tempDisabled ? <><FiToggleRight size={14} /> Enable</> : <><FiToggleLeft size={14} /> Disable</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: page === i + 1 ? '#667eea' : 'white',
                  color: page === i + 1 ? 'white' : '#4b5563',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: showConfirm.action === 'disable' ? '#fee2e2' : '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.5rem'
              }}>
                {showConfirm.action === 'disable' ? <FiAlertCircle color="#dc2626" /> : <FiCheckCircle color="#059669" />}
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#1f2937' }}>
                {showConfirm.action === 'disable' ? 'Disable Distributor?' : 'Enable Distributor?'}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                {showConfirm.action === 'disable'
                  ? `"${showConfirm.distributor.businessName}" will be hidden from the website and their panel access will be blocked.`
                  : `"${showConfirm.distributor.businessName}" will be re-enabled. Their subscription days will be extended for the paused period.`
                }
              </p>
            </div>

            {showConfirm.action === 'disable' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                  Reason for disabling (optional)
                </label>
                <textarea
                  value={disableReason}
                  onChange={(e) => setDisableReason(e.target.value)}
                  placeholder="e.g., Inactive for a long time, no products added..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setShowConfirm(null); setDisableReason(''); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  color: '#6b7280',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleToggleDisable}
                disabled={!!actionLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: showConfirm.action === 'disable'
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  opacity: actionLoading ? 0.6 : 1
                }}
              >
                {actionLoading ? 'Processing...' : showConfirm.action === 'disable' ? 'Yes, Disable' : 'Yes, Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DistributorStatusPage;
