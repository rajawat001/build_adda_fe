import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiHash, FiBriefcase, FiCheck, FiShoppingBag, FiPackage, FiArrowLeft } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import SEO from '../components/SEO';
import { googleAuth, googleRegisterDistributor } from '../services/auth.service';
import { sendRegisterOTP, verifyRegisterOTP } from '../services/email-auth.service';
import OTPInput from '../components/common/OTPInput';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthIllustration from '../components/AuthIllustration';
import SuccessTruck from '../components/SuccessTruck';
import type { MapPickerLocation } from '../components/MapPicker';
import { getApiErrorMessage, scrollToError } from '../utils/api-error';

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

// Panel entrance with spring stagger
// 3D slide transition for wizard steps (used for steps 1 & 2 only; steps 3 & 4 use plain divs for Leaflet compat)
const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction * 60,
    rotateY: direction * 6,
  }),
  center: {
    opacity: 1,
    x: 0,
    rotateY: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -60,
    rotateY: direction * -6,
  }),
};

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
  const [formStep, setFormStep] = useState(1); // 1=Account, 2=Contact, 3=Location
  const [direction, setDirection] = useState(1); // 1=forward, -1=back
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
    gstNumber: '',
    location: { type: 'Point', coordinates: [0, 0] }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [otpError, setOtpError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [mapMounted, setMapMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);


  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    if (formData.role === 'distributor') {
      // Store credential and jump to distributor details step
      setGoogleCredential(credentialResponse.credential);
      setDirection(1);
      setFormStep(4); // Google distributor details step
      setError('');
      return;
    }

    // For buyer: create account directly
    setLoading(true);
    setError('');
    try {
      const response = await googleAuth(credentialResponse.credential);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify({
          _id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
        }));
        localStorage.setItem('role', response.user.role);
        window.dispatchEvent(new Event('userLogin'));
        setStep('success');
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Google sign-up failed. Please try again.'));
      scrollToError();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDistributorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate distributor fields
    const errors: ValidationErrors = {};
    if (!formData.businessName?.trim()) errors.businessName = 'Business name is required';
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;
    if (!formData.state?.trim()) errors.state = 'State is required';
    if (!formData.city?.trim()) errors.city = 'City is required';
    const pincodeError = validatePincode(formData.pincode);
    if (pincodeError) errors.pincode = pincodeError;
    const addressError = validateAddress(formData.address);
    if (addressError) errors.address = addressError;
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!googleCredential) {
      setError('Google session expired. Please try again.');
      setFormStep(1);
      return;
    }

    setLoading(true);
    try {
      const response = await googleRegisterDistributor({
        credential: googleCredential,
        businessName: formData.businessName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        gstNumber: formData.gstNumber || undefined,
        location: formData.location.coordinates[0] !== 0 ? formData.location : undefined,
      });

      if (response.user) {
        localStorage.setItem('user', JSON.stringify({
          _id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
        }));
        localStorage.setItem('role', response.user.role);
        window.dispatchEvent(new Event('userLogin'));
        setStep('success');
        setTimeout(() => router.push('/distributor/plan-selection'), 2000);
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
      scrollToError();
    } finally {
      setLoading(false);
    }
  };

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

  // Per-step validation
  const validateStep1 = (): boolean => {
    const errors: ValidationErrors = {};
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;
    if (formData.role === 'distributor' && !formData.businessName?.trim()) {
      errors.businessName = 'Business name is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: ValidationErrors = {};
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);
    if (emailError) errors.email = emailError;
    if (phoneError) errors.phone = phoneError;
    if (passwordError) errors.password = passwordError;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: ValidationErrors = {};
    if (!formData.state?.trim()) errors.state = 'State is required';
    if (!formData.city?.trim()) errors.city = 'City is required';
    const pincodeError = validatePincode(formData.pincode);
    const addressError = validateAddress(formData.address);
    if (pincodeError) errors.pincode = pincodeError;
    if (addressError) errors.address = addressError;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    let valid = false;
    if (formStep === 1) valid = validateStep1();
    else if (formStep === 2) valid = validateStep2();
    if (valid) {
      setDirection(1);
      setFormStep(prev => prev + 1);
      setError('');
    }
  };

  const handlePrevStep = () => {
    setDirection(-1);
    setFormStep(prev => prev - 1);
    setValidationErrors({});
    setError('');
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
    // Collapse the map after confirming location
    setShowMap(false);
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateStep3()) return;
    setLoading(true);

    try {
      await sendRegisterOTP(formData.email);
      setStep('verify');
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to send verification code. Please try again.'));
      scrollToError();
    } finally {
      setLoading(false);
    }
  };

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
        gstNumber: formData.gstNumber || undefined,
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

        setTimeout(() => {
          if (response.user.role === 'distributor') {
            router.push('/distributor/subscription');
          } else {
            router.push('/');
          }
        }, 2000);
      }
    } catch (err: any) {
      setOtpError(getApiErrorMessage(err, 'Verification failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendRegisterOTP(formData.email);
    } catch (err: any) {
      setOtpError(getApiErrorMessage(err, 'Failed to resend OTP.'));
    }
  };

  // 5-step progress: Account(1) -> Contact(2) -> Location(3) -> Verify(4) -> Done(5)
  // Google flow for distributor: Account(1) -> GoogleDistDetails(formStep=4 maps to step 3) -> Done(5)
  const getOverallStep = (): number => {
    if (step === 'details') {
      if (formStep === 4) return 3; // Google distributor details maps to Location step visually
      return Math.min(formStep, 3);
    }
    if (step === 'verify') return 4;
    return 5;
  };

  const getStepStatus = (s: number) => {
    const current = getOverallStep();
    if (s < current) return 'completed';
    if (s === current) return 'active';
    return '';
  };

  const handleRoleCardKeyDown = (e: React.KeyboardEvent, role: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (role === 'user') {
        setFormData({ ...formData, role: 'user', businessName: '' });
      } else {
        setFormData({ ...formData, role: 'distributor' });
      }
    }
  };

  const theme = formData.role === 'distributor' ? 'distributor' : 'user';
  const stepLabels = ['Account', 'Contact', 'Location', 'Verify', 'Done'];

  return (
    <>
      <SEO
        title="Register"
        description="Create your BuildAdda account. Join India's Premier Building Materials Marketplace as a buyer or distributor. Sign up now!"
        canonicalUrl="https://www.buildadda.in/register"
      />
      <Header />

      <div className="auth-layout">
        <AuthIllustration
          theme={theme}
          scene={theme === 'distributor' ? 'revenue' : 'bungalow'}
          title={theme === 'distributor' ? 'Grow your business' : 'Start building'}
          subtitle={theme === 'distributor' ? 'Sell building materials to thousands of buyers' : 'Shop quality building materials at the best prices'}
        />

        <div className="auth-form-panel register-panel">
          <div className="login-logo">
            <img src="/buildAddaBrandImage.png" alt="BuildAdda" />
          </div>

          <h1>Sign up</h1>
          <p className="auth-form-subtitle">
            Register as a member to experience
          </p>

          {/* 5-Step Progress */}
          <div className="step-progress">
            {stepLabels.map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && (
                  <div className={`step-connector ${getStepStatus(i + 1) === 'completed' || getStepStatus(i) === 'completed' ? 'completed' : ''}`} />
                )}
                <div className="step-item">
                  <div className={`step-circle ${getStepStatus(i + 1)}`}>
                    {getStepStatus(i + 1) === 'completed' ? '\u2713' : i + 1}
                  </div>
                  <span className={`step-label ${getStepStatus(i + 1)}`}>{label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            {step === 'details' && formStep === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ perspective: 1200 }}
              >
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
                  {/* Role Selector Cards */}
                  <div className="form-group">
                    <label>Register as</label>
                    <div className="role-selector">
                      <div
                        className={`role-card ${formData.role === 'user' ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'user', businessName: '' })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => handleRoleCardKeyDown(e, 'user')}
                      >
                        <div className="role-card-check"><FiCheck size={12} /></div>
                        <div className="role-card-icon"><FiShoppingBag size={22} /></div>
                        <p className="role-card-title">Buyer</p>
                        <p className="role-card-desc">Shop building materials</p>
                      </div>
                      <div
                        className={`role-card ${formData.role === 'distributor' ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'distributor' })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => handleRoleCardKeyDown(e, 'distributor')}
                      >
                        <div className="role-card-check"><FiCheck size={12} /></div>
                        <div className="role-card-icon"><FiPackage size={22} /></div>
                        <p className="role-card-title">Distributor</p>
                        <p className="role-card-desc">Sell your products</p>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="name">Full name</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left"><FiUser /></span>
                      <input
                        id="name" type="text" name="name" value={formData.name}
                        onChange={handleChange}
                        className={validationErrors.name ? 'input-error' : ''}
                        placeholder="Your full name"
                        autoComplete="name" required
                      />
                    </div>
                    {validationErrors.name && <span className="validation-error">{validationErrors.name}</span>}
                  </div>

                  <AnimatePresence>
                    {formData.role === 'distributor' && (
                      <motion.div
                        key="businessName"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="form-group">
                          <label htmlFor="businessName">Business name</label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><FiBriefcase /></span>
                            <input
                              id="businessName" type="text" name="businessName"
                              value={formData.businessName} onChange={handleChange}
                              className={validationErrors.businessName ? 'input-error' : ''}
                              placeholder="Your business name"
                              autoComplete="organization" required
                            />
                          </div>
                          {validationErrors.businessName && <span className="validation-error">{validationErrors.businessName}</span>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    className="btn-submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                  </motion.button>
                </form>

                  {/* Google Sign-Up Divider & Button */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    margin: '16px 0 12px',
                  }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-primary, #e5e7eb)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-primary, #e5e7eb)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google sign-up failed. Please try again.')}
                      theme="outline"
                      size="large"
                      shape="rectangular"
                      text="continue_with"
                      width={320}
                    />
                  </div>
              </motion.div>
            )}

            {step === 'details' && formStep === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ perspective: 1200 }}
              >
                <button type="button" className="btn-back-step" onClick={handlePrevStep}>
                  <FiArrowLeft size={16} /> Back
                </button>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left"><FiMail /></span>
                      <input
                        id="email" type="email" name="email" value={formData.email}
                        onChange={handleChange}
                        className={validationErrors.email ? 'input-error' : ''}
                        placeholder="you@example.com"
                        autoComplete="email" required
                      />
                    </div>
                    {validationErrors.email && <span className="validation-error">{validationErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone number</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left"><FiPhone /></span>
                      <input
                        id="phone" type="tel" name="phone" value={formData.phone}
                        onChange={handleChange}
                        className={validationErrors.phone ? 'input-error' : ''}
                        placeholder="10-digit mobile number"
                        autoComplete="tel" required
                      />
                    </div>
                    {validationErrors.phone && <span className="validation-error">{validationErrors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left"><FiLock /></span>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password} onChange={handleChange}
                        className={`${validationErrors.password ? 'input-error' : ''} ${showPassword ? 'password-input' : ''}`}
                        placeholder="Create a strong password"
                        autoComplete="new-password" required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {validationErrors.password && <span className="validation-error">{validationErrors.password}</span>}
                    <small className="field-hint">
                      8+ characters with uppercase, lowercase, number & special character
                    </small>
                  </div>

                  <motion.button
                    type="submit"
                    className="btn-submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                  </motion.button>
                </form>
              </motion.div>
            )}

            {step === 'details' && formStep === 3 && (
              <div key="step-3">
                <button type="button" className="btn-back-step" onClick={handlePrevStep}>
                  <FiArrowLeft size={16} /> Back
                </button>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmitDetails} noValidate>
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <select
                      id="state" name="state" value={formData.state}
                      onChange={handleStateChange}
                      className={validationErrors.state ? 'input-error' : ''} required
                    >
                      <option value="">Select state</option>
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
                      <option value="">Select city</option>
                      {availableCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {validationErrors.city && <span className="validation-error">{validationErrors.city}</span>}
                    {!formData.state && <small className="field-hint">Please select a state first</small>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="pincode">Pincode</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left"><FiHash /></span>
                      <input
                        id="pincode" type="text" name="pincode"
                        value={formData.pincode} onChange={handleChange}
                        className={validationErrors.pincode ? 'input-error' : ''}
                        placeholder="6-digit pincode" maxLength={6}
                        autoComplete="postal-code" required
                      />
                    </div>
                    {validationErrors.pincode && <span className="validation-error">{validationErrors.pincode}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Street address</label>
                    <textarea
                      id="address" name="address" value={formData.address}
                      onChange={handleChange}
                      className={validationErrors.address ? 'input-error' : ''}
                      placeholder="House/Flat no, Building, Street, Landmark"
                      autoComplete="street-address" rows={3} required
                    />
                    {validationErrors.address && <span className="validation-error">{validationErrors.address}</span>}
                  </div>

                  {formData.role === 'distributor' && (
                    <div className="form-group">
                      <label htmlFor="gstNumber">GST Number (optional)</label>
                      <div className="input-with-icon">
                        <span className="input-icon-left"><FiHash /></span>
                        <input
                          id="gstNumber" type="text" name="gstNumber"
                          value={formData.gstNumber}
                          onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                          placeholder="e.g. 08AABCU9603R1ZM"
                          maxLength={15}
                          autoComplete="off"
                        />
                      </div>
                      <small className="field-hint">15-character GSTIN (optional)</small>
                    </div>
                  )}

                  <div style={{ marginBottom: '0.75rem' }}>
                    {formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0 && !showMap && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 14px', borderRadius: '10px',
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        marginBottom: '10px', fontSize: '13px', color: '#166534',
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        <span style={{ flex: 1 }}>Location pinned successfully</span>
                        <button type="button" onClick={() => setShowMap(true)} style={{
                          background: 'none', border: 'none', color: '#2563eb',
                          fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0,
                          textDecoration: 'underline',
                        }}>Change</button>
                      </div>
                    )}
                    {!(formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0 && !showMap) && (
                      <button
                        type="button"
                        className="btn-map-toggle"
                        onClick={() => { setShowMap(!showMap); if (!showMap) setMapMounted(true); }}
                        style={{ marginBottom: showMap ? '10px' : 0, width: '100%' }}
                      >
                        {showMap ? 'Hide Map' : 'Pick Location on Map'}
                      </button>
                    )}
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
                          height="300px"
                          visible={showMap}
                        />
                      </div>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? <><span className="btn-spinner" />Sending verification...</> : 'Continue & verify email'}
                  </motion.button>
                </form>
              </div>
            )}

            {/* Google Distributor: Collect business details after Google auth */}
            {step === 'details' && formStep === 4 && (
              <div key="step-google-dist">
                <button type="button" className="btn-back-step" onClick={() => { setFormStep(1); setDirection(-1); setGoogleCredential(null); setValidationErrors({}); setError(''); }}>
                  <FiArrowLeft size={16} /> Back
                </button>

                <div style={{ background: 'var(--bg-secondary, #f0fdf4)', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCheck size={16} style={{ flexShrink: 0 }} />
                  <span>Google account connected. Complete your business details below.</span>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleGoogleDistributorSubmit} noValidate>
                  <div className="form-group">
                    <label htmlFor="gd-businessName">Business name</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left"><FiBriefcase /></span>
                      <input
                        id="gd-businessName" type="text" name="businessName"
                        value={formData.businessName} onChange={handleChange}
                        className={validationErrors.businessName ? 'input-error' : ''}
                        placeholder="Your business name" required
                      />
                    </div>
                    {validationErrors.businessName && <span className="validation-error">{validationErrors.businessName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gd-phone">Phone number</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left"><FiPhone /></span>
                      <input
                        id="gd-phone" type="tel" name="phone"
                        value={formData.phone} onChange={handleChange}
                        className={validationErrors.phone ? 'input-error' : ''}
                        placeholder="10-digit mobile number" required
                      />
                    </div>
                    {validationErrors.phone && <span className="validation-error">{validationErrors.phone}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label htmlFor="gd-state">State</label>
                      <select
                        id="gd-state" name="state" value={formData.state}
                        onChange={handleStateChange}
                        className={validationErrors.state ? 'input-error' : ''} required
                      >
                        <option value="">Select state</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {validationErrors.state && <span className="validation-error">{validationErrors.state}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="gd-city">City</label>
                      <select
                        id="gd-city" name="city" value={formData.city}
                        onChange={handleChange}
                        className={validationErrors.city ? 'input-error' : ''}
                        disabled={!formData.state} required
                      >
                        <option value="">Select city</option>
                        {availableCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      {validationErrors.city && <span className="validation-error">{validationErrors.city}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="gd-pincode">Pincode</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left"><FiHash /></span>
                      <input
                        id="gd-pincode" type="text" name="pincode"
                        value={formData.pincode} onChange={handleChange}
                        className={validationErrors.pincode ? 'input-error' : ''}
                        placeholder="6-digit pincode" maxLength={6} required
                      />
                    </div>
                    {validationErrors.pincode && <span className="validation-error">{validationErrors.pincode}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gd-address">Street address</label>
                    <textarea
                      id="gd-address" name="address" value={formData.address}
                      onChange={handleChange}
                      className={validationErrors.address ? 'input-error' : ''}
                      placeholder="House/Flat no, Building, Street, Landmark"
                      rows={3} required
                    />
                    {validationErrors.address && <span className="validation-error">{validationErrors.address}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gd-gstNumber">GST Number (optional)</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left"><FiHash /></span>
                      <input
                        id="gd-gstNumber" type="text" name="gstNumber"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g. 08AABCU9603R1ZM"
                        maxLength={15}
                        autoComplete="off"
                      />
                    </div>
                    <small className="field-hint">15-character GSTIN (optional)</small>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    {formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0 && !showMap && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 14px', borderRadius: '10px',
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        marginBottom: '10px', fontSize: '13px', color: '#166534',
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        <span style={{ flex: 1 }}>Location pinned successfully</span>
                        <button type="button" onClick={() => setShowMap(true)} style={{
                          background: 'none', border: 'none', color: '#2563eb',
                          fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0,
                          textDecoration: 'underline',
                        }}>Change</button>
                      </div>
                    )}
                    {!(formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0 && !showMap) && (
                      <button
                        type="button"
                        className="btn-map-toggle"
                        onClick={() => { setShowMap(!showMap); if (!showMap) setMapMounted(true); }}
                        style={{ marginBottom: showMap ? '10px' : 0, width: '100%' }}
                      >
                        {showMap ? 'Hide Map' : 'Pick Location on Map'}
                      </button>
                    )}
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
                          height="300px"
                          visible={showMap}
                        />
                      </div>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? <><span className="btn-spinner" />Creating account...</> : 'Complete Registration'}
                  </motion.button>
                </form>
              </div>
            )}

            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 50, rotateY: 5 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -50, rotateY: -5 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ perspective: 1200 }}
              >
                <button
                  className="btn-back"
                  onClick={() => { setStep('details'); setFormStep(3); setDirection(-1); setOtpError(''); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to details
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
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 18, stiffness: 120 }}
              >
                <div className="auth-success">
                  <div className="auth-success-icon">{'\u2713'}</div>
                  <h2>Registration successful!</h2>
                  <p>
                    {formData.role === 'distributor'
                      ? 'Your account is created. Redirecting to subscription...'
                      : 'Welcome to BuildAdda! Redirecting...'
                    }
                  </p>
                </div>
                <SuccessTruck color={formData.role === 'distributor' ? '#FF6B35' : '#2c3e50'} />
              </motion.div>
            )}
          </AnimatePresence>

          {step !== 'success' && (
            <p className="login-footer">
              Already a member? <Link href="/login">Sign in</Link>
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
