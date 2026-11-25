import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';
import { getErrorPayload } from '../utils/helpers';

export const PAGE_SIZE = 5;

export const fetchHotels = createAsyncThunk(
  'hotels/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const { filters } = getState().hotels;
    try {
      const params = {
        limit: PAGE_SIZE,
        offset: (filters.page - 1) * PAGE_SIZE,
      };
      if (filters.search) params.search = filters.search;
      if (filters.minPrice !== '') params.minPrice = filters.minPrice;
      if (filters.maxPrice !== '') params.maxPrice = filters.maxPrice;

      const res = await api.get('/api/hotels', { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorPayload(err));
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotels/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/hotels/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorPayload(err));
    }
  }
);

export const createHotel = createAsyncThunk(
  'hotels/create',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/hotels', formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorPayload(err));
    }
  }
);

export const updateHotel = createAsyncThunk(
  'hotels/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/hotels/${id}`, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorPayload(err));
    }
  }
);

export const deleteHotel = createAsyncThunk(
  'hotels/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/hotels/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorPayload(err));
    }
  }
);

const defaultFilters = { search: '', minPrice: '', maxPrice: '', page: 1 };

const initialState = {
  list: [],
  total: 0,
  current: null,
  loading: false,
  saving: false,
  error: null,
  filters: { ...defaultFilters },
};

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    // any filter change should take us back to the first page
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage(state, action) {
      state.filters.page = action.payload;
    },
    resetFilters(state) {
      state.filters = { ...defaultFilters };
    },
    clearCurrent(state) {
      state.current = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load hotels';
      })
      // single
      .addCase(fetchHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load hotel';
      })
      // create
      .addCase(createHotel.pending, (state) => {
        state.saving = true;
      })
      .addCase(createHotel.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createHotel.rejected, (state) => {
        state.saving = false;
      })
      // update
      .addCase(updateHotel.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.saving = false;
        state.current = action.payload;
      })
      .addCase(updateHotel.rejected, (state) => {
        state.saving = false;
      })
      // delete
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.list = state.list.filter((h) => h.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export const { setFilters, setPage, resetFilters, clearCurrent } = hotelSlice.actions;
export default hotelSlice.reducer;
