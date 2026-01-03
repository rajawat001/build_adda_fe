import { useState, useEffect } from 'react';
import DistributorLayout from '../../components/distributor/Layout';
import api from '../../services/api';

interface DistributorProfile {
  _id: string;
  businessName: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  rating: number;
  reviewCount: number;
}

const Profile = () => {
  const [profile, setProfile] = useState<DistributorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/distributor/profile');
      const distributorData = response.data.distributor;
      setProfile(distributorData);
      setFormData({
        businessName: distributorData.businessName,
        phone: distributorData.phone,
        address: distributorData.address,
        city: distributorData.city,
        state: distributorData.state,
        pincode: distributorData.pincode,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.put('/distributor/profile', formData);
      alert('Profile updated successfully');
      setEditMode(false);
      fetchProfile();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        businessName: profile.businessName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
      });
    }
    setEditMode(false);
  };

  if (loading) {
    return (
      <DistributorLayout title="Profile">
        <div className="loading">Loading profile...</div>
      </DistributorLayout>
    );
  }

  if (!profile) {
    return (
      <DistributorLayout title="Profile">
        <div className="error">Error loading profile</div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title="Profile">
      <div className="profile-page">
        <div className="page-header">
          <h1>My Profile</h1>
          {!editMode && (
            <button className="btn-edit" onClick={() => setEditMode(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        <div className="profile-grid">
          {/* Account Status Card */}
          <div className="status-card">
            <h3>Account Status</h3>
            <div className="status-items">
              <div className="status-item">
                <span className="label">Approval Status</span>
                <span className={`badge ${profile.isApproved ? 'approved' : 'pending'}`}>
                  {profile.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Account Status</span>
                <span className={`badge ${profile.isActive ? 'active' : 'inactive'}`}>
                  {profile.isActive ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Member Since</span>
                <span className="value">
                  {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Rating</span>
                <span className="rating">
                  ⭐ {profile.rating.toFixed(1)} ({profile.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Profile Information Card */}
          <div className="info-card">
            <h3>Business Information</h3>

            {editMode ? (
              <form onSubmit={handleUpdate} className="edit-form">
                <div className="form-group">
                  <label>Business Name *</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    pattern="[0-9]{6}"
                    required
                  />
                  <small>Enter 6-digit pincode</small>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-display">
                <div className="info-row">
                  <span className="label">Business Name:</span>
                  <span className="value">{profile.businessName}</span>
                </div>
                <div className="info-row">
                  <span className="label">Contact Person:</span>
                  <span className="value">{profile.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{profile.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{profile.phone}</span>
                </div>
                <div className="info-row">
                  <span className="label">Address:</span>
                  <span className="value">{profile.address}</span>
                </div>
                <div className="info-row">
                  <span className="label">City:</span>
                  <span className="value">{profile.city}</span>
                </div>
                <div className="info-row">
                  <span className="label">State:</span>
                  <span className="value">{profile.state}</span>
                </div>
                <div className="info-row">
                  <span className="label">Pincode:</span>
                  <span className="value">{profile.pincode}</span>
                </div>
                {profile.gstNumber && (
                  <div className="info-row">
                    <span className="label">GST Number:</span>
                    <span className="value">{profile.gstNumber}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          max-width: 1000px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .page-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
        }

        .btn-edit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-edit:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .profile-grid {
          display: grid;
          gap: 24px;
        }

        .status-card,
        .info-card {
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .status-card h3,
        .info-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1a202c;
          margin: 0 0 24px 0;
        }

        .status-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-item .label {
          font-size: 13px;
          color: #718096;
          font-weight: 500;
        }

        .status-item .value {
          font-size: 15px;
          color: #1a202c;
          font-weight: 600;
        }

        .status-item .rating {
          font-size: 16px;
          color: #f59e0b;
          font-weight: 600;
        }

        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: white;
        }

        .badge.approved {
          background: #10b981;
        }

        .badge.pending {
          background: #f59e0b;
        }

        .badge.active {
          background: #10b981;
        }

        .badge.inactive {
          background: #6b7280;
        }

        .info-display {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-row {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #f7fafc;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row .label {
          font-size: 14px;
          color: #718096;
          font-weight: 500;
        }

        .info-row .value {
          font-size: 15px;
          color: #1a202c;
          font-weight: 600;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group small {
          font-size: 12px;
          color: #718096;
          margin-top: 4px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 12px;
          margin-top: 12px;
          border-top: 2px solid #f7fafc;
        }

        .btn-cancel,
        .btn-submit {
          padding: 12px 32px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel {
          background: #edf2f7;
          color: #2d3748;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
        }

        .btn-submit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .loading,
        .error {
          text-align: center;
          padding: 60px;
          color: #718096;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .info-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .status-items {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DistributorLayout>
  );
};

export default Profile;
