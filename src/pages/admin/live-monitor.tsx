import { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '../../components/admin/Layout';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FiMonitor,
  FiUsers,
  FiUser,
  FiTruck,
  FiAlertTriangle,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiServer,
  FiCpu,
  FiClock,
  FiSmartphone,
  FiTablet,
  FiGlobe
} from 'react-icons/fi';

interface ServerHealth {
  status: string;
  uptime: number;
  uptimeFormatted: string;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    percentage: number;
  };
  nodeVersion: string;
  platform: string;
  pid: number;
}

interface VisitorStats {
  total: number;
  guests: number;
  users: number;
  distributors: number;
  admins: number;
  suspicious: number;
}

interface Visitor {
  ip: string;
  browser: string;
  os: string;
  deviceType: string;
  deviceVendor: string;
  deviceModel: string;
  accessSource: string;
  accessApp: string;
  userId: string | null;
  userType: string;
  userName: string;
  userEmail: string;
  currentPath: string;
  requestCount: number;
  firstSeen: number;
  lastActivity: number;
  city: string;
  state: string;
  country: string;
  isSuspicious: boolean;
  suspiciousReasons: string[];
}

interface MonitorData {
  server: ServerHealth;
  stats: VisitorStats;
  visitors: Visitor[];
  suspiciousVisitors: Visitor[];
}

