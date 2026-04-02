// In-memory ring buffer – last 10 server errors
const _store = [];

export function logError(message, source = 'unknown') {
    _store.unshift({
        timestamp: new Date().toISOString(),
        message: String(message),
        source,
    });
    if (_store.length > 10) _store.length = 10;
}

export function getErrors() {
    return [..._store];
}

export function clearErrors() {
    _store.length = 0;
}
