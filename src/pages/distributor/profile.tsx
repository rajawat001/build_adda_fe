import { useState, useEffect } from 'react';
import DistributorLayout from '../../components/distributor/Layout';
import { Button, Card, Loading, Badge } from '../../components/ui';
import { useIsMobile } from '../../hooks';
import { FiEdit, FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCheck, FiClock, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
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
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<DistributorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/distributor/profile', formData);
      toast.success('Profile updated successfully');
      setEditMode(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
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
        <Loading fullScreen text="Loading profile..." />
      </DistributorLayout>
    );
  }

  if (!profile) {
    return (
      <DistributorLayout title="Profile">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FiUser className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-[var(--text-secondary)]">Error loading profile</p>
          <Button onClick={fetchProfile} className="mt-4">
            Retry
          </Button>
        </div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title="Profile">
      <div className={`max-w-4xl space-y-4 md:space-y-6 ${isMobile && editMode ? 'pb-24' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-[var(--text-primary)]`}>
              {isMobile ? 'Profile' : 'My Profile'}
            </h1>
            {!isMobile && (
              <p className="text-[var(--text-secondary)] mt-1">Manage your business information</p>
            )}
          </div>
          {!editMode && !isMobile && (
            <Button onClick={() => setEditMode(true)} leftIcon={<FiEdit />}>
              Edit Profile
            </Button>
          )}
        </div>

        {/* Mobile Edit Button */}
        {!editMode && isMobile && (
          <Button
            onClick={() => setEditMode(true)}
            leftIcon={<FiEdit />}
            className="w-full min-h-tap"
          >
            Edit Profile
          </Button>
        )}

        {/* Account Status Card */}
        <Card className={isMobile ? 'p-4' : ''}>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)] mb-4`}>
            Account Status
          </h3>
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
            <div className={`${isMobile ? 'p-3' : 'p-4'} bg-[var(--bg-secondary)] rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <FiCheck className={`${profile.isApproved ? 'text-green-500' : 'text-yellow-500'} ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs' : 'text-sm'}`}>Approval</span>
              </div>
              <Badge variant={profile.isApproved ? 'success' : 'warning'} size={isMobile ? 'sm' : 'md'}>
                {profile.isApproved ? 'Approved' : 'Pending'}
              </Badge>
            </div>

            <div className={`${isMobile ? 'p-3' : 'p-4'} bg-[var(--bg-secondary)] rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${profile.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs' : 'text-sm'}`}>Status</span>
              </div>
              <Badge variant={profile.isActive ? 'success' : 'default'} size={isMobile ? 'sm' : 'md'}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className={`${isMobile ? 'p-3' : 'p-4'} bg-[var(--bg-secondary)] rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <FiClock className={`text-[var(--text-secondary)] ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs' : 'text-sm'}`}>Since</span>
              </div>
              <span className={`font-semibold text-[var(--text-primary)] ${isMobile ? 'text-sm' : ''}`}>
                {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: isMobile ? 'short' : 'long',
                })}
              </span>
            </div>

            <div className={`${isMobile ? 'p-3' : 'p-4'} bg-[var(--bg-secondary)] rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <FiStar className={`text-yellow-500 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs' : 'text-sm'}`}>Rating</span>
              </div>
              <span className={`font-semibold text-[var(--text-primary)] ${isMobile ? 'text-sm' : ''}`}>
                {profile.rating.toFixed(1)} ({profile.reviewCount})
              </span>
            </div>
          </div>
        </Card>

        {/* Profile Information Card */}
        <Card className={isMobile ? 'p-4' : ''}>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)] mb-4`}>
            Business Information
          </h3>

          {editMode ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                  className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={isMobile ? 2 : 3}
                  required
                  className={`w-full px-4 ${isMobile ? 'py-3' : 'py-2'} bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                />
              </div>

              {/* City & State */}
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'}`}>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  pattern="[0-9]{6}"
                  required
                  className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Enter 6-digit pincode</p>
              </div>

              {/* Desktop Form Actions */}
              {!isMobile && (
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)]">
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={saving} leftIcon={<FiSave />}>
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <InfoRow
                icon={<FiUser />}
                label="Business Name"
                value={profile.businessName}
                isMobile={isMobile}
              />
              <InfoRow
                icon={<FiUser />}
                label="Contact Person"
                value={profile.name}
                isMobile={isMobile}
              />
              <InfoRow
                icon={<FiMail />}
                label="Email"
                value={profile.email}
                isMobile={isMobile}
              />
              <InfoRow
                icon={<FiPhone />}
                label="Phone"
                value={profile.phone}
                isMobile={isMobile}
              />
              <InfoRow
                icon={<FiMapPin />}
                label="Address"
                value={profile.address}
                isMobile={isMobile}
              />
              <InfoRow
                label="City"
                value={profile.city}
                isMobile={isMobile}
              />
              <InfoRow
                label="State"
                value={profile.state}
                isMobile={isMobile}
              />
              <InfoRow
                label="Pincode"
                value={profile.pincode}
                isMobile={isMobile}
              />
              {profile.gstNumber && (
                <InfoRow
                  label="GST Number"
                  value={profile.gstNumber}
                  isMobile={isMobile}
                />
              )}
            </div>
          )}
        </Card>

        {/* Mobile Fixed Bottom Action Bar */}
        {isMobile && editMode && (
          <div
            className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-primary)] p-4 z-40 shadow-lg"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          >
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                className="flex-1 min-h-tap"
                leftIcon={<FiX />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={saving}
                leftIcon={<FiSave />}
                className="flex-1 min-h-tap"
                onClick={handleUpdate}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </DistributorLayout>
  );
};

// Info Row Component
const InfoRow = ({
  icon,
  label,
  value,
  isMobile,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  isMobile: boolean;
}) => (
  <div className={`${isMobile ? 'py-2' : 'py-3'} border-b border-[var(--border-primary)] last:border-b-0`}>
    <div className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center gap-4'}`}>
      <div className={`flex items-center gap-2 ${isMobile ? '' : 'w-40'}`}>
        {icon && <span className="text-[var(--text-secondary)]">{icon}</span>}
        <span className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {label}
        </span>
      </div>
      <span className={`font-medium text-[var(--text-primary)] ${isMobile ? 'text-sm' : ''}`}>
        {value}
      </span>
    </div>
  </div>
);

export default Profile;