const LiveMonitor = () => {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/admin/live-monitor');
      setData(response.data);
      setLastUpdated(new Date());
      setSecondsAgo(0);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 15s
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchData]);

  // "X seconds ago" ticker
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [lastUpdated]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <FiSmartphone />;
      case 'tablet': return <FiTablet />;
      default: return <FiMonitor />;
    }
  };

  const getMemoryColor = (pct: number) => {
    if (pct < 50) return '#10b981';
    if (pct < 75) return '#f59e0b';
    return '#ef4444';
  };

  const getAccessBadge = (source: string, app: string) => {
    const config: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
      'browser': { bg: '#dbeafe', color: '#1e40af', icon: <FiGlobe size={12} /> },
      'in-app': { bg: '#fef3c7', color: '#92400e', icon: <FiSmartphone size={12} /> },
      'api-client': { bg: '#fce7f3', color: '#9d174d', icon: <FiServer size={12} /> },
      'bot': { bg: '#f3f4f6', color: '#6b7280', icon: <FiCpu size={12} /> },
      'unknown': { bg: '#f3f4f6', color: '#6b7280', icon: <FiMonitor size={12} /> }
    };
    const c = config[source] || config.unknown;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem',
        fontWeight: 600, background: c.bg, color: c.color, whiteSpace: 'nowrap' as const
      }}>
        {c.icon} {app || source}
      </span>
    );
  };

  const getUserTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      admin: { bg: '#fef3c7', color: '#92400e' },
      distributor: { bg: '#dbeafe', color: '#1e40af' },
      user: { bg: '#d1fae5', color: '#065f46' },
      guest: { bg: '#f3f4f6', color: '#374151' }
    };
    const s = styles[type] || styles.guest;
    return (
      <span style={{
        padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem',
        fontWeight: 600, background: s.bg, color: s.color, textTransform: 'capitalize'
      }}>
        {type}
      </span>
    );
  };

  // Filter and search visitors
  const filteredVisitors = data?.visitors.filter(v => {
    if (filterType !== 'all' && v.userType !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        v.ip.toLowerCase().includes(q) ||
        v.userName.toLowerCase().includes(q) ||
        v.userEmail.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.country.toLowerCase().includes(q) ||
        v.browser.toLowerCase().includes(q)
      );
    }
    return true;
  }) || [];

  if (loading && !data) {
    return (
      <AdminLayout title="Live Monitor">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <LoadingSpinner size="large" message="Loading monitor..." />
        </div>
      </AdminLayout>
    );
  }

  const server = data?.server;
  const stats = data?.stats;
  const suspicious = data?.suspiciousVisitors || [];

  return (
    <AdminLayout title="Live Monitor">
      <div className="live-monitor">
        {/* Header */}
        <div className="monitor-header">
          <div className="header-left">
            <h1 className="page-title">
              <FiMonitor style={{ marginRight: '10px' }} />
              Live Monitor
            </h1>
            <span className="update-badge">
              {autoRefresh && <span className="pulse-dot" />}
              Updated {secondsAgo}s ago
            </span>
          </div>
          <div className="header-actions">
            <button
              className={`toggle-btn ${autoRefresh ? 'active' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <FiRefreshCw className={autoRefresh ? 'spinning' : ''} />
              {autoRefresh ? 'Auto' : 'Paused'}
            </button>
            <button className="refresh-btn" onClick={fetchData}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <FiAlertTriangle /> {error}
          </div>
        )}

        {/* Server Health Bar */}
        {server && (
          <div className="server-health">
            <div className="health-status">
              <span className="status-dot online" />
              <span className="status-label">Server Online</span>
            </div>
            <div className="health-info">
              <div className="health-item">
                <FiClock size={14} />
                <span>Uptime: {server.uptimeFormatted}</span>
              </div>
              <div className="health-item memory-item">
                <FiCpu size={14} />
                <span>Memory: {server.memory.heapUsed}MB / {server.memory.heapTotal}MB</span>
                <div className="memory-bar">
                  <div
                    className="memory-fill"
                    style={{
                      width: `${server.memory.percentage}%`,
                      background: getMemoryColor(server.memory.percentage)
                    }}
                  />
                </div>
                <span className="memory-pct">{server.memory.percentage}%</span>
              </div>
              <div className="health-item">
                <FiServer size={14} />
                <span>Node {server.nodeVersion} | PID {server.pid}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon"><FiEye /></div>
              <div className="stat-info">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Live</div>
              </div>
            </div>
            <div className="stat-card users">
              <div className="stat-icon"><FiUser /></div>
              <div className="stat-info">
                <div className="stat-value">{stats.users}</div>
                <div className="stat-label">Users</div>
              </div>
            </div>
            <div className="stat-card distributors">
              <div className="stat-icon"><FiTruck /></div>
              <div className="stat-info">
                <div className="stat-value">{stats.distributors}</div>
                <div className="stat-label">Distributors</div>
              </div>
            </div>
            <div className="stat-card guests">
              <div className="stat-icon"><FiUsers /></div>
              <div className="stat-info">
                <div className="stat-value">{stats.guests}</div>
                <div className="stat-label">Guests</div>
              </div>
            </div>
            <div className="stat-card admins">
              <div className="stat-icon"><FiMonitor /></div>
              <div className="stat-info">
                <div className="stat-value">{stats.admins}</div>
                <div className="stat-label">Admins</div>
              </div>
            </div>
            {stats.suspicious > 0 && (
              <div className="stat-card suspicious">
                <div className="stat-icon"><FiAlertTriangle /></div>
                <div className="stat-info">
                  <div className="stat-value">{stats.suspicious}</div>
                  <div className="stat-label">Suspicious</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Suspicious Alerts */}
        {suspicious.length > 0 && (
          <div className="suspicious-section">
            <h3 className="section-title suspicious-title">
              <FiAlertTriangle /> Suspicious Activity Detected
            </h3>
            <div className="suspicious-cards">
              {suspicious.map((v, i) => (
                <div key={i} className="suspicious-card">
                  <div className="suspicious-ip">{v.ip}</div>
                  <div className="suspicious-details">
                    {(v.city || v.state) && <span>{v.city}{v.city && v.state ? ', ' : ''}{v.state}</span>}
                    <span>{v.requestCount} requests</span>
                    <span>{v.browser}</span>
                  </div>
                  <div className="suspicious-reasons">
                    {v.suspiciousReasons.map((r, j) => (
                      <div key={j} className="reason-tag">{r}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <FiFilter size={16} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="guest">Guests</option>
              <option value="user">Users</option>
              <option value="distributor">Distributors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="search-group">
            <FiSearch size={16} />
            <input
              type="text"
              placeholder="Search IP, name, email, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <span className="results-count">{filteredVisitors.length} visitors</span>
        </div>

        {/* Visitors Table */}
        <div className="table-container">
          <table className="visitors-table">
            <thead>
              <tr>
                <th>IP Address</th>
                <th>City / State</th>
                <th>Type</th>
                <th>Name / Email</th>
                <th>Access Via</th>
                <th>Browser</th>
                <th>OS</th>
                <th>Device</th>
                <th>Page</th>
                <th>Requests</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    {data?.visitors.length === 0 ? 'No active visitors' : 'No visitors match the current filters'}
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v, i) => (
                  <tr key={i} className={v.isSuspicious ? 'row-suspicious' : ''}>
                    <td className="ip-cell">
                      <code>{v.ip}</code>
                    </td>
                    <td>
                      {v.city || v.state ? (
                        <span className="location">
                          <FiGlobe size={12} />
                          {v.city}{v.city && v.state ? ', ' : ''}{v.state}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>{getUserTypeBadge(v.userType)}</td>
                    <td>
                      {v.userName ? (
                        <div>
                          <div className="visitor-name">{v.userName}</div>
                          <div className="visitor-email">{v.userEmail}</div>
                        </div>
                      ) : (
                        <span className="text-muted">Anonymous</span>
                      )}
                    </td>
                    <td>{getAccessBadge(v.accessSource, v.accessApp)}</td>
                    <td><span className="text-sm">{v.browser}</span></td>
                    <td><span className="text-sm">{v.os}</span></td>
                    <td>
                      <span className="device-badge">
                        {getDeviceIcon(v.deviceType)}
                        <span>{v.deviceType}</span>
                      </span>
                    </td>
                    <td>
                      <span className="path-badge" title={v.currentPath}>
                        {v.currentPath.length > 25 ? v.currentPath.slice(0, 25) + '...' : v.currentPath}
                      </span>
                    </td>
                    <td>
                      <span className={`req-count ${v.requestCount > 50 ? 'high' : ''}`}>
                        {v.requestCount}
                      </span>
                    </td>
                    <td>
                      <span className="duration">
                        {formatDuration(Date.now() - v.firstSeen)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .live-monitor {
          padding: 0;
        }

        .monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--admin-text, #1f2937);
          margin: 0;
          display: flex;
          align-items: center;
        }

        .update-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .toggle-btn, .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #374151;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-btn:hover, .refresh-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .toggle-btn.active {
          background: #ecfdf5;
          border-color: #10b981;
          color: #059669;
        }

        .toggle-btn :global(.spinning) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        /* Server Health */
        .server-health {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .health-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #065f46;
          font-size: 0.95rem;
          white-space: nowrap;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }

        .status-dot.online {
          animation: pulse 2s infinite;
        }

        .health-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          flex: 1;
        }

        .health-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #374151;
          white-space: nowrap;
        }

        .memory-item {
          gap: 8px;
        }

        .memory-bar {
          width: 80px;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .memory-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .memory-pct {
          font-weight: 600;
          font-size: 0.8rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1.25rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .stat-card.total .stat-icon { background: #ede9fe; color: #7c3aed; }
        .stat-card.users .stat-icon { background: #d1fae5; color: #059669; }
        .stat-card.distributors .stat-icon { background: #dbeafe; color: #2563eb; }
        .stat-card.guests .stat-icon { background: #f3f4f6; color: #6b7280; }
        .stat-card.admins .stat-icon { background: #fef3c7; color: #d97706; }
        .stat-card.suspicious .stat-icon { background: #fee2e2; color: #dc2626; }

        .stat-card.suspicious {
          border-color: #fca5a5;
          background: #fff5f5;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6b7280;
          margin-top: 2px;
        }

        /* Suspicious Section */
        .suspicious-section {
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .suspicious-title {
          color: #dc2626;
        }

        .suspicious-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 0.75rem;
        }

        .suspicious-card {
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-left: 4px solid #ef4444;
          border-radius: 8px;
        }

        .suspicious-ip {
          font-weight: 700;
          font-family: monospace;
          color: #991b1b;
          margin-bottom: 4px;
        }

        .suspicious-details {
          display: flex;
          gap: 12px;
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .suspicious-reasons {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .reason-tag {
          font-size: 0.75rem;
          padding: 2px 8px;
          background: #fee2e2;
          color: #b91c1c;
          border-radius: 4px;
          font-weight: 500;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .filter-group, .search-group {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
        }

        .filter-select {
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.85rem;
          color: #374151;
          background: #f9fafb;
          cursor: pointer;
          outline: none;
        }

        .filter-select:focus {
          border-color: #667eea;
        }

        .search-group {
          flex: 1;
          min-width: 200px;
        }

        .search-input {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.85rem;
          outline: none;
          background: #f9fafb;
        }

        .search-input:focus {
          border-color: #667eea;
        }

        .results-count {
          font-size: 0.8rem;
          color: #9ca3af;
          white-space: nowrap;
        }

        /* Visitors Table */
        .table-container {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .visitors-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .visitors-table th {
          padding: 12px 14px;
          text-align: left;
          font-weight: 600;
          color: #6b7280;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }

        .visitors-table td {
          padding: 10px 14px;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
          vertical-align: middle;
        }

        .visitors-table tbody tr {
          transition: background 0.15s;
        }

        .visitors-table tbody tr:hover {
          background: #f9fafb;
        }

        .visitors-table tbody tr.row-suspicious {
          background: #fff5f5;
          border-left: 3px solid #ef4444;
        }

        .visitors-table tbody tr.row-suspicious:hover {
          background: #fef2f2;
        }

        .ip-cell code {
          font-size: 0.8rem;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          color: #1f2937;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
        }

        .text-muted {
          color: #9ca3af;
        }

        .text-sm {
          font-size: 0.8rem;
        }

        .visitor-name {
          font-weight: 500;
          font-size: 0.85rem;
        }

        .visitor-email {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .device-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          text-transform: capitalize;
        }

        .path-badge {
          font-size: 0.75rem;
          font-family: monospace;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .req-count {
          font-weight: 600;
          font-size: 0.85rem;
        }

        .req-count.high {
          color: #dc2626;
        }

        .duration {
          font-size: 0.8rem;
          color: #6b7280;
          white-space: nowrap;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Dark mode */
        :global([data-theme='dark']) .server-health {
          background: linear-gradient(135deg, #064e3b, #065f46);
          border-color: #059669;
        }

        :global([data-theme='dark']) .stat-card {
          background: #1f2937;
          border-color: #374151;
        }

        :global([data-theme='dark']) .stat-value {
          color: #f9fafb;
        }

        :global([data-theme='dark']) .filters-bar {
          background: #1f2937;
          border-color: #374151;
        }

        :global([data-theme='dark']) .table-container {
          background: #1f2937;
          border-color: #374151;
        }

        :global([data-theme='dark']) .visitors-table th {
          background: #111827;
          border-color: #374151;
          color: #9ca3af;
        }

        :global([data-theme='dark']) .visitors-table td {
          border-color: #374151;
          color: #d1d5db;
        }

        :global([data-theme='dark']) .visitors-table tbody tr:hover {
          background: #111827;
        }

        :global([data-theme='dark']) .filter-select,
        :global([data-theme='dark']) .search-input {
          background: #111827;
          border-color: #374151;
          color: #d1d5db;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-group {
            min-width: unset;
          }

          .health-info {
            gap: 0.75rem;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default LiveMonitor;
