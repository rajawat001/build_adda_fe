import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSave,
  FiSettings,
  FiGlobe,
  FiCreditCard,
  FiTruck,
  FiPercent,
  FiMail,
  FiBell,
  FiDatabase,
  FiUpload,
  FiAlertCircle,
  FiCheckCircle,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';
import api from '../../services/api';

interface Settings {
  // General
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
  logo: string;
  favicon: string;

  // Payment
  phonepeMerchantId: string;
  phonepeSaltKey: string;
  phonepeSaltIndex: string;
  phonepeEnv: string;
  codEnabled: boolean;
  minOrderAmount: number;

  // Shipping
  defaultShippingCharge: number;
  freeShippingThreshold: number;
  shippingZones: string[];

  // Tax
  taxRate: number;
  taxCalculationMethod: 'inclusive' | 'exclusive';
  taxEnabled: boolean;

  // Email
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  emailSignature: string;

  // Notifications
  adminNotifications: boolean;
  orderNotifications: boolean;
  distributorNotifications: boolean;
  smsEnabled: boolean;
  smsApiKey: string;
  pushEnabled: boolean;

  // Advanced
  maintenanceMode: boolean;
  debugMode: boolean;
  cacheEnabled: boolean;
  apiRateLimit: number;
}

type SettingsSection =
  | 'general'
  | 'payment'
  | 'shipping'
  | 'tax'
  | 'email'
  | 'notifications'
  | 'advanced';

const AdminSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [settings, setSettings] = useState<Settings>({
    // General
    siteName: 'BuildAdda',
    siteDescription: 'Building Materials E-commerce Platform',
    contactEmail: 'contact@buildadda.com',
    contactPhone: '+91 1234567890',
    address: '123 Main Street, City, State, PIN',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    logo: '',
    favicon: '',

    // Payment
    phonepeMerchantId: '',
    phonepeSaltKey: '',
    phonepeSaltIndex: '1',
    phonepeEnv: 'sandbox',
    codEnabled: true,
    minOrderAmount: 500,

    // Shipping
    defaultShippingCharge: 50,
    freeShippingThreshold: 1000,
    shippingZones: ['Local', 'Regional', 'National'],

    // Tax
    taxRate: 18,
    taxCalculationMethod: 'exclusive',
    taxEnabled: true,

    // Email
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpFromEmail: 'noreply@buildadda.com',
    smtpFromName: 'BuildAdda',
    emailSignature: 'Best regards,\nBuildAdda Team',

    // Notifications
    adminNotifications: true,
    orderNotifications: true,
    distributorNotifications: true,
    smsEnabled: false,
    smsApiKey: '',
    pushEnabled: false,

    // Advanced
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    apiRateLimit: 100
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');

      if (response.data.success && response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await api.put('/admin/settings', settings);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Save settings error:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleBoolean = (key: keyof Settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    { id: 'general' as SettingsSection, label: 'General', icon: FiGlobe },
    { id: 'payment' as SettingsSection, label: 'Payment', icon: FiCreditCard },
    { id: 'shipping' as SettingsSection, label: 'Shipping', icon: FiTruck },
    { id: 'tax' as SettingsSection, label: 'Tax', icon: FiPercent },
    { id: 'email' as SettingsSection, label: 'Email', icon: FiMail },
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: FiBell },
    { id: 'advanced' as SettingsSection, label: 'Advanced', icon: FiDatabase }
  ];

  const renderToggleSwitch = (key: keyof Settings, label: string, description?: string) => {
    const value = settings[key] as boolean;
    const Icon = value ? FiToggleRight : FiToggleLeft;

    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div>
            <label style={{ fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.25rem', display: 'block' }}>
              {label}
            </label>
            {description && (
              <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-tertiary)' }}>
                {description}
              </span>
            )}
          </div>
          <button
            onClick={() => toggleBoolean(key)}
            style={{
              background: value ? 'var(--admin-primary-color)' : 'var(--admin-text-tertiary)',
              border: 'none',
              borderRadius: '1.5rem',
              width: '3rem',
              height: '1.5rem',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s'
            }}
          >
            <Icon
              size={20}
              style={{
                position: 'absolute',
                top: '50%',
                right: value ? '0.25rem' : 'auto',
                left: value ? 'auto' : '0.25rem',
                transform: 'translateY(-50%)',
                color: '#fff'
              }}
            />
          </button>
        </div>
      </div>
    );
  };

  const renderInputField = (key: keyof Settings, label: string, type: string = 'text', placeholder?: string) => {
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
          {label}
        </label>
        <input
          type={type}
          value={settings[key] as string | number}
          onChange={(e) => updateSetting(key, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--admin-border-primary)',
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            color: 'var(--admin-text-primary)',
            backgroundColor: 'var(--admin-bg-card)'
          }}
        />
      </div>
    );
  };

  const renderTextArea = (key: keyof Settings, label: string, rows: number = 3, placeholder?: string) => {
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
          {label}
        </label>
        <textarea
          value={settings[key] as string}
          onChange={(e) => updateSetting(key, e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--admin-border-primary)',
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            color: 'var(--admin-text-primary)',
            backgroundColor: 'var(--admin-bg-card)',
            resize: 'vertical'
          }}
        />
      </div>
    );
  };

  const renderSelectField = (key: keyof Settings, label: string, options: { value: string; label: string }[]) => {
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
          {label}
        </label>
        <select
          value={settings[key] as string}
          onChange={(e) => updateSetting(key, e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--admin-border-primary)',
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            color: 'var(--admin-text-primary)',
            backgroundColor: 'var(--admin-bg-card)',
            cursor: 'pointer'
          }}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderGeneralSettings = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>
        General Settings
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          {renderInputField('siteName', 'Site Name', 'text', 'Enter site name')}
          {renderInputField('contactEmail', 'Contact Email', 'email', 'contact@example.com')}
          {renderInputField('contactPhone', 'Contact Phone', 'tel', '+91 1234567890')}
          {renderSelectField('currency', 'Currency', [
            { value: 'INR', label: 'INR - Indian Rupee' },
            { value: 'USD', label: 'USD - US Dollar' },
            { value: 'EUR', label: 'EUR - Euro' }
          ])}
        </div>
        <div>
          {renderTextArea('siteDescription', 'Site Description', 2, 'Enter site description')}
          {renderTextArea('address', 'Address', 3, 'Enter complete address')}
          {renderSelectField('timezone', 'Timezone', [
            { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
            { value: 'America/New_York', label: 'America/New_York (EST)' },
            { value: 'Europe/London', label: 'Europe/London (GMT)' }
          ])}
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>
        Payment Settings
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
            PhonePe Configuration
          </h4>
          {renderInputField('phonepeMerchantId', 'PhonePe Merchant ID', 'text', 'PGTESTPAYUAT')}
          {renderInputField('phonepeSaltKey', 'PhonePe Salt Key', 'password', 'Enter salt key')}
          {renderInputField('phonepeSaltIndex', 'PhonePe Salt Index', 'text', '1')}
          {renderInputField('phonepeEnv', 'PhonePe Environment', 'text', 'sandbox or production')}
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
            Cash on Delivery
          </h4>
          {renderToggleSwitch('codEnabled', 'Enable Cash on Delivery', 'Allow customers to pay on delivery')}
          {renderInputField('minOrderAmount', 'Minimum Order Amount', 'number', '500')}
        </div>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>
        Shipping Settings
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          {renderInputField('defaultShippingCharge', 'Default Shipping Charge', 'number', '50')}
          {renderInputField('freeShippingThreshold', 'Free Shipping Threshold', 'number', '1000')}
        </div>
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
              Shipping Zones
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {settings.shippingZones.map((zone, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--admin-bg-secondary)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--admin-text-primary)'
                  }}
                >
                  {zone}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaxSettings = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>
        Tax Settings
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          {renderToggleSwitch('taxEnabled', 'Enable Tax', 'Apply tax to all orders')}
          {renderInputField('taxRate', 'Tax Rate (%)', 'number', '18')}
        </div>
        <div>
          {renderSelectField('taxCalculationMethod', 'Tax Calculation Method', [
            { value: 'inclusive', label: 'Inclusive (Tax included in price)' },
            { value: 'exclusive', label: 'Exclusive (Tax added to price)' }
          ])}
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>
        Email Settings
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
            SMTP Configuration
          </h4>
          {renderInputField('smtpHost', 'SMTP Host', 'text', 'smtp.gmail.com')}
          {renderInputField('smtpPort', 'SMTP Port', 'number', '587')}
          {renderInputField('smtpUser', 'SMTP Username', 'text', 'username@gmail.com')}
          {renderInputField('smtpPassword', 'SMTP Password', 'password', 'Enter password')}
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
            Sender Information
          </h4>
          {renderInputField('smtpFromEmail', 'From Email', 'email', 'noreply@buildadda.com')}
          {renderInputField('smtpFromName', 'From Name', 'text', 'BuildAdda')}
          {renderTextArea('emailSignature', 'Email Signature', 3, 'Enter email signature')}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>
        Notification Settings
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
            Admin Notifications
          </h4>
          {renderToggleSwitch('adminNotifications', 'Admin Notifications', 'Receive all admin notifications')}
          {renderToggleSwitch('orderNotifications', 'Order Notifications', 'Notify on new orders')}
          {renderToggleSwitch('distributorNotifications', 'Distributor Notifications', 'Notify on distributor actions')}
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
            SMS & Push Notifications
          </h4>
          {renderToggleSwitch('smsEnabled', 'SMS Notifications', 'Enable SMS notifications')}
          {settings.smsEnabled && renderInputField('smsApiKey', 'SMS API Key', 'text', 'Enter API key')}
          {renderToggleSwitch('pushEnabled', 'Push Notifications', 'Enable push notifications')}
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>
        Advanced Settings
      </h3>
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <FiAlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
          Warning: These settings can affect the entire system. Change with caution.
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
            System Mode
          </h4>
          {renderToggleSwitch('maintenanceMode', 'Maintenance Mode', 'Disable site for maintenance')}
          {renderToggleSwitch('debugMode', 'Debug Mode', 'Enable detailed error logging')}
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
            Performance
          </h4>
          {renderToggleSwitch('cacheEnabled', 'Cache Enabled', 'Enable response caching')}
          {renderInputField('apiRateLimit', 'API Rate Limit (requests/15min)', 'number', '100')}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'shipping':
        return renderShippingSettings();
      case 'tax':
        return renderTaxSettings();
      case 'email':
        return renderEmailSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'advanced':
        return renderAdvancedSettings();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-tertiary)' }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              background: 'var(--admin-primary-gradient)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiSettings size={24} style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0, color: 'var(--admin-text-primary)' }}>
              System Settings
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--admin-text-tertiary)', margin: 0 }}>
              Configure your platform settings
            </p>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '2rem',
              right: '2rem',
              zIndex: 1000,
              background: message.type === 'success' ? '#10b981' : '#ef4444',
              color: '#fff',
              padding: '1rem 1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            {message.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
            <span style={{ fontWeight: 500 }}>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sidebar Navigation */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <div style={{ background: 'var(--admin-bg-card)', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    marginBottom: '0.5rem',
                    background: isActive ? 'var(--admin-primary-gradient)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--admin-text-primary)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.9375rem',
                    fontWeight: isActive ? 500 : 400,
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={18} />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Save Button */}
          <motion.button
            onClick={handleSaveSettings}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.875rem',
              background: 'var(--admin-primary-gradient)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)'
            }}
          >
            <FiSave size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </motion.button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'var(--admin-bg-card)',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;