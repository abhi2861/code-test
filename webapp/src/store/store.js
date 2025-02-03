import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
// import otpSlice from './otpSlice';
import drawerReducer from './drawerSlice';
import commonReducer  from './commonReducer';

const store = configureStore({
	reducer: {
		auth: authReducer,
		// OTP: otpSlice,
		drawer: drawerReducer,
		commonReducer
	},
});

export default store;
