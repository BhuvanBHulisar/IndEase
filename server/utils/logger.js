const isDev = process.env.NODE_ENV !== 'production';

const SENSITIVE_KEYS = [
  'password', 'token', 'accessToken', 'refreshToken',
  'secret', 'key', 'authorization', 'cookie',
  'credit_card', 'bank_account', 'ifsc', 'tax_id',
  'idToken', 'googleToken', 'hashed', 'hash'
];

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = Array.isArray(obj) ? [] : {};
  for (const k in obj) {
    if (SENSITIVE_KEYS.some(s => k.toLowerCase().includes(s))) {
      clean[k] = '••••••';
    } else if (typeof obj[k] === 'object') {
      clean[k] = sanitize(obj[k]);
    } else {
      clean[k] = obj[k];
    }
  }
  return clean;
}

export const logger = {
  info: (msg, data) => {
    if (data) console.log(`[INFO] ${msg}`, sanitize(data));
    else console.log(`[INFO] ${msg}`);
  },
  error: (msg, err) => {
    console.error(`[ERROR] ${msg}`, err?.message || err);
  },
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  debug: (msg, data) => {
    if (!isDev) return;
    if (data) console.log(`[DEBUG] ${msg}`, sanitize(data));
    else console.log(`[DEBUG] ${msg}`);
  }
};
