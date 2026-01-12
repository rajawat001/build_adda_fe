import React, { useState, useEffect } from 'react';
import { FiActivity, FiUser, FiClock, FiFilter, FiDownload, FiEdit, FiTrash2, FiPlus, FiCheckCircle, FiX } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import FilterPanel, { FilterOption } from '../../components/admin/FilterPanel';
import ExportButton from '../../components/admin/ExportButton';
import { motion } from 'framer-motion';
import api from '../../services/api';

interface ActivityLog {
  _id: string;
  admin: {
    _id: string;
    name: string;
    email: string;
  };
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'bulk_action';
  entity: 'user' | 'distributor' | 'product' | 'order' | 'coupon' | 'category' | 'role';
  entityId: string;
  changes?: {
    before?: any;
    after?: any;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  description?: string;
}

interface ActivityStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [currentPage, filters, searchTerm]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
        search: searchTerm,
        ...filters
      };

      const response = await api.get('/admin/activity-logs', { params });
      
      setLogs(response.data.logs || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/activity-logs/stats');
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const params: Record<string, any> = {
        format,
        search: searchTerm,
        ...filters
      };

      const response = await api.get('/admin/activity-logs/export', {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, JSX.Element> = {
      create: <FiPlus size={16} style={{ color: 'var(--admin-success)' }} />,
      update: <FiEdit size={16} style={{ color: 'var(--admin-primary)' }} />,
      delete: <FiTrash2 size={16} style={{ color: 'var(--admin-error)' }} />,
      approve: <FiCheckCircle size={16} style={{ color: 'var(--admin-success)' }} />,
      reject: <FiX size={16} style={{ color: 'var(--admin-error)' }} />,
      bulk_action: <FiActivity size={16} style={{ color: 'var(--admin-warning)' }} />
    };
    return icons[action] || <FiActivity size={16} />;
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      create: 'green',
      update: 'blue',
      delete: 'red',
      approve: 'green',
      reject: 'red',
      bulk_action: 'orange'
    };
    return (
      <span className={`badge ${colors[action] || 'purple'}`}>
        {action.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getEntityBadge = (entity: string) => {
    return (
      <span className="badge purple" style={{ textTransform: 'capitalize' }}>
        {entity}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterOptions: FilterOption[] = [
    {
      key: 'action',
      label: 'Action Type',
      type: 'select',
      options: [
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'delete', label: 'Delete' },
        { value: 'approve', label: 'Approve' },
        { value: 'reject', label: 'Reject' },
        { value: 'bulk_action', label: 'Bulk Action' }
      ]
    },
    {
      key: 'entity',
      label: 'Entity Type',
      type: 'select',
      options: [
        { value: 'user', label: 'User' },
        { value: 'distributor', label: 'Distributor' },
        { value: 'product', label: 'Product' },
        { value: 'order', label: 'Order' },
        { value: 'coupon', label: 'Coupon' },
        { value: 'category', label: 'Category' },
        { value: 'role', label: 'Role' }
      ]
    },
    {
      key: 'date',
      label: 'Date Range',
      type: 'daterange'
    }
  ];

  return (
    <AdminLayout title="Activity Logs" >
      <div className="admin-content">
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Activity Logs
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Track all administrative actions and changes
              </p>
            </div>
            <ExportButton onExport={handleExport} label="Export Logs" />
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Today"
              value={stats.today.toLocaleString()}
              icon={FiActivity}
              variant="orders"
              subtitle="Actions today"
            />
            <StatCard
              title="This Week"
              value={stats.thisWeek.toLocaleString()}
              icon={FiClock}
              variant="products"
              subtitle="Last 7 days"
            />
            <StatCard
              title="This Month"
              value={stats.thisMonth.toLocaleString()}
              icon={FiUser}
              variant="distributors"
              subtitle="Last 30 days"
            />
            <StatCard
              title="Total Logs"
              value={stats.total.toLocaleString()}
              icon={FiActivity}
              variant="users"
              subtitle="All time"
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

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: '2rem' }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : logs.length > 0 ? (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border-primary)', padding: '2rem' }}>
              {/* Timeline */}
              <div style={{ position: 'relative', paddingLeft: '3rem' }}>
                {/* Timeline Line */}
                <div style={{
                  position: 'absolute',
                  left: '1.5rem',
                  top: '1rem',
                  bottom: '1rem',
                  width: '2px',
                  background: 'var(--admin-border-primary)'
                }} />

                {logs.map((log, index) => (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      position: 'relative',
                      marginBottom: '2rem',
                      paddingBottom: '1rem',
                      borderBottom: index < logs.length - 1 ? '1px solid var(--admin-border-primary)' : 'none'
                    }}
                  >
                    {/* Timeline Dot */}
                    <div style={{
                      position: 'absolute',
                      left: '-2.25rem',
                      top: '0.25rem',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'white',
                      border: '2px solid var(--admin-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}>
                      {getActionIcon(log.action)}
                    </div>

                    {/* Content */}
                    <div>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {getActionBadge(log.action)}
                          {getEntityBadge(log.entity)}
                          <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                            by <strong>{log.admin.name}</strong>
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                          <FiClock size={14} />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </div>

                      {/* Description */}
                      {log.description && (
                        <p style={{ margin: '0.5rem 0', color: 'var(--admin-text-primary)', fontSize: '0.9375rem' }}>
                          {log.description}
                        </p>
                      )}

                      {/* Details */}
                      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                        {log.entityId && (
                          <div>
                            <strong>ID:</strong> <code style={{ background: 'var(--admin-bg-secondary)', padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.75rem' }}>{log.entityId.substring(0, 8)}...</code>
                          </div>
                        )}
                        {log.ipAddress && (
                          <div>
                            <strong>IP:</strong> {log.ipAddress}
                          </div>
                        )}
                      </div>

                      {/* Changes */}
                      {log.changes && (Object.keys(log.changes.before || {}).length > 0 || Object.keys(log.changes.after || {}).length > 0) && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ marginTop: '0.75rem' }}
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetailsModal(true);
                          }}
                        >
                          View Changes
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--admin-border-primary)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border-primary)' }}>
              <FiActivity size={48} style={{ color: 'var(--admin-text-tertiary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Activity Logs</h3>
              <p style={{ color: 'var(--admin-text-secondary)' }}>
                No administrative actions have been logged yet
              </p>
            </div>
          )}
        </motion.div>

        {/* Details Modal */}
        {showDetailsModal && selectedLog && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
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
                <h2 className="modal-title">Activity Details</h2>
                <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                  <FiX size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ padding: '1.5rem' }}>
                {/* Metadata */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--admin-bg-secondary)', borderRadius: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <div style={{ color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>Admin</div>
                      <div style={{ fontWeight: 500 }}>{selectedLog.admin.name}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>Action</div>
                      <div>{getActionBadge(selectedLog.action)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>Entity</div>
                      <div>{getEntityBadge(selectedLog.entity)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>Timestamp</div>
                      <div style={{ fontWeight: 500 }}>
                        {new Date(selectedLog.timestamp).toLocaleString('en-IN')}
                      </div>
                    </div>
                    {selectedLog.ipAddress && (
                      <div>
                        <div style={{ color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>IP Address</div>
                        <div style={{ fontFamily: 'monospace' }}>{selectedLog.ipAddress}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Changes Comparison */}
                {selectedLog.changes && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {/* Before */}
                    {selectedLog.changes.before && Object.keys(selectedLog.changes.before).length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--admin-error)' }}>
                          Before
                        </h4>
                        <pre style={{
                          background: 'var(--admin-bg-secondary)',
                          padding: '1rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: '300px',
                          border: '1px solid var(--admin-border-primary)'
                        }}>
                          {JSON.stringify(selectedLog.changes.before, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* After */}
                    {selectedLog.changes.after && Object.keys(selectedLog.changes.after).length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--admin-success)' }}>
                          After
                        </h4>
                        <pre style={{
                          background: 'var(--admin-bg-secondary)',
                          padding: '1rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: '300px',
                          border: '1px solid var(--admin-border-primary)'
                        }}>
                          {JSON.stringify(selectedLog.changes.after, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActivityLogsPage;