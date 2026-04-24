import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Card, Button } from '../../components/ui';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPercent, FiCreditCard, FiCheck, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import commissionService from '../../services/commission.service';
import subscriptionService from '../../services/subscription.service';

const PlanSelectionPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [commissionPlans, setCommissionPlans] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const [commRes, subRes] = await Promise.all([
        commissionService.getCommissionPlans().catch(() => ({ plans: [] })),
        subscriptionService.getPlans().catch(() => ({ plans: [] }))
      ]);
      setCommissionPlans(commRes.plans || []);
      setSubscriptionPlans(subRes.plans || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommissionPlan = async (planId: string) => {
    setSelecting(true);
    try {
      await commissionService.selectCommissionPlan(planId);
      toast.success('Commission plan selected! Your account is now active.');
      router.push('/distributor/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to select plan');
    } finally {
      setSelecting(false);
    }
  };

  const handleGoToSubscription = () => {
    router.push('/distributor/subscription');
  };

  if (loading) {
    return (
      <DistributorLayout title="Choose Your Plan">
        <LoadingSpinner />
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title="Choose Your Plan">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary, #1a202c)', margin: '0 0 0.5rem' }}>
            Choose How You Want to Sell
          </h2>
          <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '1rem' }}>
            Select a plan to activate your distributor account and start selling on BuildAdda.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Subscription Plan Card */}
          <div
            onClick={handleGoToSubscription}
            style={{
              background: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '2rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#667eea'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 40px rgba(102, 126, 234, 0.15)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiCreditCard style={{ color: 'white', width: '24px', height: '24px' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Subscription Plan</h3>
            </div>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Pay a fixed monthly/yearly fee upfront. Best for established businesses with predictable volume.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
              {['Fixed cost, no surprises', 'Unlimited orders included', 'Priority support'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0', color: '#374151' }}>
                  <FiCheck style={{ color: '#10b981', flexShrink: 0 }} /> {item}
                </li>
              ))}
            </ul>
            {subscriptionPlans.length > 0 && (
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Starting from ₹{Math.min(...subscriptionPlans.map((p: any) => p.offerPrice || p.price)).toLocaleString('en-IN')}/month
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '1rem', color: '#667eea', fontWeight: 600, gap: '0.25rem' }}>
              View Plans <FiArrowRight />
            </div>
          </div>

          {/* Commission Plan Cards */}
          {commissionPlans.map((plan: any) => (
            <div
              key={plan._id}
              style={{
                background: '#ffffff',
                border: selectedPlan === plan._id ? '2px solid #10b981' : '2px solid #e5e7eb',
                borderRadius: '16px',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
              onClick={() => setSelectedPlan(plan._id)}
              onMouseEnter={(e) => { if (selectedPlan !== plan._id) { (e.currentTarget as HTMLElement).style.borderColor = '#10b981'; } (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.15)'; }}
              onMouseLeave={(e) => { if (selectedPlan !== plan._id) { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; } (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#ecfdf5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                No Upfront Cost
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiPercent style={{ color: 'white', width: '24px', height: '24px' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{plan.name}</h3>
              </div>
              <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: 1.6 }}>
                {plan.description || 'Pay only when you earn. Commission is charged per delivered order.'}
              </p>
              <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>
                  {plan.type === 'percentage' ? `${plan.value}%` : `₹${plan.value}`}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {plan.type === 'percentage' ? 'per delivered order' : 'fixed fee per order'}
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
                {[
                  'Zero upfront payment',
                  'Start selling immediately',
                  `Wallet limit: ₹${plan.walletLimit?.toLocaleString('en-IN')}`,
                  `${plan.gracePeriodDays} day grace period`
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0', color: '#374151' }}>
                    <FiCheck style={{ color: '#10b981', flexShrink: 0 }} /> {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectCommissionPlan(plan._id);
                }}
                disabled={selecting}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: selectedPlan === plan._id ? 'linear-gradient(135deg, #10b981, #059669)' : '#f3f4f6',
                  color: selectedPlan === plan._id ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: selecting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: selecting ? 0.7 : 1,
                }}
              >
                {selecting ? 'Activating...' : 'Select This Plan'}
              </button>
            </div>
          ))}
        </div>

        {commissionPlans.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>No commission plans are available yet. Please choose a subscription plan.</p>
          </div>
        )}
      </div>
    </DistributorLayout>
  );
};

export default PlanSelectionPage;
