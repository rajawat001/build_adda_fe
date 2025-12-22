import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO from '../components/SEO';
import { register } from '../services/auth.service';
import { getLocationDetails } from '../utils/location';

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  pincode?: string;
  address?: string;
  businessName?: string;
}

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    businessName: '',
    pincode: '',
    address: '',
    location: { type: 'Point', coordinates: [0, 0] }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateName = (name: string): string | null => {
    if (!name || !name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 100) return 'Name must not exceed 100 characters';
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) return 'Please enter a valid 10-digit Indian phone number';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    if (!/[@$!%*?&]/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
    return null;
  };

  const validatePincode = (pincode: string): string | null => {
    if (!pincode) return 'Pincode is required';
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) return 'Pincode must be exactly 6 digits';
    return null;
  };

  const validateAddress = (address: string): string | null => {
    if (!address || !address.trim()) return 'Address is required';
    if (address.trim().length < 10) return 'Address must be at least 10 characters';
    return null;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);
    const pincodeError = validatePincode(formData.pincode);
    const addressError = validateAddress(formData.address);

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (phoneError) errors.phone = phoneError;
    if (passwordError) errors.password = passwordError;
    if (pincodeError) errors.pincode = pincodeError;
    if (addressError) errors.address = addressError;

    // Validate business name for distributors
    if (formData.role === 'distributor') {
      const businessNameError = validateName(formData.businessName);
      if (businessNameError) errors.businessName = 'Business name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear validation error for this field
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined
      });
    }
  };

  const handleGetLocation = async () => {
    try {
      setLoading(true);
      const locationDetails = await getLocationDetails();

      setFormData({
        ...formData,
        location: {
          type: 'Point',
          coordinates: [locationDetails.coordinates.longitude, locationDetails.coordinates.latitude]
        },
        pincode: locationDetails.pincode,
        address: locationDetails.address
      });

      alert(`Location captured successfully!\nPincode: ${locationDetails.pincode}\nCity: ${locationDetails.city}, ${locationDetails.state}`);
    } catch (error: any) {
      console.error('Location error:', error);
      alert('Unable to get location. Please enable location services and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData);

      // SECURITY FIX: Don't store JWT token - it's in httpOnly cookie
      // Only store non-sensitive user data for UI purposes
      if (response.user) {
        localStorage.setItem('user', JSON.stringify({
          _id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role
        }));
        localStorage.setItem('role', response.user.role);

        // Trigger custom event to update header
        window.dispatchEvent(new Event('userLogin'));

        // Redirect based on role (user is now logged in automatically)
        if (response.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (response.user.role === 'distributor') {
          router.push('/distributor/dashboard');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          err.message ||
                          'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Register" />

      <div className="login-page">
        <div className="login-container">
          <h1>Register at BuildAdda</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="role">Register As</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={validationErrors.name ? 'input-error' : ''}
                autoComplete="name"
                required
              />
              {validationErrors.name && (
                <span className="validation-error">{validationErrors.name}</span>
              )}
            </div>

            {formData.role === 'distributor' && (
              <div className="form-group">
                <label htmlFor="businessName">Business Name</label>
                <input
                  id="businessName"
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={validationErrors.businessName ? 'input-error' : ''}
                  autoComplete="organization"
                  required
                />
                {validationErrors.businessName && (
                  <span className="validation-error">{validationErrors.businessName}</span>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={validationErrors.email ? 'input-error' : ''}
                autoComplete="email"
                required
              />
              {validationErrors.email && (
                <span className="validation-error">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={validationErrors.phone ? 'input-error' : ''}
                placeholder="10-digit mobile number"
                autoComplete="tel"
                required
              />
              {validationErrors.phone && (
                <span className="validation-error">{validationErrors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={validationErrors.password ? 'input-error' : ''}
                autoComplete="new-password"
                required
              />
              {validationErrors.password && (
                <span className="validation-error">{validationErrors.password}</span>
              )}
              <small className="field-hint">
                Must be 8+ characters with uppercase, lowercase, number, and special character
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className={validationErrors.pincode ? 'input-error' : ''}
                placeholder="6-digit pincode"
                maxLength={6}
                autoComplete="postal-code"
                required
              />
              {validationErrors.pincode && (
                <span className="validation-error">{validationErrors.pincode}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={validationErrors.address ? 'input-error' : ''}
                autoComplete="street-address"
                rows={3}
                required
              />
              {validationErrors.address && (
                <span className="validation-error">{validationErrors.address}</span>
              )}
            </div>

            <button type="button" className="btn-location" onClick={handleGetLocation}>
              📍 Capture Current Location
            </button>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="login-footer">
            Already have an account? <Link href="/login">Login here</Link>
          </p>
        </div>
      </div>
    </>
  );
}
