import React, { useState, useEffect } from 'react';
import {
  FiCreditCard,
  FiDollarSign,
  FiCalendar,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiUsers,
  FiTrendingUp,
  FiPackage,
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface SubscriptionPlan {
  _id: string;
  name: 'Monthly' | 'Yearly';
  duration: 'monthly' | 'yearly';
  durationInDays: number;
  realPrice: number;
  offerPrice: number;
  discount: number;
  features: string[];
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface Subscription {
  _id: string;
  distributor: {
    _id: string;
    businessName: string;
    email: string;
  };
  plan: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  finalAmount: number;
  couponApplied?: {
    code: string;
  };
}

interface PlanStats {
  totalPlans: number;
  activePlans: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
}

const SubscriptionPlansManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<PlanStats>({
    totalPlans: 0,
    activePlans: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>('plans');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: 'Monthly' as 'Monthly' | 'Yearly',
    duration: 'monthly' as 'monthly' | 'yearly',
    durationInDays: 30,
    realPrice: 0,
    offerPrice: 0,
    features: [''],
    description: '',
    isActive: true
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    onConfirm: () => {}
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Extend subscription modal
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [extendDays, setExtendDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, statsRes, subsRes] = await Promise.all([
        api.get('/admin/subscription-plans'),
        api.get('/admin/subscription-plans/stats'),
        api.get('/admin/subscriptions')
      ]);
      setPlans(plansRes.data.plans || []);
      setStats(statsRes.data.stats || stats);
      setSubscriptions(subsRes.data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData({
      name: 'Monthly',
      duration: 'monthly',
      durationInDays: 30,
      realPrice: 0,
      offerPrice: 0,
      features: [''],
      description: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      duration: plan.duration,
      durationInDays: plan.durationInDays,
      realPrice: plan.realPrice,
      offerPrice: plan.offerPrice,
      features: plan.features?.length ? plan.features : [''],
      description: plan.description || '',
      isActive: plan.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const payload = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== '')
      };

      if (editingPlan) {
        await api.put(`/admin/subscription-plans/${editingPlan._id}`, payload);
      } else {
        await api.post('/admin/subscription-plans', payload);
      }

      await fetchData();
      setShowModal(false);
    } catch (error: any) {
      console.error('Save plan failed:', error);
      alert(error.response?.data?.message || 'Failed to save plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePlan = (plan: SubscriptionPlan) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Plan',
      message: `Are you sure you want to delete the "${plan.name}" plan? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete(`/admin/subscription-plans/${plan._id}`);
          await fetchData();
        } catch (error: any) {
          console.error('Delete failed:', error);
          alert(error.response?.data?.message || 'Failed to delete plan');
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      await api.put(`/admin/subscription-plans/${plan._id}`, {
        isActive: !plan.isActive
      });
      await fetchData();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const handleExtendSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/subscriptions/${selectedSubscription._id}/extend`, {
        days: extendDays
      });
      await fetchData();
      setShowExtendModal(false);
      setSelectedSubscription(null);
    } catch (error: any) {
      console.error('Extend failed:', error);
      alert(error.response?.data?.message || 'Failed to extend subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = (subscription: Subscription) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Subscription',
      message: `Are you sure you want to cancel the subscription for "${subscription.distributor?.businessName}"?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.put(`/admin/subscriptions/${subscription._id}/cancel`, {
            reason: 'Cancelled by admin'
          });
          await fetchData();
        } catch (error: any) {
          console.error('Cancel failed:', error);
          alert(error.response?.data?.message || 'Failed to cancel subscription');
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length ? newFeatures : [''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const planColumns: Column[] = [
    {
      key: 'name',
      label: 'Plan',
      sortable: true,
      render: (value, row: SubscriptionPlan) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)', fontSize: '1rem' }}>
            {value}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
            {row.durationInDays} days
          </div>
        </div>
      )
    },
    {
      key: 'realPrice',
      label: 'Price',
      render: (value, row: SubscriptionPlan) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>
            ₹{row.offerPrice.toLocaleString('en-IN')}
          </div>
          {row.discount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-tertiary)', textDecoration: 'line-through' }}>
                ₹{value.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-success)', fontWeight: 500 }}>
                {row.discount}% off
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'features',
      label: 'Features',
      render: (value: string[]) => (
        <div style={{ maxWidth: '200px' }}>
          {value?.slice(0, 2).map((f, i) => (
            <div key={i} style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
              • {f}
            </div>
          ))}
          {value?.length > 2 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-tertiary)' }}>
              +{value.length - 2} more
            </div>
          )}
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <span className={`badge ${value ? 'green' : 'red'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: SubscriptionPlan) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-icon"
            title="Edit Plan"
            onClick={() => handleEditPlan(row)}
          >
            <FiEdit size={16} />
          </button>
          <button
            className={`btn-icon ${row.isActive ? '' : 'success'}`}
            title={row.isActive ? 'Deactivate' : 'Activate'}
            onClick={() => handleToggleActive(row)}
          >
            {row.isActive ? <FiX size={16} /> : <FiCheck size={16} />}
          </button>
          <button
            className="btn-icon danger"
            title="Delete Plan"
            onClick={() => handleDeletePlan(row)}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const subscriptionColumns: Column[] = [
    {
      key: 'distributor',
      label: 'Distributor',
      render: (value) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>
            {value?.businessName || 'Unknown'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
            {value?.email}
          </div>
        </div>
      )
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (value) => (
        <span style={{ fontWeight: 500 }}>{value?.name || 'Unknown'}</span>
      )
    },
    {
      key: 'startDate',
      label: 'Period',
      render: (value, row: Subscription) => (
        <div style={{ fontSize: '0.875rem' }}>
          <div>{new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <div style={{ color: 'var(--admin-text-secondary)' }}>
            to {new Date(row.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      )
    },
    {
      key: 'finalAmount',
      label: 'Amount',
      render: (value, row: Subscription) => (
        <div>
          <div style={{ fontWeight: 600 }}>₹{value?.toLocaleString('en-IN') || '0'}</div>
          {row.couponApplied && (
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-success)' }}>
              {row.couponApplied.code}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const colors: Record<string, string> = {
          active: 'green',
          expired: 'red',
          cancelled: 'red',
          pending: 'yellow'
        };
        return (
          <span className={`badge ${colors[value] || 'gray'}`}>
            {value?.charAt(0).toUpperCase() + value?.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: Subscription) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-icon"
            title="Extend Subscription"
            onClick={() => {
              setSelectedSubscription(row);
              setExtendDays(30);
              setShowExtendModal(true);
            }}
          >
            <FiCalendar size={16} />
          </button>
          {row.status === 'active' && (
            <button
              className="btn-icon danger"
              title="Cancel Subscription"
              onClick={() => handleCancelSubscription(row)}
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <AdminLayout title="Subscription Plans" requiredPermission="subscriptions.view">
      <div className="admin-content">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Subscription Management
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Manage subscription plans and distributor subscriptions
              </p>
            </div>
            {activeTab === 'plans' && (
              <button className="btn btn-primary" onClick={handleCreatePlan}>
                <FiPlus size={16} />
                Create Plan
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard
              title="Total Plans"
              value={stats.totalPlans.toLocaleString()}
              icon={FiPackage}
              variant="products"
              subtitle={`${stats.activePlans} active`}
            />
            <StatCard
              title="Active Subscriptions"
              value={stats.activeSubscriptions.toLocaleString()}
              icon={FiUsers}
              variant="users"
              subtitle={`of ${stats.totalSubscriptions} total`}
            />
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
              icon={FiTrendingUp}
              variant="revenue"
              subtitle="From subscriptions"
            />
            <StatCard
              title="Active Plans"
              value={stats.activePlans.toLocaleString()}
              icon={FiCreditCard}
              variant="orders"
              subtitle="Currently offered"
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--admin-border-primary)' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {(['plans', 'subscriptions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: activeTab === tab ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
                  borderBottom: activeTab === tab ? '2px solid var(--admin-primary)' : '2px solid transparent',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'plans' ? 'Subscription Plans' : 'All Subscriptions'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'plans' ? (
            <DataTable
              columns={planColumns}
              data={plans}
              loading={loading}
            />
          ) : (
            <DataTable
              columns={subscriptionColumns}
              data={subscriptions}
              loading={loading}
            />
          )}
        </motion.div>

        {/* Plan Form Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <motion.div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ maxWidth: '600px' }}
              >
                <div className="modal-header">
                  <h2 className="modal-title">
                    {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                  </h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Plan Name *</label>
                        <select
                          className="form-select"
                          value={formData.name}
                          onChange={(e) => {
                            const name = e.target.value as 'Monthly' | 'Yearly';
                            setFormData({
                              ...formData,
                              name,
                              duration: name === 'Monthly' ? 'monthly' : 'yearly',
                              durationInDays: name === 'Monthly' ? 30 : 365
                            });
                          }}
                          required
                          disabled={!!editingPlan}
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Duration (Days) *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.durationInDays}
                          onChange={(e) => setFormData({ ...formData, durationInDays: parseInt(e.target.value) || 0 })}
                          required
                          min="1"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Real Price (₹) *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.realPrice}
                          onChange={(e) => setFormData({ ...formData, realPrice: parseFloat(e.target.value) || 0 })}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Offer Price (₹) *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.offerPrice}
                          onChange={(e) => setFormData({ ...formData, offerPrice: parseFloat(e.target.value) || 0 })}
                          required
                          min="0"
                          step="0.01"
                        />
                        {formData.realPrice > 0 && formData.offerPrice < formData.realPrice && (
                          <small style={{ color: 'var(--admin-success)', fontSize: '0.75rem' }}>
                            {Math.round(((formData.realPrice - formData.offerPrice) / formData.realPrice) * 100)}% discount
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-input"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                        placeholder="Brief description of the plan"
                      />
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label className="form-label" style={{ margin: 0 }}>Features</label>
                        <button
                          type="button"
                          onClick={addFeature}
                          style={{ background: 'none', border: 'none', color: 'var(--admin-primary)', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          + Add Feature
                        </button>
                      </div>
                      {formData.features.map((feature, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            placeholder={`Feature ${index + 1}`}
                          />
                          {formData.features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              style={{ background: 'none', border: 'none', color: 'var(--admin-error)', cursor: 'pointer', padding: '0.5rem' }}
                            >
                              <FiX size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span className="form-label" style={{ margin: 0 }}>Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiCheck size={16} />
                          {editingPlan ? 'Update' : 'Create'} Plan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Extend Subscription Modal */}
        <AnimatePresence>
          {showExtendModal && selectedSubscription && (
            <div className="modal-overlay" onClick={() => setShowExtendModal(false)}>
              <motion.div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ maxWidth: '400px' }}
              >
                <div className="modal-header">
                  <h2 className="modal-title">Extend Subscription</h2>
                  <button className="modal-close" onClick={() => setShowExtendModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                <div className="modal-body" style={{ padding: '1.5rem' }}>
                  <p style={{ marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
                    Extend subscription for <strong>{selectedSubscription.distributor?.businessName}</strong>
                  </p>
                  <div className="form-group">
                    <label className="form-label">Days to Extend</label>
                    <input
                      type="number"
                      className="form-input"
                      value={extendDays}
                      onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowExtendModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleExtendSubscription}
                    disabled={actionLoading || extendDays <= 0}
                  >
                    {actionLoading ? 'Extending...' : `Extend ${extendDays} Days`}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default SubscriptionPlansManagement;
