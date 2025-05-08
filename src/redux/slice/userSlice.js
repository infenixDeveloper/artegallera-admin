import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@services/api';

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

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {

      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addBalance = createAsyncThunk('user/addBalance',
  async (userData, { rejectWithValue }) => {

    try {
      const response = await api.put('/user/balance', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)


const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    status: { success: false },
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.status = "Pending"
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "Success"
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(addBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(addBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default usersSlice.reducer;
