import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "../types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  checkingAuth: false, // Start as false, will be set to true when auth check starts
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      state.checkingAuth = false;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.checkingAuth = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.checkingAuth = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Add these new actions
    checkAuthStart: (state) => {
      state.checkingAuth = true;
    },
    checkAuthSuccess: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      state.checkingAuth = false;
    },
    checkAuthFailure: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.checkingAuth = false;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUser,
  checkAuthStart,
  checkAuthSuccess,
  checkAuthFailure,
} = authSlice.actions;

export default authSlice.reducer;
