import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { sendRegisterOTP, verifyRegisterOTP } from '../services/email-auth.service';
import { getLocationDetails } from '../utils/location';
import OTPInput from '../components/common/OTPInput';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { MapPickerLocation } from '../components/MapPicker';

const MapPicker = dynamic(() => import('../components/MapPicker'), { ssr: false });

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  pincode?: string;
  address?: string;
  businessName?: string;
  city?: string;
  state?: string;
}

type RegisterStep = 'details' | 'verify' | 'success';

// Indian states and their cities
const indianStatesAndCities: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kakinada', 'Rajahmundry', 'Anantapur', 'Eluru'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Along', 'Tezu', 'Roing', 'Daporijo'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Goalpara'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Arrah', 'Begusarai', 'Katihar', 'Munger'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Dhamtari'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Canacona', 'Sanquelim', 'Cuncolim'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad'],
  'Haryana': ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'],
  'Himachal Pradesh': ['Shimla', 'Mandi', 'Solan', 'Dharamshala', 'Palampur', 'Kullu', 'Manali', 'Hamirpur', 'Una', 'Bilaspur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Phusro', 'Medininagar'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Kalaburagi', 'Davangere', 'Bellary', 'Vijayapura', 'Tumkur'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Malappuram', 'Kannur', 'Kottayam'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai'],
  'Manipur': ['Imphal', 'Thoubal', 'Kakching', 'Bishnupur', 'Churachandpur', 'Senapati', 'Ukhrul', 'Chandel', 'Tamenglong', 'Jiribam'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Williamnagar', 'Baghmara', 'Resubelpara', 'Mairang', 'Nongpoh', 'Cherrapunji'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Lawngtlai', 'Saiha', 'Mamit', 'Hnahthial', 'Khawzawl'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon', 'Phek', 'Kiphire', 'Longleng'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot', 'Moga', 'Batala'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Sikar', 'Sri Ganganagar'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo', 'Singtam', 'Jorethang', 'Nayabazar', 'Ravangla', 'Pelling'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Siddipet'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia', 'Ambassa', 'Khowai', 'Teliamura', 'Sabroom', 'Sonamura'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Ghaziabad', 'Noida', 'Bareilly', 'Aligarh'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Pithoragarh', 'Ramnagar', 'Mussoorie'],
  'West Bengal': ['Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur'],
  'Delhi': ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Dwarka', 'Rohini', 'Shahdara', 'Najafgarh'],
  'Chandigarh': ['Chandigarh'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
};

const indianStates = Object.keys(indianStatesAndCities).sort();

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>('details');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    businessName: '',
    pincode: '',
    address: '',
    city: '',
    state: '',
    location: { type: 'Point', coordinates: [0, 0] }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [otpError, setOtpError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [mapMounted, setMapMounted] = useState(false);

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
    if (!/^\d{6}$/.test(pincode)) return 'Pincode must be exactly 6 digits';
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

    if (!formData.state?.trim()) errors.state = 'State is required';
    if (!formData.city?.trim()) errors.city = 'City is required';

    if (formData.role === 'distributor') {
      if (!formData.businessName?.trim()) errors.businessName = 'Business name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = e.target.value;
    setFormData({ ...formData, state: selectedState, city: '' });
    setAvailableCities(selectedState ? indianStatesAndCities[selectedState] || [] : []);
    if (validationErrors.state) {
      setValidationErrors({ ...validationErrors, state: undefined, city: undefined });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors({ ...validationErrors, [name]: undefined });
    }
  };

  const handleGetLocation = async () => {
    try {
      setLoading(true);
      const locationDetails = await getLocationDetails();
      const matchedState = indianStates.find(
        s => s.toLowerCase() === locationDetails.state.toLowerCase()
      ) || '';
      const cities = matchedState ? indianStatesAndCities[matchedState] || [] : [];
      setAvailableCities(cities);
      const matchedCity = cities.find(
        c => c.toLowerCase() === locationDetails.city.toLowerCase()
      ) || '';

      setFormData({
        ...formData,
        location: {
          type: 'Point',
          coordinates: [locationDetails.coordinates.longitude, locationDetails.coordinates.latitude]
        },
        pincode: locationDetails.pincode,
        address: locationDetails.address,
        city: matchedCity,
        state: matchedState
      });

      if (matchedState && matchedCity) {
        alert(`Location captured successfully!\nPincode: ${locationDetails.pincode}\nCity: ${matchedCity}, ${matchedState}`);
      } else {
        alert(`Location captured!\nPincode: ${locationDetails.pincode}\nPlease select your state and city from the dropdowns.`);
      }
    } catch (error: any) {
      alert('Unable to get location. Please enable location services and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapLocationSelect = (loc: MapPickerLocation) => {
    const matchedState = indianStates.find(
      s => s.toLowerCase() === loc.state.toLowerCase()
    ) || '';
    const cities = matchedState ? indianStatesAndCities[matchedState] || [] : [];
    setAvailableCities(cities);
    const matchedCity = cities.find(
      c => c.toLowerCase() === loc.city.toLowerCase()
    ) || '';

    setFormData(prev => ({
      ...prev,
      address: loc.address,
      city: matchedCity || loc.city,
      state: matchedState || loc.state,
      pincode: loc.pincode,
      location: { type: 'Point', coordinates: [loc.lng, loc.lat] },
    }));
    setShowMap(false);
  };

  // Step 1: Validate form and send OTP
  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      await sendRegisterOTP(formData.email);
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleVerifyOTP = async (otp: string) => {
    setOtpError('');
    setLoading(true);

    try {
      const response = await verifyRegisterOTP({
        email: formData.email,
        otp,
        name: formData.name,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        businessName: formData.businessName,
        pincode: formData.pincode,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        location: formData.location
      });

      if (response.user) {
        localStorage.setItem('user', JSON.stringify({
          _id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role
        }));
        localStorage.setItem('role', response.user.role);
        window.dispatchEvent(new Event('userLogin'));
        setStep('success');

        // Auto-redirect after showing success
        setTimeout(() => {
          if (response.user.role === 'distributor') {
            router.push('/distributor/subscription');
          } else {
            router.push('/');
          }
        }, 2000);
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendRegisterOTP(formData.email);
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const getStepStatus = (s: number) => {
    const steps: Record<RegisterStep, number> = { details: 1, verify: 2, success: 3 };
    const current = steps[step];
    if (s < current) return 'completed';
    if (s === current) return 'active';
    return '';
  };

  return (
    <>
      <SEO
        title="Register"
        description="Create your BuildAdda account. Join India's Premier Building Materials Marketplace as a buyer or distributor. Sign up now!"
        canonicalUrl="https://www.buildadda.in/register"
      />
      <Header />

      <div className="login-page">
        <div className="login-container">
          <h1>Register at BuildAdda</h1>

          {/* Step Progress */}
          <div className="step-progress">
            <div className="step-item">
              <div className={`step-circle ${getStepStatus(1)}`}>
                {getStepStatus(1) === 'completed' ? '\u2713' : '1'}
              </div>
              <span className={`step-label ${getStepStatus(1)}`}>Details</span>
            </div>
            <div className={`step-connector ${getStepStatus(1) === 'completed' ? 'completed' : ''}`} />
            <div className="step-item">
              <div className={`step-circle ${getStepStatus(2)}`}>
                {getStepStatus(2) === 'completed' ? '\u2713' : '2'}
              </div>
              <span className={`step-label ${getStepStatus(2)}`}>Verify</span>
            </div>
            <div className={`step-connector ${getStepStatus(2) === 'completed' ? 'completed' : ''}`} />
            <div className="step-item">
              <div className={`step-circle ${getStepStatus(3)}`}>
                {getStepStatus(3) === 'completed' ? '\u2713' : '3'}
              </div>
              <span className={`step-label ${getStepStatus(3)}`}>Done</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmitDetails} noValidate>
                  <div className="form-group">
                    <label htmlFor="role">Register As</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange}>
                      <option value="user">User</option>
                      <option value="distributor">Distributor</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name" type="text" name="name" value={formData.name}
                      onChange={handleChange}
                      className={validationErrors.name ? 'input-error' : ''}
                      autoComplete="name" required
                    />
                    {validationErrors.name && <span className="validation-error">{validationErrors.name}</span>}
                  </div>

                  {formData.role === 'distributor' && (
                    <div className="form-group">
                      <label htmlFor="businessName">Business Name</label>
                      <input
                        id="businessName" type="text" name="businessName"
                        value={formData.businessName} onChange={handleChange}
                        className={validationErrors.businessName ? 'input-error' : ''}
                        autoComplete="organization" required
                      />
                      {validationErrors.businessName && <span className="validation-error">{validationErrors.businessName}</span>}
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email" type="email" name="email" value={formData.email}
                      onChange={handleChange}
                      className={validationErrors.email ? 'input-error' : ''}
                      autoComplete="email" required
                    />
                    {validationErrors.email && <span className="validation-error">{validationErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone" type="tel" name="phone" value={formData.phone}
                      onChange={handleChange}
                      className={validationErrors.phone ? 'input-error' : ''}
                      placeholder="10-digit mobile number"
                      autoComplete="tel" required
                    />
                    {validationErrors.phone && <span className="validation-error">{validationErrors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      id="password" type="password" name="password"
                      value={formData.password} onChange={handleChange}
                      className={validationErrors.password ? 'input-error' : ''}
                      autoComplete="new-password" required
                    />
                    {validationErrors.password && <span className="validation-error">{validationErrors.password}</span>}
                    <small className="field-hint">
                      Must be 8+ characters with uppercase, lowercase, number, and special character
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <select
                      id="state" name="state" value={formData.state}
                      onChange={handleStateChange}
                      className={validationErrors.state ? 'input-error' : ''} required
                    >
                      <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {validationErrors.state && <span className="validation-error">{validationErrors.state}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <select
                      id="city" name="city" value={formData.city}
                      onChange={handleChange}
                      className={validationErrors.city ? 'input-error' : ''}
                      disabled={!formData.state} required
                    >
                      <option value="">Select City</option>
                      {availableCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {validationErrors.city && <span className="validation-error">{validationErrors.city}</span>}
                    {!formData.state && <small className="field-hint">Please select a state first</small>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="pincode">Pincode</label>
                    <input
                      id="pincode" type="text" name="pincode"
                      value={formData.pincode} onChange={handleChange}
                      className={validationErrors.pincode ? 'input-error' : ''}
                      placeholder="6-digit pincode" maxLength={6}
                      autoComplete="postal-code" required
                    />
                    {validationErrors.pincode && <span className="validation-error">{validationErrors.pincode}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Street Address</label>
                    <textarea
                      id="address" name="address" value={formData.address}
                      onChange={handleChange}
                      className={validationErrors.address ? 'input-error' : ''}
                      placeholder="House/Flat no, Building, Street, Landmark"
                      autoComplete="street-address" rows={3} required
                    />
                    {validationErrors.address && <span className="validation-error">{validationErrors.address}</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <button type="button" className="btn-location" onClick={handleGetLocation} disabled={loading}>
                      Capture Current Location
                    </button>
                    <button
                      type="button"
                      className="btn-map-toggle"
                      onClick={() => {
                        const next = !showMap;
                        setShowMap(next);
                        if (next) setMapMounted(true);
                      }}
                    >
                      {showMap ? 'Hide Map' : 'Pick Location on Map'}
                    </button>
                  </div>

                  {mapMounted && (
                    <div style={showMap ? {} : { overflow: 'hidden', height: 0, opacity: 0, pointerEvents: 'none' as const }}>
                      <MapPicker
                        initialLat={
                          formData.location?.coordinates?.[1] && formData.location.coordinates[1] !== 0
                            ? formData.location.coordinates[1]
                            : undefined
                        }
                        initialLng={
                          formData.location?.coordinates?.[0] && formData.location.coordinates[0] !== 0
                            ? formData.location.coordinates[0]
                            : undefined
                        }
                        onLocationSelect={handleMapLocationSelect}
                        height="350px"
                        visible={showMap}
                      />
                    </div>
                  )}

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Sending Verification...' : 'Continue & Verify Email'}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  className="btn-back"
                  onClick={() => { setStep('details'); setOtpError(''); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to Details
                </button>

                <OTPInput
                  onComplete={handleVerifyOTP}
                  onResend={handleResendOTP}
                  error={otpError}
                  loading={loading}
                  email={formData.email}
                  purpose="register"
                />
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="auth-success">
                  <div className="auth-success-icon">{'\u2713'}</div>
                  <h2>Registration Successful!</h2>
                  <p>
                    {formData.role === 'distributor'
                      ? 'Your account is created. Redirecting to subscription...'
                      : 'Welcome to BuildAdda! Redirecting...'
                    }
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step !== 'success' && (
            <p className="login-footer">
              Already have an account? <Link href="/login">Login here</Link>
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
