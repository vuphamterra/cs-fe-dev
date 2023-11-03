import React, { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInterceptors from '~/api';
import _ from 'lodash';

export interface DATABASE {
  id: number;
  connection: string;
  host: string;
  port: string;
  schema: string;
  tenant: string;
  username: string;
  password: string;
  created_at: string;
  setting: { color_palette: string; root_path: string; organization_name: string };
}

type STATETYPE = {
  databases: DATABASE[];
  selectedDb: DATABASE;
  loading: boolean;
  creating: boolean;
  migrating: boolean;
  deleting: boolean;
  message: { message: string; description: ReactNode; type: string; fields?: string[] };
  inInstallDBProcess: string;
  appSetting: { rootPath: string; organizationName: string; migrated: boolean };
};

const initialState: STATETYPE = {
  databases: [],
  selectedDb: null,
  loading: false,
  creating: false,
  deleting: false,
  migrating: false,
  inInstallDBProcess: '',
  message: null,
  appSetting: {
    rootPath: '',
    organizationName: '',
    migrated: false,
  },
};

const AuthSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {
    updateDatabases: (state, action) => {
      state.databases = action.payload;
    },
    selectDb: (state, action) => {
      state.selectedDb = action.payload;
    },
    unselectDb: (state) => {
      state.selectedDb = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    toggleInInstallDBProcess: (state, action) => {
      state.inInstallDBProcess = action.payload;
    },
    saveAppSetting: (state, action) => {
      state.appSetting = action.payload;
    },
    reset: () => _.cloneDeep(initialState),
  },
  extraReducers: (builder) => {
    builder.addCase(getDatabases.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(getDatabases.fulfilled, (state: STATETYPE, result: any) => {
      state.loading = false;
      const {
        payload: {
          payload: { data = [] },
        },
      } = result;
      state.databases = [...data];
    });
    builder.addCase(getDatabases.rejected, (state: STATETYPE) => {
      state.loading = false;
    });

    // Create Database
    builder.addCase(createDatabase.pending, (state: STATETYPE) => {
      state.creating = true;
    });
    builder.addCase(createDatabase.fulfilled, (state: STATETYPE, result: any) => {
      state.creating = false;
      const {
        payload: { payload: createdDb },
      } = result;
      state.selectedDb = { ...createdDb };
      state.message = {
        message: 'Database created successfully',
        description: React.createElement('span', {}, [
          'Database ',
          React.createElement('b', { key: uuidv4() }, createdDb.connection),
          ' has been successfully created',
        ]),
        type: 'success',
      };
    });
    builder.addCase(createDatabase.rejected, (state: STATETYPE, result: any) => {
      state.creating = false;
      const { code, response } = result.payload;
      if (code === 'ERR_NETWORK') {
        state.message = {
          message: 'Connection Failed',
          description: 'Cannot contact to host server',
          type: 'error',
        };
        return;
      }
      if (response) {
        const {
          data: { statusCode, message },
        } = response;
        if (statusCode === 409) {
          if (message === 'Connection already exist') {
            state.message = {
              message: 'Connection Failed',
              description: response.data.message,
              type: 'error',
              fields: ['connection'],
            };
          }
          if (message === 'Schema already exist') {
            state.message = {
              message: 'Connection Failed',
              description: response.data.message,
              type: 'error',
              fields: ['schema'],
            };
          }
        }
        if (statusCode === 422 && message === 'Cannot reach database server') {
          state.message = {
            message: 'Connection Failed',
            description: response.data.message,
            type: 'error',
            fields: ['host', 'port', 'username', 'password'],
          };
        }
      }
    });

    // Migrate database
    builder.addCase(migrateDatabase.pending, (state: STATETYPE) => {
      state.migrating = true;
    });
    builder.addCase(migrateDatabase.fulfilled, (state: STATETYPE, result: any) => {
      state.migrating = false;
    });
    builder.addCase(migrateDatabase.rejected, (state: STATETYPE, result: any) => {
      state.migrating = false;
    });
    // Update database
    builder.addCase(updateDatabase.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(updateDatabase.fulfilled, (state: STATETYPE) => {
      state.loading = false;
    });
    builder.addCase(updateDatabase.rejected, (state: STATETYPE) => {
      state.loading = false;
    });

    builder.addCase(removeDatabase.pending, (state: STATETYPE) => {
      state.deleting = true;
    });
    builder.addCase(removeDatabase.fulfilled, (state: STATETYPE, result: any) => {
      state.deleting = false;
      const {
        payload: { statusCode, removedDb },
      } = result;
      if (statusCode === 200) {
        state.message = {
          message: 'Remove database successfully',
          description: React.createElement('span', {}, [
            'Database ',
            React.createElement('b', { key: uuidv4() }, removedDb.connection),
            ' has been removed',
          ]),
          type: 'success',
        };
      }
    });
    builder.addCase(removeDatabase.rejected, (state: STATETYPE, result: any) => {
      state.deleting = false;
      const {
        payload: { code },
        error,
      } = result;
      if ((error && !code) || code === 'ERR_NETWORK') {
        state.message = {
          message: 'Error',
          description: 'Something went wrong',
          type: 'error',
        };
        return;
      }
      const {
        payload: { response },
      } = result;
      if (response) {
        const {
          data: { statusCode, message },
        } = response;
        if (statusCode === 404) {
          if (message === 'Password missmatch') {
            state.message = {
              message: 'Delete failed',
              description: 'Password is incorrect',
              type: 'error',
              fields: ['password'],
            };
          } else if (message === 'Database not found') {
            state.message = {
              message: 'Delete failed',
              description: message,
              type: 'error',
            };
          } else {
            state.message = {
              message: 'Error',
              description: 'Something went wrong',
              type: 'error',
            };
          }
        }
      }
    });
  },
});

export const getDatabases = createAsyncThunk(
  'database/getDatabases',
  async (payload: { skip?: number; take?: number }, thunkAPI) => {
    try {
      const skip = payload.skip || 0;
      const take = payload.take || 100;
      const res = await axiosInterceptors.get(`/database/list?skip=${skip}&take=${take}`);
      const { data } = res;
      return data;
    } catch (error) {
      const {
        response: { data },
      } = error;
      throw thunkAPI.rejectWithValue(data);
    }
  },
);

export const createDatabase = createAsyncThunk(
  'database/createDatabase',
  async (payload: any, thunkAPI) => {
    try {
      const { data } = await axiosInterceptors.post('/database', payload);
      // update database list
      thunkAPI.dispatch(getDatabases({ skip: 0, take: 100 }));
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const migrateDatabase = createAsyncThunk(
  'database/migrateDatabase',
  async (payload: any, thunkAPI) => {
    try {
      const { data } = await axiosInterceptors.post('/migrate', payload);
      // update database list
      thunkAPI.dispatch(getDatabases({ skip: 0, take: 100 }));
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const updateDatabase = createAsyncThunk(
  'database/updateDatabase',
  async (payload: { id: number; organization_name?: string; color_palette?: string }, thunkAPI) => {
    try {
      const { data } = await axiosInterceptors.put(`/database/${payload.id}/setting`, payload);
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const removeDatabase = createAsyncThunk(
  'database/removeDatabase',
  async (payload: { password: string; db: DATABASE }, thunkAPI) => {
    try {
      const { password, db } = payload;
      const { data } = await axiosInterceptors.delete(`/database/${db.id}`, { data: { password } });
      data.removedDb = db;
      // update database list
      thunkAPI.dispatch(getDatabases({ skip: 0, take: 100 }));
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const downloadChangeLogs = createAsyncThunk(
  'folder/downloadChangeLogs',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInterceptors.get('/software/what-new', {
        responseType: 'blob',
      });
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

// export const downloadChangeLogs = createAsyncThunk(
//   'folder/downloadChangeLogs',
//   async (_, thunkAPI) => {
//     try {
//       const response = await axiosInterceptors.get('/software/what-new', {
//         responseType: 'arraybuffer',
//       });
//       const { data } = response;
//       return data;
//     } catch (error) {
//       throw thunkAPI.rejectWithValue(error);
//     }
//   },
// );

export const {
  selectDb,
  unselectDb,
  reset,
  clearMessage,
  updateDatabases,
  toggleInInstallDBProcess,
  saveAppSetting,
} = AuthSlice.actions;
export default AuthSlice.reducer;
