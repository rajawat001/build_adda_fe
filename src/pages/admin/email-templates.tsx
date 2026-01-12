import React, { useState, useEffect } from 'react';
import { FiMail, FiPlus, FiEdit, FiTrash2, FiEye, FiSend, FiCheck, FiX, FiCode } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface EmailTemplate {
  _id: string;
  name: string;
  slug: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
}

interface EmailTemplateStats {
  total: number;
  active: number;
  inactive: number;
}

const SAMPLE_DATA: Record<string, any> = {
  userName: 'John Doe',
  userEmail: 'john@example.com',
  orderNumber: 'ORD-2024-001',
  orderDate: new Date().toLocaleDateString(),
  orderAmount: '₹15,000',
  distributorName: 'ABC Building Materials',
  productName: 'Premium Cement',
  quantity: '50 bags',
  trackingNumber: 'TRK123456789'
};

const EmailTemplatesManagement: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<EmailTemplateStats>({
    total: 0,
    active: 0,
    inactive: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subject: '',
    body: '',
    variables: [] as string[],
    isActive: true
  });
  const [testEmail, setTestEmail] = useState('');
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
    fetchTemplates();
    fetchStats();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/email-templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/email-templates/stats');
      const data = response.data;
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      slug: '',
      subject: '',
      body: '',
      variables: [],
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      slug: template.slug,
      subject: template.subject,
      body: template.body,
      variables: template.variables,
      isActive: template.isActive
    });
    setShowModal(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingTemplate) {
        await api.put(`/admin/email-templates/${editingTemplate._id}`, formData);
      } else {
        await api.post('/admin/email-templates', formData);
      }

      await fetchTemplates();
      await fetchStats();
      setShowModal(false);
    } catch (error) {
      console.error('Save template failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTemplate = (template: EmailTemplate) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Email Template',
      message: `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete(`/admin/email-templates/${template._id}`);

          await fetchTemplates();
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

  const handleSendTestEmail = async (template: EmailTemplate) => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/admin/email-templates/${template._id}/test`, {
        email: testEmail
      });

      alert('Test email sent successfully!');
      setTestEmail('');
    } catch (error) {
      console.error('Send test email failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      body: prev.body + `{{${variable}}}`
    }));
  };

  const renderPreview = (template: EmailTemplate) => {
    let rendered = template.body;

    // Replace variables with sample data
    template.variables.forEach(variable => {
      const value = SAMPLE_DATA[variable] || `[${variable}]`;
      rendered = rendered.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    return rendered;
  };

  const TemplateFormModal = () => (
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
            style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {editingTemplate ? 'Edit Email Template' : 'Create Email Template'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Template Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Order Confirmation"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Slug *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    required
                    placeholder="e.g., order-confirmation"
                    style={{ fontFamily: 'monospace' }}
                  />
                  <small style={{ color: 'var(--admin-text-secondary)', fontSize: '0.75rem' }}>
                    Unique identifier for this template
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    placeholder="e.g., Your Order #{{orderNumber}} is Confirmed"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Body *</label>
                  <textarea
                    className="form-input"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={12}
                    required
                    placeholder="Enter your email HTML here..."
                    style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                  />
                  <small style={{ color: 'var(--admin-text-secondary)', fontSize: '0.75rem' }}>
                    Use HTML for formatting. Variables: {'{{variableName}}'}
                  </small>
                </div>

                {/* Common Variables */}
                <div className="form-group">
                  <label className="form-label">Insert Variable</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['userName', 'userEmail', 'orderNumber', 'orderDate', 'orderAmount', 'distributorName', 'productName', 'trackingNumber'].map(variable => (
                      <button
                        key={variable}
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => insertVariable(variable)}
                      >
                        <FiCode size={14} />
                        {variable}
                      </button>
                    ))}
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
                      {editingTemplate ? 'Update' : 'Create'} Template
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

  const PreviewModal = () => (
    <AnimatePresence>
      {showPreviewModal && previewTemplate && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
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
              <h2 className="modal-title">Preview: {previewTemplate.name}</h2>
              <button className="modal-close" onClick={() => setShowPreviewModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              {/* Subject Preview */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' }}>
                  SUBJECT:
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--admin-bg-secondary)', borderRadius: '6px', fontWeight: 500 }}>
                  {previewTemplate.subject.replace(/{{(\w+)}}/g, (match, variable) => SAMPLE_DATA[variable] || match)}
                </div>
              </div>

              {/* Body Preview */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' }}>
                  EMAIL BODY:
                </div>
                <div
                  style={{
                    padding: '1.5rem',
                    background: 'white',
                    border: '1px solid var(--admin-border-primary)',
                    borderRadius: '8px',
                    minHeight: '200px'
                  }}
                  dangerouslySetInnerHTML={{ __html: renderPreview(previewTemplate) }}
                />
              </div>

              {/* Test Email */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' }}>
                  SEND TEST EMAIL:
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="email"
                    className="form-input"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email address"
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSendTestEmail(previewTemplate)}
                    disabled={actionLoading || !testEmail}
                  >
                    <FiSend size={16} />
                    Send Test
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <AdminLayout title="Email Templates">
      <div className="admin-content">
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Email Templates
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Manage automated email notifications
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleCreateTemplate}>
              <FiPlus size={16} />
              Create Template
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <StatCard
              title="Total Templates"
              value={stats.total.toLocaleString()}
              icon={FiMail}
              variant="products"
              subtitle="All templates"
            />
            <StatCard
              title="Active"
              value={stats.active.toLocaleString()}
              icon={FiCheck}
              variant="orders"
              subtitle="Currently active"
            />
            <StatCard
              title="Inactive"
              value={stats.inactive.toLocaleString()}
              icon={FiX}
              variant="users"
              subtitle="Disabled templates"
            />
          </div>
        </div>

        {/* Templates List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : templates.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {templates.map((template) => (
                <div
                  key={template._id}
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
                        background: 'var(--admin-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <FiMail size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', margin: 0 }}>
                          {template.name}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', margin: '0.25rem 0 0 0', fontFamily: 'monospace' }}>
                          {template.slug}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>
                        <strong>Subject:</strong> {template.subject}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${template.isActive ? 'green' : 'red'}`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {template.variables.length > 0 && (
                        <span className="badge purple">
                          {template.variables.length} variables
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-icon"
                      title="Preview"
                      onClick={() => handlePreview(template)}
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      title="Edit Template"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      title="Delete Template"
                      onClick={() => handleDeleteTemplate(template)}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border-primary)' }}>
              <FiMail size={48} style={{ color: 'var(--admin-text-tertiary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Templates Yet</h3>
              <p style={{ color: 'var(--admin-text-secondary)', marginBottom: '1.5rem' }}>
                Create your first email template to automate notifications
              </p>
              <button className="btn btn-primary" onClick={handleCreateTemplate}>
                <FiPlus size={16} />
                Create First Template
              </button>
            </div>
          )}
        </motion.div>

        {/* Template Form Modal */}
        <TemplateFormModal />

        {/* Preview Modal */}
        <PreviewModal />

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

export default EmailTemplatesManagement;