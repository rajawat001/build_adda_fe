import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Button, Card, Badge, Loading } from '../../components/ui';
import { FiUpload, FiX, FiCheck, FiImage, FiArrowLeft, FiCamera, FiPlus, FiChevronDown, FiChevronUp, FiStar } from 'react-icons/fi';
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
  unitType: string;
  minQuantity: string;
  maxQuantity: string;
  acceptedPaymentMethods: string[];
  brand: string;
  manufacturer: string;
  origin: string;
  material: string;
  color: string;
  weight: string;
  warranty: string;
  hsnCode: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
    dimensionUnit: string;
  };
  specifications: Array<{ key: string; value: string }>;
}

const UNIT_TYPE_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'L', label: 'Litre (L)' },
  { value: 'mL', label: 'Millilitre (mL)' },
  { value: 'ton', label: 'Ton' },
  { value: 'piece', label: 'Piece' },
  { value: 'bag', label: 'Bag' },
  { value: 'box', label: 'Box' },
  { value: 'sqft', label: 'Square Feet (sqft)' },
  { value: 'sqm', label: 'Square Meter (sqm)' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'set', label: 'Set' },
  { value: 'meter', label: 'Meter' },
  { value: 'feet', label: 'Feet' },
  { value: 'unit', label: 'Unit' },
];

