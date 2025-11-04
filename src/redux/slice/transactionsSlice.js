import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@services/api';

// Acción para obtener los usuarios
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Acción para obtener los eventos de un usuario
export const fetchEvents = createAsyncThunk(
  'users/fetchEvents',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/betting/report/event/${userId}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Acción para obtener las transacciones de las rondas
export const fetchRounds = createAsyncThunk(
  'users/fetchRounds',
  async ({ userId, eventId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/betting/report/car/${userId}/${eventId}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice de usuarios y transacciones
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    events: [],
    rounds: [],
    loading: false,
    status: { success: false },
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Reducer para obtener los usuarios
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Reducer para obtener los eventos de un usuario
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Reducer para obtener las transacciones de las rondas
    builder
      .addCase(fetchRounds.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRounds.fulfilled, (state, action) => {
        state.loading = false;
        state.rounds = action.payload;
      })
      .addCase(fetchRounds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default usersSlice.reducer;
