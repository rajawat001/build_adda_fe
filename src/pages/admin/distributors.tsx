import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiTruck, FiCheck, FiX, FiPackage, FiShoppingCart, FiMapPin, FiPhone, FiMail, FiDollarSign, FiTrendingUp, FiEye, FiEdit, FiCalendar, FiStar, FiFileText } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import FilterPanel, { FilterOption } from '../../components/admin/FilterPanel';
import BulkActionBar, { BulkAction } from '../../components/admin/BulkActionBar';
import ExportButton from '../../components/admin/ExportButton';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface Distributor {
  _id: string;
  businessName: string;
  ownerName: string;
  name?: string; // API returns 'name' instead of 'ownerName'
  email: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  gstNumber?: string;
  isApproved: boolean;
  isActive: boolean;
  productCount?: number;
  orderCount?: number;
  totalRevenue?: number;
  rating?: number;
  createdAt: string;
}

interface DistributorStats {
  total: number;
  approved: number;
  pending: number;
  active: number;
  trend: number;
}

const DistributorsManagement: React.FC = () => {
  const router = useRouter();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [stats, setStats] = useState<DistributorStats>({
    total: 0,
    approved: 0,
    pending: 0,
    active: 0,
    trend: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');
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

  // View & Edit Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [editFormData, setEditFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    address: '',
    gstNumber: '',
    isActive: true
  });

  useEffect(() => {
    if (router.isReady && router.query.search) {
      setSearchTerm(router.query.search as string);
    }
  }, [router.isReady, router.query.search]);

  useEffect(() => {
    fetchDistributors();
    fetchStats();
  }, [currentPage, filters, searchTerm, activeTab]);

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        tab: activeTab,
        ...filters
      });

      const response = await api.get(`/admin/distributors?${queryParams}`);
      setDistributors(response.data.distributors || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalItems(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching distributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/distributors/stats');
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
        tab: activeTab,
        ...filters
      });

      const response = await api.get(`/admin/distributors/export?${queryParams}`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `distributors_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  const handleBulkApprove = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve Distributors',
      message: `Are you sure you want to approve ${selectedDistributors.length} selected distributor(s)?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.post('/admin/distributors/bulk-approve', {
            distributorIds: selectedDistributors
          });

          await fetchDistributors();
          await fetchStats();
          setSelectedDistributors([]);
        } catch (error) {
          console.error('Bulk approve failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const handleBulkReject = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Distributors',
      message: `Are you sure you want to reject ${selectedDistributors.length} selected distributor(s)?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.post('/admin/distributors/bulk-reject', {
            distributorIds: selectedDistributors
          });

          await fetchDistributors();
          await fetchStats();
          setSelectedDistributors([]);
        } catch (error) {
          console.error('Bulk reject failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Distributors',
      message: `Are you sure you want to permanently delete ${selectedDistributors.length} selected distributor(s)? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete('/admin/distributors/bulk-delete', {
            data: { distributorIds: selectedDistributors }
          });

          await fetchDistributors();
          await fetchStats();
          setSelectedDistributors([]);
        } catch (error) {
          console.error('Bulk delete failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const columns: Column[] = [
    {
      key: 'businessName',
      label: 'Business',
      sortable: true,
      render: (value, row: Distributor) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'var(--admin-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}>
            {value.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--admin-text-primary)' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
              {row.ownerName || row.name || '-'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact',
      render: (value, row: Distributor) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--admin-text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            <FiMail size={12} />
            {value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
            <FiPhone size={12} />
            {row.phone}
          </div>
        </div>
      )
    },
    {
      key: 'city',
      label: 'Location',
      sortable: true,
      render: (value, row: Distributor) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
          <FiMapPin size={14} />
          {value}, {row.state}
        </div>
      )
    },
    {
      key: 'isApproved',
      label: 'Approval',
      sortable: true,
      render: (value) => (
        <span className={`badge ${value ? 'green' : 'orange'}`}>
          {value ? 'Approved' : 'Pending'}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`badge ${value ? 'blue' : 'red'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'productCount',
      label: 'Products',
      sortable: true,
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <FiPackage size={14} style={{ color: 'var(--admin-text-secondary)' }} />
          <span style={{ fontWeight: 500 }}>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'orderCount',
      label: 'Orders',
      sortable: true,
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <FiShoppingCart size={14} style={{ color: 'var(--admin-text-secondary)' }} />
          <span style={{ fontWeight: 500 }}>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'totalRevenue',
      label: 'Revenue',
      sortable: true,
      render: (value) => (
        <span style={{ fontWeight: 500, color: 'var(--admin-success)' }}>
          ₹{value?.toLocaleString('en-IN') || '0'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: Distributor) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-icon"
            title="View Details"
            onClick={() => handleViewDistributor(row._id)}
          >
            <FiEye size={16} />
          </button>
          <button
            className="btn-icon"
            title="Edit Distributor"
            onClick={() => handleEditDistributor(row._id)}
          >
            <FiEdit size={16} />
          </button>
          {!row.isApproved && (
            <button
              className="btn-icon success"
              title="Approve"
              onClick={() => handleApproveDistributor(row._id)}
            >
              <FiCheck size={16} />
            </button>
          )}
          {!row.isApproved && (
            <button
              className="btn-icon danger"
              title="Reject"
              onClick={() => handleRejectDistributor(row._id)}
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  const filterOptions: FilterOption[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search by name, email, phone...'
    },
    {
      key: 'approval',
      label: 'Approval Status',
      type: 'select',
      options: [
        { value: 'approved', label: 'Approved' },
        { value: 'pending', label: 'Pending' }
      ]
    },
    {
      key: 'status',
      label: 'Active Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      key: 'state',
      label: 'State',
      type: 'text',
      placeholder: 'Enter state name'
    },
    {
      key: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Enter city name'
    },
    {
      key: 'registeredDate',
      label: 'Registration Date',
      type: 'daterange'
    }
  ];

  const bulkActions: BulkAction[] = [
    {
      label: 'Approve',
      icon: <FiCheck size={16} />,
      variant: 'success',
      onClick: handleBulkApprove
    },
    {
      label: 'Reject',
      icon: <FiX size={16} />,
      variant: 'warning',
      onClick: handleBulkReject
    }
  ];

  const handleApproveDistributor = (distributorId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve Distributor',
      message: 'Are you sure you want to approve this distributor?',
      variant: 'info',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.put(`/admin/distributors/${distributorId}/approve`, { isApproved: true });

          await fetchDistributors();
          await fetchStats();
        } catch (error) {
          console.error('Approve failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const handleRejectDistributor = (distributorId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Distributor',
      message: 'Are you sure you want to reject this distributor application?',
      variant: 'warning',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.put(`/admin/distributors/${distributorId}/approve`, {
            isApproved: false,
            rejectionReason: 'Application rejected by admin'
          });

          await fetchDistributors();
          await fetchStats();
        } catch (error) {
          console.error('Reject failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const handleViewProducts = (distributorId: string) => {
    window.open(`/admin/products?distributor=${distributorId}`, '_blank');
  };

  const handleViewOrders = (distributorId: string) => {
    window.open(`/admin/orders?distributor=${distributorId}`, '_blank');
  };

  const handleViewDistributor = (distributorId: string) => {
    const distributor = distributors.find(d => d._id === distributorId);
    if (distributor) {
      setSelectedDistributor(distributor);
      setShowViewModal(true);
    }
  };

  const handleEditDistributor = (distributorId: string) => {
    const distributor = distributors.find(d => d._id === distributorId);
    if (distributor) {
      setSelectedDistributor(distributor);
      setEditFormData({
        businessName: distributor.businessName || '',
        ownerName: distributor.ownerName || distributor.name || '',
        email: distributor.email || '',
        phone: distributor.phone || '',
        city: distributor.city || '',
        state: distributor.state || '',
        address: distributor.address || '',
        gstNumber: distributor.gstNumber || '',
        isActive: distributor.isActive ?? true
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDistributor) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/distributors/${selectedDistributor._id}`, editFormData);
      await fetchDistributors();
      await fetchStats();
      setShowEditModal(false);
      setSelectedDistributor(null);
    } catch (error: any) {
      console.error('Update distributor failed:', error);
      alert(error.response?.data?.message || 'Failed to update distributor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDistributorStatus = async (distributorId: string, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/distributors/${distributorId}`, { isActive: !currentStatus });
      await fetchDistributors();
      await fetchStats();
      if (selectedDistributor && selectedDistributor._id === distributorId) {
        setSelectedDistributor({ ...selectedDistributor, isActive: !currentStatus });
      }
    } catch (error) {
      console.error('Toggle status failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Distributors Management" requiredPermission="distributors.view">
      <div className="admin-content">
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Distributors Management
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Manage distributor approvals, products, and performance
              </p>
            </div>
            <ExportButton onExport={handleExport} label="Export Distributors" />
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Distributors"
              value={stats.total.toLocaleString()}
              icon={FiTruck}
              variant="distributors"
              trend={{ value: stats.trend, isPositive: stats.trend > 0 }}
              subtitle="All registered distributors"
            />
            <StatCard
              title="Approved"
              value={stats.approved.toLocaleString()}
              icon={FiCheck}
              variant="orders"
              subtitle="Verified distributors"
            />
            <StatCard
              title="Pending Approval"
              value={stats.pending.toLocaleString()}
              icon={FiTrendingUp}
              variant="products"
              subtitle="Awaiting review"
            />
            <StatCard
              title="Active"
              value={stats.active.toLocaleString()}
              icon={FiDollarSign}
              variant="revenue"
              subtitle="Currently active"
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--admin-border-primary)' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {(['all', 'pending', 'approved'] as const).map((tab) => (
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
                {tab === 'pending' && stats.pending > 0 && (
                  <span className="badge orange" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filterOptions}
          onApply={setFilters}
          onClear={() => setFilters({})}
          activeFilters={filters}
        />

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={distributors}
            loading={loading}
            selectable
            selectedIds={selectedDistributors}
            onSelect={setSelectedDistributors}
            pagination={{
              page: currentPage,
              limit: 20,
              total: totalItems,
              onPageChange: setCurrentPage,
            }}
          />
        </motion.div>

        {/* Bulk Actions Bar */}
        <BulkActionBar
          selectedCount={selectedDistributors.length}
          actions={bulkActions}
          onClear={() => setSelectedDistributors([])}
        />

        {/* View Distributor Modal */}
        <AnimatePresence>
          {showViewModal && selectedDistributor && (
            <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
              <motion.div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}
              >
                <div className="modal-header">
                  <h2 className="modal-title">Distributor Details</h2>
                  <button className="modal-close" onClick={() => setShowViewModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                <div className="modal-body" style={{ padding: '1.5rem' }}>
                  {/* Business Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      background: 'var(--admin-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1.5rem'
                    }}>
                      {selectedDistributor.businessName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                        {selectedDistributor.businessName}
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' }}>
                        Owner: {selectedDistributor.ownerName || selectedDistributor.name || '-'}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className={`badge ${selectedDistributor.isApproved ? 'green' : 'orange'}`}>
                          {selectedDistributor.isApproved ? 'Approved' : 'Pending'}
                        </span>
                        <span className={`badge ${selectedDistributor.isActive ? 'blue' : 'red'}`}>
                          {selectedDistributor.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {selectedDistributor.rating && (
                          <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FiStar size={12} style={{ color: '#f59e0b' }} />
                            {selectedDistributor.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div style={{ background: 'var(--admin-bg-secondary)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.75rem' }}>
                      Contact Information
                    </h4>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiMail size={16} style={{ color: 'var(--admin-text-tertiary)' }} />
                        <span style={{ color: 'var(--admin-text-primary)' }}>{selectedDistributor.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiPhone size={16} style={{ color: 'var(--admin-text-tertiary)' }} />
                        <span style={{ color: 'var(--admin-text-primary)' }}>{selectedDistributor.phone}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <FiMapPin size={16} style={{ color: 'var(--admin-text-tertiary)', marginTop: '2px' }} />
                        <span style={{ color: 'var(--admin-text-primary)' }}>
                          {selectedDistributor.address}, {selectedDistributor.city}, {selectedDistributor.state}
                        </span>
                      </div>
                      {selectedDistributor.gstNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FiFileText size={16} style={{ color: 'var(--admin-text-tertiary)' }} />
                          <span style={{ color: 'var(--admin-text-primary)' }}>GST: {selectedDistributor.gstNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'var(--admin-bg-secondary)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FiPackage size={16} style={{ color: 'var(--admin-primary)' }} />
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                        {selectedDistributor.productCount || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>Products</div>
                    </div>
                    <div style={{ background: 'var(--admin-bg-secondary)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FiShoppingCart size={16} style={{ color: 'var(--admin-info)' }} />
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                        {selectedDistributor.orderCount || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>Orders</div>
                    </div>
                    <div style={{ background: 'var(--admin-bg-secondary)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FiDollarSign size={16} style={{ color: 'var(--admin-success)' }} />
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-success)' }}>
                        ₹{(selectedDistributor.totalRevenue || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>Revenue</div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ background: 'var(--admin-bg-secondary)', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiCalendar size={16} style={{ color: 'var(--admin-text-tertiary)' }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>Registered:</span>
                      <span style={{ color: 'var(--admin-text-primary)', fontWeight: 500 }}>
                        {new Date(selectedDistributor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleViewProducts(selectedDistributor._id)}
                    >
                      <FiPackage size={16} />
                      View Products
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleViewOrders(selectedDistributor._id)}
                    >
                      <FiShoppingCart size={16} />
                      View Orders
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className={`btn ${selectedDistributor.isActive ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleDistributorStatus(selectedDistributor._id, selectedDistributor.isActive)}
                      disabled={actionLoading}
                    >
                      {selectedDistributor.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowViewModal(false);
                        handleEditDistributor(selectedDistributor._id);
                      }}
                    >
                      <FiEdit size={16} />
                      Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Distributor Modal */}
        <AnimatePresence>
          {showEditModal && selectedDistributor && (
            <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
              <motion.div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}
              >
                <div className="modal-header">
                  <h2 className="modal-title">Edit Distributor</h2>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdateDistributor}>
                  <div className="modal-body" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Business Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editFormData.businessName}
                          onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Owner Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editFormData.ownerName}
                          onChange={(e) => setEditFormData({ ...editFormData, ownerName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-input"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Address *</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editFormData.city}
                          onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editFormData.state}
                          onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">GST Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFormData.gstNumber}
                        onChange={(e) => setEditFormData({ ...editFormData, gstNumber: e.target.value })}
                        placeholder="Enter GST number (optional)"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editFormData.isActive}
                          onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span className="form-label" style={{ margin: 0 }}>Active (can operate on the platform)</span>
                      </label>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
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
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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

export default DistributorsManagement;
