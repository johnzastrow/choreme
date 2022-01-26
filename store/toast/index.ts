import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ToastProps } from "../../components/toast";
import { ToastState } from "./type";

type IToast = ToastProps & {
  type: string;
  message: string;
};
const initialState: Partial<ToastState> = {
  isOpen: undefined,
  message: undefined,
  type: undefined,
};

const showToast: CaseReducer<Partial<ToastState>, PayloadAction<IToast>> = (
  state,
  action
) => {
  state.isOpen = true;
  state.message = action.payload.message;
  state.type = action.payload.type;
};

const hideToast: CaseReducer<Partial<ToastState>> = (state) => {
  state.isOpen = false;
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: showToast,
    hideToast: hideToast,
  },
});

export const toastActions = toastSlice.actions;
export const toastReducer = toastSlice.reducer;
