import React, { useState, useEffect } from 'react';
import { FiShield, FiMail, FiPhone, FiEdit, FiCheck, FiX, FiSearch, FiUser } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface AssignedRole {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  assignedRole?: AssignedRole | null;
  createdAt: string;
  lastLogin?: string;
}

// Permission labels for display
const PERMISSION_LABELS: Record<string, string> = {
  '*': 'Full Access (All Permissions)',
  'users.view': 'Users - View',
  'users.create': 'Users - Create',
  'users.edit': 'Users - Edit',
  'users.delete': 'Users - Delete',
  'distributors.view': 'Distributors - View',
  'distributors.approve': 'Distributors - Approve',
  'distributors.edit': 'Distributors - Edit',
  'distributors.delete': 'Distributors - Delete',
  'products.view': 'Products - View',
  'products.edit': 'Products - Edit',
  'products.delete': 'Products - Delete',
  'orders.view': 'Orders - View',
  'orders.edit': 'Orders - Edit',
  'orders.refund': 'Orders - Refund',
  'categories.view': 'Categories - View',
  'categories.create': 'Categories - Create',
  'categories.edit': 'Categories - Edit',
  'categories.delete': 'Categories - Delete',
  'coupons.view': 'Coupons - View',
  'coupons.create': 'Coupons - Create',
  'coupons.edit': 'Coupons - Edit',
  'coupons.delete': 'Coupons - Delete',
  'roles.view': 'Roles - View',
  'roles.create': 'Roles - Create',
  'roles.edit': 'Roles - Edit',
  'roles.delete': 'Roles - Delete',
  'settings.view': 'Settings - View',
  'settings.edit': 'Settings - Edit',
  'reviews.view': 'Reviews - View',
  'reviews.approve': 'Reviews - Approve',
  'reviews.delete': 'Reviews - Delete',
  'activityLogs.view': 'Activity Logs - View',
  'emailTemplates.view': 'Email Templates - View',
  'emailTemplates.edit': 'Email Templates - Edit',
  'contacts.view': 'Messages - View',
  'contacts.reply': 'Messages - Reply',
  'contacts.delete': 'Messages - Delete',
  'subscriptions.view': 'Subscriptions - View',
  'subscriptions.edit': 'Subscriptions - Edit',
};

