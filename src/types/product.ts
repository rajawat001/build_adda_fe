export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;        // ✅ REQUIRED (important)
  images?: string[];
  category?: {
    _id: string;
    name: string;
  };
  distributor?: {
    _id: string;
    businessName: string;
  };
  stock: number;
}
