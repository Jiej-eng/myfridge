import { useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { CATEGORIES, STORAGE_PLACES, UNITS } from '../constants.js';
import { todayISO } from '../utils/date.js';
import Modal from './Modal.jsx';
import CameraCapture from './CameraCapture.jsx';

/**
 * ItemForm - handles both Create and Update.
 * In edit mode it is seeded with the existing item; in add mode with sensible
 * defaults. Validation is local so an invalid draft never reaches useItems.
 */
export default function ItemForm({ item, onSubmit, onClose }) {
  const isEditing = Boolean(item);
  const [draft, setDraft] = useState(() => ({
    name: item?.name ?? '',
    category: item?.category ?? 'dairy',
    quantity: item?.quantity ?? 1,
    unit: item?.unit ?? 'pcs',
    expiryDate: item?.expiryDate ?? todayISO(),
    place: item?.place ?? 'Fridge',
    note: item?.note ?? '',
    photo: item?.photo ?? null
  }));
  const [errors, setErrors] = useState({});
  const [cameraOpen, setCameraOpen] = useState(false);

  const setField = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!draft.name.trim()) nextErrors.name = 'Give the item a name.';
    if (!draft.expiryDate) nextErrors.expiryDate = 'Choose an expiry date.';
    if (!Number(draft.quantity) || Number(draft.quantity) < 1) {
      nextErrors.quantity = 'Quantity must be at least 1.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...draft,
      name: draft.name.trim(),
      quantity: Number(draft.quantity)
    });
    onClose();
  };

  return (
    <>
      <Modal
        title={isEditing ? 'Edit item' : 'Add to MyFridge'}
        subtitle={isEditing ? 'Update the details and the card changes instantly.' : 'Everything is saved on this device.'}
        onClose={onClose}
      >
        <form className="item-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row form-row--photo">
            <div className="photo-preview">
              {draft.photo ? (
                <img src={draft.photo} alt="Item preview" />
              ) : (
                <span aria-hidden="true">🍽️</span>
              )}
            </div>
            <div className="photo-controls">
              <button type="button" className="ghost-button" onClick={() => setCameraOpen(true)}>
                <Camera size={16} /> {draft.photo ? 'Retake photo' : 'Take a photo'}
              </button>
              {draft.photo && (
                <button type="button" className="ghost-button ghost-button--danger" onClick={() => setField('photo', null)}>
                  <Trash2 size={16} /> Remove
                </button>
              )}
              <p className="hint">Optional. Uses the device camera.</p>
            </div>
          </div>

          <label className={`field ${errors.name ? 'has-error' : ''}`}>
            <span>Name</span>
            <input
              type="text"
              value={draft.name}
              placeholder="e.g. Whole milk"
              autoFocus
              onChange={(event) => setField('name', event.target.value)}
            />
            {errors.name && <em>{errors.name}</em>}
          </label>

          <div className="form-grid">
            <label className="field">
              <span>Category</span>
              <select value={draft.category} onChange={(event) => setField('category', event.target.value)}>
                {CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Stored in</span>
              <select value={draft.place} onChange={(event) => setField('place', event.target.value)}>
                {STORAGE_PLACES.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
            </label>

            <label className={`field ${errors.quantity ? 'has-error' : ''}`}>
              <span>Quantity</span>
              <input
                type="number"
                min="1"
                step="1"
                value={draft.quantity}
                onChange={(event) => setField('quantity', event.target.value)}
              />
              {errors.quantity && <em>{errors.quantity}</em>}
            </label>

            <label className="field">
              <span>Unit</span>
              <select value={draft.unit} onChange={(event) => setField('unit', event.target.value)}>
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={`field ${errors.expiryDate ? 'has-error' : ''}`}>
            <span>Expiry date</span>
            <input
              type="date"
              value={draft.expiryDate}
              onChange={(event) => setField('expiryDate', event.target.value)}
            />
            {errors.expiryDate && <em>{errors.expiryDate}</em>}
          </label>

          <label className="field">
            <span>Note (optional)</span>
            <textarea
              rows={2}
              value={draft.note}
              placeholder="Opened on Monday, use for pasta…"
              onChange={(event) => setField('note', event.target.value)}
            />
          </label>

          <div className="form-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {isEditing ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </form>
      </Modal>

      {cameraOpen && (
        <CameraCapture
          onCapture={(photo) => setField('photo', photo)}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </>
  );
}
