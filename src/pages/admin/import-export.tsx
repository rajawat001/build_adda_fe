import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  FiArrowLeft,
  FiDownload,
  FiUpload,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiStar,
  FiFileText,
  FiDollarSign,
  FiSettings,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiDatabase
} from 'react-icons/fi';
import api from '../../services/api';

interface CollectionStats {
  users: number;
  distributors: number;
  products: number;
  orders: number;
  reviews: number;
  invoices: number;
  transactions: number;
  settings: number;
}

interface DataSection {
  key: keyof CollectionStats;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const dataSections: DataSection[] = [
  { key: 'users', label: 'Users', icon: FiUsers, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  { key: 'distributors', label: 'Distributors', icon: FiTruck, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
  { key: 'products', label: 'Products', icon: FiPackage, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  { key: 'orders', label: 'Orders', icon: FiShoppingCart, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  { key: 'reviews', label: 'Reviews & Ratings', icon: FiStar, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  { key: 'invoices', label: 'Invoices', icon: FiFileText, color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' },
  { key: 'transactions', label: 'Transactions', icon: FiDollarSign, color: '#84cc16', bgColor: 'rgba(132, 204, 22, 0.1)' },
  { key: 'settings', label: 'Settings / Config', icon: FiSettings, color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' }
];

const ImportExportPage: React.FC = () => {
  const router = useRouter();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const importAllRef = useRef<HTMLInputElement | null>(null);
  const [stats, setStats] = useState<CollectionStats>({
    users: 0,
    distributors: 0,
    products: 0,
    orders: 0,
    reviews: 0,
    invoices: 0,
    transactions: 0,
    settings: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [exportingAll, setExportingAll] = useState(false);
  const [importingAll, setImportingAll] = useState(false);
  const [exportingItem, setExportingItem] = useState<string | null>(null);
  const [importingItem, setImportingItem] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await api.get('/admin/export/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // ─── Export Handlers ───

  const handleExportCSV = async (collection: string) => {
    try {
      setExportingItem(collection + '-csv');
      const response = await api.get(`/admin/export/${collection}?format=csv`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showMessage('success', `${collection} exported as CSV successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      showMessage('error', `Failed to export ${collection}`);
    } finally {
      setExportingItem(null);
    }
  };

  const handleExportJSON = async (collection: string) => {
    try {
      setExportingItem(collection + '-json');
      const response = await api.get(`/admin/export/${collection}?format=json`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showMessage('success', `${collection} exported as JSON successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      showMessage('error', `Failed to export ${collection}`);
    } finally {
      setExportingItem(null);
    }
  };

  const handleExportAll = async () => {
    try {
      setExportingAll(true);
      const response = await api.get('/admin/export/all', {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buildadda_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showMessage('success', 'All data exported successfully');
    } catch (error) {
      console.error('Export all failed:', error);
      showMessage('error', 'Failed to export all data');
    } finally {
      setExportingAll(false);
    }
  };

  // ─── Import Handlers ───

  const handleImportCSV = async (collection: string, file: File) => {
    try {
      setImportingItem(collection);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/admin/import/${collection}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const { imported = 0, updated = 0, errors = 0 } = response.data;
        showMessage('success', `${collection} imported: ${imported} new, ${updated} updated${errors ? `, ${errors} errors` : ''}`);
        fetchStats();
      }
    } catch (error: any) {
      console.error('Import failed:', error);
      showMessage('error', error.response?.data?.message || `Failed to import ${collection}`);
    } finally {
      setImportingItem(null);
    }
  };

  const handleImportAll = async (file: File) => {
    try {
      setImportingAll(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/admin/import/all', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const { totalImported = 0, totalUpdated = 0, totalErrors = 0 } = response.data.summary || {};
        showMessage('success', `Full import done: ${totalImported} new, ${totalUpdated} updated${totalErrors ? `, ${totalErrors} errors` : ''}`);
        fetchStats();
      }
    } catch (error: any) {
      console.error('Import all failed:', error);
      showMessage('error', error.response?.data?.message || 'Failed to import all data');
    } finally {
      setImportingAll(false);
    }
  };

  const triggerFileInput = (collection: string) => {
    fileInputRefs.current[collection]?.click();
  };

  // ─── Export Card ───

  const renderExportCard = (section: DataSection) => {
    const Icon = section.icon;
    const count = stats[section.key];
    const isExportingCSV = exportingItem === section.key + '-csv';
    const isExportingJSON = exportingItem === section.key + '-json';
    const isBusy = isExportingCSV || isExportingJSON;

    return (
      <motion.div
        key={section.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--admin-bg-card)',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid var(--admin-border-primary)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              background: section.bgColor,
              borderRadius: '0.625rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={20} style={{ color: section.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--admin-text-primary)' }}>
              {section.label}
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--admin-text-tertiary)' }}>
              {loadingStats ? '...' : `${count.toLocaleString()} records`}
            </span>
          </div>
          <FiDownload size={16} style={{ color: 'var(--admin-text-tertiary)' }} />
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleExportCSV(section.key)}
            disabled={isBusy}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '0.625rem 0.75rem',
              border: 'none',
              borderRadius: '0.375rem',
              background: section.color,
              color: '#fff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: isBusy ? 'not-allowed' : 'pointer',
              opacity: isBusy ? 0.6 : 1,
              transition: 'all 0.2s',
              boxShadow: `0 2px 4px ${section.color}40`
            }}
          >
            {isExportingCSV ? <FiLoader size={14} className="spin" /> : <FiDownload size={14} />}
            Export CSV
          </button>
          <button
            onClick={() => handleExportJSON(section.key)}
            disabled={isBusy}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '0.625rem 0.75rem',
              border: `2px solid ${section.color}`,
              borderRadius: '0.375rem',
              background: 'transparent',
              color: section.color,
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: isBusy ? 'not-allowed' : 'pointer',
              opacity: isBusy ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isExportingJSON ? <FiLoader size={14} className="spin" /> : <FiDownload size={14} />}
            Export JSON
          </button>
        </div>
      </motion.div>
    );
  };

  // ─── Import Card ───

  const renderImportCard = (section: DataSection) => {
    const Icon = section.icon;
    const count = stats[section.key];
    const isImporting = importingItem === section.key;

    return (
      <motion.div
        key={section.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--admin-bg-card)',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid var(--admin-border-primary)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              background: section.bgColor,
              borderRadius: '0.625rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={20} style={{ color: section.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--admin-text-primary)' }}>
              {section.label}
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--admin-text-tertiary)' }}>
              {loadingStats ? '...' : `${count.toLocaleString()} records`}
            </span>
          </div>
          <FiUpload size={16} style={{ color: 'var(--admin-text-tertiary)' }} />
        </div>

        {/* Import Button */}
        <button
          onClick={() => triggerFileInput(section.key)}
          disabled={isImporting}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            padding: '0.625rem 0.75rem',
            border: `1px dashed ${section.color}`,
            borderRadius: '0.375rem',
            background: section.bgColor,
            color: section.color,
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: isImporting ? 'not-allowed' : 'pointer',
            opacity: isImporting ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
        >
          {isImporting ? <FiLoader size={14} className="spin" /> : <FiUpload size={14} />}
          {isImporting ? 'Importing...' : 'Import CSV'}
        </button>
        <input
          ref={(el) => { fileInputRefs.current[section.key] = el; }}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImportCSV(section.key, file);
              e.target.value = '';
            }
          }}
        />
      </motion.div>
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
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
              gap: '0.75rem',
              maxWidth: '500px'
            }}
          >
            {message.type === 'success' ? <FiCheckCircle size={20} style={{ flexShrink: 0 }} /> : <FiAlertCircle size={20} style={{ flexShrink: 0 }} />}
            <span style={{ fontWeight: 500 }}>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.push('/admin/settings')}
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--admin-border-primary)',
                background: 'var(--admin-bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--admin-text-primary)',
                transition: 'all 0.2s'
              }}
            >
              <FiArrowLeft size={20} />
            </button>
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
              <FiDatabase size={24} style={{ color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0, color: 'var(--admin-text-primary)' }}>
                Import / Export Data
              </h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--admin-text-tertiary)', margin: 0 }}>
                Backup, restore, or migrate your platform data
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {/* Import All Button */}
            <button
              onClick={() => importAllRef.current?.click()}
              disabled={importingAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                border: '1px solid var(--admin-border-primary)',
                borderRadius: '0.5rem',
                background: 'var(--admin-bg-card)',
                color: 'var(--admin-text-primary)',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: importingAll ? 'not-allowed' : 'pointer',
                opacity: importingAll ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {importingAll ? (
                <>
                  <FiLoader size={18} className="spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FiUpload size={18} />
                  Import All Data
                </>
              )}
            </button>
            <input
              ref={importAllRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImportAll(file);
                  e.target.value = '';
                }
              }}
            />

            {/* Export All Button */}
            <button
              onClick={handleExportAll}
              disabled={exportingAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                cursor: exportingAll ? 'not-allowed' : 'pointer',
                opacity: exportingAll ? 0.7 : 1,
                boxShadow: '0 4px 8px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              {exportingAll ? (
                <>
                  <FiLoader size={18} className="spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FiDownload size={18} />
                  Export All Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Export Section ─── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <FiDownload size={20} style={{ color: 'var(--admin-text-secondary)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--admin-text-primary)' }}>
            Export Data
          </h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--admin-text-tertiary)' }}>
            Download your data as CSV or JSON
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {dataSections.map((section) => renderExportCard(section))}
        </div>
      </div>

      {/* ─── Import Section ─── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <FiUpload size={20} style={{ color: 'var(--admin-text-secondary)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--admin-text-primary)' }}>
            Import Data
          </h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--admin-text-tertiary)' }}>
            Upload CSV files to restore or add data
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {dataSections.map((section) => renderImportCard(section))}
        </div>
      </div>

      {/* Spinner animation */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ImportExportPage;
