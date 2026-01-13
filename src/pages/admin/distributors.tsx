import React, { useState, useEffect } from 'react';
import { FiTruck, FiCheck, FiX, FiPackage, FiShoppingCart, FiMapPin, FiPhone, FiMail, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import FilterPanel, { FilterOption } from '../../components/admin/FilterPanel';
import BulkActionBar, { BulkAction } from '../../components/admin/BulkActionBar';
import ExportButton from '../../components/admin/ExportButton';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion } from 'framer-motion';
import api from '../../services/api';

interface Distributor {
  _id: string;
  businessName: string;
  ownerName: string;
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
              {row.ownerName}
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
          <button
            className="btn-icon"
            title="View Products"
            onClick={() => handleViewProducts(row._id)}
          >
            <FiPackage size={16} />
          </button>
          <button
            className="btn-icon"
            title="View Orders"
            onClick={() => handleViewOrders(row._id)}
          >
            <FiShoppingCart size={16} />
          </button>
        </div>
      )
    }
  ];

  const filterOptions: FilterOption[] = [
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
          await api.put(`/admin/distributors/${distributorId}/approve`);

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
          await api.put(`/admin/distributors/${distributorId}/reject`);

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

  return (
    <AdminLayout title="Distributors Management" >
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
          />
        </motion.div>

        {/* Bulk Actions Bar */}
        <BulkActionBar
          selectedCount={selectedDistributors.length}
          actions={bulkActions}
          onClear={() => setSelectedDistributors([])}
        />

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
