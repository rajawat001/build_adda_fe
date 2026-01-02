// Shared Product interface
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: string | { _id: string; name: string };
  distributor: {
    _id: string;
    businessName: string;
  };
  stock: number;
  unit?: string;
  isActive?: boolean;
}

// Category interface
export interface Category {
  _id: string;
  name: string;
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