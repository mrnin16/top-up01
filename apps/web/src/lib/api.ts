const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

let _access:  string | null = null;
let _refresh: string | null = null;

export function setAccessToken(t: string | null)  { _access  = t; }
export function setRefreshToken(t: string | null) { _refresh = t; }
export function getAccessToken()  { return _access; }
export function getRefreshToken() { return _refresh; }

// Hook for the store to clear auth + redirect on terminal failure
let _onAuthFailure: (() => void) | null = null;
export function onAuthFailure(cb: () => void) { _onAuthFailure = cb; }

async function request<T>(
  path: string,
  init: RequestInit = {},
  idempotencyKey?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (_access)         headers['Authorization']   = `Bearer ${_access}`;
  if (idempotencyKey)  headers['Idempotency-Key'] = idempotencyKey;

  const res = await fetch(`${API}${path}`, { ...init, headers, credentials: 'include' });

  // 401 → try one refresh attempt (if we have a refresh token)
  if (res.status === 401 && _refresh && !path.startsWith('/auth/')) {
    try {
      const r = await fetch(`${API}/auth/refresh`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ refresh: _refresh }),
      });
      if (r.ok) {
        const { access, refresh } = await r.json();
        _access  = access;
        if (refresh) _refresh = refresh;
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${access}`;
        const retry = await fetch(`${API}${path}`, { ...init, headers, credentials: 'include' });
        if (!retry.ok) throw await toError(retry);
        return retry.status === 204 ? (undefined as unknown as T) : retry.json();
      }
    } catch {
      // fall through to clear + redirect
    }
    _access  = null;
    _refresh = null;
    if (_onAuthFailure) _onAuthFailure();
    throw new Error('Session expired — please sign in again');
  }

  if (!res.ok)              throw await toError(res);
  if (res.status === 204)   return undefined as unknown as T;
  return res.json();
}

async function toError(res: Response) {
  try {
    const body = await res.json();
    return Object.assign(
      new Error(body.detail ?? body.message ?? res.statusText),
      { status: res.status, body },
    );
  } catch {
    return Object.assign(new Error(res.statusText), { status: res.status });
  }
}

// ── Typed surface ───────────────────────────────────────────────────────────
export const api = {
  // Platform public settings (KHQR image, merchant info, UI mode, multilingual text — no auth)
  publicSettings: () =>
    request<Record<string, string> & {
      khqrImageUrl?:     string;
      khqrMerchantName?: string;
      khqrMerchantId?:   string;
      khqrAccountNo?:    string;
      khqrCity?:         string;
      announcementText?: string;
      uiMode?:           'default' | 'liquid' | 'anime';
    }>('/settings/public'),

  // Catalog
  categories:       () => request<any[]>('/categories'),
  products:         (params: Record<string, string | undefined> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
    return request<any[]>(`/products?${q}`);
  },
  product:          (slug: string) => request<any>(`/products/${slug}`),
  validateAccount:  (slug: string, body: { gameUserId: string; zoneId: string }) =>
    request<{ valid: boolean; displayName: string | null }>(
      `/products/${slug}/validate-account`,
      { method: 'POST', body: JSON.stringify(body) },
    ),

  // Auth
  register:    (body: unknown) =>
    request<{ access: string; refresh: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:       (body: unknown) =>
    request<{ access: string; refresh: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  refresh:     (refresh: string) =>
    request<{ access: string; refresh: string }>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh }) }),
  me:          () =>
    request<{ id: string; email?: string; phone?: string; name: string; role: string }>('/auth/me'),
  updateMe:    (body: { name?: string; email?: string; phone?: string }) =>
    request<{ id: string; name: string; email?: string }>('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),
  sendOtp:     (body: { email?: string; phone?: string }) =>
    request<{ token: string }>('/auth/otp/send', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp:   (body: { token: string; code: string }) =>
    request<{ verified: boolean }>('/auth/otp/verify', { method: 'POST', body: JSON.stringify(body) }),

  // Orders
  createOrder: (body: unknown, idempotencyKey: string) =>
    request<any>('/orders', { method: 'POST', body: JSON.stringify(body) }, idempotencyKey),
  order:       (id: string) => request<any>(`/orders/${id}`),
  orders:      (page = 1)   => request<any[]>(`/orders?page=${page}`),

  // Payments
  initiateKhqr: (orderId: string) =>
    request<{ paymentId: string; qrString: string; expiresAt: string }>(
      '/payments/khqr', { method: 'POST', body: JSON.stringify({ orderId }) },
    ),
  initiateBank: (orderId: string, bankCode: string) =>
    request<{ paymentId: string; redirectUrl: string; ref: string }>(
      '/payments/bank', { method: 'POST', body: JSON.stringify({ orderId, bankCode }) },
    ),
  initiateCard: (orderId: string) =>
    request<{ paymentId: string; clientSecret: string }>(
      '/payments/card', { method: 'POST', body: JSON.stringify({ orderId }) },
    ),
  paymentStatus: (paymentId: string) => request<any>(`/payments/${paymentId}/status`),
  simulateKhqr:  (orderId: string) =>
    request<{ ok: boolean }>(`/dev/khqr/simulate/${orderId}`, { method: 'POST' }),

  // ── Admin (ADMIN role required) ─────────────────────────────────────────────
  admin: {
    stats:     () => request<any>('/admin/stats'),
    products:  () => request<any[]>('/admin/products'),
    orders:    (page = 1) => request<any[]>(`/admin/orders?page=${page}`),
    updateProduct: (id: string, body: Record<string, unknown>) =>
      request<any>(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    discountAll: (percent: number) =>
      request<{ updated: number; discountPercent: number }>(
        '/admin/products/discount-all', { method: 'POST', body: JSON.stringify({ percent }) },
      ),
    settings:       () => request<Record<string, string>>('/admin/settings'),
    updateSettings: (body: Record<string, string>) =>
      request<Record<string, string>>('/admin/settings', { method: 'PATCH', body: JSON.stringify(body) }),
    upload: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      // request() forces Content-Type: application/json — use fetch directly for multipart
      const headers: Record<string, string> = {};
      if (_access) headers['Authorization'] = `Bearer ${_access}`;
      return fetch(`${API}/admin/upload`, { method: 'POST', headers, body: form, credentials: 'include' })
        .then(r => r.ok ? r.json() : r.json().then((b: any) => { throw new Error(b.detail ?? b.message); }))
        .then((d: any) => d as { url: string; filename: string });
    },
  },
};
