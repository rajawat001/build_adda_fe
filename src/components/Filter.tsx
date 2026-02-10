interface Category {
  _id: string;
  id?: string;
  name: string;
}

interface FilterProps {
  categories: Category[];
  filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    availability: string;
    sortBy?: string;
    pincode?: string;
  };
  onFilterChange: (filterName: string, value: string) => void;
}

export default function Filter({ categories, filters, onFilterChange }: FilterProps) {
  return (
    <div className="filter-container">
      {/* Category Filter */}
      <div className="filter-section">
        <h4>Category</h4>
        <select
          className="filter-select"
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id || cat.id} value={cat.id || cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <div className="price-input-group">
            <label>Min (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
              min="0"
            />
          </div>
          <span className="price-separator">–</span>
          <div className="price-input-group">
            <label>Max (₹)</label>
            <input
              type="number"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Pincode Filter */}
      <div className="filter-section">
        <h4>Pincode</h4>
        <input
          className="filter-input"
          type="text"
          placeholder="e.g., 302001"
          value={filters.pincode || ''}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            onFilterChange('pincode', val);
          }}
          maxLength={6}
        />
        <small>Find products from distributors in your area</small>
      </div>
    </div>
  );
}
