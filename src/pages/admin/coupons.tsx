import React, { useState, useEffect } from 'react';
import { FiTag, FiPercent, FiDollarSign, FiCalendar, FiUsers, FiPlus, FiEdit, FiTrash2, FiCopy, FiCheck, FiX, FiTrendingUp } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import ExportButton from '../../components/admin/ExportButton';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  expiryDate?: string;
  isActive: boolean;
  usageCount?: number;
  usageLimit?: number;
  createdAt: string;
}

interface CouponStats {
  total: number;
  active: number;
  expired: number;
  totalUsage: number;
  totalDiscount: number;
}

const CouponsManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats>({
    total: 0,
    active: 0,
    expired: 0,
    totalUsage: 0,
    totalDiscount: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minPurchase: 0,
    maxDiscount: 0,
    expiryDate: '',
    isActive: true,
    usageLimit: 0
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

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, [currentPage, searchTerm, activeTab]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        ...(activeTab !== 'all' && { status: activeTab })
      });

      const response = await api.get(`/admin/coupons?${queryParams}`);
      setCoupons(response.data.coupons || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/coupons/stats');
      const data = response.data;
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        search: searchTerm,
        ...(activeTab !== 'all' && { status: activeTab })
      });

      const response = await api.get(`/admin/coupons/export?${queryParams}`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coupons_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minPurchase: 0,
      maxDiscount: 0,
      expiryDate: '',
      isActive: true,
      usageLimit: 0
    });
    setShowModal(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount,
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit || 0
    });
    setShowModal(true);
  };

  const handleDuplicateCoupon = (coupon: Coupon) => {
    setEditingCoupon(null);
    setFormData({
      code: `${coupon.code}_COPY`,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount,
      expiryDate: '',
      isActive: true,
      usageLimit: coupon.usageLimit || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon._id}`, formData);
      } else {
        await api.post('/admin/coupons', formData);
      }

      await fetchCoupons();
      await fetchStats();
      setShowModal(false);
    } catch (error) {
      console.error('Save coupon failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Coupon',
      message: `Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete(`/admin/coupons/${coupon._id}`);

          await fetchCoupons();
          await fetchStats();
        } catch (error) {
          console.error('Delete failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const columns: Column[] = [
    {
      key: 'code',
      label: 'Coupon Code',
      sortable: true,
      render: (value, row: Coupon) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--admin-primary)', fontSize: '1rem', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
            {value}
          </div>
          {isExpired(row.expiryDate) && (
            <span className="badge red">Expired</span>
          )}
          {!isExpired(row.expiryDate) && row.isActive && (
            <span className="badge green">Active</span>
          )}
          {!row.isActive && (
            <span className="badge red">Inactive</span>
          )}
        </div>
      )
    },
    {
      key: 'discountType',
      label: 'Discount',
      render: (value, row: Coupon) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {value === 'percentage' ? (
            <>
              <FiPercent size={16} style={{ color: 'var(--admin-success)' }} />
              <span style={{ fontWeight: 600, color: 'var(--admin-success)', fontSize: '1rem' }}>
                {row.discountValue}%
              </span>
            </>
          ) : (
            <>
              <FiDollarSign size={16} style={{ color: 'var(--admin-success)' }} />
              <span style={{ fontWeight: 600, color: 'var(--admin-success)', fontSize: '1rem' }}>
                ₹{row.discountValue}
              </span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'minPurchase',
      label: 'Min Purchase',
      sortable: true,
      render: (value) => value > 0 ? (
        <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>
          ₹{value.toLocaleString('en-IN')}
        </span>
      ) : (
        <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-tertiary)' }}>No minimum</span>
      )
    },
    {
      key: 'maxDiscount',
      label: 'Max Discount',
      sortable: true,
      render: (value) => value > 0 ? (
        <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>
          ₹{value.toLocaleString('en-IN')}
        </span>
      ) : (
        <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-tertiary)' }}>No limit</span>
      )
    },
    {
      key: 'expiryDate',
      label: 'Expiry',
      sortable: true,
      render: (value) => value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: isExpired(value) ? 'var(--admin-error)' : 'var(--admin-text-secondary)' }}>
          <FiCalendar size={14} />
          {new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      ) : (
        <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-tertiary)' }}>No expiry</span>
      )
    },
    {
      key: 'usageCount',
      label: 'Usage',
      sortable: true,
      render: (value, row: Coupon) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <FiUsers size={14} style={{ color: 'var(--admin-text-secondary)' }} />
          <span style={{ fontWeight: 500 }}>
            {value || 0}
            {row.usageLimit && row.usageLimit > 0 && ` / ${row.usageLimit}`}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: Coupon) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-icon"
            title="Duplicate Coupon"
            onClick={() => handleDuplicateCoupon(row)}
          >
            <FiCopy size={16} />
          </button>
          <button
            className="btn-icon"
            title="Edit Coupon"
            onClick={() => handleEditCoupon(row)}
          >
            <FiEdit size={16} />
          </button>
          <button
            className="btn-icon danger"
            title="Delete Coupon"
            onClick={() => handleDeleteCoupon(row)}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const CouponFormModal = () => (
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
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Coupon Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="e.g., SAVE20"
                    style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                    disabled={!!editingCoupon}
                  />
                  <small style={{ color: 'var(--admin-text-secondary)', fontSize: '0.75rem' }}>
                    Code will be automatically converted to uppercase
                  </small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Discount Type *</label>
                    <select
                      className="form-select"
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                      required
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Discount Value *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                      required
                      min="0"
                      max={formData.discountType === 'percentage' ? 100 : undefined}
                      step="0.01"
                      placeholder={formData.discountType === 'percentage' ? '0-100' : 'Amount'}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Minimum Purchase</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                      placeholder="0 = No minimum"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Maximum Discount</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                      placeholder="0 = No limit"
                      disabled={formData.discountType === 'fixed'}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <small style={{ color: 'var(--admin-text-secondary)', fontSize: '0.75rem' }}>
                      Leave blank for no expiry
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Usage Limit</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                      min="0"
                      placeholder="0 = Unlimited"
                    />
                  </div>
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
                      {editingCoupon ? 'Update' : 'Create'} Coupon
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <AdminLayout title="Coupons Management">
      <div className="admin-content">
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Coupons Management
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Create and manage discount coupons
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <ExportButton onExport={handleExport} label="Export Coupons" />
              <button className="btn btn-primary" onClick={handleCreateCoupon}>
                <FiPlus size={16} />
                Create Coupon
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Coupons"
              value={stats.total.toLocaleString()}
              icon={FiTag}
              variant="products"
              subtitle="All coupons"
            />
            <StatCard
              title="Active Coupons"
              value={stats.active.toLocaleString()}
              icon={FiCheck}
              variant="orders"
              subtitle="Currently usable"
            />
            <StatCard
              title="Total Usage"
              value={stats.totalUsage.toLocaleString()}
              icon={FiUsers}
              variant="users"
              subtitle="Times used"
            />
            <StatCard
              title="Total Discount"
              value={`₹${stats.totalDiscount.toLocaleString('en-IN')}`}
              icon={FiTrendingUp}
              variant="revenue"
              subtitle="Savings provided"
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--admin-border-primary)' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {(['all', 'active', 'expired'] as const).map((tab) => (
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
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={coupons}
            loading={loading}
          />
        </motion.div>

        {/* Coupon Form Modal */}
        <CouponFormModal />

        {/* Confirm Dialog */}
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

export default CouponsManagement;