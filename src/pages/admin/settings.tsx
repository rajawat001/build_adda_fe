import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
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
  FiDownload,
  FiAlertCircle,
  FiCheckCircle,
  FiToggleLeft,
  FiToggleRight,
  FiFileText,
  FiBriefcase,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiArrowLeft
} from 'react-icons/fi';
import api from '../../services/api';

interface GSTSettings {
  enabled: boolean;
  gstin: string;
  pan: string;
  legalName: string;
  tradeName: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  subscriptionSacCode: string;
  invoicePrefix: string;
  stateCode: string;
}

interface CompanySettings {
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  bankBranch: string;
}

interface ServiceArea {
  state: string;
  cities: string[];
}

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

  // GST
  gst: GSTSettings;

  // Company
  company: CompanySettings;

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

  // Service Areas
  serviceAreas: ServiceArea[];
}

type SettingsSection =
  | 'general'
  | 'payment'
  | 'shipping'
  | 'tax'
  | 'gst'
  | 'company'
  | 'email'
  | 'notifications'
  | 'advanced'
  | 'serviceAreas';

const AdminSettings: React.FC = () => {
  const router = useRouter();
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

    // GST
    gst: {
      enabled: true,
      gstin: '',
      pan: '',
      legalName: 'BuildAdda',
      tradeName: 'BuildAdda',
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
      subscriptionSacCode: '998361',
      invoicePrefix: 'BA',
      stateCode: '24'
    },

    // Company
    company: {
      name: 'BuildAdda',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      phone: '',
      email: '',
      website: '',
      bankName: '',
      bankAccount: '',
      bankIfsc: '',
      bankBranch: ''
    },

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
    apiRateLimit: 100,

    // Service Areas
    serviceAreas: [{ state: 'Rajasthan', cities: ['Jaipur'] }]
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
        setSettings(prev => ({
          ...prev,
          ...response.data.settings,
          gst: { ...prev.gst, ...(response.data.settings.gst || {}) },
          company: { ...prev.company, ...(response.data.settings.company || {}) },
          serviceAreas: response.data.settings.serviceAreas || prev.serviceAreas
        }));
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

  const updateNestedSetting = (parent: 'gst' | 'company', key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
  };

  const toggleBoolean = (key: keyof Settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNestedBoolean = (parent: 'gst' | 'company', key: string) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: !(prev[parent] as any)[key]
      }
    }));
  };

  // Service Areas local state
  const [newStateName, setNewStateName] = useState('');
  const [newCityNames, setNewCityNames] = useState<{ [stateIndex: number]: string }>({});

  const addState = () => {
    const trimmed = newStateName.trim();
    if (!trimmed) return;
    if (settings.serviceAreas.some(a => a.state.toLowerCase() === trimmed.toLowerCase())) return;
    setSettings(prev => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, { state: trimmed, cities: [] }]
    }));
    setNewStateName('');
  };

  const removeState = (index: number) => {
    setSettings(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((_, i) => i !== index)
    }));
  };

  const addCity = (stateIndex: number) => {
    const cityName = (newCityNames[stateIndex] || '').trim();
    if (!cityName) return;
    const area = settings.serviceAreas[stateIndex];
    if (area.cities.some(c => c.toLowerCase() === cityName.toLowerCase())) return;
    setSettings(prev => {
      const updated = [...prev.serviceAreas];
      updated[stateIndex] = { ...updated[stateIndex], cities: [...updated[stateIndex].cities, cityName] };
      return { ...prev, serviceAreas: updated };
    });
    setNewCityNames(prev => ({ ...prev, [stateIndex]: '' }));
  };

  const removeCity = (stateIndex: number, cityIndex: number) => {
    setSettings(prev => {
      const updated = [...prev.serviceAreas];
      updated[stateIndex] = { ...updated[stateIndex], cities: updated[stateIndex].cities.filter((_, i) => i !== cityIndex) };
      return { ...prev, serviceAreas: updated };
    });
  };

  const sections = [
    { id: 'general' as SettingsSection, label: 'General', icon: FiGlobe },
    { id: 'payment' as SettingsSection, label: 'Payment', icon: FiCreditCard },
    { id: 'shipping' as SettingsSection, label: 'Shipping', icon: FiTruck },
    { id: 'tax' as SettingsSection, label: 'Tax', icon: FiPercent },
    { id: 'gst' as SettingsSection, label: 'GST', icon: FiFileText },
    { id: 'company' as SettingsSection, label: 'Company', icon: FiBriefcase },
    { id: 'email' as SettingsSection, label: 'Email', icon: FiMail },
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: FiBell },
    { id: 'advanced' as SettingsSection, label: 'Advanced', icon: FiDatabase },
    { id: 'serviceAreas' as SettingsSection, label: 'Service Areas', icon: FiMapPin }
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

  const renderNestedToggleSwitch = (parent: 'gst' | 'company', key: string, label: string, description?: string) => {
    const value = (settings[parent] as any)[key] as boolean;
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
            onClick={() => toggleNestedBoolean(parent, key)}
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

  const renderNestedInputField = (parent: 'gst' | 'company', key: string, label: string, type: string = 'text', placeholder?: string) => {
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
          {label}
        </label>
        <input
          type={type}
          value={(settings[parent] as any)[key] as string | number}
          onChange={(e) => updateNestedSetting(parent, key, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
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

  const renderGSTSettings = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>
        GST Configuration
      </h3>
      <div style={{ marginBottom: '1.5rem' }}>
        {renderNestedToggleSwitch('gst', 'enabled', 'Enable GST', 'Apply GST to invoices and orders')}
      </div>
      {settings.gst.enabled && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
              Registration Details
            </h4>
            {renderNestedInputField('gst', 'gstin', 'GSTIN', 'text', 'e.g. 24AAAAA0000A1Z5')}
            {renderNestedInputField('gst', 'pan', 'PAN', 'text', 'e.g. AAAAA0000A')}
            {renderNestedInputField('gst', 'legalName', 'Legal Name', 'text', 'Legal entity name')}
            {renderNestedInputField('gst', 'tradeName', 'Trade Name', 'text', 'Business trade name')}
            {renderNestedInputField('gst', 'stateCode', 'State Code', 'text', 'e.g. 24 for Gujarat')}
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
              Tax Rates & Invoice
            </h4>
            {renderNestedInputField('gst', 'cgstRate', 'CGST Rate (%)', 'number', '9')}
            {renderNestedInputField('gst', 'sgstRate', 'SGST Rate (%)', 'number', '9')}
            {renderNestedInputField('gst', 'igstRate', 'IGST Rate (%)', 'number', '18')}
            {renderNestedInputField('gst', 'subscriptionSacCode', 'Subscription SAC Code', 'text', '998361')}
            {renderNestedInputField('gst', 'invoicePrefix', 'Invoice Prefix', 'text', 'BA')}
          </div>
        </div>
      )}
    </div>
  );

  const renderCompanySettings = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>
        Company Details
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-tertiary)', marginBottom: '1.5rem' }}>
        These details are used in invoices, receipts, and legal documents.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
            Business Information
          </h4>
          {renderNestedInputField('company', 'name', 'Company Name', 'text', 'Your company name')}
          {renderNestedInputField('company', 'street', 'Street Address', 'text', 'Street address')}
          {renderNestedInputField('company', 'city', 'City', 'text', 'City')}
          {renderNestedInputField('company', 'state', 'State', 'text', 'State')}
          {renderNestedInputField('company', 'pincode', 'Pincode', 'text', 'Pincode')}
          {renderNestedInputField('company', 'country', 'Country', 'text', 'Country')}
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', color: 'var(--admin-text-secondary)' }}>
            Contact & Banking
          </h4>
          {renderNestedInputField('company', 'phone', 'Phone', 'tel', '+91 XXXXXXXXXX')}
          {renderNestedInputField('company', 'email', 'Email', 'email', 'company@example.com')}
          {renderNestedInputField('company', 'website', 'Website', 'url', 'https://www.example.com')}
          {renderNestedInputField('company', 'bankName', 'Bank Name', 'text', 'Bank name')}
          {renderNestedInputField('company', 'bankAccount', 'Bank Account Number', 'text', 'Account number')}
          {renderNestedInputField('company', 'bankIfsc', 'Bank IFSC Code', 'text', 'IFSC code')}
          {renderNestedInputField('company', 'bankBranch', 'Bank Branch', 'text', 'Branch name')}
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

  const renderServiceAreasSettings = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--admin-text-primary)' }}>
        Service Areas
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-tertiary)', marginBottom: '1.5rem' }}>
        Manage delivery states and cities. These will appear as dropdown options in the checkout page.
      </p>

      {settings.serviceAreas.map((area, stateIndex) => (
        <div
          key={stateIndex}
          style={{
            border: '1px solid var(--admin-border-primary)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1rem',
            background: 'var(--admin-bg-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text-primary)', margin: 0 }}>
              {area.state}
            </h4>
            <button
              onClick={() => removeState(stateIndex)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 500
              }}
            >
              <FiTrash2 size={14} />
              Remove State
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {area.cities.map((city, cityIndex) => (
              <span
                key={cityIndex}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  background: 'var(--admin-bg-card)',
                  border: '1px solid var(--admin-border-primary)',
                  borderRadius: '2rem',
                  fontSize: '0.875rem',
                  color: 'var(--admin-text-primary)'
                }}
              >
                {city}
                <button
                  onClick={() => removeCity(stateIndex, cityIndex)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--admin-text-tertiary)'
                  }}
                  title="Remove city"
                >
                  &times;
                </button>
              </span>
            ))}
            {area.cities.length === 0 && (
              <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-tertiary)', fontStyle: 'italic' }}>
                No cities added yet
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              value={newCityNames[stateIndex] || ''}
              onChange={(e) => setNewCityNames(prev => ({ ...prev, [stateIndex]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCity(stateIndex); } }}
              placeholder="Add a city..."
              style={{
                flex: 1,
                minWidth: 0,
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                color: '#374151',
                backgroundColor: '#fff'
              }}
            />
            <button
              onClick={() => addCity(stateIndex)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 0.75rem',
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <FiPlus size={14} />
              Add City
            </button>
          </div>
        </div>
      ))}

      <div style={{
        border: '2px dashed #d1d5db',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        marginTop: '1rem'
      }}>
        <label style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
          Add New State
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            value={newStateName}
            onChange={(e) => setNewStateName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addState(); } }}
            placeholder="Enter state name..."
            style={{
              flex: 1,
              minWidth: 0,
              padding: '0.625rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.9375rem',
              color: '#374151',
              backgroundColor: '#fff'
            }}
          />
          <button
            onClick={addState}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.625rem 1rem',
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <FiPlus size={16} />
            Add State
          </button>
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
      case 'gst':
        return renderGSTSettings();
      case 'company':
        return renderCompanySettings();
      case 'email':
        return renderEmailSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'advanced':
        return renderAdvancedSettings();
      case 'serviceAreas':
        return renderServiceAreasSettings();
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          <button
            onClick={() => router.push('/admin/import-export')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              border: '1px solid var(--admin-border-primary)',
              borderRadius: '0.5rem',
              background: 'var(--admin-bg-card)',
              color: 'var(--admin-text-primary)',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--admin-primary-color)';
              e.currentTarget.style.color = 'var(--admin-primary-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--admin-border-primary)';
              e.currentTarget.style.color = 'var(--admin-text-primary)';
            }}
          >
            <FiUpload size={16} />
            <FiDownload size={16} />
            Import / Export
          </button>
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
        <div style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '1rem', alignSelf: 'flex-start' }}>
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              marginBottom: '0.5rem',
              background: '#fff',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              width: '100%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.color = '#6366f1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.color = '#374151';
            }}
          >
            <FiArrowLeft size={16} />
            Back
          </button>

          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    marginBottom: '2px',
                    background: isActive ? '#4f46e5' : 'transparent',
                    color: isActive ? '#fff' : '#374151',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.15s',
                    textAlign: 'left',
                    boxShadow: isActive ? '0 2px 6px rgba(79, 70, 229, 0.4)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={16} />
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
              marginTop: '0.5rem',
              padding: '0.625rem',
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
            }}
          >
            <FiSave size={16} />
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
