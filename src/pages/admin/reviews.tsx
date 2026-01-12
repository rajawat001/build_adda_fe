import React, { useState, useEffect } from 'react';
import { FiStar, FiCheck, FiX, FiFlag, FiMessageSquare, FiUser, FiPackage, FiTruck, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import AdminLayout from '../../components/admin/Layout';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import FilterPanel, { FilterOption } from '../../components/admin/FilterPanel';
import BulkActionBar, { BulkAction } from '../../components/admin/BulkActionBar';
import ExportButton from '../../components/admin/ExportButton';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  product?: {
    _id: string;
    name: string;
  };
  distributor?: {
    _id: string;
    businessName: string;
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  approvedBy?: {
    _id: string;
    name: string;
  };
  adminReply?: string;
  isFlagged: boolean;
  createdAt: string;
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  avgRating: number;
}

const ReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    flagged: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'flagged'>('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
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
    fetchReviews();
    fetchStats();
  }, [currentPage, filters, searchTerm, activeTab]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        ...(activeTab !== 'all' && { status: activeTab }),
        ...filters
      });

      const response = await api.get(`/admin/reviews?${queryParams}`);
      setReviews(response.data.reviews || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/reviews/stats');
      const data = response.data;
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        search: searchTerm,
        ...(activeTab !== 'all' && { status: activeTab }),
        ...filters
      });

      const response = await api.get(`/admin/reviews/export?${queryParams}`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reviews_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  const handleApproveReview = (reviewId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve Review',
      message: 'Are you sure you want to approve this review?',
      variant: 'info',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.put(`/admin/reviews/${reviewId}/approve`);

          await fetchReviews();
          await fetchStats();
        } catch (error) {
          console.error('Approve failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const handleRejectReview = (reviewId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Review',
      message: 'Are you sure you want to reject this review? It will be hidden from users.',
      variant: 'warning',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.put(`/admin/reviews/${reviewId}/reject`);

          await fetchReviews();
          await fetchStats();
        } catch (error) {
          console.error('Reject failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const handleFlagReview = (reviewId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Flag Review',
      message: 'Flag this review for inappropriate content?',
      variant: 'warning',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.put(`/admin/reviews/${reviewId}/flag`);

          await fetchReviews();
          await fetchStats();
        } catch (error) {
          console.error('Flag failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Review',
      message: 'Are you sure you want to permanently delete this review?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.delete(`/admin/reviews/${reviewId}`);

          await fetchReviews();
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

  const handleReply = (review: Review) => {
    setReplyingTo(review);
    setReplyText(review.adminReply || '');
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!replyingTo || !replyText.trim()) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/reviews/${replyingTo._id}/reply`, {
        adminReply: replyText
      });

      await fetchReviews();
      setShowReplyModal(false);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Reply failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve Reviews',
      message: `Approve ${selectedReviews.length} selected review(s)?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.post('/admin/reviews/bulk-approve', {
            reviewIds: selectedReviews
          });

          await fetchReviews();
          await fetchStats();
          setSelectedReviews([]);
        } catch (error) {
          console.error('Bulk approve failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const handleBulkReject = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Reviews',
      message: `Reject ${selectedReviews.length} selected review(s)?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await api.post('/admin/reviews/bulk-reject', {
            reviewIds: selectedReviews
          });

          await fetchReviews();
          await fetchStats();
          setSelectedReviews([]);
        } catch (error) {
          console.error('Bulk reject failed:', error);
        } finally {
          setActionLoading(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '0.125rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <FiStar
            key={star}
            size={16}
            style={{
              fill: star <= rating ? '#f59e0b' : 'transparent',
              stroke: star <= rating ? '#f59e0b' : 'var(--admin-text-tertiary)',
              strokeWidth: 2
            }}
          />
        ))}
      </div>
    );
  };

  const columns: Column[] = [
    {
      key: 'user',
      label: 'Reviewer',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiUser size={16} style={{ color: 'var(--admin-text-secondary)' }} />
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{value.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>{value.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'product',
      label: 'Item',
      render: (value, row: Review) => {
        if (row.product) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiPackage size={14} style={{ color: 'var(--admin-text-secondary)' }} />
              <span style={{ fontSize: '0.875rem' }}>{row.product.name}</span>
            </div>
          );
        }
        if (row.distributor) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiTruck size={14} style={{ color: 'var(--admin-text-secondary)' }} />
              <span style={{ fontSize: '0.875rem' }}>{row.distributor.businessName}</span>
            </div>
          );
        }
        return <span style={{ color: 'var(--admin-text-tertiary)' }}>N/A</span>;
      }
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (value) => renderStars(value)
    },
    {
      key: 'comment',
      label: 'Comment',
      render: (value) => (
        <div style={{ maxWidth: '300px', fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>
          {value.length > 100 ? value.substring(0, 100) + '...' : value}
        </div>
      )
    },
    {
      key: 'isApproved',
      label: 'Status',
      sortable: true,
      render: (value, row: Review) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span className={`badge ${value ? 'green' : 'orange'}`}>
            {value ? 'Approved' : 'Pending'}
          </span>
          {row.isFlagged && (
            <span className="badge red" style={{ fontSize: '0.75rem' }}>
              <FiFlag size={10} /> Flagged
            </span>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
          {new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: Review) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!row.isApproved && (
            <button
              className="btn-icon success"
              title="Approve"
              onClick={() => handleApproveReview(row._id)}
            >
              <FiThumbsUp size={16} />
            </button>
          )}
          {row.isApproved && (
            <button
              className="btn-icon warning"
              title="Reject"
              onClick={() => handleRejectReview(row._id)}
            >
              <FiThumbsDown size={16} />
            </button>
          )}
          <button
            className="btn-icon"
            title="Reply"
            onClick={() => handleReply(row)}
          >
            <FiMessageSquare size={16} />
          </button>
          {!row.isFlagged && (
            <button
              className="btn-icon warning"
              title="Flag as Inappropriate"
              onClick={() => handleFlagReview(row._id)}
            >
              <FiFlag size={16} />
            </button>
          )}
          <button
            className="btn-icon danger"
            title="Delete"
            onClick={() => handleDeleteReview(row._id)}
          >
            <FiX size={16} />
          </button>
        </div>
      )
    }
  ];

  const filterOptions: FilterOption[] = [
    {
      key: 'rating',
      label: 'Rating',
      type: 'select',
      options: [
        { value: '5', label: '5 Stars' },
        { value: '4', label: '4 Stars' },
        { value: '3', label: '3 Stars' },
        { value: '2', label: '2 Stars' },
        { value: '1', label: '1 Star' }
      ]
    },
    {
      key: 'type',
      label: 'Review Type',
      type: 'select',
      options: [
        { value: 'product', label: 'Product Reviews' },
        { value: 'distributor', label: 'Distributor Reviews' }
      ]
    },
    {
      key: 'date',
      label: 'Review Date',
      type: 'daterange'
    }
  ];

  const bulkActions: BulkAction[] = [
    {
      label: 'Approve',
      icon: <FiCheck size={16} />,
      variant: 'success',
      onClick: handleBulkApprove
    },
    {
      label: 'Reject',
      icon: <FiX size={16} />,
      variant: 'warning',
      onClick: handleBulkReject
    }
  ];

  const ReplyModal = () => (
    <AnimatePresence>
      {showReplyModal && replyingTo && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
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
              <h2 className="modal-title">Reply to Review</h2>
              <button className="modal-close" onClick={() => setShowReplyModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              {/* Original Review */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--admin-bg-secondary)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{replyingTo.user.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginTop: '0.25rem' }}>
                      {new Date(replyingTo.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {renderStars(replyingTo.rating)}
                </div>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--admin-text-primary)' }}>
                  {replyingTo.comment}
                </p>
              </div>

              {/* Reply Input */}
              <div className="form-group">
                <label className="form-label">Admin Reply</label>
                <textarea
                  className="form-input"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={5}
                  placeholder="Type your reply to this review..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowReplyModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmitReply}
                disabled={actionLoading || !replyText.trim()}
              >
                {actionLoading ? (
                  <>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiCheck size={16} />
                    Submit Reply
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <AdminLayout title="Reviews Management" >
      <div className="admin-content">
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Reviews Management
              </h1>
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                Moderate product and distributor reviews
              </p>
            </div>
            <ExportButton onExport={handleExport} label="Export Reviews" />
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Reviews"
              value={stats.total.toLocaleString()}
              icon={FiStar}
              variant="products"
              subtitle="All reviews"
            />
            <StatCard
              title="Pending"
              value={stats.pending.toLocaleString()}
              icon={FiCheck}
              variant="distributors"
              subtitle="Awaiting approval"
            />
            <StatCard
              title="Approved"
              value={stats.approved.toLocaleString()}
              icon={FiThumbsUp}
              variant="orders"
              subtitle="Visible to users"
            />
            <StatCard
              title="Average Rating"
              value={stats.avgRating.toFixed(1)}
              icon={FiStar}
              variant="revenue"
              subtitle="Overall rating"
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--admin-border-primary)' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {(['all', 'pending', 'approved', 'rejected', 'flagged'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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
                {tab !== 'all' && stats[tab as keyof ReviewStats] && (
                  <span className="badge purple" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                    {stats[tab as keyof ReviewStats]}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={reviews}
            loading={loading}
            selectable
          />
        </motion.div>

        {/* Bulk Actions Bar */}
        <BulkActionBar
          selectedCount={selectedReviews.length}
          actions={bulkActions}
          onClear={() => setSelectedReviews([])}
        />

        {/* Reply Modal */}
        <ReplyModal />

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

export default ReviewsManagement;