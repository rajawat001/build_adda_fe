import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Card, Loading, Button, Badge } from '../../components/ui';
import { FiDollarSign, FiAlertTriangle, FiLock, FiClock, FiArrowDownRight, FiArrowUpRight, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import commissionService from '../../services/commission.service';

const WalletPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [txPage]);

  const loadData = async () => {
    try {
      const [walletRes, dashRes] = await Promise.all([
        commissionService.getMyWallet(),
        commissionService.getCommissionDashboard()
      ]);
      setWallet(walletRes.wallet);
      setDashboard(dashRes.dashboard);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.info('No commission wallet found. You may not be on a commission plan.');
      } else {
        toast.error('Failed to load wallet data');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await commissionService.getMyTransactions({ page: txPage, limit: 15 });
      setTransactions(res.transactions || []);
      setTxTotal(res.pagination?.pages || 0);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const getBalanceColor = () => {
    if (!wallet || !dashboard) return '#10b981';
    const ratio = wallet.balance / (dashboard.walletLimit || 1);
    if (ratio >= 0.8) return '#ef4444';
    if (ratio >= 0.5) return '#f59e0b';
    return '#10b981';
  };

  const getBalancePercentage = () => {
    if (!wallet || !dashboard?.walletLimit) return 0;
    return Math.min(100, (wallet.balance / dashboard.walletLimit) * 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'commission_charge': return <FiArrowUpRight style={{ color: '#ef4444' }} />;
      case 'payment': return <FiArrowDownRight style={{ color: '#10b981' }} />;
      case 'reversal': return <FiRefreshCw style={{ color: '#3b82f6' }} />;
      case 'adjustment': return <FiDollarSign style={{ color: '#f59e0b' }} />;
      default: return <FiDollarSign />;
    }
  };

  if (loading) {
    return <DistributorLayout title="Commission Wallet"><Loading /></DistributorLayout>;
  }

  if (!wallet) {
    return (
      <DistributorLayout title="Commission Wallet">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>No commission wallet found.</p>
          <button onClick={() => router.push('/distributor/plan-selection')} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            Select a Plan
          </button>
        </div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title="Commission Wallet">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Lock Warning Banner */}
        {wallet.status === 'locked' && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiLock style={{ color: '#ef4444', flexShrink: 0, width: '24px', height: '24px' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#991b1b' }}>Account Locked</div>
              <div style={{ color: '#b91c1c', fontSize: '0.875rem' }}>Your account is locked due to unpaid commission. Please make a payment to unlock.</div>
            </div>
            <button onClick={() => router.push('/distributor/commission-payment')} style={{ marginLeft: 'auto', padding: '0.5rem 1.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Pay Now
            </button>
          </div>
        )}

        {/* Grace Period Warning */}
        {wallet.isLimitExceeded && wallet.status !== 'locked' && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiAlertTriangle style={{ color: '#f59e0b', flexShrink: 0, width: '24px', height: '24px' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#92400e' }}>Wallet Limit Reached</div>
              <div style={{ color: '#a16207', fontSize: '0.875rem' }}>
                Grace period expires {wallet.graceExpiresAt ? formatDate(wallet.graceExpiresAt) : 'soon'}. Pay before then to avoid getting locked.
              </div>
            </div>
            <button onClick={() => router.push('/distributor/commission-payment')} style={{ marginLeft: 'auto', padding: '0.5rem 1.25rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Pay Now
            </button>
          </div>
        )}

        {/* Balance Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Outstanding Balance</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: getBalanceColor() }}>
                ₹{wallet.balance?.toLocaleString('en-IN')}
              </div>
            </div>
            {dashboard?.plan && (
              <div style={{ textAlign: 'right' }}>
                <Badge variant={wallet.status === 'locked' ? 'error' : wallet.status === 'active' ? 'success' : 'warning'}>
                  {wallet.status?.toUpperCase()}
                </Badge>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  {dashboard.plan.name} ({dashboard.plan.type === 'percentage' ? `${dashboard.plan.value}%` : `₹${dashboard.plan.value}/order`})
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.375rem' }}>
              <span>₹0</span>
              <span>Limit: ₹{dashboard?.walletLimit?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ height: '10px', background: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${getBalancePercentage()}%`, background: getBalanceColor(), borderRadius: '999px', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          <button onClick={() => router.push('/distributor/commission-payment')} style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.938rem' }}>
            Make Payment
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Charged', value: `₹${dashboard?.totalCharged?.toLocaleString('en-IN') || 0}`, color: '#ef4444' },
            { label: 'Total Paid', value: `₹${dashboard?.totalPaid?.toLocaleString('en-IN') || 0}`, color: '#10b981' },
            { label: 'Total Orders', value: dashboard?.totalOrders || 0, color: '#3b82f6' },
            { label: 'Last Payment', value: dashboard?.lastPaymentDate ? new Date(dashboard.lastPaymentDate).toLocaleDateString('en-IN') : 'Never', color: '#8b5cf6' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 1rem', color: '#1a202c' }}>Transaction History</h3>

          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No transactions yet</div>
          ) : (
            <div>
              {transactions.map((tx: any) => (
                <div key={tx._id} style={{ display: 'flex', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid #f3f4f6', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#1a202c', fontSize: '0.875rem' }}>{tx.description}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{formatDate(tx.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: tx.amount > 0 ? '#ef4444' : '#10b981', fontSize: '0.938rem' }}>
                      {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Bal: ₹{tx.balanceAfter?.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {txTotal > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <button disabled={txPage <= 1} onClick={() => setTxPage(p => p - 1)} style={{ padding: '0.375rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: txPage <= 1 ? 'not-allowed' : 'pointer', opacity: txPage <= 1 ? 0.5 : 1 }}>Prev</button>
                  <span style={{ padding: '0.375rem 0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>Page {txPage} of {txTotal}</span>
                  <button disabled={txPage >= txTotal} onClick={() => setTxPage(p => p + 1)} style={{ padding: '0.375rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: txPage >= txTotal ? 'not-allowed' : 'pointer', opacity: txPage >= txTotal ? 0.5 : 1 }}>Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DistributorLayout>
  );
};

export default WalletPage;
