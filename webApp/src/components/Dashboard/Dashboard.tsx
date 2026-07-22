import './Dashboard.css';

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import type { Device } from 'shared';
import { useDevices } from '../../hooks/useDevices.ts';
import { useAuth } from '../AuthProvider/AuthProvider.tsx';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MapContext } from '../Map/MapContext.ts';
import { config } from '../../config.ts';

const Map = lazy(() => import('../Map/Map.tsx'));

type ThemeName = 'light' | 'dark';
type ThemeMode = ThemeName | 'system';
type StatusBucket = 'active' | 'alert' | 'offline';
type Filter = 'all' | StatusBucket;

const THEME_STORAGE_KEY = 'cs-dashboard-theme';

interface ThemeColors {
  page: string;
  panel: string;
  panelSolid: string;
  text: string;
  subtext: string;
  hairline: string;
  selBg: string;
  shadow: string;
  brand: string;
  brandDark: string;
  accent: string;
}

const THEME_COLORS: Record<ThemeName, ThemeColors> = {
  dark: {
    page: '#0D1B2A',
    panel: 'rgba(30,45,61,.82)',
    panelSolid: '#1E2D3D',
    text: '#F7F9FC',
    subtext: '#8A9AAD',
    hairline: 'rgba(255,255,255,.09)',
    selBg: 'rgba(255,255,255,.05)',
    shadow: '0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.42)',
    brand: '#45C4E6',
    brandDark: '#1A9BBF',
    accent: '#F5A623',
  },
  light: {
    page: '#F7F9FC',
    panel: 'rgba(255,255,255,.82)',
    panelSolid: '#FFFFFF',
    text: '#0D1B2A',
    subtext: '#6B7A8D',
    hairline: 'rgba(13,27,42,.09)',
    selBg: 'rgba(13,27,42,.045)',
    shadow: '0 1px 2px rgba(13,27,42,.05), 0 6px 20px rgba(13,27,42,.09)',
    brand: '#45C4E6',
    brandDark: '#1A9BBF',
    accent: '#F5A623',
  },
};

const STATUS_META: Record<StatusBucket, { color: string; label: string }> = {
  active: { color: '#45C4E6', label: 'Active' },
  alert: { color: '#F5A623', label: 'Alert' },
  offline: { color: '#6B7A8D', label: 'Offline' },
};

// Generic asset icon (the prototype's "container" glyph) — the real Device
// model has no type enum to pick a per-device icon from.
const DEVICE_ICON_PATH = 'M12 2.5 20.5 7v10L12 21.5 3.5 17V7z M3.5 7l8.5 4.5L20.5 7 M12 11.5v10';

// A device that has registered but never reported telemetry has no status
// yet (device.status is null) — treated as offline, the closest existing
// bucket to "no data".
function statusBucket(overall: string | null | undefined): StatusBucket {
  if (!overall) return 'offline';
  const s = overall.toLowerCase();
  if (s === 'active' || s === 'ok' || s === 'online' || s === 'healthy') return 'active';
  if (s === 'alert' || s === 'warning' || s === 'degraded') return 'alert';
  return 'offline';
}

function batteryClass(battery: number | null | undefined): string {
  if (battery == null) return 'cs-battery-unknown';
  if (battery >= 50) return 'cs-battery-good';
  if (battery >= 20) return 'cs-battery-warn';
  return 'cs-battery-low';
}

function getInitialThemeMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

// Unlike a one-time `matchMedia(...).matches` read at load, this tracks OS
// theme changes live via the media query's `change` event, so "System" mode
// actually follows the OS instead of just seeding an initial value.
function useSystemPrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return prefersDark;
}

function matchesQuery(device: Device, query: string): boolean {
  const haystack = `${device.name ?? ''} ${device.description ?? ''} ${device.uuid}`.toLowerCase();
  return haystack.includes(query);
}

type ThemeVars = CSSProperties & Record<`--${string}`, string>;

