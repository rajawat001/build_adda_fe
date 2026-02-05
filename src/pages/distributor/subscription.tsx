import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Card, Loading, Button, Badge, Modal } from '../../components/ui';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { useIsMobile } from '../../hooks';
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
  autoRenew?: boolean;
  autopay?: {
    enabled: boolean;
    authStatus: 'pending' | 'authorized' | 'failed' | 'revoked' | 'none';
    frequency?: 'MONTHLY' | 'YEARLY';
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
  const isMobile = useIsMobile();
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
  const [enableAutopay, setEnableAutopay] = useState(true); // Default to autopay enabled
  const [togglingAutoRenew, setTogglingAutoRenew] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

      let orderResult;

      // Use autopay or one-time payment based on user selection
      if (enableAutopay) {
        try {
          orderResult = await subscriptionService.createOrderWithAutopay(
            selectedPlan._id,
            appliedCoupon?.coupon.code
          );
        } catch (autopayError: any) {
          // If autopay fails due to sandbox mode, fall back to regular payment
          if (autopayError.response?.data?.code === 'AUTOPAY_SANDBOX_NOT_SUPPORTED') {
            toast.info('Auto-renewal not available in test mode. Using one-time payment.');
            setEnableAutopay(false);
            orderResult = await subscriptionService.createOrder(
              selectedPlan._id,
              appliedCoupon?.coupon.code
            );
          } else {
            throw autopayError;
          }
        }
      } else {
        orderResult = await subscriptionService.createOrder(
          selectedPlan._id,
          appliedCoupon?.coupon.code
        );
      }

      // If it's a free subscription (coupon with 100% discount or free months)
      if (orderResult.isFree) {
        toast.success('Subscription activated successfully! Redirecting to dashboard...');
        setShowCheckoutModal(false);
        setTimeout(() => {
          router.push('/distributor/dashboard');
        }, 1500);
        return;
      }

      // Redirect to PhonePe payment page
      if (orderResult.paymentUrl) {
        window.location.href = orderResult.paymentUrl;
      } else {
        toast.error('Failed to get payment URL. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process subscription');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!currentSubscription) return;

    try {
      setTogglingAutoRenew(true);
      const newState = !currentSubscription.autoRenew;
      await subscriptionService.toggleAutoRenew(currentSubscription._id, newState);
      toast.success(`Auto-renewal ${newState ? 'enabled' : 'disabled'}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update auto-renewal');
    } finally {
      setTogglingAutoRenew(false);
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
      <div className={`space-y-4 md:space-y-6 ${isMobile ? '' : 'p-6'}`}>
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-3">
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[var(--text-primary)]`}>
              Subscription
            </h1>
            {!isMobile && (
              <p className="text-[var(--text-secondary)] mt-1">
                Manage your subscription plan and billing
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowHistoryModal(true)}
            leftIcon={<FiClock />}
            className={isMobile ? 'w-full min-h-tap' : ''}
          >
            {isMobile ? 'History' : 'View History'}
          </Button>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && currentSubscription.status === 'active' ? (
          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3 md:gap-4">
                <div className={`${isMobile ? 'p-2' : 'p-3'} bg-orange-100 rounded-lg`}>
                  <FiZap className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-orange-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)]`}>
                      {currentSubscription.plan?.name} Plan
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-medium text-white rounded-full ${getStatusColor(currentSubscription.status)}`}>
                      Active
                    </span>
                  </div>
                  <div className={`flex flex-col ${isMobile ? 'gap-1' : 'flex-wrap flex-row items-center gap-4'} text-sm text-[var(--text-secondary)]`}>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      Expires: {format(new Date(currentSubscription.endDate), isMobile ? 'dd MMM yy' : 'dd MMM yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {getDaysRemaining(currentSubscription.endDate)} days left
                    </span>
                  </div>
                  {currentSubscription.couponApplied && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                      <FiTag className="w-4 h-4" />
                      {currentSubscription.couponApplied.code}
                    </div>
                  )}
                  {/* Auto-renewal status */}
                  {currentSubscription.autopay?.authStatus === 'authorized' && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-sm ${currentSubscription.autoRenew ? 'text-green-600' : 'text-gray-500'}`}>
                        <FiRefreshCw className="w-4 h-4 inline mr-1" />
                        Auto-renewal: {currentSubscription.autoRenew ? 'On' : 'Off'}
                      </span>
                      <button
                        onClick={handleToggleAutoRenew}
                        disabled={togglingAutoRenew}
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          currentSubscription.autoRenew
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } transition-colors`}
                      >
                        {togglingAutoRenew ? '...' : currentSubscription.autoRenew ? 'Turn Off' : 'Turn On'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(true)}
                className={`text-red-600 border-red-300 hover:bg-red-50 ${isMobile ? 'w-full min-h-tap' : ''}`}
              >
                Cancel
              </Button>
            </div>
          </Card>
        ) : (
          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200`}>
            <div className="flex items-center gap-3 md:gap-4">
              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-gray-100 rounded-lg`}>
                <FiAlertCircle className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-gray-500`} />
              </div>
              <div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)]`}>
                  No Active Subscription
                </h3>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-secondary)]`}>
                  Subscribe to unlock premium features.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Subscription Plans */}
        <div>
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-[var(--text-primary)] mb-4`}>
            {currentSubscription?.status === 'active' ? 'Upgrade Plan' : 'Choose a Plan'}
          </h2>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-2 gap-6'}`}>
            {plans.map((plan) => (
              <Card
                key={plan._id}
                className={`${isMobile ? 'p-4' : 'p-6'} relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  plan.name === 'Yearly' ? 'border-2 border-orange-400' : ''
                }`}
              >
                {plan.name === 'Yearly' && (
                  <div className="absolute top-3 right-3">
                    <span className={`${isMobile ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} font-semibold text-white bg-orange-500 rounded-full`}>
                      BEST VALUE
                    </span>
                  </div>
                )}

                <div className="mb-3 md:mb-4">
                  <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-[var(--text-primary)]`}>{plan.name}</h3>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-secondary)]`}>{plan.description}</p>
                </div>

                <div className="mb-4 md:mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-[var(--text-primary)]`}>
                      ₹{plan.offerPrice.toLocaleString('en-IN')}
                    </span>
                    {plan.discount > 0 && (
                      <span className={`${isMobile ? 'text-sm' : 'text-lg'} text-[var(--text-tertiary)] line-through`}>
                        ₹{plan.realPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-secondary)]`}>
                      /{plan.duration === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {plan.discount > 0 && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded">
                      Save {plan.discount}%
                    </span>
                  )}
                </div>

                <ul className={`space-y-2 md:space-y-3 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                  {plan.features?.slice(0, isMobile ? 3 : undefined).map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-secondary)]`}>
                      <FiCheck className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-green-500 flex-shrink-0 mt-0.5`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {isMobile && plan.features && plan.features.length > 3 && (
                    <li className="text-xs text-[var(--text-tertiary)]">
                      +{plan.features.length - 3} more features
                    </li>
                  )}
                </ul>

                <Button
                  className={`w-full ${isMobile ? 'min-h-tap' : ''}`}
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
          isMobile ? (
            <BottomSheet
              isOpen={showCheckoutModal}
              onClose={() => setShowCheckoutModal(false)}
              title="Checkout"
            >
              <div className="space-y-4">
                {/* Plan Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
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
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Have a coupon code?
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
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
                      <button onClick={handleRemoveCoupon} className="p-2 hover:bg-green-100 rounded-lg min-h-tap min-w-tap flex items-center justify-center">
                        <FiX className="w-5 h-5 text-green-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-3 min-h-tap border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 uppercase text-base"
                      />
                      <Button
                        variant="secondary"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="min-h-tap"
                      >
                        {applyingCoupon ? '...' : 'Apply'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4">
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
                      <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 rounded-xl">
                        <FiGift className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Free subscription with coupon!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-renewal Toggle */}
                {appliedCoupon?.finalAmount !== 0 && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <FiRefreshCw className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[var(--text-primary)]">Auto-renewal</h4>
                          <p className="text-xs text-[var(--text-secondary)]">
                            Automatically renew when subscription expires
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEnableAutopay(!enableAutopay)}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          enableAutopay ? 'bg-orange-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            enableAutopay ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {enableAutopay && (
                      <p className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                        Your card will be charged automatically before expiry. You can cancel anytime.
                      </p>
                    )}
                  </div>
                )}

                {/* Subscribe Button */}
                <Button
                  className="w-full min-h-tap"
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={processingPayment}
                  leftIcon={processingPayment ? <FiRefreshCw className="animate-spin" /> : <FiCreditCard />}
                >
                  {processingPayment
                    ? 'Processing...'
                    : appliedCoupon?.finalAmount === 0
                    ? 'Activate Free'
                    : enableAutopay
                    ? `Subscribe ₹${(appliedCoupon?.finalAmount ?? selectedPlan.offerPrice).toLocaleString('en-IN')}/` + (selectedPlan.duration === 'monthly' ? 'mo' : 'yr')
                    : `Pay ₹${(appliedCoupon?.finalAmount ?? selectedPlan.offerPrice).toLocaleString('en-IN')}`}
                </Button>

                <p className="text-xs text-center text-[var(--text-tertiary)]">
                  {enableAutopay
                    ? 'By subscribing, you authorize automatic recurring payments. Cancel anytime.'
                    : 'By subscribing, you agree to our Terms of Service and Privacy Policy.'}
                </p>
              </div>
            </BottomSheet>
          ) : (
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

                {/* Auto-renewal Toggle */}
                {appliedCoupon?.finalAmount !== 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <FiRefreshCw className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[var(--text-primary)]">Enable Auto-renewal</h4>
                          <p className="text-sm text-[var(--text-secondary)]">
                            Automatically renew when subscription expires
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEnableAutopay(!enableAutopay)}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          enableAutopay ? 'bg-orange-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            enableAutopay ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {enableAutopay && (
                      <p className="mt-3 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                        Your payment method will be charged automatically before subscription expires. You can cancel anytime.
                      </p>
                    )}
                  </div>
                )}

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
                    : enableAutopay
                    ? `Subscribe ₹${(appliedCoupon?.finalAmount ?? selectedPlan.offerPrice).toLocaleString('en-IN')}/` + (selectedPlan.duration === 'monthly' ? 'month' : 'year')
                    : `Pay ₹${(appliedCoupon?.finalAmount ?? selectedPlan.offerPrice).toLocaleString('en-IN')}`}
                </Button>

                <p className="text-xs text-center text-[var(--text-tertiary)] mt-4">
                  {enableAutopay
                    ? 'By subscribing, you authorize automatic recurring payments. Cancel anytime from your subscription page.'
                    : 'By subscribing, you agree to our Terms of Service and Privacy Policy.'}
                </p>
              </div>
            </div>
          )
        )}

        {/* History Modal */}
        {showHistoryModal && (
          isMobile ? (
            <BottomSheet
              isOpen={showHistoryModal}
              onClose={() => setShowHistoryModal(false)}
              title="Subscription History"
            >
              {subscriptionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)]">No subscription history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subscriptionHistory.map((sub) => (
                    <div key={sub._id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-[var(--text-primary)] truncate">
                            {sub.plan?.name || 'Unknown'} Plan
                          </h4>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {format(new Date(sub.startDate), 'dd MMM yy')} - {format(new Date(sub.endDate), 'dd MMM yy')}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium text-white rounded-full flex-shrink-0 ${getStatusColor(sub.status)}`}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[var(--text-secondary)]">
                          ₹{sub.finalAmount.toLocaleString('en-IN')}
                        </span>
                        {sub.couponApplied && (
                          <span className="text-green-600 flex items-center gap-1 text-xs">
                            <FiTag className="w-3 h-3" />
                            {sub.couponApplied.code}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BottomSheet>
          ) : (
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
          )
        )}

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          isMobile ? (
            <BottomSheet
              isOpen={showCancelModal}
              onClose={() => setShowCancelModal(false)}
              title="Cancel Subscription"
            >
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  Are you sure you want to cancel? You will lose access to premium features at the end of your billing period.
                </p>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please let us know why you're cancelling..."
                    className="w-full px-4 py-3 min-h-[100px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-base"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="secondary"
                    className="w-full min-h-tap"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full min-h-tap bg-red-500 hover:bg-red-600"
                    onClick={handleCancelSubscription}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </BottomSheet>
          ) : (
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
          )
        )}
      </div>
    </DistributorLayout>
  );
};

export default SubscriptionPage;