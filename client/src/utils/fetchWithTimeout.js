const DEFAULT_TIMEOUT_MS = 8000;

export class FetchTimeoutError extends Error {
    constructor(url) {
        super(`Request timed out: ${url}`);
        this.name = 'FetchTimeoutError';
    }
}

export default async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        return res;
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new FetchTimeoutError(url);
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
}
