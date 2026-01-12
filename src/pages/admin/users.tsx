import React, { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiPhone, FiCalendar, FiEdit, FiTrash2, FiEye, FiCheck, FiX, FiUserCheck, FiUserX } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import FilterPanel, { FilterOption } from '../../components/admin/FilterPanel';
import BulkActionBar, { BulkAction } from '../../components/admin/BulkActionBar';
import ExportButton from '../../components/admin/ExportButton';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion } from 'framer-motion';
import api from '../../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  orderCount?: number;
  totalSpent?: number;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  newThisMonth: number;
  trend: number;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    newThisMonth: 0,
    trend: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
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
    fetchUsers();
    fetchStats();
  }, [currentPage, filters, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        ...filters
      });

      const response = await api.get(`/admin/users?${queryParams}`);

      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/users/stats');
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
        ...filters
      });

      const response = await api.get(`/admin/users/export?${queryParams}`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  const handleBulkActivate = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Activate Users',
      message: `Are you sure you want to activate ${selectedUsers.length} selected user(s)?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.post('/admin/users/bulk-activate', {
            userIds: selectedUsers
          });

          await fetchUsers();
          await fetchStats();
          setSelectedUsers([]);
        } catch (error) {
          console.error('Bulk activate failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const handleBulkDeactivate = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Deactivate Users',
      message: `Are you sure you want to deactivate ${selectedUsers.length} selected user(s)? They will not be able to log in.`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.post('/admin/users/bulk-deactivate', {
            userIds: selectedUsers
          });

          await fetchUsers();
          await fetchStats();
          setSelectedUsers([]);
        } catch (error) {
          console.error('Bulk deactivate failed:', error);
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
      title: 'Delete Users',
      message: `Are you sure you want to permanently delete ${selectedUsers.length} selected user(s)? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete('/admin/users/bulk-delete', {
            data: { userIds: selectedUsers }
          });

          await fetchUsers();
          await fetchStats();
          setSelectedUsers([]);
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
      key: 'name',
      label: 'User',
      sortable: true,
      render: (value, row: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
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
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <FiMail size={12} />
              {row.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (value) => value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
          <FiPhone size={14} />
          {value}
        </div>
      ) : (
        <span style={{ color: 'var(--admin-text-tertiary)', fontSize: '0.875rem' }}>N/A</span>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => (
        <span className="badge purple" style={{ textTransform: 'capitalize' }}>
          {value}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`badge ${value ? 'green' : 'red'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'isVerified',
      label: 'Verified',
      render: (value) => value ? (
        <FiCheck style={{ color: 'var(--admin-success)' }} size={18} />
      ) : (
        <FiX style={{ color: 'var(--admin-error)' }} size={18} />
      )
    },
    {
      key: 'orderCount',
      label: 'Orders',
      sortable: true,
      render: (value) => (
        <span style={{ fontWeight: 500, color: 'var(--admin-text-primary)' }}>
          {value || 0}
        </span>
      )
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (value) => (
        <span style={{ fontWeight: 500, color: 'var(--admin-success)' }}>
          ₹{value?.toLocaleString('en-IN') || '0'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (value) => (
        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
          {new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: User) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-icon"
            title="View Details"
            onClick={() => handleViewUser(row._id)}
          >
            <FiEye size={16} />
          </button>
          <button
            className="btn-icon"
            title="Edit User"
            onClick={() => handleEditUser(row._id)}
          >
            <FiEdit size={16} />
          </button>
          <button
            className="btn-icon danger"
            title="Delete User"
            onClick={() => handleDeleteUser(row._id)}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const filterOptions: FilterOption[] = [
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' },
        { value: 'distributor', label: 'Distributor' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      key: 'verified',
      label: 'Verification',
      type: 'select',
      options: [
        { value: 'verified', label: 'Verified' },
        { value: 'unverified', label: 'Unverified' }
      ]
    },
    {
      key: 'registeredDate',
      label: 'Registration Date',
      type: 'daterange'
    }
  ];

  const bulkActions: BulkAction[] = [
    {
      label: 'Activate',
      icon: <FiUserCheck size={16} />,
      variant: 'success',
      onClick: handleBulkActivate
    },
    {
      label: 'Deactivate',
      icon: <FiUserX size={16} />,
      variant: 'warning',
      onClick: handleBulkDeactivate
    },
    {
      label: 'Delete',
      icon: <FiTrash2 size={16} />,
      variant: 'danger',
      onClick: handleBulkDelete
    }
  ];

  const handleViewUser = (userId: string) => {
    // TODO: Open user details modal
    console.log('View user:', userId);
  };

  const handleEditUser = (userId: string) => {
    // TODO: Open edit user modal
    console.log('Edit user:', userId);
  };

  const handleDeleteUser = (userId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete(`/admin/users/${userId}`);

          await fetchUsers();
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

  return (
    <AdminLayout title="Users Management">
      <div className="admin-content">
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Users Management
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Manage all registered users, their roles, and activity
              </p>
            </div>
            <ExportButton onExport={handleExport} label="Export Users" />
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Users"
              value={stats.total.toLocaleString()}
              icon={FiUsers}
              variant="users"
              trend={{ value: stats.trend, isPositive: stats.trend > 0 }}
              subtitle="All registered users"
            />
            <StatCard
              title="Active Users"
              value={stats.active.toLocaleString()}
              icon={FiUserCheck}
              variant="orders"
              subtitle="Currently active"
            />
            <StatCard
              title="Inactive Users"
              value={stats.inactive.toLocaleString()}
              icon={FiUserX}
              variant="distributors"
              subtitle="Deactivated accounts"
            />
            <StatCard
              title="New This Month"
              value={stats.newThisMonth.toLocaleString()}
              icon={FiCalendar}
              variant="products"
              subtitle="Recent registrations"
            />
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
            data={users}
            loading={loading}
            selectable
          />
        </motion.div>

        {/* Bulk Actions Bar */}
        <BulkActionBar
          selectedCount={selectedUsers.length}
          actions={bulkActions}
          onClear={() => setSelectedUsers([])}
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

export default UsersManagement;