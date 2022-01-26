import { combineReducers } from "redux";
import { api } from "../lib/api";
import { authReducer } from "./auth";
import { toastReducer } from "./toast/index";

export const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  toast: toastReducer,
});
