import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/metadata';

export const fetchMetadata = createAsyncThunk(
  'categories/fetchMetadata',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// For compatibility with existing code
export const fetchCategories = fetchMetadata;

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    mainCategories: [],
    subCategories: [], // This maps to 'categories' in the product model
    categories: [], // Compatibility alias for subCategories
    colors: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetadata.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetadata.fulfilled, (state, action) => {
        state.loading = false;
        state.mainCategories = action.payload.mainCategories;
        state.categories = action.payload.categories; 
        state.colors = action.payload.colors;
      })
      .addCase(fetchMetadata.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
