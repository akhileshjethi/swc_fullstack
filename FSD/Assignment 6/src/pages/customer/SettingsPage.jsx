import { useState } from "react";

const Toggle = ({ checked, onChange, id }) => (
  <button id={id} onClick={() => onChange(!checked)} style={{
    width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
    background: checked ? "var(--accent-primary)" : "var(--bg-elevated)",
    position: "relative", transition: "background 0.2s", flexShrink: 0,
  }}>
    <span style={{
      position: "absolute", width: 18, height: 18, borderRadius: "50%", background: "white",
      top: 3, left: checked ? 22 : 3, transition: "left 0.2s",
    }} />
  </button>
);

const SettingsRow = ({ icon, title, desc, settingKey, settings, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--border-color)" }}>
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <span style={{ fontSize: "1.3rem" }}>{icon}</span>
      <div>
        <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{title}</p>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>{desc}</p>
      </div>
    </div>
    <Toggle id={`toggle-${settingKey}`} checked={settings[settingKey]} onChange={v => onChange(settingKey, v)} />
  </div>
);

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    bookingConfirmation: true, promotions: false, reminders: true, newMovies: true, priceAlerts: false,
  });
  const [account, setAccount] = useState({ twoFactor: false, dataSharing: false });

  const updateNotif = (key, val) => setNotifications(p => ({ ...p, [key]: val }));
  const updateAccount = (key, val) => setAccount(p => ({ ...p, [key]: val }));

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: 8 }}>Account <span style={{ color: "var(--accent-primary)" }}>Settings</span></h1>
      <p className="text-muted" style={{ marginBottom: 32 }}>Manage your preferences and account settings</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Notifications */}
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>🔔 Notification Preferences</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>Choose which notifications you receive</p>
          <SettingsRow icon="🎟️" title="Booking Confirmations" desc="Receive confirmations for every booking" settingKey="bookingConfirmation" settings={notifications} onChange={updateNotif} />
          <SettingsRow icon="🎬" title="New Movie Alerts" desc="Get notified when new movies are added" settingKey="newMovies" settings={notifications} onChange={updateNotif} />
          <SettingsRow icon="⏰" title="Show Reminders" desc="Remind me 1 hour before my shows" settingKey="reminders" settings={notifications} onChange={updateNotif} />
          <SettingsRow icon="🏷️" title="Promotions & Offers" desc="Exclusive deals and discount codes" settingKey="promotions" settings={notifications} onChange={updateNotif} />
          <SettingsRow icon="💰" title="Price Drop Alerts" desc="Alert when ticket prices drop" settingKey="priceAlerts" settings={notifications} onChange={updateNotif} />
        </div>

        {/* Account Security */}
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>🔐 Account Security</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>Manage your account security settings</p>
          <SettingsRow icon="🛡️" title="Two-Factor Authentication" desc="Add an extra layer of security to your account" settingKey="twoFactor" settings={account} onChange={updateAccount} />
          <SettingsRow icon="📊" title="Data Sharing" desc="Share anonymous usage data to improve CineVerse" settingKey="dataSharing" settings={account} onChange={updateAccount} />
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <h3 style={{ marginBottom: 4, color: "#f87171" }}>⚠️ Danger Zone</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16 }}>Irreversible actions for your account</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-outline" id="delete-account-btn" style={{ borderColor: "#f87171", color: "#f87171" }}>
              Delete Account
            </button>
            <button className="btn btn-secondary" id="export-data-btn">Export My Data</button>
          </div>
        </div>
      </div>
    </div>
  );
}
