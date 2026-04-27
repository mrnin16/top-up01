import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CheckoutDraft {
  productId:   string | null;
  packageId:   string | null;
  topupMethod: 'DIRECT' | 'CODE' | null;
  gameUserId:  string;
  zoneId:      string;
  orderId:     string | null;
}

interface AuthUser { id: string; email?: string; phone?: string; name?: string; role: string; }

interface AuthState {
  accessToken:  string | null;
  refreshToken: string | null;
  user: AuthUser | null;
}

interface ThemeState {
  brandColor: string;
  dark: boolean;
}

interface AppState extends CheckoutDraft, AuthState, ThemeState {
  setCheckout:   (draft: Partial<CheckoutDraft>) => void;
  clearCheckout: () => void;
  setAuth:       (access: string, refresh: string, user: AuthUser) => void;
  setAccessToken:(access: string) => void;     // for refresh-only updates
  setUser:       (user: AuthUser) => void;
  clearAuth:     () => void;
  setBrand:      (color: string) => void;
  setDark:       (dark: boolean) => void;
  // Guest order tracking — orderIds placed without being signed in,
  // stored locally so the success/checkout pages remain accessible after
  // page refresh, and a "recent orders" list can be shown in account.
  guestOrderIds: string[];
  pushGuestOrder: (orderId: string) => void;
}

// Mirror auth presence to a cookie so Next.js middleware can read it
function syncSessionCookie(present: boolean) {
  if (typeof document === 'undefined') return;
  if (present) {
    document.cookie = 'topup-session=1; path=/; max-age=2592000; samesite=lax';
  } else {
    document.cookie = 'topup-session=; path=/; max-age=0; samesite=lax';
  }
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      productId: null, packageId: null, topupMethod: null,
      gameUserId: '',  zoneId: '',     orderId: null,
      setCheckout: (draft) => set(draft),
      clearCheckout: () => set({
        productId: null, packageId: null, topupMethod: null,
        gameUserId: '',  zoneId: '',     orderId: null,
      }),

      accessToken:  null,
      refreshToken: null,
      user:         null,
      setAuth: (accessToken, refreshToken, user) => {
        syncSessionCookie(true);
        set({ accessToken, refreshToken, user });
      },
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      clearAuth: () => {
        syncSessionCookie(false);
        set({ accessToken: null, refreshToken: null, user: null });
      },

      brandColor: '#2563eb',
      dark:       false,
      setBrand:   (brandColor) => set({ brandColor }),
      setDark:    (dark)        => set({ dark }),

      guestOrderIds: [],
      pushGuestOrder: (orderId) =>
        set((s) => ({
          guestOrderIds: s.guestOrderIds.includes(orderId)
            ? s.guestOrderIds
            : [orderId, ...s.guestOrderIds].slice(0, 50),
        })),
    }),
    {
      name: 'topup-store',
      partialize: (s) => ({
        brandColor:    s.brandColor,
        dark:          s.dark,
        accessToken:   s.accessToken,
        refreshToken:  s.refreshToken,
        user:          s.user,
        guestOrderIds: s.guestOrderIds,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken && state?.user) syncSessionCookie(true);
      },
    },
  ),
);
