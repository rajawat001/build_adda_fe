import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import SEO from '../../components/SEO';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { checkPaymentStatus } from '../../services/order.service';
import subscriptionService from '../../services/subscription.service';
import { useCart } from '../../context/CartContext';

type PaymentState = 'checking' | 'success' | 'pending' | 'failed';

export default function PaymentStatus() {
  const router = useRouter();
  const { merchantOrderId, merchantTransactionId, type, orderId, subscriptionId } = router.query;
  const { clearCart } = useCart();
  const [status, setStatus] = useState<PaymentState>('checking');
  const [message, setMessage] = useState('Verifying your payment...');
  const retryCount = useRef(0);
  const maxRetries = 5;

  // Support both v2 (merchantOrderId) and v1 (merchantTransactionId) query params
  const txnId = (merchantOrderId || merchantTransactionId) as string;

  useEffect(() => {
    if (!router.isReady) return;
    if (!txnId || !type) {
      setStatus('failed');
      setMessage('Invalid payment callback. Missing parameters.');
      return;
    }
    verifyPayment();
  }, [router.isReady, txnId, type]);

  const verifyPayment = async () => {
    try {
      if (type === 'order' && orderId) {
        const result = await checkPaymentStatus(
          txnId,
          orderId as string
        );

        if (result.paymentStatus === 'paid') {
          setStatus('success');
          setMessage('Payment successful! Your order has been confirmed.');
          clearCart();
          setTimeout(() => router.push('/order-success'), 2000);
          return;
        }

        if (result.paymentStatus === 'pending') {
          handlePending();
          return;
        }

        setStatus('failed');
        setMessage('Payment failed. Please try again.');
        setTimeout(() => router.push('/order-failure'), 3000);

      } else if (type === 'subscription' && subscriptionId) {
        const result = await subscriptionService.verifyPayment({
          merchantOrderId: txnId,
          subscriptionId: subscriptionId as string
        });

        if (result.paymentStatus === 'paid') {
          setStatus('success');
          setMessage('Payment successful! Your subscription has been activated.');
          setTimeout(() => router.push('/distributor/dashboard'), 2000);
          return;
        }

        if (result.paymentStatus === 'pending') {
          handlePending();
          return;
        }

        setStatus('failed');
        setMessage('Payment failed. Please try again.');
        setTimeout(() => router.push('/distributor/subscription'), 3000);

      } else {
        setStatus('failed');
        setMessage('Invalid payment type or missing ID.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      if (retryCount.current < maxRetries) {
        handlePending();
      } else {
        setStatus('failed');
        setMessage('Unable to verify payment. Please contact support.');
      }
    }
  };

  const handlePending = () => {
    if (retryCount.current >= maxRetries) {
      setStatus('pending');
      setMessage('Payment is still being processed. Please check your order status later.');
      return;
    }
    retryCount.current += 1;
    setStatus('pending');
    setMessage(`Payment is being processed... (attempt ${retryCount.current}/${maxRetries})`);
    setTimeout(verifyPayment, 5000);
  };

  return (
    <>
      <SEO title="Payment Status" />
      <Header />
      <main className="payment-status-page" style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          maxWidth: '500px'
        }}>
          {status === 'checking' && (
            <>
              <div className="spinner" style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #f97316',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.5rem'
              }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Verifying Payment</h2>
              <p style={{ color: '#6b7280' }}>{message}</p>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="spinner" style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #f59e0b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.5rem'
              }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#f59e0b' }}>Payment Pending</h2>
              <p style={{ color: '#6b7280' }}>{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white',
                fontSize: '2rem'
              }}>
                &#10003;
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#10b981' }}>Payment Successful</h2>
              <p style={{ color: '#6b7280' }}>{message}</p>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>Redirecting...</p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#ef4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white',
                fontSize: '2rem'
              }}>
                &#10007;
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#ef4444' }}>Payment Failed</h2>
              <p style={{ color: '#6b7280' }}>{message}</p>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>Redirecting...</p>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <Footer />
    </>
  );
}
