export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  realPrice?: number;
  image: string;
  images?: string[];
  category?: {
    _id: string;
    name: string;
  } | string;
  distributor?: {
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
  minQuantity?: number;
  maxQuantity?: number;
  acceptedPaymentMethods?: string[];
  isActive?: boolean;
}
