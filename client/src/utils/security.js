const STATIC_SALT = "FinSights_SecuRe_S@lt_2026";

// ─── RC4 Core ───────────────────────────────────────────
function rc4(key, str) {
    let s = Array.from({ length: 256 }, (_, i) => i);
    let j = 0;

    for (let i = 0; i < 256; i++) {
        j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
        [s[i], s[j]] = [s[j], s[i]]; // ← cleaner swap
    }

    let i = 0; j = 0;
    return str.split('').map(char => {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        [s[i], s[j]] = [s[j], s[i]];
        return String.fromCharCode(char.charCodeAt(0) ^ s[(s[i] + s[j]) % 256]);
    }).join('');
}

// ─── Base64 Unicode Helpers ──────────────────────────────
const toB64 = str => btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    (_, p1) => String.fromCharCode(parseInt(p1, 16))));

const fromB64 = str => decodeURIComponent(atob(str).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

// ─── Key ─────────────────────────────────────────────────
const getKey = (userId) => userId ? `${userId}_${STATIC_SALT}` : STATIC_SALT;

// ─── Encrypt / Decrypt ───────────────────────────────────
export function encryptData(data, userId) {
    if (data == null) return '';
    try {
        const text = typeof data === 'string' ? data : JSON.stringify(data);
        return btoa(rc4(getKey(userId), toB64(text)));
    } catch (e) {
        console.error("Encryption failed:", e);
        return '';
    }
}

export function decryptData(ciphertext, userId) {
    if (!ciphertext) return null;
    try {
        return fromB64(rc4(getKey(userId), atob(ciphertext)));
    } catch (e) {
        console.error("Decryption failed:", e);
        return null;
    }
}

// ─── Storage Adapters ────────────────────────────────────
const makeStorage = (store) => ({
    setItem: (key, value, userId) => store.setItem(key, encryptData(value, userId)),
    getItem: (key, userId) => {
        const val = store.getItem(key);
        return val ? decryptData(val, userId) : null;
    },
    removeItem: (key) => store.removeItem(key),
    clear: () => store.clear()
});

export const secureLocalStorage = makeStorage(localStorage);
export const secureSessionStorage = makeStorage(sessionStorage);

// ─── Auto-Migration & Cleanup of Legacy/Stale Storage Keys ───
try {
    // 1. Migrate active auth keys to encrypted format if they are plaintext
    const rawUser = localStorage.getItem('user');
    if (rawUser && decryptData(rawUser) === null) {
        localStorage.setItem('user', encryptData(rawUser));
    }
    const rawToken = localStorage.getItem('token');
    if (rawToken && decryptData(rawToken) === null) {
        localStorage.setItem('token', encryptData(rawToken));
    }

    // 2. Wipe legacy/stale plaintext keys that shouldn't persist in localStorage
    localStorage.removeItem('finsights_data');
    localStorage.removeItem('finsights_page');
    localStorage.removeItem('finsights_data_undefined');
} catch (e) {
    console.error("Storage auto-migration and cleanup failed:", e);
}