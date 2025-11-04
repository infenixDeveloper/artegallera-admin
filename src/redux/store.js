import { configureStore } from "@reduxjs/toolkit";

import menuReducer from "./slice/menuSlice"
import userReducer from "./slice/userSlice"
import eventsReducer from "./slice/eventsSlice"
import winnersReducer from "./slice/winnersSlice"
import roundsReducer from "./slice/roundsSlice"
import videosReducer from "./slice/videosSlice"
import chatReducer from "./slice/chatSlice"

const store = configureStore({
  reducer: {
    menu: menuReducer,
    users: userReducer,
    results: eventsReducer,
    winners: winnersReducer,
    rounds: roundsReducer,
    videos: videosReducer,
    chat: chatReducer,
  }
})

export default store;