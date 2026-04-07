const errors = [];
const MAX_ERRORS = 50;

export function logError(message, source = 'unknown') {
    errors.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        message,
        source
    });
    if (errors.length > MAX_ERRORS) errors.pop();
}

export function getErrors() {
    return errors.slice(0, 10);
}

export function clearErrors() {
    errors.length = 0;
}
