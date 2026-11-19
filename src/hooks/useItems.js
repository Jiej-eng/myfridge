import { useCallback, useMemo } from 'react';
import { STORAGE_KEY } from '../constants.js';
import { usePersistedState } from './usePersistedState.js';
import { expiryStatus, isoDateFromOffset } from '../utils/date.js';

/**
 * useItems - the single owner of the item collection.
 *
 * Every mutation goes through this hook, which keeps all four CRUD operations
 * in one place:
 *   Create -> addItem
 *   Read   -> items (plus derived selectors)
 *   Update -> updateItem / adjustQuantity
 *   Delete -> deleteItem / clearAll
 *
 * The list itself is persisted by usePersistedState, so state and storage can
 * never disagree.
 */
export function useItems() {
  const [items, setItems, storageError] = usePersistedState(STORAGE_KEY, []);

  const addItem = useCallback(
    (draft) => {
      const now = new Date().toISOString();
      const item = {
        id: createId(),
        name: draft.name.trim(),
        category: draft.category,
        quantity: Number(draft.quantity) || 1,
        unit: draft.unit,
        expiryDate: draft.expiryDate,
        place: draft.place,
        note: (draft.note ?? '').trim(),
        photo: draft.photo ?? null,
        createdAt: now,
        updatedAt: now
      };
      setItems((previous) => [item, ...previous]);
      return item;
    },
    [setItems]
  );

  const updateItem = useCallback(
    (id, changes) => {
      setItems((previous) =>
        previous.map((item) =>
          item.id === id
            ? { ...item, ...changes, updatedAt: new Date().toISOString() }
            : item
        )
      );
    },
    [setItems]
  );

  /** Used by the +/- buttons on the card: quantity never drops below 1. */
  const adjustQuantity = useCallback(
    (id, delta) => {
      setItems((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.max(1, Number(item.quantity) + delta),
                updatedAt: new Date().toISOString()
              }
            : item
        )
      );
    },
    [setItems]
  );

  const deleteItem = useCallback(
    (id) => {
      setItems((previous) => previous.filter((item) => item.id !== id));
    },
    [setItems]
  );

  const clearAll = useCallback(() => setItems([]), [setItems]);

  const stats = useMemo(() => computeStats(items), [items]);

  return {
    items,
    stats,
    storageError,
    addItem,
    updateItem,
    adjustQuantity,
    deleteItem,
    clearAll,
    setItems
  };
}

function computeStats(items) {
  return items.reduce(
    (totals, item) => {
      const status = expiryStatus(item.expiryDate);
      totals.total += 1;
      if (status.id === 'expired') totals.expired += 1;
      if (status.id === 'soon') totals.soon += 1;
      return totals;
    },
    { total: 0, expired: 0, soon: 0 }
  );
}

/** crypto.randomUUID is available in every modern browser; fall back for older ones. */
function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Demo data so a fresh install is not an empty screen during the demonstration. */
export const DEMO_ITEMS = [
  {
    id: 'demo-milk',
    name: 'Whole milk',
    category: 'dairy',
    quantity: 1,
    unit: 'bottle',
    expiryDate: isoDateFromOffset(2),
    place: 'Fridge',
    note: 'Opened on Monday',
    photo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-spinach',
    name: 'Baby spinach',
    category: 'produce',
    quantity: 1,
    unit: 'pack',
    expiryDate: isoDateFromOffset(1),
    place: 'Fridge',
    note: '',
    photo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-eggs',
    name: 'Free-range eggs',
    category: 'other',
    quantity: 6,
    unit: 'pcs',
    expiryDate: isoDateFromOffset(12),
    place: 'Fridge',
    note: '',
    photo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-yoghurt',
    name: 'Greek yoghurt',
    category: 'dairy',
    quantity: 2,
    unit: 'pack',
    expiryDate: isoDateFromOffset(-2),
    place: 'Fridge',
    note: 'Check the smell before use',
    photo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-bread',
    name: 'Sourdough loaf',
    category: 'bakery',
    quantity: 1,
    unit: 'pcs',
    expiryDate: isoDateFromOffset(4),
    place: 'Pantry',
    note: 'Slice before freezing',
    photo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
