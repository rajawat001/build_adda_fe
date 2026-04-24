import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Button, Card } from '../../components/ui';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useIsMobile } from '../../hooks';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { searchCustomers, createCustomer, createManualOrder } from '../../services/manualOrder.service';
import {
  FiArrowLeft, FiSearch, FiPlus, FiTrash2, FiUser, FiPhone, FiMail,
  FiShoppingCart, FiCheck, FiX, FiMapPin, FiMinus,
} from 'react-icons/fi';

interface OfflineCustomer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  unit?: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

const CreateOrderPage = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Customer state
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<OfflineCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<OfflineCustomer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' });
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Order state
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Offline');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // GST state
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstType, setGstType] = useState<'intra' | 'inter'>('intra');
  const [gstRate, setGstRate] = useState(18);

  // Fetch distributor's products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/distributor/products?limit=200');
        setProducts(res.data?.products || []);
      } catch { /* ignore */ }
    };
    loadProducts();
  }, []);

  // Customer search with debounce
  const handleCustomerSearch = useCallback((value: string) => {
    setCustomerSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!value.trim()) {
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchCustomers(value);
        setCustomerResults(res.customers || []);
        setShowCustomerDropdown(true);
      } catch { /* ignore */ }
    }, 300);
  }, []);

  const selectCustomer = (customer: OfflineCustomer) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim() || !newCustomer.email.trim()) {
      toast.error('Name, phone and email are required');
      return;
    }
    try {
      const res = await createCustomer(newCustomer);
      const customer = res.customer;
      setSelectedCustomer(customer);
      setShowNewCustomerModal(false);
      setNewCustomer({ name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' });
      toast.success(res.message || 'Customer created');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create customer');
    }
  };

  // Product helpers
  const filteredProducts = products.filter(p => {
    if (!productSearch.trim()) return true;
    return p.name.toLowerCase().includes(productSearch.toLowerCase());
  }).filter(p => !orderItems.some(item => item.product._id === p._id));

  const addProduct = (product: Product) => {
    setOrderItems(prev => [...prev, { product, quantity: 1, price: product.price }]);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const removeItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, qty: number) => {
    setOrderItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: Math.max(1, qty) } : item));
  };

  const updateItemPrice = (index: number, price: number) => {
    setOrderItems(prev => prev.map((item, i) => i === index ? { ...item, price: Math.max(0, price) } : item));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // GST calculation
  const gstAmount = gstEnabled ? Math.round(subtotal * gstRate / 100 * 100) / 100 : 0;
  const cgstAmount = gstEnabled && gstType === 'intra' ? Math.round(subtotal * (gstRate / 2) / 100 * 100) / 100 : 0;
  const sgstAmount = gstEnabled && gstType === 'intra' ? Math.round(subtotal * (gstRate / 2) / 100 * 100) / 100 : 0;
  const igstAmount = gstEnabled && gstType === 'inter' ? Math.round(subtotal * gstRate / 100 * 100) / 100 : 0;

  const total = Math.round((subtotal + gstAmount + deliveryCharge) * 100) / 100;

  const handleSubmit = async () => {
    if (!selectedCustomer) { toast.error('Please select a customer'); return; }
    if (orderItems.length === 0) { toast.error('Please add at least one product'); return; }

    setSubmitting(true);
    try {
      const res = await createManualOrder({
        offlineCustomerId: selectedCustomer._id,
        items: orderItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod,
        deliveryCharge,
        notes,
        gst: gstEnabled ? { enabled: true, gstType, gstRate } : undefined,
        shippingAddress: selectedCustomer.address ? {
          fullName: selectedCustomer.name,
          phone: selectedCustomer.phone,
          address: selectedCustomer.address,
          city: selectedCustomer.city || 'N/A',
          state: selectedCustomer.state || 'N/A',
          pincode: selectedCustomer.pincode || '000000',
        } : undefined,
      });
      toast.success('Order created successfully!');
      router.push('/distributor/manual-orders');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DistributorLayout title="Create Manual Order">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <FiArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Create Manual Order
          </h1>
        </div>

        {/* Step 1: Customer Selection */}
        <Card className={`${isMobile ? 'p-3' : 'p-4'} mb-4`}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiUser size={16} /> Customer
          </h3>

          {selectedCustomer ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedCustomer.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  <FiPhone size={11} style={{ marginRight: 4 }} />{selectedCustomer.phone}
                  {selectedCustomer.email && <span style={{ marginLeft: 12 }}><FiMail size={11} style={{ marginRight: 4 }} />{selectedCustomer.email}</span>}
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <FiX size={18} />
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <FiSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="Search by name, phone, or email..."
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onFocus={() => customerSearch.trim() && setShowCustomerDropdown(true)}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <Button onClick={() => setShowNewCustomerModal(true)} leftIcon={<FiPlus />} size={isMobile ? 'sm' : 'md'}>
                  New
                </Button>
              </div>

              {/* Search Results Dropdown */}
              {showCustomerDropdown && customerResults.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 4, maxHeight: 240, overflow: 'auto'
                }}>
                  {customerResults.map(c => (
                    <div key={c._id} onClick={() => selectCustomer(c)}
                      style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-primary)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {c.phone} {c.email && `• ${c.email}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Step 2: Add Products */}
        <Card className={`${isMobile ? 'p-3' : 'p-4'} mb-4`}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiShoppingCart size={16} /> Products
          </h3>

          {/* Product Search */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <FiSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
              onFocus={() => setShowProductDropdown(true)}
              onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
            {showProductDropdown && filteredProducts.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 4, maxHeight: 200, overflow: 'auto'
              }}>
                {filteredProducts.slice(0, 10).map(p => (
                  <div key={p._id} onMouseDown={() => addProduct(p)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Stock: {p.stock} {p.unit || ''}</div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary-color)' }}>₹{p.price.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Items */}
          {orderItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
              No products added yet. Search and add products above.
            </div>
          ) : (
            <div>
              {/* Header */}
              {!isMobile && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 100px 40px', gap: 8, padding: '8px 0', borderBottom: '2px solid var(--border-primary)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span>Product</span>
                  <span style={{ textAlign: 'center' }}>Qty</span>
                  <span style={{ textAlign: 'right' }}>Price (₹)</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                  <span />
                </div>
              )}

              {orderItems.map((item, i) => (
                <div key={item.product._id} style={{
                  display: isMobile ? 'flex' : 'grid',
                  gridTemplateColumns: isMobile ? undefined : '1fr 100px 120px 100px 40px',
                  flexDirection: isMobile ? 'column' : undefined,
                  gap: 8,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-primary)',
                  alignItems: isMobile ? 'stretch' : 'center'
                }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{item.product.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: isMobile ? 'flex-start' : 'center' }}>
                    {isMobile && <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginRight: 8 }}>Qty:</span>}
                    <button onClick={() => updateItemQuantity(i, item.quantity - 1)} style={{ width: 28, height: 28, border: '1px solid var(--border-primary)', borderRadius: 4, background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiMinus size={12} />
                    </button>
                    <input type="number" value={item.quantity} onChange={(e) => updateItemQuantity(i, parseInt(e.target.value) || 1)}
                      style={{ width: 50, textAlign: 'center', padding: '4px', border: '1px solid var(--border-primary)', borderRadius: 4, fontSize: 13, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                    <button onClick={() => updateItemQuantity(i, item.quantity + 1)} style={{ width: 28, height: 28, border: '1px solid var(--border-primary)', borderRadius: 4, background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiPlus size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                    {isMobile && <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginRight: 8 }}>Price:</span>}
                    <input type="number" value={item.price} onChange={(e) => updateItemPrice(i, parseFloat(e.target.value) || 0)}
                      style={{ width: 90, textAlign: 'right', padding: '4px 8px', border: '1px solid var(--border-primary)', borderRadius: 4, fontSize: 13, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                  </div>
                  <div style={{ textAlign: isMobile ? 'left' : 'right', fontWeight: 600, fontSize: 13 }}>
                    {isMobile && <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginRight: 8, fontWeight: 400 }}>Total:</span>}
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                  <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, alignSelf: isMobile ? 'flex-end' : 'center', marginTop: isMobile ? -40 : 0 }}>
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Step 3: GST & Order Summary */}
        <Card className={`${isMobile ? 'p-3' : 'p-4'} mb-4`}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Order Summary</h3>

          {/* GST Toggle */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: gstEnabled ? 12 : 0 }}>
              <input type="checkbox" checked={gstEnabled} onChange={(e) => setGstEnabled(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#ff6b35' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Apply GST</span>
            </label>

            {gstEnabled && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>GST Type</label>
                  <select value={gstType} onChange={(e) => setGstType(e.target.value as 'intra' | 'inter')}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 13, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value="intra">Intra-State (CGST + SGST)</option>
                    <option value="inter">Inter-State (IGST)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>GST Rate (%)</label>
                  <select value={gstRate} onChange={(e) => setGstRate(parseFloat(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 13, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <option value="Offline">Offline (Paid)</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Delivery Charge (₹)</label>
              <input type="number" value={deliveryCharge} onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)} min="0"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any notes for this order..."
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }} />
          </div>

          {/* Totals */}
          <div style={{ marginTop: 16, borderTop: '2px solid var(--border-primary)', paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({orderItems.length} items)</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {gstEnabled && gstType === 'intra' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>CGST ({gstRate / 2}%)</span>
                  <span>₹{cgstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>SGST ({gstRate / 2}%)</span>
                  <span>₹{sgstAmount.toLocaleString('en-IN')}</span>
                </div>
              </>
            )}
            {gstEnabled && gstType === 'inter' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>IGST ({gstRate}%)</span>
                <span>₹{igstAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {deliveryCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery</span>
                <span>₹{deliveryCharge.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, paddingTop: 8, borderTop: '1px solid var(--border-primary)' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary-color)' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          isLoading={submitting}
          disabled={!selectedCustomer || orderItems.length === 0 || submitting}
          leftIcon={<FiCheck />}
          className="w-full"
        >
          Create Order — ₹{total.toLocaleString('en-IN')}
        </Button>
      </div>

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowNewCustomerModal(false)}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, width: '90%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              New Customer
              <button onClick={() => setShowNewCustomerModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <FiX size={20} />
              </button>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Name *" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                style={{ padding: '10px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              <input placeholder="Phone (10 digits) *" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} maxLength={10}
                style={{ padding: '10px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              <input placeholder="Email *" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                style={{ padding: '10px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              <input placeholder="Address (optional)" value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                style={{ padding: '10px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input placeholder="City" value={newCustomer.city} onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  style={{ padding: '10px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                <input placeholder="Pincode" value={newCustomer.pincode} onChange={(e) => setNewCustomer({ ...newCustomer, pincode: e.target.value })} maxLength={6}
                  style={{ padding: '10px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Button variant="secondary" onClick={() => setShowNewCustomerModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleCreateCustomer} leftIcon={<FiCheck />} className="flex-1">Create</Button>
            </div>
          </div>
        </div>
      )}
    </DistributorLayout>
  );
};

export default CreateOrderPage;
