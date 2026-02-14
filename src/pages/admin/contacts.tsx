import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiMail, FiPhone, FiUser, FiTrash2, FiCheck, FiX, FiInbox, FiSend } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import FilterPanel, { FilterOption } from '../../components/admin/FilterPanel';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface ThreadMessage {
  _id: string;
  sender: 'user' | 'admin';
  subject?: string;
  message: string;
  createdAt: string;
}

interface ContactThread {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  messages: ThreadMessage[];
  lastMessageAt: string;
  createdAt: string;
}

interface ContactStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  closed: number;
}

const subjectLabels: Record<string, string> = {
  'product-inquiry': 'Product Inquiry',
  'order-issue': 'Order Issue',
  'delivery-question': 'Delivery Question',
  'payment-issue': 'Payment Issue',
  'return-refund': 'Return/Refund',
  'distributor-inquiry': 'Become a Distributor',
  'partnership': 'Partnership',
  'feedback': 'Feedback',
  'other': 'Other'
};

const statusColors: Record<string, string> = {
  new: 'blue',
  read: 'orange',
  replied: 'green',
  closed: 'gray'
};

const ContactsManagement: React.FC = () => {
  const [contacts, setContacts] = useState<ContactThread[]>([]);
  const [stats, setStats] = useState<ContactStats>({ total: 0, new: 0, read: 0, replied: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'read' | 'replied' | 'closed'>('all');
  const [selectedThread, setSelectedThread] = useState<ContactThread | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [currentPage, filters, searchTerm, activeTab]);

  useEffect(() => {
    if (showChatModal && chatEndRef.current) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [showChatModal, selectedThread?.messages?.length]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        ...(activeTab !== 'all' && { status: activeTab }),
        ...filters
      });
      const response = await api.get(`/admin/contacts?${queryParams}`);
      setContacts(response.data.contacts || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalItems(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/contacts/stats');
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleOpenChat = async (thread: ContactThread) => {
    setSelectedThread(thread);
    setShowChatModal(true);
    setReplyText('');
    setReplyError('');

    if (thread.status === 'new') {
      try {
        await api.patch(`/admin/contacts/${thread._id}`, { status: 'read' });
        setContacts(prev => prev.map(c => c._id === thread._id ? { ...c, status: 'read' } : c));
        fetchStats();
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleUpdateStatus = async (threadId: string, newStatus: string) => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/contacts/${threadId}`, { status: newStatus });
      await fetchContacts();
      await fetchStats();
      if (selectedThread && selectedThread._id === threadId) {
        setSelectedThread({ ...selectedThread, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedThread || !replyText.trim()) return;

    try {
      setReplyLoading(true);
      setReplyError('');

      const response = await api.post(`/admin/contacts/${selectedThread._id}/reply`, {
        reply: replyText.trim()
      });

      const updatedThread = response.data.contact;
      setSelectedThread(updatedThread);
      setContacts(prev => prev.map(c => c._id === updatedThread._id ? updatedThread : c));
      setReplyText('');
      await fetchStats();
    } catch (error: any) {
      setReplyError(error.response?.data?.error || error.message || 'Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteThread = (threadId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Conversation',
      message: 'Are you sure you want to permanently delete this entire conversation?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete(`/admin/contacts/${threadId}`);
          await fetchContacts();
          await fetchStats();
          if (selectedThread && selectedThread._id === threadId) {
            setShowChatModal(false);
            setSelectedThread(null);
          }
        } catch (error) {
          console.error('Delete failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getLastMessage = (thread: ContactThread) => {
    if (!thread.messages || thread.messages.length === 0) return '';
    const last = thread.messages[thread.messages.length - 1];
    const prefix = last.sender === 'admin' ? 'You: ' : '';
    return prefix + (last.message.length > 60 ? last.message.substring(0, 60) + '...' : last.message);
  };

  const columns: Column[] = [
    {
      key: 'name',
      label: 'Contact',
      render: (value, row: ContactThread) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleOpenChat(row)}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: row.status === 'new' ? 'var(--admin-primary, #ff6b35)' : '#e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: row.status === 'new' ? '#fff' : '#6b7280',
            fontWeight: 700, fontSize: '0.9rem', flexShrink: 0
          }}>
            {value.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: row.status === 'new' ? 700 : 500, fontSize: '0.875rem' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'messages',
      label: 'Last Message',
      render: (value, row: ContactThread) => (
        <div style={{ maxWidth: '300px', cursor: 'pointer' }} onClick={() => handleOpenChat(row)}>
          <div style={{
            fontSize: '0.875rem', color: 'var(--admin-text-primary)',
            fontWeight: row.status === 'new' ? 600 : 400,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {getLastMessage(row)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{
              fontSize: '0.7rem', color: 'var(--admin-text-secondary)',
              background: 'var(--admin-bg-secondary, #f3f4f6)',
              padding: '0.15rem 0.5rem', borderRadius: '10px'
            }}>
              {row.messages?.length || 0} message{(row.messages?.length || 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`badge ${statusColors[value] || 'gray'}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'lastMessageAt',
      label: 'Last Activity',
      sortable: true,
      render: (value) => (
        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
          {formatTime(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: ContactThread) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-icon" title="Open Chat" onClick={() => handleOpenChat(row)}>
            <FiMessageSquare size={16} />
          </button>
          <button className="btn-icon danger" title="Delete" onClick={() => handleDeleteThread(row._id)}>
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const filterOptions: FilterOption[] = [
    {
      key: 'subject',
      label: 'Subject',
      type: 'select',
      options: [
        { value: 'product-inquiry', label: 'Product Inquiry' },
        { value: 'order-issue', label: 'Order Issue' },
        { value: 'delivery-question', label: 'Delivery Question' },
        { value: 'payment-issue', label: 'Payment Issue' },
        { value: 'return-refund', label: 'Return/Refund' },
        { value: 'distributor-inquiry', label: 'Become a Distributor' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'feedback', label: 'Feedback' },
        { value: 'other', label: 'Other' }
      ]
    }
  ];

  // ---- Chat Modal (inline JSX to avoid remount on state change) ----
  const chatModalJSX = (
    <AnimatePresence>
      {showChatModal && selectedThread && (
        <div className="modal-overlay" onClick={() => !replyLoading && setShowChatModal(false)}>
          <motion.div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ maxWidth: '700px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div>
                <h2 className="modal-title" style={{ marginBottom: '0.25rem' }}>{selectedThread.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FiMail size={12} /> {selectedThread.email}
                  </span>
                  {selectedThread.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiPhone size={12} /> {selectedThread.phone}
                    </span>
                  )}
                  <span className={`badge ${statusColors[selectedThread.status]}`} style={{ fontSize: '0.7rem' }}>
                    {selectedThread.status.charAt(0).toUpperCase() + selectedThread.status.slice(1)}
                  </span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowChatModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem 1.5rem',
              background: 'var(--admin-bg-secondary, #f9fafb)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              minHeight: '200px'
            }}>
              {selectedThread.messages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  <div style={{
                    maxWidth: '75%',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.sender === 'admin' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background: msg.sender === 'admin' ? 'var(--admin-primary, #ff6b35)' : '#fff',
                    color: msg.sender === 'admin' ? '#fff' : 'var(--admin-text-primary)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                  }}>
                    {/* Subject badge for user messages */}
                    {msg.sender === 'user' && msg.subject && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '10px',
                          background: '#f3f0ff',
                          color: '#7c3aed',
                          fontWeight: 600
                        }}>
                          {subjectLabels[msg.subject] || msg.subject}
                        </span>
                      </div>
                    )}
                    <div style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {msg.message}
                    </div>
                    <div style={{
                      fontSize: '0.65rem',
                      marginTop: '0.4rem',
                      opacity: 0.7,
                      textAlign: msg.sender === 'admin' ? 'right' : 'left'
                    }}>
                      {msg.sender === 'admin' ? 'Admin' : selectedThread.name} &middot; {formatFullDate(msg.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Reply Input Area */}
            <div style={{
              flexShrink: 0,
              padding: '0.75rem 1.5rem',
              borderTop: '1px solid var(--admin-border-primary, #e5e7eb)',
              background: 'var(--admin-bg-primary, #fff)'
            }}>
              {replyError && (
                <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.8rem' }}>
                  {replyError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <textarea
                  value={replyText}
                  onChange={(e) => { setReplyText(e.target.value); setReplyError(''); }}
                  placeholder="Type your reply..."
                  disabled={replyLoading}
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.75rem',
                    border: '2px solid var(--admin-border-primary, #e5e7eb)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    resize: 'none',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={replyLoading || !replyText.trim()}
                  style={{
                    padding: '0.65rem',
                    background: replyLoading || !replyText.trim() ? '#d1d5db' : 'var(--admin-primary, #ff6b35)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: replyLoading || !replyText.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '42px',
                    height: '42px',
                    flexShrink: 0,
                    transition: 'background 0.2s'
                  }}
                >
                  {replyLoading ? (
                    <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  ) : (
                    <FiSend size={18} />
                  )}
                </button>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-secondary)', marginTop: '0.35rem' }}>
                Enter to send &middot; Shift+Enter for new line &middot; Reply emailed to {selectedThread.email}
              </div>
            </div>

            {/* Footer: Status + Delete */}
            <div className="modal-footer" style={{ flexShrink: 0, justifyContent: 'space-between', padding: '0.75rem 1.5rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleDeleteThread(selectedThread._id)}
                disabled={actionLoading}
                style={{ color: '#e74c3c', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FiTrash2 size={14} /> Delete
              </button>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {(['new', 'read', 'replied', 'closed'] as const).map((s) => (
                  <button
                    key={s}
                    className={`btn btn-sm ${selectedThread.status === s ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleUpdateStatus(selectedThread._id, s)}
                    disabled={actionLoading || selectedThread.status === s}
                    style={{
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      textTransform: 'capitalize',
                      opacity: selectedThread.status === s ? 1 : 0.7
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <AdminLayout title="Contact Messages" requiredPermission="contacts.view">
      <div className="admin-content">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Contact Messages
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Manage conversations from the contact form
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard title="Total Conversations" value={stats.total.toLocaleString()} icon={FiMessageSquare} variant="products" subtitle="All time" />
            <StatCard title="New" value={stats.new.toLocaleString()} icon={FiInbox} variant="orders" subtitle="Unread" />
            <StatCard title="Replied" value={stats.replied.toLocaleString()} icon={FiCheck} variant="distributors" subtitle="Responded" />
            <StatCard title="Closed" value={stats.closed.toLocaleString()} icon={FiX} variant="revenue" subtitle="Resolved" />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--admin-border-primary)' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {(['all', 'new', 'read', 'replied', 'closed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: activeTab === tab ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
                  borderBottom: activeTab === tab ? '2px solid var(--admin-primary)' : '2px solid transparent',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
                {tab !== 'all' && stats[tab as keyof ContactStats] > 0 && (
                  <span className={`badge ${tab === 'new' ? 'blue' : 'purple'}`} style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                    {stats[tab as keyof ContactStats]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filterOptions}
          onApply={setFilters}
          onClear={() => setFilters({})}
          activeFilters={filters}
        />

        {/* Data Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DataTable
            columns={columns}
            data={contacts}
            loading={loading}
            pagination={{
              page: currentPage,
              limit: 20,
              total: totalItems,
              onPageChange: setCurrentPage,
            }}
          />
        </motion.div>

        {/* Chat Modal */}
        {chatModalJSX}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default ContactsManagement;
