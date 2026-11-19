import { Refrigerator } from 'lucide-react';

/** Shown when the filter/search combination returns nothing. */
export default function EmptyState({ filtered, onAdd, onReset, onLoadDemo }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <Refrigerator size={40} />
      </span>
      <h3>{filtered ? 'No items match this filter' : 'Your fridge is empty'}</h3>
      <p>
        {filtered
          ? 'Try a different search term or switch back to the All tab.'
          : 'Add your first item and MyFridge will start counting down the days for you.'}
      </p>
      {filtered ? (
        <button type="button" className="ghost-button" onClick={onReset}>
          Clear filters
        </button>
      ) : (
        <div className="empty-state__actions">
          <button type="button" className="primary-button" onClick={onAdd}>
            Add first item
          </button>
          {onLoadDemo && (
            <button type="button" className="ghost-button" onClick={onLoadDemo}>
              Load sample items
            </button>
          )}
        </div>
      )}
    </div>
  );
}
