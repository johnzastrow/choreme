import {createSlice} from "@reduxjs/toolkit";
import {AuthState} from "./type";

const initialState: Partial<AuthState> = {
    token: undefined,
    isAuthenticated: false,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
    },

})

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;