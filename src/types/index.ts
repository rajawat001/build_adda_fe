// Shared Product interface
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  realPrice?: number;
  image: string;
  images?: string[];
  category: string | { _id: string; name: string };
  distributor: {
    _id: string;
    businessName: string;
    city?: string;
    state?: string;
  };
  stock: number;
  unit?: string;
  unitType?: string;
  brand?: string;
  manufacturer?: string;
  origin?: string;
  material?: string;
  color?: string;
  weight?: string;
  warranty?: string;
  hsnCode?: string;
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
    dimensionUnit?: string;
  };
  specifications?: Array<{ key: string; value: string }>;
  isActive?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  acceptedPaymentMethods?: ('COD' | 'Online')[];
}

// Category interface
export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

// User interface
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'distributor' | 'admin';
  addresses?: Address[];
}

// Address interface
export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

// Order interface
export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  taxPercentage: number;
  deliveryCharge: number;
  totalAmount: number;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'Online' | 'COD';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  createdAt: string;
  updatedAt?: string;
}

// Order Item interface
export interface OrderItem {
  product: Product | string;
  quantity: number;
  price: number;
}

// Cart Item interface
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal?: number;
}