import PocketBase from 'pocketbase';

const defaultUrl = typeof window !== 'undefined' && window.location.port !== '5173' ? window.location.origin : 'http://127.0.0.1:8090';

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || defaultUrl;

export const pb = new PocketBase(pbUrl);
