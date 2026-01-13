import api from './api';

export const getProducts = async (params?: any) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getAllProducts = async (params?: any) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getProductsByDistributor = async (distributorId: string) => {
  const response = await api.get(`/products/distributor/${distributorId}`);
  return response.data;
};

export const getProductsByCategory = async (category: string) => {
  const response = await api.get(`/products/category/${category}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};

export const createProduct = async (data: any) => {
  const response = await api.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: any) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Wishlist
export const getWishlist = async () => {
  const response = await api.get('/products/wishlist');
  return response.data;
};

export const addToWishlist = async (productId: string) => {
  const response = await api.post('/products/wishlist', { productId });
  return response.data;
};

export const removeFromWishlist = async (productId: string) => {
  const response = await api.delete(`/products/wishlist/${productId}`);
  return response.data;
};

// Cart
export const getCart = async () => {
  const response = await api.get('/products/cart');
  return response.data;
};

export const addToCart = async (productId: string, quantity: number) => {
  const response = await api.post('/products/cart', { productId, quantity });
  return response.data;
};

export const updateCartItem = async (productId: string, quantity: number) => {
  const response = await api.put(`/products/cart/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId: string) => {
  const response = await api.delete(`/products/cart/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/products/cart');
  return response.data;
};

// Export as default object for compatibility
const productService = {
  getProducts,
  getAllProducts,
  getProductById,
  getProductsByDistributor,
  getProductsByCategory,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

export default productService;