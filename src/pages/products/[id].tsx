import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import axios from 'axios';
import SEO from '../../components/SEO';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import productService from '../../services/product.service';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import ShareSheet from '../../components/ShareSheet';
import Toast from '../../components/Toast';
import {
  FiHeart, FiCheckCircle, FiXCircle, FiShoppingCart, FiZap,
  FiChevronLeft, FiChevronRight, FiX, FiZoomIn, FiShare2, FiTruck, FiShield, FiPackage,
} from 'react-icons/fi';

function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }));
}

// ─── Image Zoom Modal (Desktop fullscreen + Mobile pinch-zoom) ───
function ImageZoomModal({
  images,
  selectedIndex,
  onClose,
  onChangeIndex,
}: {
  images: string[];
  selectedIndex: number;
  onClose: () => void;
  onChangeIndex: (i: number) => void;
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom on image change
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [selectedIndex]);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onChangeIndex(Math.max(0, selectedIndex - 1));
      if (e.key === 'ArrowRight') onChangeIndex(Math.min(images.length - 1, selectedIndex + 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, images.length]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale(prev => Math.min(4, Math.max(1, prev + delta)));
    if (scale + delta <= 1) setPosition({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setDragging(true);
    lastPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || scale <= 1) return;
    setPosition({
      x: e.clientX - lastPos.current.x,
      y: e.clientY - lastPos.current.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  // Touch zoom (pinch)
  const lastTouchDist = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1 && scale > 1) {
      lastPos.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
      setDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = (dist - lastTouchDist.current) * 0.008;
      lastTouchDist.current = dist;
      setScale(prev => Math.min(4, Math.max(1, prev + delta)));
    } else if (e.touches.length === 1 && dragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - lastPos.current.x,
        y: e.touches[0].clientY - lastPos.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (scale <= 1) setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="pdp-zoom-overlay" onClick={onClose}>
      <div className="pdp-zoom-container" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="pdp-zoom-close" onClick={onClose}><FiX size={24} /></button>

        {/* Counter */}
        <div className="pdp-zoom-counter">{selectedIndex + 1} / {images.length}</div>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              className="pdp-zoom-nav pdp-zoom-prev"
              onClick={() => onChangeIndex(Math.max(0, selectedIndex - 1))}
              disabled={selectedIndex === 0}
            >
              <FiChevronLeft size={28} />
            </button>
            <button
              className="pdp-zoom-nav pdp-zoom-next"
              onClick={() => onChangeIndex(Math.min(images.length - 1, selectedIndex + 1))}
              disabled={selectedIndex === images.length - 1}
            >
              <FiChevronRight size={28} />
            </button>
          </>
        )}

        {/* Image */}
        <div
          ref={containerRef}
          className="pdp-zoom-image-wrap"
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        >
          <img
            src={images[selectedIndex]}
            alt="Zoom"
            draggable={false}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: dragging ? 'none' : 'transform 0.2s ease',
            }}
          />
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="pdp-zoom-thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                className={`pdp-zoom-thumb ${i === selectedIndex ? 'active' : ''}`}
                onClick={() => onChangeIndex(i)}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mobile Image Carousel ───
function MobileImageCarousel({
  images,
  productName,
  onImageClick,
}: {
  images: string[];
  productName: string;
  onImageClick: (index: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  };

  const scrollToIndex = (i: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: 'smooth' });
    setActiveIndex(i);
  };

  return (
    <div className="pdp-mobile-carousel">
      <div
        ref={scrollRef}
        className="pdp-mobile-carousel-track"
        onScroll={handleScroll}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="pdp-mobile-carousel-slide"
            onClick={() => onImageClick(i)}
          >
            <img
              src={img}
              alt={`${productName} ${i + 1}`}
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }}
            />
            <div className="pdp-mobile-zoom-hint"><FiZoomIn size={16} /> Tap to zoom</div>
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="pdp-mobile-carousel-dots">
          {images.map((_, i) => (
            <span key={i} className={`pdp-dot ${i === activeIndex ? 'active' : ''}`} />
          ))}
        </div>
      )}
      {/* Thumbnail strip below carousel */}
      <div className="pdp-mobile-thumbstrip">
        {images.map((img, i) => (
          <button
            key={i}
            className={`pdp-mobile-thumb ${i === activeIndex ? 'active' : ''}`}
            onClick={() => scrollToIndex(i)}
          >
            <img src={img} alt={`${productName} ${i + 1}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SSR: Fetch minimal product data for OG meta tags ───
interface SSRProductMeta {
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  inStock: boolean;
  id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    const res = await axios.get(`${API_URL}/products/${id}`, { timeout: 5000 });
    const data = res.data;
    const product = data.product || data.data?.product || data;

    const category = typeof product.category === 'object'
      ? product.category?.name || ''
      : product.category || '';

    const image = product.images?.[0] || product.image || '';

    return {
      props: {
        ssrMeta: {
          name: product.name || '',
          price: product.price || 0,
          description: (product.description || '').substring(0, 200),
          image,
          category,
          inStock: (product.stock || 0) > 0,
          id: product._id || id || '',
        } as SSRProductMeta,
      },
    };
  } catch {
    return { props: { ssrMeta: null } };
  }
};

// ─── Main Page Component ───
export default function ProductDetail({ ssrMeta }: { ssrMeta: SSRProductMeta | null }) {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'specs'>('description');

  // Desktop hover-lens zoom
  const mainImageRef = useRef<HTMLDivElement>(null);
  const [lensActive, setLensActive] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });

  const minQty = product?.minQuantity || 1;
  const maxQty = product?.maxQuantity || product?.stock || 999;

  useEffect(() => {
    if (id) {
      fetchProductDetails();
      checkWishlistStatus();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productService.getProductById(id as string);
      let productData: Product;
      if (response.product) productData = response.product;
      else if (response.data?.product) productData = response.data.product;
      else productData = response;

      setProduct(productData);

      const imgs = productData.images && productData.images.length > 0
        ? productData.images
        : productData.image ? [productData.image] : [];
      setAllImages(imgs);
      setSelectedImageIndex(0);

      if (productData.minQuantity && productData.minQuantity > 1) {
        setQuantity(productData.minQuantity);
      }

      if (productData.category) {
        const categoryId = typeof productData.category === 'string'
          ? productData.category
          : productData.category._id;
        fetchRelatedProducts(categoryId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId: string) => {
    try {
      const response = await productService.getProductsByCategory(categoryId);
      let products: Product[] = [];
      if (Array.isArray(response)) products = response;
      else if (response.products) products = response.products;
      else if (response.data?.products) products = response.data.products;
      setRelatedProducts(products.filter((p: Product) => p._id !== id).slice(0, 4));
    } catch (err) { /* ignore */ }
  };

  const checkWishlistStatus = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;
      const wishlistData = localStorage.getItem('wishlist');
      if (wishlistData) {
        const wishlist = JSON.parse(wishlistData);
        setIsInWishlist(wishlist.some((item: any) => item._id === id));
      }
    } catch { /* ignore */ }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const user = localStorage.getItem('user');
    if (!user) { router.push('/login'); return; }
    if (quantity < minQty) { showToast(`Minimum quantity is ${minQty}`, 'warning'); return; }
    const effectiveMax = Math.min(maxQty, product.stock);
    if (quantity > effectiveMax) { showToast(`Maximum quantity is ${effectiveMax}`, 'warning'); return; }
    setAddingToCart(true);
    addToCart(product, quantity);
    setTimeout(() => setAddingToCart(false), 600);
  };

  const handleAddToWishlist = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) { router.push('/login'); return; }
      setAddingToWishlist(true);

      if (isInWishlist) {
        await productService.removeFromWishlist(product!._id);
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        localStorage.setItem('wishlist', JSON.stringify(wishlist.filter((item: any) => item._id !== product!._id)));
        setIsInWishlist(false);
        window.dispatchEvent(new Event('storage'));
        showToast('Removed from wishlist', 'info');
      } else {
        await productService.addToWishlist(product!._id);
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (!wishlist.find((item: any) => item._id === product!._id)) wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        setIsInWishlist(true);
        window.dispatchEvent(new Event('storage'));
        showToast('Added to wishlist!', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating wishlist', 'error');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push('/cart'), 500);
  };

  const handleShare = () => {
    setShowShareSheet(true);
  };

  // Desktop hover lens
  const handleMainImageMouseMove = (e: React.MouseEvent) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLensPos({ x, y });
  };

  const selectedImage = allImages[selectedImageIndex] || product?.image || '/placeholder-product.png';
  const inStock = product ? product.stock > 0 : false;
  const category = product ? (typeof product.category === 'object' ? product.category?.name : product.category) : null;
  const distributor = product ? (typeof product.distributor === 'object' ? product.distributor : null) : null;

  // Check if product has any detail fields
  const hasDetails = product && (product.brand || product.manufacturer || product.origin || product.material || product.color || product.weight || product.warranty || product.hsnCode);
  const hasDimensions = product?.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height);
  const hasSpecs = product?.specifications && product.specifications.length > 0;

  // Build detail rows (label + value)
  const detailRows = useMemo(() => {
    if (!product) return [];
    const rows: { label: string; value: string }[] = [];
    if (product.brand) rows.push({ label: 'Brand', value: product.brand });
    if (product.manufacturer) rows.push({ label: 'Manufacturer', value: product.manufacturer });
    if (product.origin) rows.push({ label: 'Country of Origin', value: product.origin });
    if (product.material) rows.push({ label: 'Material', value: product.material });
    if (product.color) rows.push({ label: 'Color', value: product.color });
    if (product.weight) rows.push({ label: 'Weight', value: product.weight });
    if (product.unitType && product.unitType !== 'unit') rows.push({ label: 'Unit Type', value: product.unitType });
    if (product.warranty) rows.push({ label: 'Warranty', value: product.warranty });
    if (product.hsnCode) rows.push({ label: 'HSN Code', value: product.hsnCode });
    if (hasDimensions) {
      const dim = [product.dimensions!.length, product.dimensions!.width, product.dimensions!.height].filter(Boolean).join(' x ');
      const unit = product.dimensions!.dimensionUnit || '';
      rows.push({ label: 'Dimensions', value: `${dim}${unit ? ' ' + unit : ''}` });
    }
    return rows;
  }, [product]);

  const productJsonLd = useMemo(() => {
    if (!product) return null;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: allImages.length > 0 ? allImages : (product.image ? [product.image] : undefined),
          url: `https://www.buildadda.in/products/${product._id}`,
          brand: product.brand ? { '@type': 'Brand', name: product.brand } : { '@type': 'Organization', name: distributor?.businessName || 'BuildAdda' },
          category: category || undefined,
          color: product.color || undefined,
          material: product.material || undefined,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'INR',
            availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Organization', name: distributor?.businessName || 'BuildAdda' },
            url: `https://www.buildadda.in/products/${product._id}`,
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.buildadda.in' },
            { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.buildadda.in/products' },
            ...(category ? [{ '@type': 'ListItem', position: 3, name: category, item: `https://www.buildadda.in/products?category=${category}` }] : []),
            { '@type': 'ListItem', position: category ? 4 : 3, name: product.name, item: `https://www.buildadda.in/products/${product._id}` },
          ],
        },
      ],
    };
  }, [product, inStock, category, distributor, allImages]);

  // Loading / Error states
  if (loading) {
    return (
      <>
        <SEO
          title={ssrMeta ? `${ssrMeta.name} - Buy Online at Best Price | BuildAdda` : 'Loading...'}
          description={ssrMeta ? `Buy ${ssrMeta.name} online at ₹${ssrMeta.price.toLocaleString('en-IN')}${ssrMeta.category ? ` in ${ssrMeta.category} category` : ''}. ${ssrMeta.inStock ? 'In stock' : 'Out of stock'}. ${ssrMeta.description}` : undefined}
          ogImage={ssrMeta?.image || undefined}
          ogType="product"
          canonicalUrl={ssrMeta ? `https://www.buildadda.in/products/${ssrMeta.id}` : undefined}
        />
        <Header />
        <div className="pdp-page">
          <div className="pdp-skeleton">
            <div className="pdp-skeleton-img" />
            <div className="pdp-skeleton-info">
              <div className="pdp-skeleton-line w80" />
              <div className="pdp-skeleton-line w40" />
              <div className="pdp-skeleton-line w60" />
              <div className="pdp-skeleton-line w90" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <SEO
          title={ssrMeta ? `${ssrMeta.name} | BuildAdda` : 'Product Not Found'}
          description={ssrMeta ? `Buy ${ssrMeta.name} online at ₹${ssrMeta.price.toLocaleString('en-IN')} on BuildAdda` : undefined}
          ogImage={ssrMeta?.image || undefined}
          canonicalUrl={ssrMeta ? `https://www.buildadda.in/products/${ssrMeta.id}` : undefined}
        />
        <Header />
        <div className="pdp-page">
          <div className="pdp-error">
            <FiPackage size={64} />
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist.'}</p>
            <Link href="/products" className="pdp-error-btn">Browse Products</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${product.name} - Buy Online at Best Price | BuildAdda`}
        description={`Buy ${product.name} online at ₹${product.price.toLocaleString('en-IN')}${category ? ` in ${category} category` : ''}. ${inStock ? 'In stock' : 'Out of stock'}. ${product.description?.substring(0, 120) || ''}`}
        keywords={`${product.name}, buy ${product.name} online, ${product.name} price, ${category ? category + ' ' : ''}building materials`}
        canonicalUrl={`https://www.buildadda.in/products/${product._id}`}
        ogImage={allImages[0] || product.image || undefined}
        ogType="product"
        jsonLd={productJsonLd}
      />
      <Header />

      <div className="pdp-page">
        {/* Breadcrumbs */}
        <nav className="pdp-breadcrumbs">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">Products</Link>
          {category && (<><span>/</span><Link href={`/products?category=${category}`}>{category}</Link></>)}
          <span>/</span>
          <span className="pdp-breadcrumb-current">{product.name}</span>
        </nav>

        {/* ═══ Main product layout ═══ */}
        <div className="pdp-main">

          {/* ─── LEFT: Image gallery (desktop) / Carousel (mobile) ─── */}
          <div className="pdp-gallery">
            {/* Desktop: Thumbnail strip + Main image with hover zoom */}
            <div className="pdp-gallery-desktop">
              <div className="pdp-thumbstrip">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`pdp-thumb ${i === selectedImageIndex ? 'active' : ''}`}
                    onMouseEnter={() => setSelectedImageIndex(i)}
                    onClick={() => setSelectedImageIndex(i)}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>

              <div
                ref={mainImageRef}
                className={`pdp-mainimg ${lensActive ? 'lens-active' : ''}`}
                onMouseEnter={() => setLensActive(true)}
                onMouseLeave={() => setLensActive(false)}
                onMouseMove={handleMainImageMouseMove}
                onClick={() => setShowZoom(true)}
              >
                <img
                  src={selectedImage}
                  alt={product.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }}
                  style={lensActive ? { transformOrigin: `${lensPos.x}% ${lensPos.y}%`, transform: 'scale(1.8)' } : undefined}
                />
                <div className="pdp-mainimg-hint"><FiZoomIn size={16} /> Hover to zoom, click to expand</div>
              </div>
            </div>

            {/* Mobile: Swipeable carousel */}
            <div className="pdp-gallery-mobile">
              <MobileImageCarousel
                images={allImages.length > 0 ? allImages : ['/placeholder-product.png']}
                productName={product.name}
                onImageClick={(i) => { setSelectedImageIndex(i); setShowZoom(true); }}
              />
            </div>
          </div>

          {/* ─── RIGHT: Product info ─── */}
          <div className="pdp-info">
            {/* Brand badge */}
            {product.brand && (
              <span className="pdp-brand-badge">{product.brand}</span>
            )}

            <h1 className="pdp-title">{product.name}</h1>

            {/* Category */}
            {category && (
              <div className="pdp-category-row">
                <Link href={`/products?category=${category}`} className="pdp-category-chip">{category}</Link>
              </div>
            )}

            {/* Price */}
            <div className="pdp-price-block">
              {product.realPrice && product.realPrice > product.price ? (
                <>
                  <span className="pdp-price-current">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.unitType && product.unitType !== 'unit' && (
                    <span className="pdp-price-unit">/{product.unitType}</span>
                  )}
                  <span className="pdp-price-mrp">
                    MRP ₹{product.realPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="pdp-price-discount">
                    ({Math.round(((product.realPrice - product.price) / product.realPrice) * 100)}% OFF)
                  </span>
                </>
              ) : (
                <>
                  <span className="pdp-price-current">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.unitType && product.unitType !== 'unit' && (
                    <span className="pdp-price-unit">/{product.unitType}</span>
                  )}
                </>
              )}
              <p className="pdp-price-inclusive">inclusive of all taxes</p>
            </div>

            {/* Stock */}
            <div className="pdp-stock-row">
              {inStock ? (
                <span className="pdp-in-stock"><FiCheckCircle size={15} /> In Stock ({product.stock} available)</span>
              ) : (
                <span className="pdp-out-stock"><FiXCircle size={15} /> Out of Stock</span>
              )}
            </div>

            {/* Quick highlights (if details exist) */}
            {(product.brand || product.material || product.weight) && (
              <div className="pdp-highlights">
                {product.brand && <div className="pdp-hl-item"><span className="pdp-hl-label">Brand</span><span className="pdp-hl-value">{product.brand}</span></div>}
                {product.material && <div className="pdp-hl-item"><span className="pdp-hl-label">Material</span><span className="pdp-hl-value">{product.material}</span></div>}
                {product.weight && <div className="pdp-hl-item"><span className="pdp-hl-label">Weight</span><span className="pdp-hl-value">{product.weight}</span></div>}
                {product.color && <div className="pdp-hl-item"><span className="pdp-hl-label">Color</span><span className="pdp-hl-value">{product.color}</span></div>}
              </div>
            )}

            {/* Seller */}
            {distributor && (
              <div className="pdp-seller">
                <span className="pdp-seller-label">Sold by</span>
                <Link href={`/distributor/${distributor._id}`} className="pdp-seller-name">{distributor.businessName}</Link>
              </div>
            )}

            {/* Trust badges */}
            <div className="pdp-trust-row">
              <div className="pdp-trust-item"><FiTruck size={18} /><span>Delivery Available</span></div>
              <div className="pdp-trust-item"><FiShield size={18} /><span>Quality Assured</span></div>
              <div className="pdp-trust-item"><FiPackage size={18} /><span>Secure Packaging</span></div>
            </div>

            {/* Quantity selector */}
            {inStock && (
              <div className="pdp-qty-section">
                <label className="pdp-qty-label">Quantity</label>
                <div className="pdp-qty-controls">
                  <button
                    className="pdp-qty-btn"
                    disabled={quantity <= minQty}
                    onClick={() => quantity > minQty && setQuantity(quantity - 1)}
                  >-</button>
                  <input
                    type="number"
                    className="pdp-qty-input"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || minQty;
                      const effectiveMax = Math.min(maxQty, product.stock);
                      setQuantity(Math.min(effectiveMax, Math.max(minQty, val)));
                    }}
                    min={minQty}
                    max={Math.min(maxQty, product.stock)}
                  />
                  <button
                    className="pdp-qty-btn"
                    disabled={quantity >= Math.min(maxQty, product.stock)}
                    onClick={() => {
                      const effectiveMax = Math.min(maxQty, product.stock);
                      if (quantity < effectiveMax) setQuantity(quantity + 1);
                    }}
                  >+</button>
                </div>
                {(minQty > 1 || maxQty < product.stock) && (
                  <span className="pdp-qty-hint">
                    Min: {minQty}{maxQty < product.stock ? ` | Max: ${maxQty}` : ''}
                  </span>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="pdp-actions">
              {inStock ? (
                <>
                  <button className="pdp-btn-cart" onClick={handleAddToCart} disabled={addingToCart}>
                    <FiShoppingCart size={18} /> {addingToCart ? 'Adding...' : 'ADD TO CART'}
                  </button>
                  <button className="pdp-btn-buy" onClick={handleBuyNow} disabled={addingToCart}>
                    <FiZap size={18} /> BUY NOW
                  </button>
                </>
              ) : (
                <button className="pdp-btn-oos" disabled>OUT OF STOCK</button>
              )}
            </div>

            {/* Wishlist + Share row */}
            <div className="pdp-secondary-actions">
              <button
                className={`pdp-btn-wishlist ${isInWishlist ? 'active' : ''}`}
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
              >
                <FiHeart size={17} fill={isInWishlist ? '#e74c3c' : 'none'} />
                {isInWishlist ? 'WISHLISTED' : 'WISHLIST'}
              </button>
              <button className="pdp-btn-share" onClick={handleShare}>
                <FiShare2 size={17} /> SHARE
              </button>
            </div>
          </div>
        </div>

        {/* ═══ Tabbed section: Description / Product Details / Specifications ═══ */}
        <div className="pdp-tabs-section">
          <div className="pdp-tabs-header">
            <button
              className={`pdp-tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            {(hasDetails || hasDimensions) && (
              <button
                className={`pdp-tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Product Details
              </button>
            )}
            {hasSpecs && (
              <button
                className={`pdp-tab ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
              >
                Specifications
              </button>
            )}
          </div>

          <div className="pdp-tab-content">
            {/* Description */}
            {activeTab === 'description' && (
              <div className="pdp-tab-desc">
                <p>{product.description}</p>
              </div>
            )}

            {/* Product Details */}
            {activeTab === 'details' && (
              <div className="pdp-tab-details">
                <table className="pdp-details-table">
                  <tbody>
                    {detailRows.map((row, i) => (
                      <tr key={i}>
                        <td className="pdp-dt-label">{row.label}</td>
                        <td className="pdp-dt-value">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Specifications */}
            {activeTab === 'specs' && product.specifications && (
              <div className="pdp-tab-specs">
                <table className="pdp-specs-table">
                  <thead>
                    <tr>
                      <th>Specification</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i}>
                        <td>{spec.key}</td>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Related Products ═══ */}
        {relatedProducts.length > 0 && (
          <div className="pdp-related">
            <h2 className="pdp-related-title">Similar Products</h2>
            <div className="pdp-related-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ Mobile Sticky Bottom Bar ═══ */}
      {inStock && (
        <div className="pdp-mobile-bottom-bar">
          <button className="pdp-mb-share" onClick={handleShare}>
            <FiShare2 size={20} />
          </button>
          <button className="pdp-mb-wishlist" onClick={handleAddToWishlist} disabled={addingToWishlist}>
            <FiHeart size={20} fill={isInWishlist ? '#e74c3c' : 'none'} color={isInWishlist ? '#e74c3c' : '#333'} />
          </button>
          <button className="pdp-mb-cart" onClick={handleAddToCart} disabled={addingToCart}>
            <FiShoppingCart size={18} /> ADD TO CART
          </button>
          <button className="pdp-mb-buy" onClick={handleBuyNow} disabled={addingToCart}>
            <FiZap size={18} /> BUY NOW
          </button>
        </div>
      )}

      {/* ═══ Zoom Modal ═══ */}
      {showZoom && (
        <ImageZoomModal
          images={allImages.length > 0 ? allImages : [product.image || '/placeholder-product.png']}
          selectedIndex={selectedImageIndex}
          onClose={() => setShowZoom(false)}
          onChangeIndex={setSelectedImageIndex}
        />
      )}

      {/* Share Sheet */}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        title={product.name}
        text={`Check out ${product.name} at ₹${product.price.toLocaleString('en-IN')} on BuildAdda`}
        url={typeof window !== 'undefined' ? window.location.href : `https://www.buildadda.in/products/${product._id}`}
        image={allImages[0] || product.image}
      />

      <Toast />
      <Footer />
    </>
  );
}
