import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Card, Loading, Button, Badge, Modal } from '../../components/ui';
import {
  FiCheck,
  FiX,
  FiClock,
  FiCalendar,
  FiTag,
  FiCreditCard,
  FiRefreshCw,
  FiAlertCircle,
  FiGift,
  FiPercent,
  FiZap,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import subscriptionService from '../../services/subscription.service';
import { format, differenceInDays } from 'date-fns';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  duration: 'monthly' | 'yearly';
  durationInDays: number;
  realPrice: number;
  offerPrice: number;
  discount: number;
  features: string[];
  description: string;
  isActive: boolean;
}

interface Subscription {
  _id: string;
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  paymentStatus: 'pending' | 'paid' | 'failed';
  amount: number;
  discount: number;
  finalAmount: number;
  couponApplied?: {
    code: string;
    freeMonths?: number;
  };
  createdAt: string;
}

interface CouponResult {
  success: boolean;
  coupon: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    freeMonths?: number;
    description?: string;
  };
  originalPrice: number;
  discount: number;
  finalAmount: number;
}

const SubscriptionPage = () => {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isNewDistributor, setIsNewDistributor] = useState(false);

  useEffect(() => {
    fetchData();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, subRes, historyRes] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getMySubscription().catch(() => ({ subscription: null })),
        subscriptionService.getHistory()
      ]);

      setPlans(plansRes.plans || []);
      setCurrentSubscription(subRes.subscription || null);
      setSubscriptionHistory(historyRes.subscriptions || []);

      // Check if new distributor (no subscription history or no active subscription)
      const history = historyRes.subscriptions || [];
      const hasNoSubscription = !subRes.subscription || subRes.subscription.status !== 'active';
      setIsNewDistributor(history.length === 0 && hasNoSubscription);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load subscription data');
      // If error, assume new distributor
      setIsNewDistributor(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setApplyingCoupon(true);
      const result = await subscriptionService.applyCoupon(couponCode.trim(), selectedPlan._id);
      setAppliedCoupon(result);
      toast.success('Coupon applied successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setAppliedCoupon(null);
    setCouponCode('');
    setShowCheckoutModal(true);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    try {
      setProcessingPayment(true);
      const orderResult = await subscriptionService.createOrder(
        selectedPlan._id,
        appliedCoupon?.coupon.code
      );  

      // If it's a free subscription (coupon with 100% discount or free months)
      if (orderResult.isFree) {
        toast.success('Subscription activated successfully! Redirecting to dashboard...');
        setShowCheckoutModal(false);
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          router.push('/distributor/dashboard');
        }, 1500);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: orderResult.razorpayKeyId,
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        name: 'BuildAdda',
        description: `${selectedPlan.name} Subscription`,
        order_id: orderResult.order.id,
        handler: async (response: any) => {
          try {
            await subscriptionService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              subscriptionId: orderResult.subscription
            });
            toast.success('Payment successful! Subscription activated. Redirecting to dashboard...');
            setShowCheckoutModal(false);
            // Redirect to dashboard after a brief delay
            setTimeout(() => {
              router.push('/distributor/dashboard');
            }, 1500);
          } catch (error: any) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#F97316'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process subscription');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      await subscriptionService.cancelSubscription(currentSubscription._id, cancelReason);
      toast.success('Subscription cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <DistributorLayout title="Subscription">
        <Loading fullScreen text="Loading subscription details..." />
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title="Subscription">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Subscription</h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Manage your subscription plan and billing
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowHistoryModal(true)}
            leftIcon={<FiClock />}
          >
            View History
          </Button>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && currentSubscription.status === 'active' ? (
          <Card className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FiZap className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      {currentSubscription.plan?.name} Plan
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-medium text-white rounded-full ${getStatusColor(currentSubscription.status)}`}>
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      Expires: {format(new Date(currentSubscription.endDate), 'dd MMM yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {getDaysRemaining(currentSubscription.endDate)} days remaining
                    </span>
                  </div>
                  {currentSubscription.couponApplied && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                      <FiTag className="w-4 h-4" />
                      Coupon applied: {currentSubscription.couponApplied.code}
                      {currentSubscription.couponApplied.freeMonths && (
                        <span className="ml-1">({currentSubscription.couponApplied.freeMonths} months free)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowCancelModal(true)} className="text-red-600 border-red-300 hover:bg-red-50">
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FiAlertCircle className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  No Active Subscription
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Subscribe to a plan to unlock premium features and grow your business.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Subscription Plans */}
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            {currentSubscription?.status === 'active' ? 'Upgrade Your Plan' : 'Choose a Plan'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan._id}
                className={`p-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  plan.name === 'Yearly' ? 'border-2 border-orange-400' : ''
                }`}
              >
                {plan.name === 'Yearly' && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-semibold text-white bg-orange-500 rounded-full">
                      BEST VALUE
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{plan.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[var(--text-primary)]">
                      ₹{plan.offerPrice.toLocaleString('en-IN')}
                    </span>
                    {plan.discount > 0 && (
                      <span className="text-lg text-[var(--text-tertiary)] line-through">
                        ₹{plan.realPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="text-sm text-[var(--text-secondary)]">
                      /{plan.duration === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {plan.discount > 0 && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded">
                      Save {plan.discount}%
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.name === 'Yearly' ? 'primary' : 'secondary'}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={currentSubscription?.plan?._id === plan._id && currentSubscription?.status === 'active'}
                >
                  {currentSubscription?.plan?._id === plan._id && currentSubscription?.status === 'active'
                    ? 'Current Plan'
                    : 'Select Plan'}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Checkout Modal */}
        {showCheckoutModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Checkout</h2>
                <button onClick={() => setShowCheckoutModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Plan Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{selectedPlan.name} Plan</h3>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Price</span>
                  <div className="text-right">
                    {selectedPlan.discount > 0 && (
                      <span className="text-sm text-[var(--text-tertiary)] line-through mr-2">
                        ₹{selectedPlan.realPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="font-semibold text-[var(--text-primary)]">
                      ₹{selectedPlan.offerPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coupon Code Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Have a coupon code?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FiTag className="w-5 h-5 text-green-600" />
                      <div>
                        <span className="font-medium text-green-700">{appliedCoupon.coupon.code}</span>
                        {appliedCoupon.coupon.freeMonths && appliedCoupon.coupon.freeMonths > 0 ? (
                          <span className="block text-sm text-green-600">
                            {appliedCoupon.coupon.freeMonths} month{appliedCoupon.coupon.freeMonths > 1 ? 's' : ''} free!
                          </span>
                        ) : (
                          <span className="block text-sm text-green-600">
                            {appliedCoupon.coupon.discountType === 'percentage'
                              ? `${appliedCoupon.coupon.discountValue}% off`
                              : `₹${appliedCoupon.coupon.discountValue} off`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={handleRemoveCoupon} className="p-1 hover:bg-green-100 rounded">
                      <FiX className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 uppercase"
                    />
                    <Button
                      variant="secondary"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                    >
                      {applyingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h4 className="font-semibold text-[var(--text-primary)] mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Subtotal</span>
                    <span>₹{selectedPlan.offerPrice.toLocaleString('en-IN')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-[var(--text-primary)] pt-2 border-t">
                    <span>Total</span>
                    <span>
                      ₹{(appliedCoupon?.finalAmount ?? selectedPlan.offerPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {appliedCoupon?.finalAmount === 0 && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-lg">
                      <FiGift className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Free subscription with coupon!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscribe Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubscribe}
                disabled={processingPayment}
                leftIcon={processingPayment ? <FiRefreshCw className="animate-spin" /> : <FiCreditCard />}
              >
                {processingPayment
                  ? 'Processing...'
                  : appliedCoupon?.finalAmount === 0
                  ? 'Activate Free Subscription'
                  : `Pay ₹${(appliedCoupon?.finalAmount ?? selectedPlan.offerPrice).toLocaleString('en-IN')}`}
              </Button>

              <p className="text-xs text-center text-[var(--text-tertiary)] mt-4">
                By subscribing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Subscription History</h2>
                <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {subscriptionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)]">No subscription history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptionHistory.map((sub) => (
                    <div key={sub._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-[var(--text-primary)]">
                            {sub.plan?.name || 'Unknown'} Plan
                          </h4>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {format(new Date(sub.startDate), 'dd MMM yyyy')} - {format(new Date(sub.endDate), 'dd MMM yyyy')}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium text-white rounded-full ${getStatusColor(sub.status)}`}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[var(--text-secondary)]">
                          Amount: ₹{sub.finalAmount.toLocaleString('en-IN')}
                        </span>
                        {sub.couponApplied && (
                          <span className="text-green-600 flex items-center gap-1">
                            <FiTag className="w-3 h-3" />
                            {sub.couponApplied.code}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Cancel Subscription</h2>
                <button onClick={() => setShowCancelModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-[var(--text-secondary)] mb-4">
                  Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.
                </p>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please let us know why you're cancelling..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowCancelModal(false)}>
                  Keep Subscription
                </Button>
                <Button variant="primary" className="flex-1 bg-red-500 hover:bg-red-600" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DistributorLayout>
  );
};

export default SubscriptionPage;