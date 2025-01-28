import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@services/api";

export const getAllVideos = createAsyncThunk(
  'videos/getAllVideos',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/video');
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const videosSlice = createSlice({
  name: "videos",
  initialState: {
    videos: [],
    loading: false,
    status: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllVideos.pending, (state) => {
        state.loading = true;
        state.status = "Pending"
      })
      .addCase(getAllVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload
        state.status = "Success"
      })
      .addCase(getAllVideos.rejected, (state, action) => {
        state.loading = false;
        state.status = "Error"
        state.error = action.payload;
      });
  }
});

export default videosSlice.reducer;