const DIMENSION_UNIT_OPTIONS = [
  { value: '', label: 'Select unit' },
  { value: 'mm', label: 'mm' },
  { value: 'cm', label: 'cm' },
  { value: 'inch', label: 'inch' },
  { value: 'feet', label: 'feet' },
  { value: 'm', label: 'm' },
];

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
    unitType: 'unit',
    minQuantity: '1',
    maxQuantity: '',
    acceptedPaymentMethods: ['COD', 'Online'],
    brand: '',
    manufacturer: '',
    origin: '',
    material: '',
    color: '',
    weight: '',
    warranty: '',
    hsnCode: '',
    dimensions: { length: '', width: '', height: '', dimensionUnit: '' },
    specifications: [],
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showDimensions, setShowDimensions] = useState(false);

  const totalImages = existingImages.length + newImages.length;

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
          unitType: product.unitType || 'unit',
          minQuantity: (product.minQuantity || 1).toString(),
          maxQuantity: product.maxQuantity ? product.maxQuantity.toString() : '',
          acceptedPaymentMethods: product.acceptedPaymentMethods || ['COD', 'Online'],
          brand: product.brand || '',
          manufacturer: product.manufacturer || '',
          origin: product.origin || '',
          material: product.material || '',
          color: product.color || '',
          weight: product.weight || '',
          warranty: product.warranty || '',
          hsnCode: product.hsnCode || '',
          dimensions: product.dimensions || { length: '', width: '', height: '', dimensionUnit: '' },
          specifications: product.specifications || [],
        });

        // Set existing images
        const imgs = product.images && product.images.length > 0
          ? product.images
          : product.image ? [product.image] : [];
        setExistingImages(imgs);

        // Show dimensions section if any dimension is filled
        if (product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height)) {
          setShowDimensions(true);
        }
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error(error.response?.data?.message || 'Failed to load product');
    } finally {
      setFetchingProduct(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remaining = 10 - totalImages;
    if (remaining <= 0) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const filesToAdd = acceptedFiles.slice(0, remaining);
    const oversized = filesToAdd.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    const previews = filesToAdd.map(f => URL.createObjectURL(f));
    setNewImages(prev => [...prev, ...filesToAdd]);
    setNewImagePreviews(prev => [...prev, ...previews]);
    toast.success(`${filesToAdd.length} image(s) added`);
  }, [totalImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 10,
  });

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: '', value: '' }],
    });
  };

  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  };

  const updateSpecification = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...formData.specifications];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, specifications: updated });
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
    submitData.append('unitType', formData.unitType);
    submitData.append('minQuantity', formData.minQuantity);
    if (formData.maxQuantity) {
      submitData.append('maxQuantity', formData.maxQuantity);
    }
    submitData.append('acceptedPaymentMethods', JSON.stringify(formData.acceptedPaymentMethods));

    // New detail fields
    submitData.append('brand', formData.brand);
    submitData.append('manufacturer', formData.manufacturer);
    submitData.append('origin', formData.origin);
    submitData.append('material', formData.material);
    submitData.append('color', formData.color);
    submitData.append('weight', formData.weight);
    submitData.append('warranty', formData.warranty);
    submitData.append('hsnCode', formData.hsnCode);
    submitData.append('dimensions', JSON.stringify(formData.dimensions));

    // Filter out empty specifications
    const validSpecs = formData.specifications.filter(s => s.key.trim() && s.value.trim());
    submitData.append('specifications', JSON.stringify(validSpecs));

    // Images
    newImages.forEach(file => {
      submitData.append('images', file);
    });

    if (isEditing) {
      submitData.append('existingImages', JSON.stringify(existingImages));
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

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 ${isMobile ? 'py-3 min-h-tap' : 'py-2'} bg-[var(--bg-primary)] border ${
      hasError ? 'border-[var(--error)]' : 'border-[var(--border-primary)]'
    } rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]`;

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
                      className={inputClass(!!errors.name)}
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
                      className={inputClass(!!errors.description)}
                    />
                    {errors.description && <p className="text-[var(--error)] text-sm mt-1">{errors.description}</p>}
                  </div>

                  {/* Real Price (MRP) */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      MRP / Real Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={formData.realPrice}
                      onChange={(e) => setFormData({ ...formData, realPrice: e.target.value })}
                      placeholder="Original price (optional)"
                      className={inputClass(!!errors.realPrice)}
                    />
                    {errors.realPrice && <p className="text-[var(--error)] text-sm mt-1">{errors.realPrice}</p>}
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Leave empty if no discount</p>
                  </div>

                  {/* Selling / Offer Price */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Selling / Offer Price <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className={inputClass(!!errors.price)}
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
                      className={inputClass(!!errors.stock)}
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
                      className={inputClass(!!errors.category)}
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

                  {/* Unit Type */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Unit Type</label>
                    <select
                      value={formData.unitType}
                      onChange={(e) => {
                        setFormData({ ...formData, unitType: e.target.value, unit: e.target.value });
                      }}
                      className={inputClass()}
                    >
                      {UNIT_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Unit (hidden, kept for backward compat) */}
                  <input type="hidden" value={formData.unit} />
                </div>
              </div>

              {/* Quantity Limits */}
              <div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)] mb-4`}>
                  Quantity Limits
                </h3>
                <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
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
                      className={inputClass()}
                    />
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Minimum order quantity</p>
                  </div>
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
                      className={inputClass(!!errors.maxQuantity)}
                    />
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Maximum order quantity (optional)</p>
                    {errors.maxQuantity && <p className="text-[var(--error)] text-sm mt-1">{errors.maxQuantity}</p>}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)] mb-4`}>
                  Product Details
                </h3>
                <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. UltraTech, Tata"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Manufacturer</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="e.g. UltraTech Cement Ltd"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Origin</label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      placeholder="e.g. India"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Material</label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g. OPC 53 Grade"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="e.g. Grey"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Weight</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g. 50 kg"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Warranty</label>
                    <input
                      type="text"
                      value={formData.warranty}
                      onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                      placeholder="e.g. 6 months"
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">HSN Code</label>
                    <input
                      type="text"
                      value={formData.hsnCode}
                      onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                      placeholder="e.g. 2523"
                      className={inputClass()}
                    />
                  </div>
                </div>
              </div>

              {/* Dimensions (collapsible) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowDimensions(!showDimensions)}
                  className="flex items-center gap-2 text-[var(--text-primary)] font-semibold mb-4"
                >
                  <span className={isMobile ? 'text-base' : 'text-lg'}>Dimensions</span>
                  <span className="text-xs text-[var(--text-tertiary)]">(optional)</span>
                  {showDimensions ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {showDimensions && (
                  <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-4 gap-4'}`}>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Length</label>
                      <input
                        type="text"
                        value={formData.dimensions.length}
                        onChange={(e) => setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, length: e.target.value }
                        })}
                        placeholder="Length"
                        className={inputClass()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Width</label>
                      <input
                        type="text"
                        value={formData.dimensions.width}
                        onChange={(e) => setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, width: e.target.value }
                        })}
                        placeholder="Width"
                        className={inputClass()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Height</label>
                      <input
                        type="text"
                        value={formData.dimensions.height}
                        onChange={(e) => setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, height: e.target.value }
                        })}
                        placeholder="Height"
                        className={inputClass()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Unit</label>
                      <select
                        value={formData.dimensions.dimensionUnit}
                        onChange={(e) => setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, dimensionUnit: e.target.value }
                        })}
                        className={inputClass()}
                      >
                        {DIMENSION_UNIT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)] mb-4`}>
                  Specifications
                </h3>
                <div className="space-y-3">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 items-start`}>
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                        placeholder="Key (e.g. Grade)"
                        className={`${inputClass()} ${isMobile ? '' : 'flex-1'}`}
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        placeholder="Value (e.g. 53)"
                        className={`${inputClass()} ${isMobile ? '' : 'flex-1'}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className={`p-2 text-[var(--error)] hover:bg-[var(--error-bg)] rounded-lg transition-colors ${isMobile ? 'self-end' : 'mt-0'}`}
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="flex items-center gap-2 text-sm text-[var(--primary-color)] hover:underline"
                  >
                    <FiPlus size={16} /> Add Specification
                  </button>
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
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[var(--text-primary)] mb-2`}>
                  Product Images
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] mb-4">
                  Upload up to 10 images. The first image will be used as the primary thumbnail.
                </p>

                {/* Image Grid */}
                {(existingImages.length > 0 || newImages.length > 0) && (
                  <div className={`grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-5 gap-3'} mb-4`}>
                    {/* Existing images */}
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative aspect-square group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className={`w-full h-full object-cover rounded-lg border-2 ${
                            index === 0 && newImages.length === 0 ? 'border-[var(--primary-color)]' : 'border-[var(--border-primary)]'
                          }`}
                        />
                        {index === 0 && newImages.length === 0 && (
                          <span className="absolute top-1 left-1 bg-[var(--primary-color)] text-white text-xs px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className={`absolute top-1 right-1 p-1 bg-[var(--error)] text-white rounded-full transition-opacity ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                    {/* New image previews */}
                    {newImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative aspect-square group">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className={`w-full h-full object-cover rounded-lg border-2 ${
                            index === 0 && existingImages.length === 0 ? 'border-[var(--primary-color)]' : 'border-[var(--success)]'
                          }`}
                        />
                        {index === 0 && existingImages.length === 0 && (
                          <span className="absolute top-1 left-1 bg-[var(--primary-color)] text-white text-xs px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className={`absolute top-1 right-1 p-1 bg-[var(--error)] text-white rounded-full transition-opacity ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropzone */}
                {totalImages < 10 && (
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
                          Tap to upload images ({totalImages}/10)
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          JPG, PNG, GIF, WEBP (Max 5MB each)
                        </p>
                      </div>
                    ) : (
                      <>
                        <FiUpload className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)]" />
                        {isDragActive ? (
                          <p className="text-[var(--primary-color)] font-medium">Drop the images here...</p>
                        ) : (
                          <>
                            <p className="text-[var(--text-primary)] font-medium mb-2">
                              Drag and drop images here, or click to select ({totalImages}/10)
                            </p>
                            <p className="text-sm text-[var(--text-tertiary)]">
                              Supports: JPG, PNG, GIF, WEBP (Max 5MB each)
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
                {isEditing && totalImages === 0 && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-2">
                    No images. Upload at least one image.
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
