import { createSlice } from '@reduxjs/toolkit';
const DEMO_USER = {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@barcodehub.pro',
    role: 'admin',
    company: 'BarcodeHub Industries',
};
const initialState = {
    user: DEMO_USER,
    token: 'demo-jwt-token',
    isAuthenticated: true,
    isLoading: false,
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setToken(state, action) {
            state.token = action.payload;
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
    },
});
export const { setUser, setToken, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
