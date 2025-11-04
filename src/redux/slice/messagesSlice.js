import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@services/api";

// Obtener todos los mensajes con filtros opcionales
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ event_id = null, limit = 100, offset = 0 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (event_id) params.append('event_id', event_id);
      params.append('limit', limit);
      params.append('offset', offset);

      const response = await api.get(`/messages?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Obtener mensajes por evento específico
export const fetchMessagesByEvent = createAsyncThunk(
  "messages/fetchMessagesByEvent",
  async ({ eventId, limit = 100, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/event/${eventId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mensajes del evento:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Eliminar mensaje
export const deleteMessage = createAsyncThunk(
  "messages/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return { messageId, ...response.data };
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    list: [],
    filteredList: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    selectedEvent: null,
    selectedUser: null,
  },
  reducers: {
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearFilters: (state) => {
      state.selectedEvent = null;
      state.selectedUser = null;
      state.filteredList = state.list;
    },
    filterMessages: (state) => {
      let filtered = [...state.list];

      if (state.selectedEvent) {
        filtered = filtered.filter(msg => msg.event_id === state.selectedEvent);
      }

      if (state.selectedUser) {
        filtered = filtered.filter(msg => msg.user_id === state.selectedUser);
      }

      state.filteredList = filtered;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data || [];
        state.filteredList = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch Messages By Event
      .addCase(fetchMessagesByEvent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessagesByEvent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data || [];
        state.filteredList = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchMessagesByEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete Message
      .addCase(deleteMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = state.list.filter(msg => msg.id !== action.payload.messageId);
        state.filteredList = state.filteredList.filter(msg => msg.id !== action.payload.messageId);
        state.error = null;
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  }
});

export const { setSelectedEvent, setSelectedUser, clearFilters, filterMessages } = messagesSlice.actions;

export default messagesSlice.reducer;