export function Dashboard() {
  const { devices, isLoading, error } = useDevices();
  const { isAuthenticated, user, login, logout } = useAuth();
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const systemPrefersDark = useSystemPrefersDark();
  const theme: ThemeName = themeMode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : themeMode;
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [focusedDeviceId, setFocusedDeviceId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // No notification API is wired up yet — this stays empty until there's a
  // real source to populate it from, rather than faking an unread indicator.
  const [notifications] = useState<{ id: string; message: string; read: boolean }[]>([]);
  const hasUnreadNotifications = notifications.some((n) => !n.read);
  const [mapInstance, setMapInstance] = useState<MapboxMap | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (!accountMenuOpen && !notificationsOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [accountMenuOpen, notificationsOpen]);

  const C = THEME_COLORS[theme];

  const counts = useMemo(() => {
    const result = { all: devices.length, active: 0, alert: 0, offline: 0 };
    devices.forEach((d) => result[statusBucket(d.status?.overall)]++);
    return result;
  }, [devices]);

  const filteredDevices = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = filter === 'all' ? devices : devices.filter((d) => statusBucket(d.status?.overall) === filter);
    if (q) list = list.filter((d) => matchesQuery(d, q));
    return list;
  }, [devices, filter, query]);

  const allExpanded =
    filteredDevices.length > 0 && filteredDevices.every((d) => expandedIds.has(d.uuid));

  const toggleExpandAll = () => {
    setExpandedIds(allExpanded ? new Set() : new Set(filteredDevices.map((d) => d.uuid)));
  };

  const rootStyle: ThemeVars = {
    '--cs-brand': C.brand,
    '--cs-brand-dark': C.brandDark,
    '--cs-accent': C.accent,
    '--cs-text': C.text,
    '--cs-sub': C.subtext,
    '--cs-panel': C.panel,
    '--cs-panel-solid': C.panelSolid,
    '--cs-hairline': C.hairline,
    '--cs-sel': C.selBg,
    '--cs-shadow': C.shadow,
    '--cs-page': C.page,
  };

  const logoSrc = theme === 'dark' ? '/brand/cerebral-stratum-darkmode.svg' : '/brand/cerebral-stratum-lightmode.svg';

  const initials =
    `${user?.givenName?.[0] ?? ''}${user?.familyName?.[0] ?? ''}`.toUpperCase() || null;

  return (
    <div className="cs-dashboard" style={rootStyle}>
      <MapContext.Provider value={{ map: mapInstance }}>
      {/* ============ MAP LAYER ============ */}
      <Suspense fallback={<div className="cs-map-container cs-map-loading" />}>
        <Map devices={filteredDevices} selectedDeviceId={focusedDeviceId} onMapChange={setMapInstance} />
      </Suspense>

      {/* ============ TOP RIBBON ============ */}
      <header className="cs-ribbon">
        <div className="cs-ribbon-brand">
          <img src={logoSrc} alt="TrueWard" className="cs-ribbon-logo" />
          <div className="cs-ribbon-brand-text">
            <div className="cs-ribbon-brand-name">TrueWard</div>
            <div className="cs-ribbon-brand-sub">BlueGuardian Co.</div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="cs-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assets, IDs, descriptions…"
              className="cs-search-input"
            />
          </div>
        )}

        {isAuthenticated && (
          <div className="cs-chips">
            {(['all', 'active', 'alert', 'offline'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`cs-chip${filter === key ? ' cs-chip-active' : ''}`}
              >
                <span
                  className="cs-chip-dot"
                  style={{ background: key === 'all' ? 'var(--cs-sub)' : STATUS_META[key].color }}
                />
                {key === 'all' ? 'All' : STATUS_META[key].label}
                <span className="cs-chip-count">{counts[key]}</span>
              </button>
            ))}
          </div>
        )}

        <div className="cs-ribbon-spacer" />

        <div className="cs-ribbon-actions">
          {!isAuthenticated ? (
            <button className="cs-signin-btn" onClick={login}>
              Sign in
            </button>
          ) : (
            <div className="cs-account" ref={accountMenuRef}>
              <button
                className="cs-avatar"
                title="Account"
                onClick={() => {
                  setAccountMenuOpen((o) => !o);
                  setNotificationsOpen(false);
                }}
              >
                {initials ?? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
                {hasUnreadNotifications && <span className="cs-avatar-dot" />}
              </button>
              {accountMenuOpen && (
                <div className="cs-account-menu">
                  <a
                    className="cs-account-menu-item"
                    href={`${config.keycloakUrl}/realms/${config.keycloakRealm}/account/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Account
                  </a>
                  <button
                    className="cs-account-menu-item"
                    onClick={() => {
                      setNotificationsOpen(true);
                      setAccountMenuOpen(false);
                    }}
                  >
                    Inbox
                  </button>
                  <div className="cs-theme-switch">
                    {(['light', 'dark', 'system'] as const).map((mode) => (
                      <button
                        key={mode}
                        className={`cs-theme-switch-btn${themeMode === mode ? ' cs-theme-switch-btn-active' : ''}`}
                        onClick={() => setThemeMode(mode)}
                      >
                        {mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'System'}
                      </button>
                    ))}
                  </div>
                  <span className="cs-account-menu-item cs-account-menu-item-disabled">Manage Subscription</span>
                  <button className="cs-account-menu-item" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
              {notificationsOpen && (
                <div className="cs-account-menu cs-notifications-panel">
                  <div className="cs-notifications-header">
                    <span>Notifications</span>
                    <button className="cs-notifications-close" onClick={() => setNotificationsOpen(false)}>
                      ×
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="cs-notifications-empty">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <p key={n.id} className="cs-notifications-empty">
                        {n.message}
                      </p>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ============ DEVICE LIST PANEL ============ */}
      {isAuthenticated && (
      <aside className={`cs-panel${panelCollapsed ? ' cs-panel-collapsed' : ''}`}>
        <div className="cs-panel-header">
          <div>
            <div className="cs-panel-title">Devices</div>
            <div className="cs-panel-subtitle">
              {filteredDevices.length} of {devices.length} assets
            </div>
          </div>
          <div className="cs-panel-header-actions">
            {!panelCollapsed && filteredDevices.length > 0 && (
              <button className="cs-panel-expand-all" onClick={toggleExpandAll}>
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </button>
            )}
            <button
              onClick={() => setPanelCollapsed((c) => !c)}
              title={panelCollapsed ? 'Expand devices' : 'Minimise'}
              className="cs-panel-toggle"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                style={{ transform: `rotate(${panelCollapsed ? 180 : 0}deg)`, transition: 'transform .2s ease' }}
              >
                <path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {!panelCollapsed && (
          <div className="cs-panel-list">
            {isLoading && <p className="cs-panel-status">Loading devices…</p>}
            {!isLoading && error && (
              <p className="cs-panel-status cs-panel-error" role="alert">
                {error}
              </p>
            )}
            {!isLoading && !error && filteredDevices.length === 0 && (
              <p className="cs-panel-status">No devices found.</p>
            )}
            {!isLoading &&
              !error &&
              filteredDevices.map((device) => {
                const bucket = statusBucket(device.status?.overall);
                const meta = STATUS_META[bucket];
                const selected = expandedIds.has(device.uuid);
                return (
                  <div key={device.uuid} className="cs-row">
                    <button
                      onClick={() => {
                        setExpandedIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(device.uuid)) next.delete(device.uuid);
                          else next.add(device.uuid);
                          return next;
                        });
                        setFocusedDeviceId(device.uuid);
                      }}
                      onFocus={() => setFocusedDeviceId(device.uuid)}
                      className="cs-row-main"
                      style={{ background: selected ? 'var(--cs-sel)' : 'transparent', borderColor: selected ? meta.color : 'transparent' }}
                    >
                      <div className="cs-row-icon-wrap">
                        {device.image_path ? (
                          <img src={device.image_path} alt="" className="cs-row-icon-img" />
                        ) : (
                          <div className="cs-row-icon" style={{ background: `${meta.color}26` }}>
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                              <path d={DEVICE_ICON_PATH} />
                            </svg>
                          </div>
                        )}
                        <span className="cs-row-dot" style={{ background: meta.color }} />
                      </div>
                      <div className="cs-row-info">
                        <div className="cs-row-title-line">
                          <span className="cs-row-name">{device.name ?? device.uuid}</span>
                          <span className="cs-row-status-label" style={{ color: meta.color }}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="cs-row-meta-line">
                          <span className="cs-row-desc">{device.description || 'Device'}</span>
                          <span className={`cs-row-battery ${batteryClass(device.status?.battery)}`}>
                            {device.status?.battery != null ? `${device.status.battery}%` : '—'}
                          </span>
                        </div>
                      </div>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--cs-sub)"
                        strokeWidth={2.2}
                        className="cs-row-chevron"
                        style={{ transform: `rotate(${selected ? 180 : 0}deg)` }}
                      >
                        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {selected && (
                      <div className="cs-row-detail">
                        {bucket === 'alert' && (
                          <div className="cs-row-alert">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--cs-accent)" strokeWidth={2} style={{ flex: '0 0 auto', marginTop: 1 }}>
                              <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>{device.status?.summary}</span>
                          </div>
                        )}
                        <div className="cs-row-stat">
                          <div className="cs-row-stat-label">Battery</div>
                          <div className="cs-row-stat-value">
                            {device.status?.battery ?? '—'}
                            {device.status?.battery != null && <span className="cs-row-stat-unit">%</span>}
                          </div>
                        </div>
                        {bucket !== 'alert' && device.status?.summary && (
                          <p className="cs-row-summary">{device.status.summary}</p>
                        )}
                        {bucket !== 'alert' && !device.status && (
                          <p className="cs-row-summary">No status reported yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </aside>
      )}

      {/* ============ MAP CONTROLS (bottom-right) ============ */}
      <div className="cs-map-controls">
        <div className="cs-zoom-group">
          <button className="cs-zoom-btn" onClick={() => mapInstance?.zoomIn()}>
            +
          </button>
          <button className="cs-zoom-btn" onClick={() => mapInstance?.zoomOut()}>
            −
          </button>
        </div>
        <button
          className="cs-locate-btn"
          title="Recenter"
          onClick={() => mapInstance?.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M12 2v3M12 19v3M22 12h-3M5 12H2" />
            <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
          </svg>
        </button>
      </div>
      </MapContext.Provider>
    </div>
  );
}
