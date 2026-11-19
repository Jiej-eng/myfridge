import {
  Beef,
  Carrot,
  CupSoda,
  Milk,
  Package,
  Sandwich,
  Snowflake
} from 'lucide-react';

/**
 * One icon per category. Using vector icons instead of emoji keeps the cards
 * visually consistent across platforms (emoji fonts differ on every device).
 */
const ICONS = {
  dairy: Milk,
  meat: Beef,
  produce: Carrot,
  bakery: Sandwich,
  frozen: Snowflake,
  drinks: CupSoda,
  other: Package
};

export default function CategoryIcon({ category, size = 38, withCircle = true }) {
  const Icon = ICONS[category] ?? Package;
  if (!withCircle) return <Icon size={size} aria-hidden="true" />;

  return (
    <span className="category-icon" aria-hidden="true">
      <Icon size={size} />
    </span>
  );
}
