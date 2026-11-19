import { CalendarDays, Camera, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { expiryStatus, formatShortDate, humanCountdown } from '../utils/date.js';
import CategoryIcon from './CategoryIcon.jsx';

/**
 * ItemCard - one food item. It receives data and callbacks through props and
 * holds no state of its own, so React can re-render it cheaply and the card
 * stays reusable inside the grid.
 */
export default function ItemCard({ item, onEdit, onDelete, onAdjustQuantity }) {
  const status = expiryStatus(item.expiryDate);

  return (
    <article className={`item-card item-card--${status.tone}`}>
      <div className="item-card__media">
        {item.photo ? (
          <img src={item.photo} alt={`${item.name} photo`} loading="lazy" />
        ) : (
          <CategoryIcon category={item.category} />
        )}
        <span className={`badge badge--${status.tone}`}>{status.label}</span>
        {item.photo && (
          <span className="item-card__photo-tag">
            <Camera size={12} /> photo
          </span>
        )}
      </div>

      <div className="item-card__body">
        <div className="item-card__title-row">
          <h3>{item.name}</h3>
          <span className="item-card__place">{item.place}</span>
        </div>

        <p className="item-card__meta">
          <CalendarDays size={14} aria-hidden="true" />
          {formatShortDate(item.expiryDate)} · <strong>{humanCountdown(item.expiryDate)}</strong>
        </p>

        {item.note && <p className="item-card__note">{item.note}</p>}

        <div className="item-card__footer">
          <div className="qty-stepper" aria-label={`Quantity of ${item.name}`}>
            <button
              type="button"
              onClick={() => onAdjustQuantity(item.id, -1)}
              aria-label={`Decrease ${item.name} quantity`}
            >
              <Minus size={14} />
            </button>
            <span>
              {item.quantity} {item.unit}
            </span>
            <button
              type="button"
              onClick={() => onAdjustQuantity(item.id, 1)}
              aria-label={`Increase ${item.name} quantity`}
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="item-card__actions">
            <button type="button" className="icon-button" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}>
              <Pencil size={16} />
            </button>
            <button
              type="button"
              className="icon-button icon-button--danger"
              onClick={() => onDelete(item)}
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
