import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../services/apiConfig';

const API_URL = `${API_BASE_URL}/products`;

// ─── Helpers ────────────────────────────────────────────────────────────────
const getAuthHeader = (thunkAPI) => ({
  Authorization: `Bearer ${thunkAPI.getState().auth?.token}`,
});

// ─── Thunks ──────────────────────────────────────────────────────────────────
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, thunkAPI) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * addProduct — accepts plain object OR FormData.
 * multipart/form-data (required when an image
 * file is attached).
 */
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, thunkAPI) => {
    try {
      let formData;
      if (productData instanceof FormData) {
        formData = productData;
      } else {
        formData = new FormData();
        Object.entries(productData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) formData.append(key, value);
        });
      }

      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeader(thunkAPI),
        },
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, thunkAPI) => {
    try {
      let formData;
      if (productData instanceof FormData) {
        formData = productData;
      } else {
        formData = new FormData();
        Object.entries(productData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) formData.append(key, value);
        });
      }

      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeader(thunkAPI),
        },
      });

      // Auto-refresh the list
      thunkAPI.dispatch(fetchProducts());

      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader(thunkAPI),
      });
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearProductError: (state) => { state.error = null; },
    clearSuccessMessage: (state) => { state.successMessage = null; },
  },
  extraReducers: (builder) => {
    // ── fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload.data) ? action.payload.data : [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── addProduct
      .addCase(addProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);   // prepend so it shows at top
        state.successMessage = 'Product created successfully!';
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── updateProduct
      .addCase(updateProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Optimization: Update the local item immediately
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        state.successMessage = 'Product updated successfully!';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── deleteProduct
      .addCase(deleteProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((p) => p._id !== action.payload);
        state.successMessage = 'Product deleted successfully!';
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductError, clearSuccessMessage } = productSlice.actions;
export default productSlice.reducer;
