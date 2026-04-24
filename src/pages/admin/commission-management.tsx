import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/Layout';
import { Card, Button, Badge, Modal, StatsCard } from '../../components/ui';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiDollarSign, FiLock, FiAlertTriangle, FiUsers, FiUnlock, FiEdit2, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import commissionService from '../../services/commission.service';

const CommissionManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Detail modal
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Adjustment modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustDistributorId, setAdjustDistributorId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadWallets();
  }, [statusFilter, page]);

  const loadDashboard = async () => {
    try {
      const res = await commissionService.adminGetDashboard();
      setDashboard(res.dashboard);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadWallets = async () => {
    setLoading(true);
    try {
      const res = await commissionService.adminGetWallets({ status: statusFilter || undefined, page, limit: 20 });
      setWallets(res.wallets || []);
      setTotalPages(res.pagination?.pages || 0);
    } catch (error) {
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const viewWalletDetails = async (distributorId: string) => {
    setDetailLoading(true);
    try {
      const res = await commissionService.adminGetWalletDetails(distributorId);
      setSelectedWallet(res.wallet);
    } catch (error) {
      toast.error('Failed to load wallet details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleForceUnlock = async (distributorId: string) => {
    try {
      await commissionService.adminForceUnlock(distributorId);
      toast.success('Distributor unlocked');
      loadWallets();
      loadDashboard();
      if (selectedWallet) viewWalletDetails(distributorId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unlock');
    }
  };

  const handleAdjust = async () => {
    if (!adjustAmount || !adjustReason) {
      toast.error('Amount and reason are required');
      return;
    }

    setAdjusting(true);
    try {
      await commissionService.adminAdjustWallet(adjustDistributorId, {
        amount: parseFloat(adjustAmount),
        reason: adjustReason,
      });
      toast.success('Wallet adjusted');
      setShowAdjustModal(false);
      setAdjustAmount('');
      setAdjustReason('');
      loadWallets();
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Adjustment failed');
    } finally {
      setAdjusting(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid var(--border-primary, #e5e7eb)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    background: 'var(--bg-primary, #ffffff)',
    color: 'var(--text-primary, #1a202c)',
    boxSizing: 'border-box',
  };

  return (
    <AdminLayout title="Commission Management" requiredPermission="subscriptions.view">
      {/* Dashboard Stats */}
      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Outstanding', value: `₹${dashboard.totalOutstanding?.toLocaleString('en-IN')}`, icon: <FiDollarSign />, color: '#ef4444' },
            { label: 'Total Collected', value: `₹${dashboard.totalCollected?.toLocaleString('en-IN')}`, icon: <FiDollarSign />, color: '#10b981' },
            { label: 'Total Wallets', value: dashboard.totalWallets, icon: <FiUsers />, color: '#3b82f6' },
            { label: 'Locked', value: dashboard.lockedWallets, icon: <FiLock />, color: '#ef4444' },
            { label: 'Limit Exceeded', value: dashboard.limitExceededWallets, icon: <FiAlertTriangle />, color: '#f59e0b' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'All', value: '' },
          { label: 'Active', value: 'active' },
          { label: 'Locked', value: 'locked' },
          { label: 'Limit Exceeded', value: 'limit_exceeded' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => { setStatusFilter(filter.value); setPage(1); }}
            style={{
              padding: '0.5rem 1rem',
              border: statusFilter === filter.value ? '2px solid #667eea' : '1px solid #e5e7eb',
              borderRadius: '8px',
              background: statusFilter === filter.value ? '#eef2ff' : 'white',
              color: statusFilter === filter.value ? '#667eea' : '#374151',
              fontWeight: statusFilter === filter.value ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.813rem',
              transition: 'all 0.2s',
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Wallets Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}><LoadingSpinner /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary, #f9fafb)', borderBottom: '1px solid #e5e7eb' }}>
                  {['Distributor', 'Plan', 'Balance', 'Limit', 'Status', 'Last Payment', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wallets.map((w: any) => (
                  <tr key={w._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{w.distributor?.businessName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{w.distributor?.email}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.813rem' }}>
                      {w.commissionPlan?.name || '-'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontWeight: 700, color: w.balance > (w.commissionPlan?.walletLimit * 0.8) ? '#ef4444' : w.balance > (w.commissionPlan?.walletLimit * 0.5) ? '#f59e0b' : '#10b981' }}>
                        ₹{w.balance?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.813rem' }}>
                      ₹{w.commissionPlan?.walletLimit?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge variant={w.status === 'locked' ? 'error' : w.isLimitExceeded ? 'warning' : 'success'}>
                        {w.status === 'locked' ? 'LOCKED' : w.isLimitExceeded ? 'LIMIT HIT' : 'ACTIVE'}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.813rem', color: '#6b7280' }}>
                      {formatDate(w.lastPaymentDate)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button onClick={() => viewWalletDetails(w.distributor?._id)} title="View" style={{ padding: '0.375rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', color: '#6b7280' }}>
                          <FiEye size={14} />
                        </button>
                        <button onClick={() => { setAdjustDistributorId(w.distributor?._id); setShowAdjustModal(true); }} title="Adjust" style={{ padding: '0.375rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', color: '#f59e0b' }}>
                          <FiEdit2 size={14} />
                        </button>
                        {w.status === 'locked' && (
                          <button onClick={() => handleForceUnlock(w.distributor?._id)} title="Unlock" style={{ padding: '0.375rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', color: '#10b981' }}>
                            <FiUnlock size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {wallets.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No wallets found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.375rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}>Prev</button>
          <span style={{ padding: '0.375rem 0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '0.375rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}>Next</button>
        </div>
      )}

      {/* Wallet Detail Modal */}
      <Modal isOpen={!!selectedWallet} title={`Wallet: ${selectedWallet?.distributor?.businessName || ''}`} onClose={() => setSelectedWallet(null)}>
          {detailLoading ? <LoadingSpinner /> : selectedWallet ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Balance</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>₹{selectedWallet.balance?.toLocaleString('en-IN')}</div></div>
                <div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Status</div><div><Badge variant={selectedWallet.status === 'locked' ? 'error' : 'success'}>{selectedWallet.status?.toUpperCase()}</Badge></div></div>
                <div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Charged</div><div style={{ fontWeight: 600 }}>₹{selectedWallet.totalCommissionCharged?.toLocaleString('en-IN')}</div></div>
                <div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Paid</div><div style={{ fontWeight: 600 }}>₹{selectedWallet.totalCommissionPaid?.toLocaleString('en-IN')}</div></div>
                <div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Orders</div><div style={{ fontWeight: 600 }}>{selectedWallet.totalOrders}</div></div>
                <div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Last Payment</div><div style={{ fontWeight: 600 }}>{formatDate(selectedWallet.lastPaymentDate)}</div></div>
              </div>

              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.938rem', fontWeight: 700 }}>Recent Transactions</h4>
              {selectedWallet.recentTransactions?.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedWallet.recentTransactions.map((tx: any) => (
                    <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.813rem' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{tx.description}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{formatDate(tx.createdAt)}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: tx.amount > 0 ? '#ef4444' : '#10b981' }}>
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>No transactions</div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                {selectedWallet.status === 'locked' && (
                  <button onClick={() => handleForceUnlock(selectedWallet.distributor?._id)} style={{ padding: '0.625rem 1.25rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    <FiUnlock style={{ marginRight: '0.375rem' }} /> Force Unlock
                  </button>
                )}
                <button onClick={() => { setAdjustDistributorId(selectedWallet.distributor?._id); setShowAdjustModal(true); setSelectedWallet(null); }} style={{ padding: '0.625rem 1.25rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: 500 }}>
                  Adjust Balance
                </button>
              </div>
            </div>
          ) : null}
        </Modal>

      {/* Adjustment Modal */}
      <Modal isOpen={showAdjustModal} title="Adjust Wallet Balance" onClose={() => { setShowAdjustModal(false); setAdjustAmount(''); setAdjustReason(''); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Amount (negative to reduce balance) *</label>
              <input type="number" style={inputStyle} value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="e.g., -500 or 200" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Reason *</label>
              <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Reason for this adjustment" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => { setShowAdjustModal(false); setAdjustAmount(''); setAdjustReason(''); }} style={{ padding: '0.625rem 1.25rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAdjust} disabled={adjusting} style={{ padding: '0.625rem 1.25rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: adjusting ? 'not-allowed' : 'pointer', opacity: adjusting ? 0.7 : 1 }}>
                {adjusting ? 'Adjusting...' : 'Apply Adjustment'}
              </button>
            </div>
          </div>
        </Modal>
    </AdminLayout>
  );
};

export default CommissionManagementPage;
