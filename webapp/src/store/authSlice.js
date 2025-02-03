import { createSlice } from "@reduxjs/toolkit";

import api from "../commonFunctions/ApiRequests";

// const initialState = localStorage.getItem("user")
//   ? JSON.parse(localStorage.getItem("user"))
//   : {
//       isAuthenticated: false,
//       user: null,
//       loading: false,
//       error: null,
//     };

    const initialState = {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    authRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
		state.loading = false;
		state.isAuthenticated = true;
		state.user = action.payload.user;
		state.error = null;
	  
		localStorage.setItem("user", JSON.stringify(action.payload.user));
    },

    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;

      localStorage.removeItem("user");
  
    },

  signupSuccess: (state, action) => {
    state.loading = false;
    state.isAuthenticated = true;
    state.user = action.payload.userData;
    state.error = null;

    localStorage.setItem("user", JSON.stringify(action.payload.userData));
  },

  signupFailure: (state, action) => {
    state.loading = false;
    state.isAuthenticated = false;
    state.error = action.payload;
  },
  
	  
  },
});

export const signup = (data) => async (dispatch) => {
  dispatch(authRequest());
  try {
    const res = await api.post("/auth/auth", data);
    const userData = res.data; 
    dispatch(signupSuccess({ userData }));
  } catch (error) {
    dispatch(signupFailure(error.message));
  }
};

export const login = (data) => async (dispatch) => {
  dispatch(authRequest());
  try {
    const res = await api.post("/auth/signup", data);

    const user = res.data.userDetails;

    // console.log(user);

    dispatch(loginSuccess(user));
  } catch (error) {
    // dispatch(loginFailure(error.message));
  }
};

export const { authRequest, loginSuccess, loginFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;
