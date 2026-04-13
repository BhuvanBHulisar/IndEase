/**
 * Demo data persistence — 24-hour localStorage cache.
 * Used only in offline/fallback demo mode (when backend is unavailable).
 * Real demo mode uses the actual backend with is_demo=true isolation.
 */

const KEY_DATA = 'demo_data';
const KEY_TIME = 'demo_data_time';
const EXPIRY_HOURS = 24;

export function loadDemoStore() {
    try {
        const saved = localStorage.getItem(KEY_DATA);
        const savedTime = localStorage.getItem(KEY_TIME);
        if (saved && savedTime) {
            const hoursElapsed = (Date.now() - parseInt(savedTime, 10)) / (1000 * 60 * 60);
            if (hoursElapsed < EXPIRY_HOURS) {
                return JSON.parse(saved);
            }
        }
    } catch (_) {}
    return null;
}

export function saveDemoStore(data) {
    try {
        localStorage.setItem(KEY_DATA, JSON.stringify(data));
        localStorage.setItem(KEY_TIME, Date.now().toString());
    } catch (_) {}
}

export function clearDemoStore() {
    localStorage.removeItem(KEY_DATA);
    localStorage.removeItem(KEY_TIME);
}

export function patchDemoStore(patch) {
    const current = loadDemoStore() || {};
    saveDemoStore({ ...current, ...patch });
}
