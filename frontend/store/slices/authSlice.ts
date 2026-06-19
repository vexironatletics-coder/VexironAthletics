import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '@/lib/types';

const loadAuth = (): AuthState => {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? (JSON.parse(userStr) as User) : null;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
};

const initialState: AuthState = { user: null, token: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        document.cookie = `token=${action.payload.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        document.cookie = `role=${action.payload.user.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; max-age=0';
        document.cookie = 'role=; path=/; max-age=0';
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
    hydrateAuth: (state) => {
      const loaded = loadAuth();
      state.user = loaded.user;
      state.token = loaded.token;
    },
  },
});

export const { setCredentials, logout, hydrateAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;
