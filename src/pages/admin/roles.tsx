import React, { useState, useEffect, useCallback } from 'react';
import { FiShield, FiUsers, FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiLock, FiAlertCircle } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  userCount?: number;
}

interface RoleStats {
  total: number;
  active: number;
  totalUsers: number;
}

interface PermissionGroup {
  name: string;
  label: string;
  permissions: {
    key: string;
    label: string;
    description: string;
  }[];
}

// Must match Role model's validPermissions exactly
const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'users',
    label: 'User Management',
    permissions: [
      { key: 'users.view', label: 'View Users', description: 'View user list and details' },
      { key: 'users.create', label: 'Create Users', description: 'Create new user accounts' },
      { key: 'users.edit', label: 'Edit Users', description: 'Edit user information and status' },
      { key: 'users.delete', label: 'Delete Users', description: 'Permanently delete users' }
    ]
  },
  {
    name: 'distributors',
    label: 'Distributor Management',
    permissions: [
      { key: 'distributors.view', label: 'View Distributors', description: 'View distributor list and details' },
      { key: 'distributors.approve', label: 'Approve Distributors', description: 'Approve or reject distributor applications' },
      { key: 'distributors.edit', label: 'Edit Distributors', description: 'Edit distributor information' },
      { key: 'distributors.delete', label: 'Delete Distributors', description: 'Delete distributors and their products' }
    ]
  },
  {
    name: 'products',
    label: 'Product Management',
    permissions: [
      { key: 'products.view', label: 'View Products', description: 'View product listings and details' },
      { key: 'products.edit', label: 'Edit Products', description: 'Edit product information and pricing' },
      { key: 'products.delete', label: 'Delete Products', description: 'Remove products from the platform' }
    ]
  },
  {
    name: 'orders',
    label: 'Order Management',
    permissions: [
      { key: 'orders.view', label: 'View Orders', description: 'View order list, details, and history' },
      { key: 'orders.edit', label: 'Edit Orders', description: 'Update order status and details' },
      { key: 'orders.refund', label: 'Process Refunds', description: 'Issue refunds for paid orders' }
    ]
  },
  {
    name: 'categories',
    label: 'Category Management',
    permissions: [
      { key: 'categories.view', label: 'View Categories', description: 'View product categories' },
      { key: 'categories.create', label: 'Create Categories', description: 'Add new product categories' },
      { key: 'categories.edit', label: 'Edit Categories', description: 'Edit category details' },
      { key: 'categories.delete', label: 'Delete Categories', description: 'Remove product categories' }
    ]
  },
  {
    name: 'coupons',
    label: 'Coupon Management',
    permissions: [
      { key: 'coupons.view', label: 'View Coupons', description: 'View coupon list and usage' },
      { key: 'coupons.create', label: 'Create Coupons', description: 'Create new discount coupons' },
      { key: 'coupons.edit', label: 'Edit Coupons', description: 'Edit coupon settings' },
      { key: 'coupons.delete', label: 'Delete Coupons', description: 'Remove coupons' }
    ]
  },
  {
    name: 'roles',
    label: 'Role Management',
    permissions: [
      { key: 'roles.view', label: 'View Roles', description: 'View roles and permissions' },
      { key: 'roles.create', label: 'Create Roles', description: 'Create new roles' },
      { key: 'roles.edit', label: 'Edit Roles', description: 'Edit role permissions' },
      { key: 'roles.delete', label: 'Delete Roles', description: 'Delete custom roles' }
    ]
  },
  {
    name: 'reviews',
    label: 'Review Management',
    permissions: [
      { key: 'reviews.view', label: 'View Reviews', description: 'View product reviews' },
      { key: 'reviews.approve', label: 'Approve Reviews', description: 'Approve or reject reviews' },
      { key: 'reviews.delete', label: 'Delete Reviews', description: 'Remove reviews' }
    ]
  },
  {
    name: 'settings',
    label: 'System Settings',
    permissions: [
      { key: 'settings.view', label: 'View Settings', description: 'View system configuration' },
      { key: 'settings.edit', label: 'Edit Settings', description: 'Modify system configuration' }
    ]
  },
  {
    name: 'activityLogs',
    label: 'Activity Logs',
    permissions: [
      { key: 'activityLogs.view', label: 'View Activity Logs', description: 'View system activity and audit logs' }
    ]
  },
  {
    name: 'emailTemplates',
    label: 'Email Templates',
    permissions: [
      { key: 'emailTemplates.view', label: 'View Templates', description: 'View email templates' },
      { key: 'emailTemplates.edit', label: 'Edit Templates', description: 'Edit email templates' }
    ]
  }
];

const RolesManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<RoleStats>({
    total: 0,
    active: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
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
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoles();
    fetchStats();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/roles?includeInactive=true');
      setRoles(response.data.roles || []);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err.response?.data?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/roles/stats');
      setStats(response.data.stats || stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: [...role.permissions],
      isActive: role.isActive
    });
    setShowModal(true);
  };

  const handleTogglePermission = useCallback((permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  }, []);

  const handleToggleAllInGroup = useCallback((group: PermissionGroup) => {
    const groupPermissions = group.permissions.map(p => p.key);
    setFormData(prev => {
      const allSelected = groupPermissions.every(p => prev.permissions.includes(p));
      return {
        ...prev,
        permissions: allSelected
          ? prev.permissions.filter(p => !groupPermissions.includes(p))
          : Array.from(new Set([...prev.permissions, ...groupPermissions]))
      };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingRole) {
        await api.put(`/admin/roles/${editingRole._id}`, formData);
      } else {
        await api.post('/admin/roles', formData);
      }

      await fetchRoles();
      await fetchStats();
      setShowModal(false);
    } catch (err: any) {
      console.error('Save role failed:', err);
      alert(err.response?.data?.message || 'Failed to save role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = (role: Role) => {
    if (role.isSystem) {
      alert('System roles cannot be deleted');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Role',
      message: `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete(`/admin/roles/${role._id}`);
          await fetchRoles();
          await fetchStats();
        } catch (err: any) {
          console.error('Delete failed:', err);
          alert(err.response?.data?.message || 'Failed to delete role');
        } finally {
          setActionLoading(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const getPermissionCount = (permissions: string[]) => {
    if (permissions.includes('*')) return 'All';
    return permissions.length;
  };

  const RoleFormModal = () => (
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
            style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Role Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Manager"
                    disabled={editingRole?.isSystem}
                  />
                  {editingRole?.isSystem && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginTop: '0.25rem' }}>
                      System role names cannot be changed
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Describe this role's purpose"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '1rem' }}>
                    Permissions ({getPermissionCount(formData.permissions)} selected)
                  </label>

                  {/* Super Admin - All Permissions */}
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--admin-bg-secondary)', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes('*')}
                        onChange={() => {
                          setFormData({
                            ...formData,
                            permissions: formData.permissions.includes('*') ? [] : ['*']
                          });
                        }}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--admin-error)', marginBottom: '0.25rem' }}>
                          Full Access (Super Admin)
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                          Grant complete system access - use with caution
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Permission Groups */}
                  {!formData.permissions.includes('*') && PERMISSION_GROUPS.map(group => {
                    const groupPermissions = group.permissions.map(p => p.key);
                    const allSelected = groupPermissions.every(p => formData.permissions.includes(p));
                    const someSelected = groupPermissions.some(p => formData.permissions.includes(p));

                    return (
                      <div key={group.name} style={{ marginBottom: '1rem', border: '1px solid var(--admin-border-primary)', borderRadius: '8px', overflow: 'hidden' }}>
                        {/* Group Header */}
                        <div style={{ padding: '0.75rem 1rem', background: 'var(--admin-bg-secondary)', borderBottom: '1px solid var(--admin-border-primary)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={allSelected}
                              ref={(input) => {
                                if (input) {
                                  input.indeterminate = someSelected && !allSelected;
                                }
                              }}
                              onChange={() => handleToggleAllInGroup(group)}
                              style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                              {group.label}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginLeft: 'auto' }}>
                              {groupPermissions.filter(p => formData.permissions.includes(p)).length}/{groupPermissions.length}
                            </span>
                          </label>
                        </div>

                        {/* Group Permissions */}
                        <div style={{ padding: '0.5rem' }}>
                          {group.permissions.map(permission => (
                            <label
                              key={permission.key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.625rem 0.75rem',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg-secondary)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.key)}
                                onChange={() => handleTogglePermission(permission.key)}
                                style={{ width: '16px', height: '16px' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.125rem' }}>
                                  {permission.label}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                                  {permission.description}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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
                      {editingRole ? 'Update' : 'Create'} Role
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
    <AdminLayout title="Roles & Permissions" requiredPermission="roles.view">
      <div className="admin-content">
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Roles & Permissions
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Manage user roles and access control
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleCreateRole}>
              <FiPlus size={16} />
              Create Role
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <StatCard
              title="Total Roles"
              value={stats.total.toLocaleString()}
              icon={FiShield}
              variant="products"
              subtitle="All defined roles"
            />
            <StatCard
              title="Active Roles"
              value={stats.active.toLocaleString()}
              icon={FiCheck}
              variant="orders"
              subtitle="Currently active"
            />
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={FiUsers}
              variant="users"
              subtitle="All users across roles"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div style={{
            padding: '1rem 1.5rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FiAlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Roles List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : roles.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {roles.map((role) => (
                <div
                  key={role._id}
                  style={{
                    padding: '1.5rem',
                    background: 'white',
                    border: `1px solid ${role.isActive ? 'var(--admin-border-primary)' : '#fecaca'}`,
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    opacity: role.isActive ? 1 : 0.7
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: role.permissions.includes('*')
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          : 'var(--admin-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        {role.permissions.includes('*') ? <FiLock size={20} /> : <FiShield size={20} />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', margin: 0 }}>
                            {role.name}
                          </h3>
                          {role.isSystem && (
                            <span style={{
                              fontSize: '0.625rem',
                              fontWeight: 600,
                              padding: '0.125rem 0.5rem',
                              background: '#dbeafe',
                              color: '#1e40af',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              System
                            </span>
                          )}
                        </div>
                        {role.description && (
                          <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', margin: '0.25rem 0 0 0' }}>
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                      <span className={`badge ${role.isActive ? 'green' : 'red'}`}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {role.permissions.includes('*') ? (
                        <span className="badge red">Full Access</span>
                      ) : (
                        <span className="badge purple">
                          {role.permissions.length} Permission{role.permissions.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="badge blue">
                        <FiUsers size={12} style={{ marginRight: '0.25rem' }} />
                        {role.userCount ?? 0} user{(role.userCount ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Permission Preview */}
                    {!role.permissions.includes('*') && role.permissions.length > 0 && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--admin-text-secondary)' }}>
                        {role.permissions.slice(0, 6).map((p, i) => (
                          <span key={p} style={{
                            display: 'inline-block',
                            padding: '0.125rem 0.5rem',
                            background: 'var(--admin-bg-secondary)',
                            borderRadius: '4px',
                            marginRight: '0.375rem',
                            marginBottom: '0.375rem',
                            fontSize: '0.75rem'
                          }}>
                            {p}
                          </span>
                        ))}
                        {role.permissions.length > 6 && (
                          <span style={{
                            display: 'inline-block',
                            padding: '0.125rem 0.5rem',
                            background: 'var(--admin-bg-secondary)',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}>
                            +{role.permissions.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
                    <button
                      className="btn-icon"
                      title="Edit Role"
                      onClick={() => handleEditRole(role)}
                    >
                      <FiEdit size={16} />
                    </button>
                    {!role.isSystem && (
                      <button
                        className="btn-icon danger"
                        title="Delete Role"
                        onClick={() => handleDeleteRole(role)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border-primary)' }}>
              <FiShield size={48} style={{ color: 'var(--admin-text-tertiary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Roles Yet</h3>
              <p style={{ color: 'var(--admin-text-secondary)', marginBottom: '1.5rem' }}>
                Create your first role to manage user permissions
              </p>
              <button className="btn btn-primary" onClick={handleCreateRole}>
                <FiPlus size={16} />
                Create First Role
              </button>
            </div>
          )}
        </motion.div>

        {/* Role Form Modal */}
        <RoleFormModal />

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default RolesManagement;
