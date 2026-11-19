import { Search, X } from 'lucide-react';
import { CATEGORIES, SORT_OPTIONS } from '../constants.js';

export const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'soon', label: 'Use soon' },
  { id: 'expired', label: 'Expired' }
];

/** Search, status tabs, category dropdown and sort order - all controlled from App. */
export default function FilterBar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  visibleCount
}) {
  return (
    <section className="toolbar" aria-label="Filter and search">
      <div className="search-field">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={query}
          placeholder="Search food, e.g. milk"
          aria-label="Search items"
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query && (
          <button type="button" className="icon-button" onClick={() => onQueryChange('')} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="status-tabs" role="tablist" aria-label="Filter by expiry status">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={status === filter.id}
            className={`status-tab ${status === filter.id ? 'is-active' : ''}`}
            onClick={() => onStatusChange(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="toolbar__selects">
        <label className="select-field">
          <span>Category</span>
          <select
            value={category}
            aria-label="Filter by category"
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="select-field">
          <span>Sort by</span>
          <select value={sort} aria-label="Sort items" onChange={(event) => onSortChange(event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <span className="toolbar__count" aria-live="polite">
          {visibleCount} shown
        </span>
      </div>
    </section>
  );
}
