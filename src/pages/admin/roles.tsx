import React, { useState, useEffect } from 'react';
import { FiShield, FiUsers, FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiLock } from 'react-icons/fi';
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

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'users',
    label: 'User Management',
    permissions: [
      { key: 'users.view', label: 'View Users', description: 'View user list and details' },
      { key: 'users.create', label: 'Create Users', description: 'Create new users' },
      { key: 'users.edit', label: 'Edit Users', description: 'Edit user information' },
      { key: 'users.delete', label: 'Delete Users', description: 'Delete users' }
    ]
  },
  {
    name: 'distributors',
    label: 'Distributor Management',
    permissions: [
      { key: 'distributors.view', label: 'View Distributors', description: 'View distributor list' },
      { key: 'distributors.approve', label: 'Approve Distributors', description: 'Approve/reject distributors' },
      { key: 'distributors.edit', label: 'Edit Distributors', description: 'Edit distributor information' },
      { key: 'distributors.delete', label: 'Delete Distributors', description: 'Delete distributors' }
    ]
  },
  {
    name: 'products',
    label: 'Product Management',
    permissions: [
      { key: 'products.view', label: 'View Products', description: 'View product list' },
      { key: 'products.edit', label: 'Edit Products', description: 'Edit product information' },
      { key: 'products.delete', label: 'Delete Products', description: 'Delete products' }
    ]
  },
  {
    name: 'orders',
    label: 'Order Management',
    permissions: [
      { key: 'orders.view', label: 'View Orders', description: 'View order list and details' },
      { key: 'orders.edit', label: 'Edit Orders', description: 'Update order status' },
      { key: 'orders.refund', label: 'Process Refunds', description: 'Issue refunds' }
    ]
  },
  {
    name: 'categories',
    label: 'Category Management',
    permissions: [
      { key: 'categories.manage', label: 'Manage Categories', description: 'Full category management' }
    ]
  },
  {
    name: 'coupons',
    label: 'Coupon Management',
    permissions: [
      { key: 'coupons.manage', label: 'Manage Coupons', description: 'Full coupon management' }
    ]
  },
  {
    name: 'analytics',
    label: 'Analytics & Reports',
    permissions: [
      { key: 'analytics.view', label: 'View Analytics', description: 'View analytics and reports' }
    ]
  },
  {
    name: 'settings',
    label: 'System Settings',
    permissions: [
      { key: 'settings.manage', label: 'Manage Settings', description: 'Configure system settings' }
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

  useEffect(() => {
    fetchRoles();
    fetchStats();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/roles');
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/roles/stats');
      const data = response.data;
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive
    });
    setShowModal(true);
  };

  const handleTogglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleToggleAllInGroup = (group: PermissionGroup) => {
    const groupPermissions = group.permissions.map(p => p.key);
    const allSelected = groupPermissions.every(p => formData.permissions.includes(p));

    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !groupPermissions.includes(p))
        : Array.from(new Set([...prev.permissions, ...groupPermissions]))
    }));
  };

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
    } catch (error) {
      console.error('Save role failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = (role: Role) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Role',
      message: `Are you sure you want to delete the role "${role.name}"? Users with this role will lose their permissions.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete(`/admin/roles/${role._id}`);

          await fetchRoles();
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

  const getPermissionCount = (permissions: string[]) => {
    return permissions.filter(p => p !== '*').length;
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
                  />
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
                    Permissions ({formData.permissions.includes('*') ? 'All' : getPermissionCount(formData.permissions)} selected)
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
                      <div key={group.name} style={{ marginBottom: '1.5rem', border: '1px solid var(--admin-border-primary)', borderRadius: '8px', overflow: 'hidden' }}>
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
                                padding: '0.75rem',
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
    <AdminLayout title="Roles & Permissions">
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
              subtitle="All roles"
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
              subtitle="Assigned to roles"
            />
          </div>
        </div>

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
                    border: '1px solid var(--admin-border-primary)',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: role.permissions.includes('*') ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'var(--admin-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {role.permissions.includes('*') ? <FiLock size={20} /> : <FiShield size={20} />}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', margin: 0 }}>
                          {role.name}
                        </h3>
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
                          {getPermissionCount(role.permissions)} Permissions
                        </span>
                      )}
                      {role.userCount !== undefined && (
                        <span className="badge blue">
                          <FiUsers size={12} style={{ marginRight: '0.25rem' }} />
                          {role.userCount} users
                        </span>
                      )}
                    </div>

                    {/* Permission Preview */}
                    {!role.permissions.includes('*') && role.permissions.length > 0 && (
                      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                        <strong>Permissions:</strong> {role.permissions.slice(0, 5).join(', ')}
                        {role.permissions.length > 5 && ` +${role.permissions.length - 5} more`}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-icon"
                      title="Edit Role"
                      onClick={() => handleEditRole(role)}
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      title="Delete Role"
                      onClick={() => handleDeleteRole(role)}
                    >
                      <FiTrash2 size={16} />
                    </button>
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
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default RolesManagement;