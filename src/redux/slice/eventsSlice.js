import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@services/api";
import Cookies from "js-cookie";

export const getEvents = createAsyncThunk("bets/events",
  async () => {
    try {
      const token = Cookies.get("authToken");
      const response = await api.get("/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data
    } catch (error) {
      console.error(error);

    }
  }
)

export const getLastEvent = createAsyncThunk("api/events", async () => {
  try {
    const token = Cookies.get("authToken");
    const response = await api.get("/events", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data.sort((a, b) => a.id - b.id).pop();

  } catch (error) {
    console.error(error);
  }
});

const eventsSlice = createSlice({
  name: "results",
  initialState: {
    events: [],
    event: null, // Cambiado de {} a null para mejor validación
    error: null,
    loading: null,
    status: null
  },

  reducers: {
  },

  extraReducers: (builder) => {
    builder
      .addCase(getEvents.pending, (state) => {
        state.loading = true;
        state.status = "Pending"
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.data
        state.status = "Success"
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.status = "Error"
        state.error = action.payload
      })
      .addCase(getLastEvent.pending, (state) => {
        state.status = "Pending"
        state.loading = true
      })
      .addCase(getLastEvent.fulfilled, (state, action) => {
        state.event = action.payload
        state.loading = false
        state.status = "success"
      })
      .addCase(getLastEvent.rejected, (state, action) => {
        state.status = "Error"
        state.error = action.payload
      })
  }
})

export default eventsSlice.reducer;