const AdminUsersManagement: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<AssignedRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // View permissions modal
  const [showPermModal, setShowPermModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchAdminUsers();
  }, [searchTerm]);

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const response = await api.get(`/admin/admin-users${params}`);
      setAdminUsers(response.data.adminUsers || []);
      setAvailableRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user: AdminUser) => {
    setSelectedUser(user);
    setSelectedRoleId(user.assignedRole?._id || '');
    setShowEditModal(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !selectedRoleId) {
      alert('Please select a role');
      return;
    }

    try {
      setActionLoading(true);
      await api.put(`/admin/users/${selectedUser._id}/assign-role`, {
        roleId: selectedRoleId
      });
      await fetchAdminUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Assign role failed:', error);
      alert(error.response?.data?.message || 'Failed to assign role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPermissions = (user: AdminUser) => {
    setViewingUser(user);
    setShowPermModal(true);
  };

  const VIEW_ONLY_PERMISSIONS = [
    'users.view', 'distributors.view', 'products.view', 'orders.view',
    'categories.view', 'coupons.view', 'subscriptions.view', 'reviews.view',
    'contacts.view', 'activityLogs.view', 'emailTemplates.view', 'settings.view'
  ];

  const getUserPermissions = (user: AdminUser): string[] => {
    if (!user.assignedRole) return VIEW_ONLY_PERMISSIONS;
    return user.assignedRole.permissions || VIEW_ONLY_PERMISSIONS;
  };

  const getRoleName = (user: AdminUser): string => {
    if (!user.assignedRole) return 'View Only (Default)';
    return user.assignedRole.name;
  };

  const getRoleColor = (roleName: string): string => {
    switch (roleName) {
      case 'Super Admin': return '#ef4444';
      case 'Admin': return '#f59e0b';
      case 'Catalog Manager': return '#8b5cf6';
      case 'Order Manager': return '#3b82f6';
      case 'Review Manager': return '#10b981';
      case 'Support': return '#6366f1';
      case 'View Only': return '#9ca3af';
      case 'View Only (Default)': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  return (
    <AdminLayout title="Admin Users" requiredPermission="roles.view">
      <div className="admin-content">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
            Admin Users & Permissions
          </h1>
          <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
            Manage admin roles and page-level access for admin users
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--admin-bg-card, #fff)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--admin-border, #e5e7eb)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Admins</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>{adminUsers.length}</div>
          </div>
          <div style={{ background: 'var(--admin-bg-card, #fff)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--admin-border, #e5e7eb)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>View Only (No Role)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#9ca3af' }}>{adminUsers.filter(u => !u.assignedRole).length}</div>
          </div>
          <div style={{ background: 'var(--admin-bg-card, #fff)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--admin-border, #e5e7eb)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Available Roles</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-primary, #667eea)' }}>{availableRoles.length}</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search admin users by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 1rem 0.625rem 2.5rem',
              border: '1px solid var(--admin-border, #e5e7eb)',
              borderRadius: '8px',
              background: 'var(--admin-bg-card, #fff)',
              color: 'var(--admin-text-primary)',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Admin Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'var(--admin-bg-card, #fff)',
            borderRadius: '12px',
            border: '1px solid var(--admin-border, #e5e7eb)',
            overflow: 'hidden'
          }}
        >
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
              Loading admin users...
            </div>
          ) : adminUsers.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
              No admin users found
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--admin-bg-secondary, #f9fafb)', borderBottom: '1px solid var(--admin-border, #e5e7eb)' }}>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase' }}>Admin User</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase' }}>Assigned Role</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((user, index) => {
                  const roleName = getRoleName(user);
                  const roleColor = getRoleColor(roleName);
                  return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      style={{ borderBottom: '1px solid var(--admin-border, #e5e7eb)' }}
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 600, fontSize: '0.875rem'
                          }}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--admin-text-primary)' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                              Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>
                            <FiMail size={13} style={{ color: 'var(--admin-text-tertiary)' }} />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
                              <FiPhone size={13} style={{ color: 'var(--admin-text-tertiary)' }} />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'white',
                          background: roleColor
                        }}>
                          {roleName}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: user.isActive ? '#059669' : '#dc2626',
                          background: user.isActive ? '#d1fae5' : '#fee2e2'
                        }}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleViewPermissions(user)}
                            title="View Permissions"
                            style={{
                              padding: '0.375rem 0.75rem',
                              borderRadius: '6px',
                              border: '1px solid var(--admin-border, #e5e7eb)',
                              background: 'var(--admin-bg-secondary, #f9fafb)',
                              color: 'var(--admin-text-primary)',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              display: 'flex', alignItems: 'center', gap: '0.375rem'
                            }}
                          >
                            <FiShield size={14} />
                            Permissions
                          </button>
                          <button
                            onClick={() => handleEditRole(user)}
                            title="Change Role"
                            style={{
                              padding: '0.375rem 0.75rem',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              display: 'flex', alignItems: 'center', gap: '0.375rem'
                            }}
                          >
                            <FiEdit size={14} />
                            Change Role
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Role Legend */}
        <div style={{ marginTop: '1.5rem', background: 'var(--admin-bg-card, #fff)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--admin-border, #e5e7eb)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Available Roles
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {/* Super Admin (default) */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'var(--admin-bg-secondary, #f9fafb)', borderRadius: '8px' }}>
              <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, color: 'white', background: getRoleColor('Super Admin'), whiteSpace: 'nowrap' }}>Super Admin</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>Full system access — all permissions</span>
            </div>
            {availableRoles.filter(r => r.name !== 'Super Admin').map(role => (
              <div key={role._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'var(--admin-bg-secondary, #f9fafb)', borderRadius: '8px' }}>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, color: 'white', background: getRoleColor(role.name), whiteSpace: 'nowrap' }}>{role.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>{role.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Role Modal */}
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
                  <h2 className="modal-title">Change Admin Role</h2>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                <div className="modal-body" style={{ padding: '1.5rem' }}>
                  {/* User info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--admin-bg-secondary, #f9fafb)', borderRadius: '8px' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 600
                    }}>
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>{selectedUser.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>{selectedUser.email}</div>
                    </div>
                  </div>

                  {/* Current Role */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', marginBottom: '0.375rem' }}>Current Role</div>
                    <span style={{
                      display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px',
                      fontSize: '0.8rem', fontWeight: 600, color: 'white',
                      background: getRoleColor(getRoleName(selectedUser))
                    }}>
                      {getRoleName(selectedUser)}
                    </span>
                  </div>

                  {/* Select New Role */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiShield size={14} />
                      Select New Role
                    </label>
                    <select
                      className="form-select"
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--admin-border, #e5e7eb)', fontSize: '0.875rem' }}
                    >
                      <option value="">-- Select a Role --</option>
                      {availableRoles.filter(r => r.isActive).map(role => (
                        <option key={role._id} value={role._id}>
                          {role.name} — {role.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Permission Preview */}
                  {selectedRoleId && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--admin-bg-secondary, #f9fafb)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Permissions Preview
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {(availableRoles.find(r => r._id === selectedRoleId)?.permissions || []).map(perm => (
                          <span key={perm} style={{
                            padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem',
                            background: perm === '*' ? '#fef3c7' : '#e0e7ff',
                            color: perm === '*' ? '#92400e' : '#3730a3',
                            fontWeight: 500
                          }}>
                            {PERMISSION_LABELS[perm] || perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveRole}
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
                        Save Role
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* View Permissions Modal */}
        <AnimatePresence>
          {showPermModal && viewingUser && (
            <div className="modal-overlay" onClick={() => setShowPermModal(false)}>
              <motion.div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ maxWidth: '550px', maxHeight: '90vh', overflow: 'auto' }}
              >
                <div className="modal-header">
                  <h2 className="modal-title">Permissions — {viewingUser.name}</h2>
                  <button className="modal-close" onClick={() => setShowPermModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                <div className="modal-body" style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>Role: </span>
                    <span style={{
                      display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: '9999px',
                      fontSize: '0.8rem', fontWeight: 600, color: 'white',
                      background: getRoleColor(getRoleName(viewingUser))
                    }}>
                      {getRoleName(viewingUser)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {getUserPermissions(viewingUser).map(perm => (
                      <span key={perm} style={{
                        padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.8rem',
                        background: perm === '*' ? '#fef3c7' : '#e0e7ff',
                        color: perm === '*' ? '#92400e' : '#3730a3',
                        fontWeight: 500,
                        border: `1px solid ${perm === '*' ? '#fde68a' : '#c7d2fe'}`
                      }}>
                        {PERMISSION_LABELS[perm] || perm}
                      </span>
                    ))}
                  </div>

                  {getUserPermissions(viewingUser).includes('*') && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '8px', fontSize: '0.8rem', color: '#92400e' }}>
                      This user has <strong>full access</strong> to all admin pages and all actions (view, edit, delete).
                    </div>
                  )}

                  {!viewingUser.assignedRole && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px', fontSize: '0.8rem', color: '#4b5563' }}>
                      This user has no role assigned — default <strong>view-only</strong> permissions are applied. Assign a role to give edit/delete access.
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowPermModal(false)}>Close</button>
                  <button className="btn btn-primary" onClick={() => { setShowPermModal(false); handleEditRole(viewingUser); }}>
                    <FiEdit size={16} />
                    Change Role
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersManagement;
