interface Category {
  _id: string;
  name: string;
}

interface FilterProps {
  categories: Category[];
  filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    availability: string;
    pincode?: string;
  };
  onFilterChange: (filterName: string, value: string) => void;
}

export default function Filter({ categories, filters, onFilterChange }: FilterProps) {
  return (
    <div className="filter-container">
      <h3>Filters</h3>
      
      <div className="filter-group">
        <label>Category</label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option key="all-categories" value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="filter-group">
        <label>Price Range</label>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          />
        </div>
      </div>
      
      {/* Availability filter removed — out-of-stock products are hidden server-side */}

      <div className="filter-group">
        <label>Filter by Pincode</label>
        <input
          type="text"
          placeholder="Enter pincode (e.g., 400001)"
          value={filters.pincode || ''}
          onChange={(e) => onFilterChange('pincode', e.target.value)}
          maxLength={6}
          pattern="[0-9]*"
        />
        <small style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
          Find products from distributors in your area
        </small>
      </div>
    </div>
  );
}