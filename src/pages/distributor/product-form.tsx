import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Button, Card, Badge, Loading } from '../../components/ui';
import { FiUpload, FiX, FiCheck, FiImage, FiArrowLeft, FiCamera } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks';
import api from '../../services/api';

interface ProductFormData {
  name: string;
  description: string;
  realPrice: string;
  price: string;
  category: string;
  stock: string;
  unit: string;
  minQuantity: string;
  maxQuantity: string;
  acceptedPaymentMethods: string[];
  image: File | null;
}

const ProductForm = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { id } = router.query;
  const isEditing = !!id;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    realPrice: '',
    price: '',
    category: '',
    stock: '',
    unit: 'unit',
    minQuantity: '1',
    maxQuantity: '',
    acceptedPaymentMethods: ['COD', 'Online'],
    image: null,
  });

  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setFetchingProduct(true);
      const response = await api.get(`/distributor/products`);
      const product = response.data.products.find((p: any) => p._id === id);

      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          realPrice: product.realPrice ? product.realPrice.toString() : '',
          price: product.price.toString(),
          category: product.category,
          stock: product.stock.toString(),
          unit: product.unit || 'unit',
          minQuantity: (product.minQuantity || 1).toString(),
          maxQuantity: product.maxQuantity ? product.maxQuantity.toString() : '',
          acceptedPaymentMethods: product.acceptedPaymentMethods || ['COD', 'Online'],
          image: null,
        });
        setExistingImageUrl(product.image || '');
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error(error.response?.data?.message || 'Failed to load product');
    } finally {
      setFetchingProduct(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
      toast.success('Image uploaded successfully');
    }
  }, [formData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
  });

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview('');
    toast.info('Image removed');
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Selling price must be greater than 0';
    }
    if (formData.realPrice && parseFloat(formData.realPrice) < parseFloat(formData.price)) {
      newErrors.realPrice = 'MRP must be greater than or equal to selling price';
    }
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be 0 or greater';
    }
    if (formData.acceptedPaymentMethods.length === 0) {
      newErrors.paymentMethods = 'Select at least one payment method';
    }
    if (formData.maxQuantity && parseInt(formData.maxQuantity) < parseInt(formData.minQuantity)) {
      newErrors.maxQuantity = 'Max quantity must be greater than min quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix all validation errors');
      return;
    }

    setLoading(true);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    if (formData.realPrice) {
      submitData.append('realPrice', formData.realPrice);
    }
    submitData.append('category', formData.category);
    submitData.append('stock', formData.stock);
    submitData.append('unit', formData.unit);
    submitData.append('minQuantity', formData.minQuantity);
    if (formData.maxQuantity) {
      submitData.append('maxQuantity', formData.maxQuantity);
    }
    submitData.append('acceptedPaymentMethods', JSON.stringify(formData.acceptedPaymentMethods));
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    try {
      if (isEditing) {
        await api.put(`/distributor/products/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/distributor/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product added successfully');
      }
      router.push('/distributor/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodToggle = (method: string) => {
    if (formData.acceptedPaymentMethods.includes(method)) {
      setFormData({
        ...formData,
        acceptedPaymentMethods: formData.acceptedPaymentMethods.filter((m) => m !== method),
      });
    } else {
      setFormData({
        ...formData,
        acceptedPaymentMethods: [...formData.acceptedPaymentMethods, method],
      });
    }
  };

  if (fetchingProduct) {
    return (
      <DistributorLayout title={isEditing ? 'Edit Product' : 'Add Product'}>
        <Loading fullScreen text="Loading product..." />
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title={isEditing ? 'Edit Product' : 'Add Product'}>
      <div className={`max-w-4xl space-y-4 md:space-y-6 ${isMobile ? 'pb-24' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-[var(--text-primary)]`}>
              {isEditing ? 'Edit Product' : isMobile ? 'New Product' : 'Add New Product'}
            </h1>
            {!isMobile && (
              <p className="text-[var(--text-secondary)] mt-1">
                {isEditing ? 'Update product information' : 'Fill in the details to add a new product'}
              </p>
            )}
          </div>
          {!isMobile && (
            <Button variant="secondary" leftIcon={<FiArrowLeft />} onClick={() => router.back()}>
              Back
            </Button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className={isMobile ? 'p-4' : ''}>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)] mb-4`}>
                  Basic Information
                </h3>
                <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Product Name <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                      className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border ${
                        errors.name ? 'border-[var(--error)]' : 'border-[var(--border-primary)]'
                      } rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                    />
                    {errors.name && <p className="text-[var(--error)] text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Description <span className="text-[var(--error)]">*</span>
                    </label>
                    <textarea
                      rows={isMobile ? 3 : 4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter product description"
                      className={`w-full px-4 ${isMobile ? 'py-3' : 'py-2'} bg-[var(--bg-primary)] border ${
                        errors.description ? 'border-[var(--error)]' : 'border-[var(--border-primary)]'
                      } rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                    />
                    {errors.description && <p className="text-[var(--error)] text-sm mt-1">{errors.description}</p>}
                  </div>

                  {/* Real Price (MRP) */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      MRP / Real Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={formData.realPrice}
                      onChange={(e) => setFormData({ ...formData, realPrice: e.target.value })}
                      placeholder="Original price (optional)"
                      className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border ${
                        errors.realPrice ? 'border-[var(--error)]' : 'border-[var(--border-primary)]'
                      } rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                    />
                    {errors.realPrice && <p className="text-[var(--error)] text-sm mt-1">{errors.realPrice}</p>}
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Leave empty if no discount</p>
                  </div>

                  {/* Selling / Offer Price */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Selling / Offer Price (₹) <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border ${
                        errors.price ? 'border-[var(--error)]' : 'border-[var(--border-primary)]'
                      } rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                    />
                    {errors.price && <p className="text-[var(--error)] text-sm mt-1">{errors.price}</p>}
                    {formData.realPrice && formData.price && parseFloat(formData.realPrice) > parseFloat(formData.price) && (
                      <p className="text-xs font-semibold text-[var(--success)] mt-1">
                        {Math.round(((parseFloat(formData.realPrice) - parseFloat(formData.price)) / parseFloat(formData.realPrice)) * 100)}% OFF
                      </p>
                    )}
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Stock <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border ${
                        errors.stock ? 'border-[var(--error)]' : 'border-[var(--border-primary)]'
                      } rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                    />
                    {errors.stock && <p className="text-[var(--error)] text-sm mt-1">{errors.stock}</p>}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Category <span className="text-[var(--error)]">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border ${
                        errors.category ? 'border-[var(--error)]' : 'border-[var(--border-primary)]'
                      } rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                    >
                      <option value="">Select Category</option>
                      <option value="Cement">Cement</option>
                      <option value="Steel">Steel</option>
                      <option value="Bricks">Bricks</option>
                      <option value="Sand">Sand</option>
                      <option value="Paint">Paint</option>
                      <option value="Tiles">Tiles</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.category && <p className="text-[var(--error)] text-sm mt-1">{errors.category}</p>}
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="e.g., kg, piece, bag"
                      className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                    />
                  </div>
                </div>
              </div>

              {/* Quantity Limits */}
              <div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)] mb-4`}>
                  Quantity Limits
                </h3>
                <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
                  {/* Min Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Minimum Quantity <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                      placeholder="1"
                      className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                    />
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Minimum order quantity</p>
                  </div>

                  {/* Max Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Maximum Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={formData.maxQuantity}
                      onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                      placeholder="Leave empty for unlimited"
                      className={`w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border ${
                        errors.maxQuantity ? 'border-[var(--error)]' : 'border-[var(--border-primary)]'
                      } rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`}
                    />
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Maximum order quantity (optional)</p>
                    {errors.maxQuantity && <p className="text-[var(--error)] text-sm mt-1">{errors.maxQuantity}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)] mb-4`}>
                  Payment Methods <span className="text-[var(--error)]">*</span>
                </h3>
                <div className={`flex ${isMobile ? 'flex-col gap-3' : 'gap-4'}`}>
                  <label className={`flex items-center gap-3 cursor-pointer ${isMobile ? 'p-3 bg-[var(--bg-tertiary)] rounded-lg min-h-tap' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.acceptedPaymentMethods.includes('COD')}
                      onChange={() => handlePaymentMethodToggle('COD')}
                      className="w-5 h-5 rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                    />
                    <span className="text-[var(--text-primary)]">Cash on Delivery (COD)</span>
                  </label>
                  <label className={`flex items-center gap-3 cursor-pointer ${isMobile ? 'p-3 bg-[var(--bg-tertiary)] rounded-lg min-h-tap' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.acceptedPaymentMethods.includes('Online')}
                      onChange={() => handlePaymentMethodToggle('Online')}
                      className="w-5 h-5 rounded border-[var(--border-primary)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                    />
                    <span className="text-[var(--text-primary)]">Online Payment</span>
                  </label>
                </div>
                {errors.paymentMethods && <p className="text-[var(--error)] text-sm mt-2">{errors.paymentMethods}</p>}
              </div>

              {/* Image Upload */}
              <div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)] mb-4`}>
                  Product Image
                </h3>

                {/* Current Image (when editing and no new image) */}
                {existingImageUrl && !imagePreview && !formData.image && (
                  <div className="mb-4">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Current Image:</p>
                    <div className={`relative ${isMobile ? 'w-full aspect-square max-w-[280px]' : 'w-64 h-64'}`}>
                      <img
                        src={existingImageUrl}
                        alt="Current product"
                        className="w-full h-full object-cover rounded-lg border-2 border-[var(--border-primary)]"
                      />
                    </div>
                  </div>
                )}

                {/* New Image Preview */}
                {(imagePreview || formData.image) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 relative"
                  >
                    <p className="text-sm font-medium text-[var(--success)] mb-2">New Image:</p>
                    <div className={`relative ${isMobile ? 'w-full aspect-square max-w-[280px]' : 'w-64 h-64'} group`}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border-2 border-[var(--success)]"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className={`absolute top-2 right-2 p-2 bg-[var(--error)] text-white rounded-full transition-opacity ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      >
                        <FiX />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg ${isMobile ? 'p-6' : 'p-8'} text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-[var(--primary-color)] bg-[var(--info-bg)]'
                      : 'border-[var(--border-primary)] hover:border-[var(--primary-color)]'
                  }`}
                >
                  <input {...getInputProps()} />
                  {isMobile ? (
                    <div className="space-y-4">
                      <div className="flex justify-center gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-14 h-14 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                            <FiCamera className="w-6 h-6 text-[var(--primary-color)]" />
                          </div>
                          <span className="text-sm text-[var(--text-secondary)]">Camera</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-14 h-14 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                            <FiImage className="w-6 h-6 text-[var(--primary-color)]" />
                          </div>
                          <span className="text-sm text-[var(--text-secondary)]">Gallery</span>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--text-primary)] font-medium">
                        Tap to upload image
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        JPG, PNG, GIF, WEBP (Max 5MB)
                      </p>
                    </div>
                  ) : (
                    <>
                      <FiUpload className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)]" />
                      {isDragActive ? (
                        <p className="text-[var(--primary-color)] font-medium">Drop the image here...</p>
                      ) : (
                        <>
                          <p className="text-[var(--text-primary)] font-medium mb-2">
                            Drag and drop an image here, or click to select
                          </p>
                          <p className="text-sm text-[var(--text-tertiary)]">
                            Supports: JPG, PNG, GIF, WEBP (Max 5MB)
                          </p>
                        </>
                      )}
                    </>
                  )}
                </div>
                {isEditing && !formData.image && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-2">
                    Leave empty to keep the current image
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Desktop Form Actions */}
          {!isMobile && (
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading} leftIcon={<FiCheck />}>
                {isEditing ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          )}
        </form>

        {/* Mobile Fixed Bottom Action Bar */}
        {isMobile && (
          <div
            className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-primary)] p-4 z-40 shadow-lg"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          >
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1 min-h-tap"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                leftIcon={<FiCheck />}
                className="flex-1 min-h-tap"
                onClick={handleSubmit}
              >
                {isEditing ? 'Update' : 'Add Product'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DistributorLayout>
  );
};

export default ProductForm;
