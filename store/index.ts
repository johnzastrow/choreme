import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import { rootReducer } from "./reducer";
import { api } from "../lib/api";

const logger = createLogger({
  // ...options
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger, api.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
