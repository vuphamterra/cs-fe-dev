import _ from 'lodash';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInterceptors from '~/api';
import { reset as resetDatabaseStore, selectDb, updateDatabases } from './DatabaseSlice';
import { clearLocalStorage } from '~/utils';
import { resetUserStore } from './UserSlice';
import { reset as resetIndexFieldStore } from './IndexField';
import { reset as resetFolderStore } from './FolderSlice';
import { reset as resetDrawerStore } from './DrawerSlice';
import { reset as resetThemeStore } from './ThemeSlice';
import { DASHBOARD } from '~/constants';
import { resetFileSlice } from './FileSlice';

type USERTYPE = {
  id: number;
  username: string;
  email: string;
  description: string;
  created_at: string;
  roles: Array<string>;
};

type STATETYPE = {
  token: string;
  user: USERTYPE;
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  selectedDashboard: string;
  loading: boolean;
  errorMessage: { message: string; description: string };
  isOpenSide: boolean;
  isSettingIconClicked: boolean;
};

const initialState: STATETYPE = {
  token: '',
  user: null,
  isLoggedIn: false,
  isSuperAdmin: false,
  isAdmin: false,
  selectedDashboard: '',
  loading: false,
  errorMessage: null,
  isOpenSide: false,
  isSettingIconClicked: false,
};

const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    selectDashboard: (state, action) => {
      state.selectedDashboard = action.payload;
    },
    setErrorMessage: (state, action) => {
      state.errorMessage = action.payload;
    },
    updateDescCurrentUser: (state, action) => {
      state.user = { ...state.user, description: action.payload };
    },
    reset: () => _.cloneDeep(initialState),
    handleOpenSide: (state, action) => {
      state.isOpenSide = action.payload;
    },
    handleSettingIconClick: (state, action) => {
      state.isSettingIconClicked = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authenticate.fulfilled, (state: STATETYPE, result: any) => {
      state.errorMessage = null;
      state.loading = false;
      const {
        payload: { payload },
      } = result;
      const isSuperAdmin = payload.user.roles.includes('SA');
      const isAdmin = payload.user.roles.includes('ADMIN');
      const isClient = !isSuperAdmin && !isAdmin;
      state.token = payload.access_token;
      state.user = payload.user;
      state.isLoggedIn = true;
      state.isSuperAdmin = isSuperAdmin;
      state.isAdmin = isAdmin;
      if (isClient) {
        state.selectedDashboard = DASHBOARD.CLIENT;
      }
    });
    builder.addCase(authenticate.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(authenticate.rejected, (state: STATETYPE, result: any) => {
      state.loading = false;
      const { payload } = result;
      const { code } = payload;
      if (!code) {
        state.errorMessage = { message: 'Error', description: 'Something went wrong' };
      } else if (code === 'ERR_NETWORK') {
        state.errorMessage = {
          message: 'Error',
          description: 'Fail to connect to ClickScan Server',
        };
      } else {
        const {
          response: { status },
        } = payload;
        if (status === 404) {
          state.errorMessage = {
            message: 'Login failed',
            description: 'Incorrect password or username. Please input again',
          };
        }
      }
    });

    // Logout
    builder.addCase(logout.fulfilled, (state: STATETYPE) => {
      state.token = '';
      state.user = null;
      state.isLoggedIn = false;
      state.isSuperAdmin = false;
      state.isAdmin = false;
      state.selectedDashboard = '';

      clearLocalStorage();
    });
  },
});

export const authenticate = createAsyncThunk(
  'auth/login',
  async (payload: { username: string; password: string }, thunkAPI) => {
    try {
      const res = await axiosInterceptors.post('/auth/login', payload);
      const { data } = res;
      const { payload: resPayload } = data;
      if (resPayload) {
        const { user } = resPayload;
        const dbs = user.databases.map((item) => ({ ...item }));
        thunkAPI.dispatch(updateDatabases(dbs));
        if (dbs.length) {
          thunkAPI.dispatch(selectDb(dbs[0]));
        }
      }
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async (payload: any, thunkAPI) => {
  try {
    const res = await axiosInterceptors.post('/auth/logout');
    const { data } = res;
    if (data.statusCode === 200) {
      thunkAPI.dispatch(reset());
      thunkAPI.dispatch(resetDatabaseStore());
      thunkAPI.dispatch(resetUserStore());
      thunkAPI.dispatch(resetIndexFieldStore());
      thunkAPI.dispatch(resetFolderStore());
      thunkAPI.dispatch(resetDrawerStore());
      thunkAPI.dispatch(resetThemeStore());
      thunkAPI.dispatch(resetFileSlice());
    }
    return data;
  } catch (error) {
    thunkAPI.rejectWithValue(error);
  }
});

export const {
  selectDashboard,
  setErrorMessage,
  updateDescCurrentUser,
  reset,
  handleOpenSide,
  handleSettingIconClick,
} = AuthSlice.actions;
export default AuthSlice.reducer;
