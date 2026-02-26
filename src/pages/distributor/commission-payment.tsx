import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Card, Loading, Button } from '../../components/ui';
import { FiCreditCard, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import commissionService from '../../services/commission.service';

const CommissionPaymentPage = () => {
  const router = useRouter();
  const { merchantOrderId: queryMerchantOrderId } = router.query;
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [paying, setPaying] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'completed' | 'pending' | 'failed' | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadWalletData();
  }, []);

  // Handle return from PhonePe payment
  useEffect(() => {
    if (queryMerchantOrderId && typeof queryMerchantOrderId === 'string') {
      checkPaymentStatus(queryMerchantOrderId);
    }
  }, [queryMerchantOrderId]);

  // Cleanup poll on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const loadWalletData = async () => {
    try {
      const [walletRes, dashRes] = await Promise.all([
        commissionService.getMyWallet(),
        commissionService.getCommissionDashboard()
      ]);
      setWallet(walletRes.wallet);
      setDashboard(dashRes.dashboard);
    } catch (error: any) {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (mOrderId: string) => {
    setCheckingStatus(true);
    let attempts = 0;

    const poll = async () => {
      try {
        const res = await commissionService.checkPaymentStatus(mOrderId);
        if (res.paymentStatus === 'completed') {
          setPaymentResult('completed');
          toast.success('Payment successful! Your wallet has been updated.');
          if (pollRef.current) clearInterval(pollRef.current);
          setCheckingStatus(false);
          loadWalletData();
        } else if (res.paymentStatus === 'failed') {
          setPaymentResult('failed');
          toast.error('Payment failed. Please try again.');
          if (pollRef.current) clearInterval(pollRef.current);
          setCheckingStatus(false);
        } else {
          attempts++;
          if (attempts >= 10) {
            setPaymentResult('pending');
            if (pollRef.current) clearInterval(pollRef.current);
            setCheckingStatus(false);
          }
        }
      } catch (error) {
        attempts++;
        if (attempts >= 10) {
          setPaymentResult('pending');
          if (pollRef.current) clearInterval(pollRef.current);
          setCheckingStatus(false);
        }
      }
    };

    await poll();
    if (!paymentResult) {
      pollRef.current = setInterval(poll, 3000);
    }
  };

  const handlePayment = async () => {
    const payAmount = parseFloat(amount);
    if (!payAmount || payAmount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    if (dashboard?.plan?.minPaymentAmount && payAmount < dashboard.plan.minPaymentAmount) {
      toast.error(`Minimum payment is ₹${dashboard.plan.minPaymentAmount}`);
      return;
    }

    if (payAmount > (wallet?.balance || 0)) {
      toast.error('Amount cannot exceed your balance');
      return;
    }

    setPaying(true);
    try {
      const res = await commissionService.initiatePayment(payAmount);
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        toast.error('Failed to get payment URL');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment initiation failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <DistributorLayout title="Commission Payment"><Loading /></DistributorLayout>;
  }

  if (!wallet) {
    return (
      <DistributorLayout title="Commission Payment">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <p>No wallet found.</p>
        </div>
      </DistributorLayout>
    );
  }

  // Show payment result if we're checking
  if (checkingStatus || paymentResult) {
    return (
      <DistributorLayout title="Commission Payment">
        <div style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {checkingStatus && (
              <>
                <div style={{ width: '60px', height: '60px', border: '4px solid #e5e7eb', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
                <h3 style={{ color: '#1a202c', marginBottom: '0.5rem' }}>Verifying Payment</h3>
                <p style={{ color: '#6b7280' }}>Please wait while we confirm your payment...</p>
              </>
            )}
            {paymentResult === 'completed' && (
              <>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <FiCheck style={{ width: '32px', height: '32px', color: '#10b981' }} />
                </div>
                <h3 style={{ color: '#059669', marginBottom: '0.5rem' }}>Payment Successful!</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Your commission wallet has been updated.</p>
                <button onClick={() => router.push('/distributor/wallet')} style={{ padding: '0.75rem 2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                  View Wallet
                </button>
              </>
            )}
            {paymentResult === 'failed' && (
              <>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <FiX style={{ width: '32px', height: '32px', color: '#ef4444' }} />
                </div>
                <h3 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Payment Failed</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>The payment was not completed. Please try again.</p>
                <button onClick={() => { setPaymentResult(null); router.replace('/distributor/commission-payment'); }} style={{ padding: '0.75rem 2rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                  Try Again
                </button>
              </>
            )}
            {paymentResult === 'pending' && (
              <>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <FiClock style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
                </div>
                <h3 style={{ color: '#d97706', marginBottom: '0.5rem' }}>Payment Pending</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Payment is still being processed. It will be updated shortly.</p>
                <button onClick={() => router.push('/distributor/wallet')} style={{ padding: '0.75rem 2rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                  Go to Wallet
                </button>
              </>
            )}
          </div>
          <style jsx>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </DistributorLayout>
    );
  }

  const minPayment = dashboard?.plan?.minPaymentAmount || 1;

  return (
    <DistributorLayout title="Commission Payment">
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Current Balance */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Outstanding Balance</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444', margin: '0.25rem 0' }}>
            ₹{wallet.balance?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Minimum payment: ₹{minPayment.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Amount Input */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            Payment Amount (₹)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min ₹${minPayment}`}
            min={minPayment}
            max={wallet.balance}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontSize: '1.25rem',
              fontWeight: 700,
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#667eea')}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />

          {/* Quick Amount Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: `Min (₹${minPayment})`, value: minPayment },
              { label: '50%', value: Math.round(wallet.balance * 0.5) },
              { label: 'Full', value: wallet.balance },
            ].filter(btn => btn.value >= minPayment && btn.value <= wallet.balance).map((btn) => (
              <button
                key={btn.label}
                onClick={() => setAmount(btn.value.toString())}
                style={{
                  padding: '0.5rem 1rem',
                  border: amount === btn.value.toString() ? '2px solid #667eea' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: amount === btn.value.toString() ? '#eef2ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '0.813rem',
                  fontWeight: 600,
                  color: amount === btn.value.toString() ? '#667eea' : '#374151',
                  transition: 'all 0.2s',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={paying || !amount || parseFloat(amount) < minPayment}
          style={{
            width: '100%',
            padding: '1rem',
            background: paying || !amount || parseFloat(amount) < minPayment
              ? '#d1d5db'
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '1.125rem',
            cursor: paying ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <FiCreditCard />
          {paying ? 'Processing...' : `Pay ₹${amount ? parseFloat(amount).toLocaleString('en-IN') : '0'}`}
        </button>

        {/* Recent Payments */}
        {wallet.recentTransactions?.filter((t: any) => t.type === 'payment' && t.status === 'completed').length > 0 && (
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: '#1a202c' }}>Recent Payments</h3>
            {wallet.recentTransactions.filter((t: any) => t.type === 'payment' && t.status === 'completed').slice(0, 5).map((tx: any) => (
              <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{new Date(tx.createdAt).toLocaleDateString('en-IN')}</div>
                <div style={{ fontWeight: 700, color: '#10b981' }}>₹{Math.abs(tx.amount).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DistributorLayout>
  );
};

export default CommissionPaymentPage;
