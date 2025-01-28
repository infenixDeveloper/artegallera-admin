import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@services/api";
import Cookies from "js-cookie";

export const fetchRoundsByEvent = createAsyncThunk('/rounds/event', async (id) => {
  try {
    const token = Cookies.get("authToken");

    const { data } = await api.get(`/rounds/event/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data) {
      return data.data?.sort((a, b) => a.id - b.id);
    }
  } catch (error) {
    console.error(error);
  }
});

export const getAllRounds = createAsyncThunk("/rounds/all", async () => {
  try {
    const token = Cookies.get("authToken");

    const { data } = await api.get('/rounds', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data && data.data) {
      return data.data?.sort((a, b) => a.id - b.id)[data.data.length - 1];
    }
  } catch (error) {
    console.error(error);

  }
})

const roundsSlice = createSlice({
  name: "rounds",
  initialState: {
    rounds: null,
    round: null,
    error: null,
    status: null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoundsByEvent.pending, (state) => {
        state.status = "Pending";
        state.loading = true;
      })
      .addCase(fetchRoundsByEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.rounds = action.payload;
      })
      .addCase(fetchRoundsByEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      })
      .addCase(getAllRounds.pending, (state) => {
        state.status = "Pending";
        state.loading = true;
      })
      .addCase(getAllRounds.fulfilled, (state, action) => {
        state.loading = false;
        state.round = action.payload;
      })
      .addCase(getAllRounds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      });
  },
});

export default roundsSlice.reducer; 