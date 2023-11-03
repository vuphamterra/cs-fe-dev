import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInterceptors from '../api';

interface DashboardState {
  drawers: string;
  folders: string;
  users: string;
  used: string;
  total: string;
  loading: boolean;
}

const initialState: DashboardState = {
  drawers: '',
  folders: '',
  users: '',
  used: '',
  total: '',
  loading: false,
};

export const getDashboardData = createAsyncThunk('dashboard/getDashboardData', async () => {
  try {
    const response = await axiosInterceptors.get('/dashboard');
    const { data } = response;
    return data;
  } catch (err) {
    console.log(err);
  }
});

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getDashboardData.pending, (state: DashboardState) => {
      state.loading = true;
    });
    builder.addCase(getDashboardData.fulfilled, (state: DashboardState, result: any) => {
      const {
        payload: { payload },
      } = result;
      state.loading = false;
      state.drawers = payload.drawers;
      state.folders = payload.folders;
      state.users = payload.users;
      state.total = payload.total;
      state.used = payload.used;
    });
    builder.addCase(getDashboardData.rejected, (state: DashboardState) => {
      state.loading = false;
    });
  },
});

export default dashboardSlice.reducer;
