import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { createOrder, verifyPayment } from '../services/order.service';
import authService from '../services/auth.service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

export default function Checkout() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    couponCode: '',
    paymentMethod: 'COD'
  });
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [addressError, setAddressError] = useState<string>('');
  const [addressFieldErrors, setAddressFieldErrors] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      router.push('/cart');
      return;
    }

    console.log('Cart items:', cart);
    console.log('First item distributor:', cart[0]?.distributor);

    setCartItems(cart);

    // Fetch user profile to get saved addresses
    fetchUserProfile();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.user && response.user.addresses) {
        setSavedAddresses(response.user.addresses);
        setIsAuthenticated(true);

        // Auto-select default address
        const defaultAddress = response.user.addresses.find((addr: Address) => addr.isDefault);
        if (defaultAddress && defaultAddress._id) {
          setSelectedAddressId(defaultAddress._id);
          updateFormDataFromAddress(defaultAddress);
        }
      }
    } catch (error: any) {
      // User not authenticated, they can still checkout with manual address entry
      setIsAuthenticated(false);
      console.log('User not authenticated, proceeding with manual address entry');
    }
  };

  const updateFormDataFromAddress = (address: Address) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode
      }
    }));
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selected = savedAddresses.find(addr => addr._id === addressId);
    if (selected) {
      updateFormDataFromAddress(selected);
    }
  };

  const validateNewAddress = () => {
    const errors = {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    };

    let isValid = true;

    if (!newAddress.fullName || newAddress.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
      isValid = false;
    }

    if (!newAddress.phone || !/^[6-9]\d{9}$/.test(newAddress.phone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number';
      isValid = false;
    }

    if (!newAddress.address || newAddress.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters';
      isValid = false;
    }

    if (!newAddress.city || newAddress.city.trim().length < 2) {
      errors.city = 'City is required';
      isValid = false;
    }

    if (!newAddress.state || newAddress.state.trim().length < 2) {
      errors.state = 'State is required';
      isValid = false;
    }

    if (!newAddress.pincode || !/^\d{6}$/.test(newAddress.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode';
      isValid = false;
    }

    setAddressFieldErrors(errors);
    return isValid;
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');

    if (!validateNewAddress()) {
      setAddressError('Please fix the errors below');
      return;
    }

    try {
      await authService.addAddress(newAddress);
      setAddressError('');
      await fetchUserProfile();
      setShowAddressForm(false);
      setNewAddress({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
      setAddressFieldErrors({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      });
    } catch (error: any) {
      setAddressError(error.response?.data?.error || error.response?.data?.message || 'Error adding address');
    }
  };

  const handleEditAddress = async (addressId: string) => {
    const address = savedAddresses.find(addr => addr._id === addressId);
    if (address) {
      setNewAddress(address);
      setShowAddressForm(true);
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress._id) return;

    setAddressError('');

    if (!validateNewAddress()) {
      setAddressError('Please fix the errors below');
      return;
    }

    try {
      await authService.updateAddress(newAddress._id, newAddress);
      setAddressError('');
      await fetchUserProfile();
      setShowAddressForm(false);
      setNewAddress({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
      setAddressFieldErrors({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      });
    } catch (error: any) {
      setAddressError(error.response?.data?.error || error.response?.data?.message || 'Error updating address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await authService.deleteAddress(addressId);
      alert('Address deleted successfully');
      await fetchUserProfile();
      if (selectedAddressId === addressId) {
        setSelectedAddressId('');
        setFormData(prev => ({
          ...prev,
          shippingAddress: {
            fullName: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            pincode: ''
          }
        }));
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting address');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await authService.updateAddress(addressId, { isDefault: true });
      alert('Default address updated');
      await fetchUserProfile();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error setting default address');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle nested shippingAddress fields
    if (['fullName', 'phone', 'address', 'city', 'state', 'pincode'].includes(name)) {
      setFormData({
        ...formData,
        shippingAddress: {
          ...formData.shippingAddress,
          [name]: value
        }
      });
    } else {
      // Handle other fields (paymentMethod, couponCode)
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const getTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal - discount;
  };

  const applyCoupon = async () => {
    // Call API to validate coupon
    // For now, mock implementation
    if (formData.couponCode === 'SAVE10') {
      setDiscount(getTotal() * 0.1);
      alert('Coupon applied! 10% discount');
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleRazorpayPayment = async (orderId: string, amount: number) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'INR',
      name: 'BuildAdda',
      description: 'Building Materials Purchase',
      order_id: orderId,
      handler: async (response: any) => {
        try {
          await verifyPayment({
            orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          
          localStorage.removeItem('cart');
          router.push('/order-success');
        } catch (error) {
          router.push('/order-failure');
        }
      },
      prefill: {
        email: localStorage.getItem('userEmail'),
        contact: formData.shippingAddress.phone
      },
      theme: {
        color: '#3399cc'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get distributor from first item (assuming all items from same distributor)
      const distributor = cartItems[0]?.distributor?._id || cartItems[0]?.distributor;

      // Validation checks
      if (!distributor) {
        const clearCart = confirm(
          'Product distributor information is missing from your cart items.\n\n' +
          'This happens when cart items are outdated.\n\n' +
          'Click OK to clear your cart and start fresh, or Cancel to go back.'
        );

        if (clearCart) {
          localStorage.removeItem('cart');
          router.push('/products');
        }

        setLoading(false);
        return;
      }

      if (!formData.paymentMethod) {
        alert('Please select a payment method');
        setLoading(false);
        return;
      }

      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
        totalAmount: getTotal(),
        couponCode: formData.couponCode,
        distributor: distributor
      };

      console.log('Submitting order data:', orderData);

      const response = await createOrder(orderData);

      if (formData.paymentMethod === 'Online') {
        await handleRazorpayPayment(response.orderId, response.amount);
      } else {
        localStorage.removeItem('cart');
        router.push('/order-success');
      }
    } catch (error) {
      alert('Order creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Checkout" />
      <Header />
      
      <main className="checkout-page">
        <div className="container">
          <h1>Checkout</h1>
          
          <div className="checkout-content">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <h2>Shipping Details</h2>

              {isAuthenticated && savedAddresses.length > 0 && (
                <div className="saved-addresses-section">
                  <h3>Select Delivery Address</h3>
                  <div className="addresses-grid">
                    {savedAddresses.map((address) => (
                      <div
                        key={address._id}
                        className={`address-card-checkout ${selectedAddressId === address._id ? 'selected' : ''}`}
                        onClick={() => handleAddressSelect(address._id!)}
                      >
                        {address.isDefault && <span className="default-badge">Default</span>}
                        <div className="address-content">
                          <p className="address-name">{address.fullName}</p>
                          <p>{address.phone}</p>
                          <p>{address.address}</p>
                          <p>{address.city}, {address.state} - {address.pincode}</p>
                        </div>
                        <div className="address-actions-checkout">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address._id!);
                            }}
                            className="btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address._id!);
                            }}
                            className="btn-delete"
                          >
                            Delete
                          </button>
                          {!address.isDefault && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefaultAddress(address._id!);
                              }}
                              className="btn-set-default"
                            >
                              Set Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(!showAddressForm);
                      setNewAddress({
                        fullName: '',
                        phone: '',
                        address: '',
                        city: '',
                        state: '',
                        pincode: '',
                        isDefault: false
                      });
                    }}
                    className="btn-add-address"
                  >
                    {showAddressForm ? 'Cancel' : '+ Add New Address'}
                  </button>
                </div>
              )}

              {showAddressForm && isAuthenticated && (
                <form className="new-address-form" onSubmit={newAddress._id ? handleUpdateAddress : handleAddNewAddress}>
                  <h3>{newAddress._id ? 'Edit Address' : 'Add New Address'}</h3>

                  {addressError && <div className="error-message" style={{marginBottom: '1rem'}}>{addressError}</div>}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={newAddress.fullName}
                        onChange={(e) => {
                          setNewAddress({ ...newAddress, fullName: e.target.value });
                          setAddressFieldErrors({...addressFieldErrors, fullName: ''});
                        }}
                        className={addressFieldErrors.fullName ? 'input-error' : ''}
                      />
                      {addressFieldErrors.fullName && <span className="validation-error">{addressFieldErrors.fullName}</span>}
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) => {
                          setNewAddress({ ...newAddress, phone: e.target.value });
                          setAddressFieldErrors({...addressFieldErrors, phone: ''});
                        }}
                        placeholder="10-digit number"
                        className={addressFieldErrors.phone ? 'input-error' : ''}
                      />
                      {addressFieldErrors.phone && <span className="validation-error">{addressFieldErrors.phone}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address * (minimum 10 characters)</label>
                    <textarea
                      value={newAddress.address}
                      onChange={(e) => {
                        setNewAddress({ ...newAddress, address: e.target.value });
                        setAddressFieldErrors({...addressFieldErrors, address: ''});
                      }}
                      placeholder="House/Flat no, Building, Street, Landmark"
                      className={addressFieldErrors.address ? 'input-error' : ''}
                    />
                    {addressFieldErrors.address && <span className="validation-error">{addressFieldErrors.address}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => {
                          setNewAddress({ ...newAddress, city: e.target.value });
                          setAddressFieldErrors({...addressFieldErrors, city: ''});
                        }}
                        className={addressFieldErrors.city ? 'input-error' : ''}
                      />
                      {addressFieldErrors.city && <span className="validation-error">{addressFieldErrors.city}</span>}
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => {
                          setNewAddress({ ...newAddress, state: e.target.value });
                          setAddressFieldErrors({...addressFieldErrors, state: ''});
                        }}
                        className={addressFieldErrors.state ? 'input-error' : ''}
                      />
                      {addressFieldErrors.state && <span className="validation-error">{addressFieldErrors.state}</span>}
                    </div>
                    <div className="form-group">
                      <label>Pincode *</label>
                      <input
                        type="text"
                        value={newAddress.pincode}
                        onChange={(e) => {
                          setNewAddress({ ...newAddress, pincode: e.target.value });
                          setAddressFieldErrors({...addressFieldErrors, pincode: ''});
                        }}
                        placeholder="6 digits"
                        className={addressFieldErrors.pincode ? 'input-error' : ''}
                      />
                      {addressFieldErrors.pincode && <span className="validation-error">{addressFieldErrors.pincode}</span>}
                    </div>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      />
                      Set as default address
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="btn-save-address"
                  >
                    {newAddress._id ? 'Update Address' : 'Save Address'}
                  </button>
                </form>
              )}

              {(!isAuthenticated || savedAddresses.length === 0 || !selectedAddressId) && !showAddressForm && (
                <>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.shippingAddress.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.shippingAddress.phone}
                      onChange={handleChange}
                      required
                      placeholder="10-digit phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Address *</label>
                    <textarea
                      name="address"
                      value={formData.shippingAddress.address}
                      onChange={handleChange}
                      required
                      placeholder="Street address, building, apartment, etc."
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.shippingAddress.city}
                      onChange={handleChange}
                      required
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.shippingAddress.state}
                      onChange={handleChange}
                      required
                      placeholder="State"
                    />
                  </div>

                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.shippingAddress.pincode}
                      onChange={handleChange}
                      required
                      placeholder="6-digit pincode"
                    />
                  </div>
                </>
              )}

              <h2>Payment Method</h2>
              
              <div className="form-group">
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="Online">Razorpay (Online Payment)</option>
                  <option value="COD">Cash on Delivery</option>
                </select>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>

            <div className="order-summary">
              <h2>Order Summary</h2>
              
              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="summary-item">
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="coupon-section">
                <input
                  type="text"
                  name="couponCode"
                  placeholder="Enter coupon code"
                  value={formData.couponCode}
                  onChange={handleChange}
                />
                <button type="button" onClick={applyCoupon}>Apply</button>
              </div>

              {discount > 0 && (
                <div className="summary-row">
                  <span>Discount:</span>
                  <span className="discount">-₹{discount}</span>
                </div>
              )}

              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{getTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}