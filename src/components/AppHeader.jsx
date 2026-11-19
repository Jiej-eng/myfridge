import { Bell, BellRing, Refrigerator, Smartphone } from 'lucide-react';

/**
 * AppHeader - presentational only. Keeping it dumb means every interactive
 * behaviour lives in App.jsx and stays easy to trace during the demo.
 */
export default function AppHeader({ permission, onEnableReminders, isStandalone }) {
  const remindersOn = permission === 'granted';

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo" aria-hidden="true">
          <Refrigerator size={26} strokeWidth={2.2} />
        </span>
        <div>
          <h1>MyFridge</h1>
          <p>Know what you have. Use it before it expires.</p>
        </div>
      </div>

      <button
        type="button"
        className={`ghost-button ${remindersOn ? 'is-active' : ''}`}
        onClick={onEnableReminders}
        aria-label={remindersOn ? 'Expiry reminders are enabled' : 'Enable expiry reminders'}
      >
        {remindersOn ? <BellRing size={18} /> : <Bell size={18} />}
        <span>{remindersOn ? 'Reminders on' : 'Enable reminders'}</span>
      </button>

      {isStandalone && (
        <span className="install-pill" title="Running as an installed app">
          <Smartphone size={14} /> Installed
        </span>
      )}
    </header>
  );
}
