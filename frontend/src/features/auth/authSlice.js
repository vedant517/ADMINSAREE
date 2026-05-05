import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: !!localStorage.getItem('isLoggedIn'),
    role: localStorage.getItem('role') || null,
    isAuthenticated: !!localStorage.getItem('isLoggedIn'),
  },
  reducers: {
    setCredentials: (state, action) => {
      const { role } = action.payload;
      state.role = role;
      state.isLoggedIn = true;
      state.isAuthenticated = true;
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('role', role);
    },
    logout: (state) => {
      state.role = null;
      state.isLoggedIn = false;
      state.isAuthenticated = false;
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('role');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
