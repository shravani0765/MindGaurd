const STORAGE_KEY = 'mindguard.auth.session.v1';

export function loadStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to load saved session:', error);
    return null;
  }
}

export function saveStoredSession(session) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function getStoredAuthToken() {
  return loadStoredSession()?.authToken || '';
}
