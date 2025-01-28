import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
}

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    open: (state) => {
      state.isOpen = true
    },
    close: (state) => {
      state.isOpen = false
    },
    toggleMenu: (state) => {
      state.isOpen = !state.isOpen
    },
  }
})

export const { open, close, toggleMenu } = menuSlice.actions;
export default menuSlice.reducer;