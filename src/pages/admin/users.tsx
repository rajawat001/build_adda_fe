import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUsers, FiMail, FiPhone, FiCalendar, FiEdit, FiTrash2, FiEye, FiCheck, FiX, FiUserCheck, FiUserX, FiShoppingCart, FiDollarSign, FiMapPin } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import FilterPanel, { FilterOption } from '../../components/admin/FilterPanel';
import BulkActionBar, { BulkAction } from '../../components/admin/BulkActionBar';
import ExportButton from '../../components/admin/ExportButton';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
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
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
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
  const router = useRouter();
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
  const [totalItems, setTotalItems] = useState(0);
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

  // View & Edit Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isActive: true,
    isVerified: false
  });

  useEffect(() => {
    if (router.isReady && router.query.search) {
      setSearchTerm(router.query.search as string);
    }
  }, [router.isReady, router.query.search]);

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
      setTotalItems(response.data.pagination?.total || 0);
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
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search by name, email, phone...'
    },
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
    const user = users.find(u => u._id === userId);
    if (user) {
      setSelectedUser(user);
      setShowViewModal(true);
    }
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setSelectedUser(user);
      setEditFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        isActive: user.isActive ?? true,
        isVerified: user.isVerified ?? false
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/users/${selectedUser._id}`, editFormData);
      await fetchUsers();
      await fetchStats();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Update user failed:', error);
      alert(error.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      await fetchUsers();
      await fetchStats();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, isActive: !currentStatus });
      }
    } catch (error) {
      console.error('Toggle status failed:', error);
    } finally {
      setActionLoading(false);
    }
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
    <AdminLayout title="Users Management" requiredPermission="users.view">
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
            selectedIds={selectedUsers}
            onSelect={setSelectedUsers}
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
          selectedCount={selectedUsers.length}
          actions={bulkActions}
          onClear={() => setSelectedUsers([])}
        />

        {/* View User Modal */}
        <AnimatePresence>
          {showViewModal && selectedUser && (
            <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
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
                  <h2 className="modal-title">User Details</h2>
                  <button className="modal-close" onClick={() => setShowViewModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                <div className="modal-body" style={{ padding: '1.5rem' }}>
                  {/* User Avatar & Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'var(--admin-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1.5rem'
                    }}>
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                        {selectedUser.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className={`badge ${selectedUser.isActive ? 'green' : 'red'}`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="badge purple" style={{ textTransform: 'capitalize' }}>
                          {selectedUser.role}
                        </span>
                        {selectedUser.isVerified && (
                          <span className="badge blue">Verified</span>
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
                        <span style={{ color: 'var(--admin-text-primary)' }}>{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FiPhone size={16} style={{ color: 'var(--admin-text-tertiary)' }} />
                          <span style={{ color: 'var(--admin-text-primary)' }}>{selectedUser.phone}</span>
                        </div>
                      )}
                      {selectedUser.address && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <FiMapPin size={16} style={{ color: 'var(--admin-text-tertiary)', marginTop: '2px' }} />
                          <span style={{ color: 'var(--admin-text-primary)' }}>
                            {[selectedUser.address.street, selectedUser.address.city, selectedUser.address.state, selectedUser.address.pincode].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'var(--admin-bg-secondary)', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FiShoppingCart size={16} style={{ color: 'var(--admin-primary)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>Total Orders</span>
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                        {selectedUser.orderCount || 0}
                      </div>
                    </div>
                    <div style={{ background: 'var(--admin-bg-secondary)', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FiDollarSign size={16} style={{ color: 'var(--admin-success)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>Total Spent</span>
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-success)' }}>
                        ₹{(selectedUser.totalSpent || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div style={{ background: 'var(--admin-bg-secondary)', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>Joined</div>
                      <div style={{ color: 'var(--admin-text-primary)', fontWeight: 500 }}>
                        {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ background: 'var(--admin-bg-secondary)', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>Last Login</div>
                      <div style={{ color: 'var(--admin-text-primary)', fontWeight: 500 }}>
                        {selectedUser.lastLogin
                          ? new Date(selectedUser.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className={`btn ${selectedUser.isActive ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleToggleUserStatus(selectedUser._id, selectedUser.isActive)}
                    disabled={actionLoading}
                  >
                    {selectedUser.isActive ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                    {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditUser(selectedUser._id);
                    }}
                  >
                    <FiEdit size={16} />
                    Edit User
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit User Modal */}
        <AnimatePresence>
          {showEditModal && selectedUser && (
            <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
              <motion.div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ maxWidth: '500px' }}
              >
                <div className="modal-header">
                  <h2 className="modal-title">Edit User</h2>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdateUser}>
                  <div className="modal-body" style={{ padding: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                      />
                    </div>

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
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Role *</label>
                      <select
                        className="form-select"
                        value={editFormData.role}
                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                        required
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="distributor">Distributor</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={editFormData.isActive}
                            onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span className="form-label" style={{ margin: 0 }}>Active</span>
                        </label>
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={editFormData.isVerified}
                            onChange={(e) => setEditFormData({ ...editFormData, isVerified: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span className="form-label" style={{ margin: 0 }}>Verified</span>
                        </label>
                      </div>
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

export default UsersManagement;