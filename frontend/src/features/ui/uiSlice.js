import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartCount: 0,
  wishlistCount: 0,
  notificationCount: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCartCount: (state, action) => {
      state.cartCount = Math.max(0, Number(action.payload) || 0);
    },
    setWishlistCount: (state, action) => {
      state.wishlistCount = Math.max(0, Number(action.payload) || 0);
    },
    setNotificationCount: (state, action) => {
      state.notificationCount = Math.max(0, Number(action.payload) || 0);
    },
    resetUiCounts: () => initialState,
  },
});

export const {
  setCartCount,
  setWishlistCount,
  setNotificationCount,
  resetUiCounts,
} = uiSlice.actions;

export default uiSlice.reducer;
