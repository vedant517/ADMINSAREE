import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
    isAuthenticated: !!localStorage.getItem('token'),
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, role } = action.payload;
      state.token = token;
      state.role = role;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
