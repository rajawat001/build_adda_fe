import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/Layout';
import { Card, Loading, Button, Badge, Modal, Table } from '../../components/ui';
import { FiPlus, FiEdit2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import commissionService from '../../services/commission.service';

interface PlanFormData {
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: string;
  walletLimit: string;
  minPaymentAmount: string;
  gracePeriodDays: string;
  earlyPaymentAllowed: boolean;
}

const defaultFormData: PlanFormData = {
  name: '',
  description: '',
  type: 'percentage',
  value: '',
  walletLimit: '5000',
  minPaymentAmount: '500',
  gracePeriodDays: '3',
  earlyPaymentAllowed: true,
};

const CommissionPlansPage = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState<PlanFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await commissionService.adminGetPlans();
      setPlans(res.plans || []);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData(defaultFormData);
    setShowModal(true);
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      type: plan.type,
      value: plan.value.toString(),
      walletLimit: plan.walletLimit.toString(),
      minPaymentAmount: plan.minPaymentAmount.toString(),
      gracePeriodDays: (plan.gracePeriodDays || 3).toString(),
      earlyPaymentAllowed: plan.earlyPaymentAllowed !== false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.value || !formData.walletLimit || !formData.minPaymentAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        value: parseFloat(formData.value),
        walletLimit: parseFloat(formData.walletLimit),
        minPaymentAmount: parseFloat(formData.minPaymentAmount),
        gracePeriodDays: parseInt(formData.gracePeriodDays),
        earlyPaymentAllowed: formData.earlyPaymentAllowed,
      };

      if (editingPlan) {
        await commissionService.adminUpdatePlan(editingPlan._id, payload);
        toast.success('Plan updated');
      } else {
        await commissionService.adminCreatePlan(payload);
        toast.success('Plan created');
      }

      setShowModal(false);
      loadPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (planId: string) => {
    try {
      const res = await commissionService.adminTogglePlan(planId);
      toast.success(res.message);
      loadPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle plan');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid var(--border-primary, #e5e7eb)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    background: 'var(--bg-primary, #ffffff)',
    color: 'var(--text-primary, #1a202c)',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.813rem',
    fontWeight: 600,
    color: 'var(--text-secondary, #374151)',
    marginBottom: '0.375rem',
  };

  if (loading) return <AdminLayout title="Commission Plans"><Loading /></AdminLayout>;

  return (
    <AdminLayout title="Commission Plans" requiredPermission="subscriptions.view">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Commission Plans ({plans.length})</h2>
        <button onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          <FiPlus /> Create Plan
        </button>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary, #f9fafb)', borderBottom: '1px solid #e5e7eb' }}>
                {['Name', 'Type', 'Value', 'Wallet Limit', 'Min Payment', 'Grace Days', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map((plan: any) => (
                <tr key={plan._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{plan.name}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Badge variant={plan.type === 'percentage' ? 'info' : 'warning'}>{plan.type}</Badge>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>
                    {plan.type === 'percentage' ? `${plan.value}%` : `₹${plan.value}`}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>₹{plan.walletLimit?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>₹{plan.minPaymentAmount?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>{plan.gracePeriodDays} days</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Badge variant={plan.isActive ? 'success' : 'error'}>{plan.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(plan)} title="Edit" style={{ padding: '0.375rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', color: '#6b7280' }}>
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleToggle(plan._id)} title="Toggle" style={{ padding: '0.375rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', color: plan.isActive ? '#10b981' : '#6b7280' }}>
                        {plan.isActive ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No commission plans yet. Create one to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={showModal} title={editingPlan ? 'Edit Commission Plan' : 'Create Commission Plan'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Plan Name *</label>
              <input style={inputStyle} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Standard 10%" />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Short description of this plan" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Commission Type *</label>
                <select style={inputStyle} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{formData.type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'} *</label>
                <input type="number" style={inputStyle} value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder={formData.type === 'percentage' ? 'e.g., 10' : 'e.g., 50'} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Wallet Limit (₹) *</label>
                <input type="number" style={inputStyle} value={formData.walletLimit} onChange={(e) => setFormData({ ...formData, walletLimit: e.target.value })} placeholder="e.g., 5000" />
              </div>
              <div>
                <label style={labelStyle}>Min Payment (₹) *</label>
                <input type="number" style={inputStyle} value={formData.minPaymentAmount} onChange={(e) => setFormData({ ...formData, minPaymentAmount: e.target.value })} placeholder="e.g., 500" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Grace Period (days)</label>
                <input type="number" style={inputStyle} value={formData.gracePeriodDays} onChange={(e) => setFormData({ ...formData, gracePeriodDays: e.target.value })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.earlyPaymentAllowed} onChange={(e) => setFormData({ ...formData, earlyPaymentAllowed: e.target.checked })} />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>Allow early payment</span>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '0.625rem 1.25rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </div>
        </Modal>
    </AdminLayout>
  );
};

export default CommissionPlansPage;
