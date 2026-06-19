import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SiteThemeSettings } from '@/lib/themes';

interface ThemePreviewState {
  preview: SiteThemeSettings | null;
}

const initialState: ThemePreviewState = {
  preview: null,
};

const themePreviewSlice = createSlice({
  name: 'themePreview',
  initialState,
  reducers: {
    setThemePreview: (state, action: PayloadAction<SiteThemeSettings>) => {
      state.preview = action.payload;
    },
    clearThemePreview: (state) => {
      state.preview = null;
    },
  },
});

export const { setThemePreview, clearThemePreview } = themePreviewSlice.actions;
export default themePreviewSlice.reducer;
