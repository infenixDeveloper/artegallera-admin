import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openChat, closeChat, toggleChat } = chatSlice.actions;
export default chatSlice.reducer;

