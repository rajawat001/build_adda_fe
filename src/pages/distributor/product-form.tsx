import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import api from '../../services/api';

interface ProductFormData {
  name: string;
  description: string;
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
  const { id } = router.query;
  const isEditing = !!id;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
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
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/distributor/products`);
      const product = response.data.products.find((p: any) => p._id === id);

      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
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
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Error loading product');
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
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

    if (!validate()) return;

    setLoading(true);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
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
        alert('Product updated successfully');
      } else {
        await api.post('/distributor/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Product added successfully');
      }
      router.push('/distributor/products');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving product');
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

  return (
    <DistributorLayout title={isEditing ? 'Edit Product' : 'Add Product'}>
      <div className="product-form-page">
        <div className="page-header">
          <h1>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
          <button className="btn-back" onClick={() => router.back()}>
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            {/* Product Name */}
            <div className="form-group full-width">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={4}
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            {/* Price */}
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>

            {/* Stock */}
            <div className="form-group">
              <label>Stock *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                className={errors.stock ? 'error' : ''}
              />
              {errors.stock && <span className="error-text">{errors.stock}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={errors.category ? 'error' : ''}
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
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            {/* Unit */}
            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., kg, piece, bag"
              />
            </div>

            {/* Min Quantity */}
            <div className="form-group">
              <label>Minimum Quantity *</label>
              <input
                type="number"
                min="1"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                placeholder="1"
              />
              <small>Minimum order quantity</small>
            </div>

            {/* Max Quantity */}
            <div className="form-group">
              <label>Maximum Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.maxQuantity}
                onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                placeholder="Leave empty for unlimited"
                className={errors.maxQuantity ? 'error' : ''}
              />
              <small>Maximum order quantity (optional)</small>
              {errors.maxQuantity && <span className="error-text">{errors.maxQuantity}</span>}
            </div>

            {/* Payment Methods */}
            <div className="form-group full-width">
              <label>Accepted Payment Methods *</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.acceptedPaymentMethods.includes('COD')}
                    onChange={() => handlePaymentMethodToggle('COD')}
                  />
                  <span>💵 Cash on Delivery (COD)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.acceptedPaymentMethods.includes('Online')}
                    onChange={() => handlePaymentMethodToggle('Online')}
                  />
                  <span>💳 Online Payment</span>
                </label>
              </div>
              {errors.paymentMethods && <span className="error-text">{errors.paymentMethods}</span>}
            </div>

            {/* Image Upload */}
            <div className="form-group full-width">
              <label>Product Image</label>

              {/* Show existing image when editing */}
              {existingImageUrl && !formData.image && (
                <div className="image-preview">
                  <img src={existingImageUrl} alt="Current product" />
                  <p className="preview-label">Current Image</p>
                </div>
              )}

              {/* Show preview of new image */}
              {formData.image && (
                <div className="image-preview">
                  <img src={URL.createObjectURL(formData.image)} alt="New product preview" />
                  <p className="preview-label new">New Image Preview</p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.files?.[0] || null })
                }
                className="file-input"
              />
              {isEditing && (
                <small className="help-text">Leave empty to keep current image</small>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => router.back()}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .product-form-page {
          max-width: 900px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .page-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
        }

        .btn-back {
          background: #edf2f7;
          color: #2d3748;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-back:hover {
          background: #e2e8f0;
        }

        .product-form {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group input.error,
        .form-group textarea.error,
        .form-group select.error {
          border-color: #fc8181;
        }

        .form-group small {
          font-size: 12px;
          color: #718096;
          margin-top: 4px;
        }

        .error-text {
          color: #e53e3e;
          font-size: 13px;
          margin-top: 4px;
        }

        .checkbox-group {
          display: flex;
          gap: 24px;
          margin-top: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 15px;
          color: #2d3748;
        }

        .checkbox-label input[type='checkbox'] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .image-preview {
          margin-bottom: 16px;
          text-align: center;
        }

        .image-preview img {
          max-width: 300px;
          max-height: 300px;
          border-radius: 8px;
          border: 3px solid #e2e8f0;
          object-fit: cover;
        }

        .preview-label {
          font-size: 13px;
          color: #718096;
          margin-top: 8px;
        }

        .preview-label.new {
          color: #38a169;
          font-weight: 600;
        }

        .file-input {
          padding: 12px;
          border: 2px dashed #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
        }

        .help-text {
          display: block;
          margin-top: 8px;
          font-size: 12px;
          color: #718096;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          padding-top: 24px;
          border-top: 2px solid #f7fafc;
        }

        .btn-cancel,
        .btn-submit {
          padding: 12px 32px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel {
          background: #edf2f7;
          color: #2d3748;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
        }

        .btn-submit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .product-form {
            padding: 24px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </DistributorLayout>
  );
};

export default ProductForm;
