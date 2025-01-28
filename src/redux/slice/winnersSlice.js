import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@services/api";
import Cookies from "js-cookie";

export const fetchWinners = createAsyncThunk('/winner', async () => {
  try {
    const token = Cookies.get("authToken");

    const { data } = api.get('/winners', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (data) {
      return data.data;
    }
  } catch (error) {
    console.error(error);
  }
});

export const fetchWinnersByEvent = createAsyncThunk('/winner/event', async ({ id_event }) => {

  try {
    const token = Cookies.get("authToken");

    const { data } = api.get(`/winners/event/${id_event}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (data) {
      return data.data;
    }
  } catch (error) {
    console.error(error);
  }
});

const winnersSlice = createSlice({
  name: "winners",
  initialState: {
    winners: null,
    winner: null,
    error: null,
    status: null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWinners.pending, (state) => {
        state.status = "Pending";
        state.loading = true;
      })
      .addCase(fetchWinners.fulfilled, (state, action) => {
        state.loading = false;
        state.winners = action.payload;
      })
      .addCase(fetchWinners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    builder
      .addCase(fetchWinnersByEvent.pending, (state) => {
        state.status = "Pending";
        state.loading = true;
      })
      .addCase(fetchWinnersByEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.winner = action.payload;
      })
      .addCase(fetchWinnersByEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
})

export default winnersSlice.reducer;
