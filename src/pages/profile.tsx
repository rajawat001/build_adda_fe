import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import authService, { User } from '../services/auth.service';

interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [addressData, setAddressData] = useState<Address>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [addressErrors, setAddressErrors] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // SECURITY FIX: Don't check localStorage for token - it's in httpOnly cookie
      // The API call will automatically send the cookie
      const response = await authService.getProfile();
      setUser(response.user);
      setFormData({
        name: response.user.name || response.user.businessName || '',
        phone: response.user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // If unauthorized (401), redirect to login
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone
      };

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await authService.updateProfile(updateData);
      alert('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating profile');
    }
  };

  const validateAddress = () => {
    const errors = {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    };

    let isValid = true;

    // Full Name validation
    if (!addressData.fullName || addressData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
      isValid = false;
    }

    // Phone validation
    if (!addressData.phone || !/^[6-9]\d{9}$/.test(addressData.phone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number';
      isValid = false;
    }

    // Address validation
    if (!addressData.address || addressData.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters';
      isValid = false;
    }

    // City validation
    if (!addressData.city || addressData.city.trim().length < 2) {
      errors.city = 'City is required';
      isValid = false;
    }

    // State validation
    if (!addressData.state || addressData.state.trim().length < 2) {
      errors.state = 'State is required';
      isValid = false;
    }

    // Pincode validation
    if (!addressData.pincode || !/^\d{6}$/.test(addressData.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode';
      isValid = false;
    }

    setAddressErrors(errors);
    return isValid;
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateAddress()) {
      setError('Please fix the errors below');
      return;
    }

    try {
      if (editingAddress?._id) {
        await authService.updateAddress(editingAddress._id, addressData);
        setSuccess('Address updated successfully');
      } else {
        await authService.addAddress(addressData);
        setSuccess('Address added successfully');
      }

      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressData({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
      setAddressErrors({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      });
      fetchProfile();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || error.response?.data?.message || 'Error saving address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await authService.deleteAddress(addressId);
      alert('Address deleted successfully');
      fetchProfile();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting address');
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressData(address);
    setShowAddressForm(true);
  };

  if (loading) {
    return (
      <>
        <SEO title="Profile" description="Manage your profile" />
        <Header />
        <div className="profile-container">
          <p>Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO title="My Profile" description="Manage your account settings" />
      <Header />
      
      <div className="profile-container">
        <div className="profile-sidebar">
          <h2>My Account</h2>
          <ul>
            <li className="active">Profile Information</li>
            <li onClick={() => router.push('/orders')}>My Orders</li>
            <li onClick={() => router.push('/wishlist')}>My Wishlist</li>
            <li onClick={async () => {
              await authService.logout();
              router.push('/login');
            }}>Logout</li>
          </ul>
        </div>
        
        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              <button onClick={() => setEditing(!editing)}>
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email (cannot be changed)</label>
                  <input type="email" value={user?.email} disabled />
                </div>
                
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                
                <hr />
                
                <h3>Change Password (Optional)</h3>
                
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
                
                <button type="submit" className="btn-primary">Save Changes</button>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span className="value">{user?.name || user?.businessName}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{user?.phone || 'Not provided'}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="profile-section">
            <div className="section-header">
              <h2>Saved Addresses</h2>
              <button onClick={() => {
                setShowAddressForm(true);
                setEditingAddress(null);
                setError('');
                setSuccess('');
                setAddressData({
                  fullName: '',
                  phone: '',
                  address: '',
                  city: '',
                  state: '',
                  pincode: '',
                  isDefault: false
                });
                setAddressErrors({
                  fullName: '',
                  phone: '',
                  address: '',
                  city: '',
                  state: '',
                  pincode: ''
                });
              }}>
                Add New Address
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={addressData.fullName}
                      onChange={(e) => {
                        setAddressData({...addressData, fullName: e.target.value});
                        setAddressErrors({...addressErrors, fullName: ''});
                      }}
                      className={addressErrors.fullName ? 'input-error' : ''}
                    />
                    {addressErrors.fullName && <span className="validation-error">{addressErrors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      value={addressData.phone}
                      onChange={(e) => {
                        setAddressData({...addressData, phone: e.target.value});
                        setAddressErrors({...addressErrors, phone: ''});
                      }}
                      placeholder="10-digit number"
                      className={addressErrors.phone ? 'input-error' : ''}
                    />
                    {addressErrors.phone && <span className="validation-error">{addressErrors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Address * (minimum 10 characters)</label>
                  <textarea
                    value={addressData.address}
                    onChange={(e) => {
                      setAddressData({...addressData, address: e.target.value});
                      setAddressErrors({...addressErrors, address: ''});
                    }}
                    placeholder="House/Flat no, Building, Street, Landmark"
                    className={addressErrors.address ? 'input-error' : ''}
                  />
                  {addressErrors.address && <span className="validation-error">{addressErrors.address}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      value={addressData.city}
                      onChange={(e) => {
                        setAddressData({...addressData, city: e.target.value});
                        setAddressErrors({...addressErrors, city: ''});
                      }}
                      className={addressErrors.city ? 'input-error' : ''}
                    />
                    {addressErrors.city && <span className="validation-error">{addressErrors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      value={addressData.state}
                      onChange={(e) => {
                        setAddressData({...addressData, state: e.target.value});
                        setAddressErrors({...addressErrors, state: ''});
                      }}
                      className={addressErrors.state ? 'input-error' : ''}
                    />
                    {addressErrors.state && <span className="validation-error">{addressErrors.state}</span>}
                  </div>

                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      value={addressData.pincode}
                      onChange={(e) => {
                        setAddressData({...addressData, pincode: e.target.value});
                        setAddressErrors({...addressErrors, pincode: ''});
                      }}
                      placeholder="6 digits"
                      className={addressErrors.pincode ? 'input-error' : ''}
                    />
                    {addressErrors.pincode && <span className="validation-error">{addressErrors.pincode}</span>}
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={addressData.isDefault}
                      onChange={(e) => setAddressData({...addressData, isDefault: e.target.checked})}
                    />
                    Set as default address
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingAddress ? 'Update' : 'Add'} Address
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                      setError('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            
            <div className="addresses-list">
              {user?.addresses && user.addresses.length > 0 ? (
                user.addresses.map((address) => (
                  <div key={address._id} className="address-card">
                    {address.isDefault && <span className="default-badge">Default</span>}
                    <div className="address-content">
                      <p className="address-name">{address.fullName}</p>
                      <p>{address.phone}</p>
                      <p>{address.address}</p>
                      <p>{address.city}, {address.state} - {address.pincode}</p>
                    </div>

                    <div className="address-actions">
                      <button onClick={() => handleEditAddress(address)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDeleteAddress(address._id!)} className="btn-delete">Delete</button>
                      {!address.isDefault && (
                        <button
                          onClick={async () => {
                            try {
                              await authService.updateAddress(address._id!, { isDefault: true });
                              setSuccess('Default address updated successfully');
                              fetchProfile();
                              setTimeout(() => setSuccess(''), 3000);
                            } catch (error: any) {
                              setError(error.response?.data?.message || 'Error setting default address');
                            }
                          }}
                          className="btn-set-default"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-addresses">No saved addresses</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Profile;