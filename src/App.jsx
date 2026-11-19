import { useEffect, useMemo, useState } from 'react';
import { BellRing, Download, Plus, Sparkles, Trash2 } from 'lucide-react';
import AppHeader from './components/AppHeader.jsx';
import StatsBar from './components/StatsBar.jsx';
import FilterBar from './components/FilterBar.jsx';
import ItemCard from './components/ItemCard.jsx';
import ItemForm from './components/ItemForm.jsx';
import EmptyState from './components/EmptyState.jsx';
import Modal from './components/Modal.jsx';
import { useItems, DEMO_ITEMS } from './hooks/useItems.js';
import { useNotifications } from './hooks/useNotifications.js';
import { expiryStatus } from './utils/date.js';

/**
 * App - the only stateful container.
 * It owns the filter state, decides which modal is open, and composes the
 * presentational children. All data mutations go through useItems.
 */
export default function App() {
  const {
    items,
    stats,
    storageError,
    addItem,
    updateItem,
    adjustQuantity,
    deleteItem,
    clearAll,
    setItems
  } = useItems();

  const { permission, lastCheck, feedback, requestPermission, checkExpiring } = useNotifications(items);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('expiry');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const isStandalone =
    typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches;

  // A single toast component, replaced (not stacked) on every action.
  const showToast = (text, tone = 'info') => setToast({ text, tone, id: Date.now() });

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Demo shortcut used when recording the walkthrough video: open the app
  // with ?demo=1 to start from a realistic fridge instead of an empty one.
  useEffect(() => {
    const wantsDemo = new URLSearchParams(window.location.search).get('demo') === '1';
    if (wantsDemo && items.length === 0) {
      setItems(DEMO_ITEMS.map((item) => ({ ...item, createdAt: new Date().toISOString() })));
    }
    // Intentionally runs only on the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return items
      .filter((item) => {
        if (status !== 'all' && expiryStatus(item.expiryDate).id !== status) return false;
        if (category !== 'all' && item.category !== category) return false;
        if (!needle) return true;
        return (
          item.name.toLowerCase().includes(needle) ||
          (item.note ?? '').toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      });
  }, [items, query, status, category, sort]);

  const openAddForm = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmit = (draft) => {
    if (editingItem) {
      updateItem(editingItem.id, draft);
      showToast(`"${draft.name}" updated`, 'success');
    } else {
      addItem(draft);
      showToast(`"${draft.name}" added to ${draft.place}`, 'success');
    }
  };

  const confirmDelete = () => {
    const name = pendingDelete?.name;
    deleteItem(pendingDelete.id);
    setPendingDelete(null);
    showToast(`"${name}" removed`, 'info');
  };

  const handleQuantity = (id, delta) => {
    const item = items.find((entry) => entry.id === id);
    if (item && item.quantity + delta < 1) return;
    adjustQuantity(id, delta);
  };

  const loadDemoItems = () => {
    setItems(DEMO_ITEMS.map((item) => ({ ...item, createdAt: new Date().toISOString() })));
    showToast('Five sample items loaded', 'success');
  };

  const resetFilters = () => {
    setQuery('');
    setStatus('all');
    setCategory('all');
  };

  const handleReminders = async () => {
    const result = await requestPermission();
    if (result === 'granted') checkExpiring();
  };

  return (
    <div className="app-shell">
      <AppHeader permission={permission} onEnableReminders={handleReminders} isStandalone={isStandalone} />

      <main className="app-main">
        <StatsBar stats={stats} />

        {(storageError || feedback) && (
          <p className={`app-banner ${storageError ? 'app-banner--danger' : ''}`} role="status">
            {storageError || feedback}
          </p>
        )}

        <div className="reminder-row">
          <button type="button" className="text-button" onClick={checkExpiring}>
            <BellRing size={16} /> Check expiring items now
          </button>
          {lastCheck && (
            <span className="reminder-row__meta">
              Last check: {new Date(lastCheck).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          )}
        </div>

        <FilterBar
          query={query}
          onQueryChange={setQuery}
          status={status}
          onStatusChange={setStatus}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
          visibleCount={visibleItems.length}
        />

        {visibleItems.length === 0 ? (
          <EmptyState
            filtered={items.length > 0}
            onAdd={openAddForm}
            onReset={resetFilters}
            onLoadDemo={loadDemoItems}
          />
        ) : (
          <section className="item-grid" aria-label="Fridge contents">
            {visibleItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={openEditForm}
                onDelete={setPendingDelete}
                onAdjustQuantity={handleQuantity}
              />
            ))}
          </section>
        )}

        {items.length > 0 && (
          <footer className="app-footer">
            <span>{items.length} item(s) stored on this device</span>
            <button type="button" className="text-button text-button--danger" onClick={clearAll}>
              <Trash2 size={14} /> Clear all
            </button>
          </footer>
        )}
      </main>

      <button type="button" className="fab" onClick={openAddForm} aria-label="Add a new item">
        <Plus size={22} />
        <span>Add item</span>
      </button>

      {formOpen && (
        <ItemForm item={editingItem} onSubmit={handleSubmit} onClose={() => setFormOpen(false)} />
      )}

      {pendingDelete && (
        <Modal
          title="Delete this item?"
          subtitle="This cannot be undone, but the rest of the fridge stays untouched."
          onClose={() => setPendingDelete(null)}
          variant="confirm"
        >
          <p className="confirm-text">
            <strong>{pendingDelete.name}</strong> will be removed from MyFridge.
          </p>
          <div className="form-actions">
            <button type="button" className="ghost-button" onClick={() => setPendingDelete(null)}>
              Keep it
            </button>
            <button type="button" className="primary-button primary-button--danger" onClick={confirmDelete}>
              Delete item
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className={`toast toast--${toast.tone}`} role="status">
          {toast.tone === 'success' ? <Sparkles size={16} /> : <Download size={16} />}
          {toast.text}
        </div>
      )}
    </div>
  );
}
