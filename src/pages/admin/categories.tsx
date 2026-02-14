import React, { useState, useEffect } from 'react';
import { FiFolder, FiFolderPlus, FiEdit, FiTrash2, FiPlus, FiTrendingUp, FiPackage, FiCheck, FiX } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parent?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  productCount?: number;
  children?: Category[];
}

interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  root: number;
  topCategories: {
    _id: string;
    name: string;
    productCount: number;
  }[];
}

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats>({
    total: 0,
    active: 0,
    inactive: 0,
    root: 0,
    topCategories: []
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image: '',
    parent: '',
    isActive: true,
    order: 0,
    metaTitle: '',
    metaDescription: ''
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
    fetchCategories();
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/categories/tree?includeInactive=true');
      setCategories(response.data.tree || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/categories/stats');
      const data = response.data;
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      image: '',
      parent: '',
      isActive: true,
      order: 0,
      metaTitle: '',
      metaDescription: ''
    });
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || '',
      parent: category.parent?._id || '',
      isActive: category.isActive,
      order: category.order,
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, formData);
      } else {
        await api.post('/admin/categories', formData);
      }

      await fetchCategories();
      await fetchStats();
      setShowModal(false);
    } catch (error) {
      console.error('Save category failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete(`/admin/categories/${category._id}`);

          await fetchCategories();
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

  const renderCategoryTree = (categories: Category[], level: number = 0) => {
    return categories.map((category) => (
      <div key={category._id} style={{ marginLeft: `${level * 2}rem` }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            padding: '1rem',
            background: 'white',
            border: '1px solid var(--admin-border-primary)',
            borderRadius: '8px',
            marginBottom: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--admin-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              {category.icon || <FiFolder size={20} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text-primary)', margin: 0 }}>
                  {category.name}
                </h3>
                <span className={`badge ${category.isActive ? 'green' : 'red'}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                {category.productCount !== undefined && (
                  <span className="badge purple">
                    <FiPackage size={12} style={{ marginRight: '0.25rem' }} />
                    {category.productCount} products
                  </span>
                )}
              </div>
              {category.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', margin: 0 }}>
                  {category.description}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-icon"
              title="Add Subcategory"
              onClick={() => {
                setEditingCategory(null);
                setFormData({
                  ...formData,
                  parent: category._id,
                  name: ''
                });
                setShowModal(true);
              }}
            >
              <FiFolderPlus size={16} />
            </button>
            <button
              className="btn-icon"
              title="Edit Category"
              onClick={() => handleEditCategory(category)}
            >
              <FiEdit size={16} />
            </button>
            <button
              className="btn-icon danger"
              title="Delete Category"
              onClick={() => handleDeleteCategory(category)}
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </motion.div>

        {category.children && category.children.length > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <AdminLayout title="Categories Management" requiredPermission="categories.view">
      <div className="admin-content">
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Categories Management
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Organize products with hierarchical categories
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleCreateCategory}>
              <FiPlus size={16} />
              Create Category
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Categories"
              value={stats.total.toLocaleString()}
              icon={FiFolder}
              variant="products"
              subtitle="All categories"
            />
            <StatCard
              title="Active Categories"
              value={stats.active.toLocaleString()}
              icon={FiCheck}
              variant="orders"
              subtitle="Currently active"
            />
            <StatCard
              title="Root Categories"
              value={stats.root.toLocaleString()}
              icon={FiFolderPlus}
              variant="distributors"
              subtitle="Top-level categories"
            />
            <StatCard
              title="Inactive"
              value={stats.inactive.toLocaleString()}
              icon={FiX}
              variant="users"
              subtitle="Disabled categories"
            />
          </div>
        </div>

        {/* Top Categories by Products */}
        {stats.topCategories.length > 0 && (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border-primary)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiTrendingUp />
              Top Categories by Product Count
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {stats.topCategories.slice(0, 5).map((cat, index) => (
                <div key={cat._id} style={{ padding: '1rem', background: 'var(--admin-bg-secondary)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>
                    #{index + 1}
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--admin-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FiPackage size={14} />
                    {cat.productCount} products
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Tree */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : categories.length > 0 ? (
            renderCategoryTree(categories)
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border-primary)' }}>
              <FiFolder size={48} style={{ color: 'var(--admin-text-tertiary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Categories Yet</h3>
              <p style={{ color: 'var(--admin-text-secondary)', marginBottom: '1.5rem' }}>
                Create your first category to start organizing products
              </p>
              <button className="btn btn-primary" onClick={handleCreateCategory}>
                <FiPlus size={16} />
                Create First Category
              </button>
            </div>
          )}
        </motion.div>

        {/* Category Form Modal */}
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
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body" style={{ padding: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Category Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter category name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-input"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Enter category description"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Icon (Emoji)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          placeholder="e.g., 🏗️"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Order</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Parent Category</label>
                      <select
                        className="form-select"
                        value={formData.parent}
                        onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                      >
                        <option value="">None (Root Category)</option>
                        {categories.map(cat => (
                          <React.Fragment key={cat._id}>
                            <option value={cat._id} disabled={editingCategory?._id === cat._id}>
                              {cat.name}
                            </option>
                            {cat.children?.map(child => (
                              <option key={child._id} value={child._id} disabled={editingCategory?._id === child._id}>
                                → {child.name}
                              </option>
                            ))}
                          </React.Fragment>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Image URL</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Enter image URL"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Meta Title (SEO)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="SEO meta title"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Meta Description (SEO)</label>
                      <textarea
                        className="form-input"
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        rows={2}
                        placeholder="SEO meta description"
                      />
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
                          {editingCategory ? 'Update' : 'Create'} Category
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

export default CategoriesManagement;