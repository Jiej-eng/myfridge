// Single source of truth for the values that drive the UI.
// Keeping them here means the filters, the form dropdowns and the badge
// colours can never drift out of sync.

export const STORAGE_KEY = 'myfridge.items.v1';

export const CATEGORIES = [
  { id: 'dairy', label: 'Dairy' },
  { id: 'meat', label: 'Meat & Fish' },
  { id: 'produce', label: 'Fruit & Veg' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'frozen', label: 'Frozen' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'other', label: 'Other' }
];

export const STORAGE_PLACES = ['Fridge', 'Freezer', 'Pantry'];

export const UNITS = ['pcs', 'pack', 'bottle', 'g', 'ml'];

// A "soon" item is one that expires within this many days.
export const SOON_THRESHOLD_DAYS = 3;

export const SORT_OPTIONS = [
  { id: 'expiry', label: 'Expiry date' },
  { id: 'name', label: 'Name (A-Z)' },
  { id: 'recent', label: 'Recently added' }
];

// Status is derived, never stored - that avoids stale data if the clock moves on.
export const STATUS = {
  expired: { id: 'expired', label: 'Expired', tone: 'danger' },
  soon: { id: 'soon', label: 'Use soon', tone: 'warning' },
  fresh: { id: 'fresh', label: 'Fresh', tone: 'success' }
};

export const categoryById = (id) =>
  CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
