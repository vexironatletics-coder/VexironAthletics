/** Guest chat session — persisted in localStorage so guests can reconnect */
const GUEST_SESSION_KEY = 'chat_guest_session_id';

export function getGuestSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(GUEST_SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(GUEST_SESSION_KEY, id);
  }
  return id;
}

export function newClientMessageId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
