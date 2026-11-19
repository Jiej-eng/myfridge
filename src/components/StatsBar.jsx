import { AlertTriangle, Package, Timer } from 'lucide-react';

/** Summary strip: three derived numbers, recomputed whenever items change. */
export default function StatsBar({ stats }) {
  const cards = [
    { id: 'total', label: 'Items tracked', value: stats.total, icon: Package, tone: 'neutral' },
    { id: 'soon', label: 'Use within 3 days', value: stats.soon, icon: Timer, tone: 'warning' },
    { id: 'expired', label: 'Already expired', value: stats.expired, icon: AlertTriangle, tone: 'danger' }
  ];

  return (
    <section className="stats" aria-label="Fridge summary">
      {cards.map(({ id, label, value, icon: Icon, tone }) => (
        <article key={id} className={`stat-card stat-card--${tone}`}>
          <Icon size={18} aria-hidden="true" />
          <div>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
