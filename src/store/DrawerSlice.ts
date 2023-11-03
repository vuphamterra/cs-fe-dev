import React from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInterceptors from '../api';
import { AxiosResponse } from 'axios';
import { DRAWER_MODEL } from '~/pages/DrawerManagement/interfaces';

export interface DrawerField {
  id: number;
  name: string;
  width: number;
  format_id: number;
  description: string;
  isDelete: boolean;
  flags: [
    {
      id: number;
      name: string;
    },
  ];
  type: { type_code: string; type_name: string; format: string };
  lists: Array<{
    id: number;
    name: string;
    field_id: number;
    order_no: number;
    isDelete: boolean;
  }>;
}
interface Drawer {
  id: number;
  name: string;
  description: string;
  image_path: string;
  database_id: number;
  deleted_at: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  fields: DrawerField[];
}

interface DrawerState {
  selectedDrawerId: number;
  total: number;
  drawers: Drawer[];
  originDrawers: Drawer[];
  currentDrawer: Drawer;
  loading: boolean;
  creating: boolean;
  message: { title: React.ReactNode; text: React.ReactNode; type: string };
  folderId: number;
  folderName: string;
  createFolderLoading: boolean;
  drawerPermissions: { id?: number; drawer_id: number; name: string; code: string }[];
  createFolderAutoIndex: boolean;
}

const initialState: DrawerState = {
  selectedDrawerId: null,
  total: 0,
  drawers: [],
  originDrawers: [],
  currentDrawer: null,
  loading: false,
  creating: false,
  message: null,
  folderId: null,
  folderName: null,
  createFolderLoading: false,
  drawerPermissions: [],
  createFolderAutoIndex: false,
};

export const getDrawerData = createAsyncThunk(
  'drawer/getDrawerData',
  async (params: { skip?: number; take?: number; view_mode?: string }) => {
    try {
      params.skip = params.skip ?? 0;
      params.take = params.take ?? 100;
      const response = await axiosInterceptors.get('/drawer/list', { params });
      const { data } = response;
      return data;
    } catch (err) {
      console.log(err);
    }
  },
);

export const createDrawer = createAsyncThunk(
  'drawer/createDrawer',
  async (payload: any, thunkAPI) => {
    try {
      const response: AxiosResponse = await axiosInterceptors.post('/drawer', payload);
      const { data } = response;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const updateDrawer = createAsyncThunk(
  'drawer/updateDrawer',
  async (payload: { id: number; drawer: DRAWER_MODEL }, thunkAPI) => {
    try {
      const response: AxiosResponse = await axiosInterceptors.put(
        `/drawer/${payload.id}`,
        payload.drawer,
      );
      const { data } = response;
      data.drawer = payload.drawer;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const duplicateDrawer = createAsyncThunk(
  'drawer/duplicateDrawer',
  async (
    payload: {
      name: string;
      description: string;
      database_id: number;
      drawer_id: number;
      current_drawer: any;
    },
    thunkAPI,
  ) => {
    try {
      const bodyData = {
        name: payload.name,
        description: payload.description,
        database_id: payload.database_id,
        drawer_id: payload.drawer_id,
      };
      const response: AxiosResponse = await axiosInterceptors.post('/drawer/duplicate', bodyData);
      const { data } = response;
      data.currentDrawer = payload.current_drawer;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const removeDrawer = createAsyncThunk(
  'drawer/removeDrawer',
  async (payload: { id: number; current_drawer: any }, thunkAPI) => {
    try {
      const response: AxiosResponse = await axiosInterceptors.delete(`/drawer/${payload.id}`);
      const { data } = response;
      data.currentDrawer = payload.current_drawer;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const purgeDrawer = createAsyncThunk(
  'drawer/purgeDrawer',
  async (payload: { id: number; current_drawer: any }, thunkAPI) => {
    try {
      const response: AxiosResponse = await axiosInterceptors.put(`/drawer/${payload.id}/purge`);
      const { data } = response;
      data.currentDrawer = payload.current_drawer;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const getDrawerDetail = createAsyncThunk(
  'drawer/getDrawerDetail',
  async (params: { id: number }, { rejectWithValue }) => {
    try {
      const { id } = params;
      const response = await axiosInterceptors.get(`/drawer/${id}`);
      const { data } = response;
      return data;
    } catch (err) {
      throw rejectWithValue(err);
    }
  },
);

export const getDrawerById = createAsyncThunk(
  'drawer/getDrawerById',
  async (params: { id: number }) => {
    try {
      const { id } = params;
      const response = await axiosInterceptors.get(`/drawer/${id}`);
      const { data } = response;
      return data;
    } catch (err) {
      console.log(err);
    }
  },
);

// Create Folder from BulkImport
export const bulkImport = createAsyncThunk(
  'drawer/bulkImport',
  async (params: any, { rejectWithValue }) => {
    try {
      const { id, dataSubmit } = params;
      const response = await axiosInterceptors.post('/folder', {
        drawer_id: id,
        fields: dataSubmit,
      });
      const { data } = response;
      return data;
    } catch (err) {
      throw rejectWithValue(err);
    }
  },
);

// Upload Files
export const uploadFiles = createAsyncThunk(
  'file/uploadFiles',
  async (formData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInterceptors.post('/file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data } = response;
      return data;
    } catch (err) {
      throw rejectWithValue(err);
    }
  },
);

// Check file location path
export const checkFileLocationPath = createAsyncThunk(
  'drawer/checkFileLocationPath',
  async (payload: { imgPath: string }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.post('/database/check-image-path', payload);
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

// Get drawer permissions
export const getDrawerPermissions = createAsyncThunk(
  'drawer/getDrawerPermissions',
  async (payload: { id: number }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.get(`permission/drawer/${payload.id}`);
      const { data } = response;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

// Get data reference data by key reference
export const getDataReferenceDataByKeyRef = createAsyncThunk(
  'drawer/getDataReferenceDataByKeyRef',
  async (params: { drawer_id: number; name: string }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.post('/reference', params);
      const { data } = response;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

// Get data reference data by key reference
export const getAutoIndexDataByAutoIndexKey = createAsyncThunk(
  'drawer/getAutoIndexDataByAutoIndexKey',
  async (params: { drawer_id: number; name: string; field_id: number }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.post('/auto-index', params);
      const { data } = response;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

// Get key & data reference data
export const getKeyDataReferenceData = createAsyncThunk(
  'drawer/getKeyDataReferenceData',
  async (params: { id: number }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.get(`/reference?id=${params.id}`);
      const { data } = response;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

// Get auto index data
export const getAutoIndexData = createAsyncThunk(
  'drawer/getAutoIndexData',
  async (params: { id: number }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.get(`/auto-index?id=${params.id}`);
      const { data } = response;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

// Download key & data reference csv template
export const downloadKeyDataReferenceCSVTemplate = createAsyncThunk(
  'drawer/downloadKeyDataReferenceCSVTemplate',
  async (payload: { drawerId: number }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.get(
        `/reference/download/drawer/${payload.drawerId}`,
        {
          responseType: 'blob',
        },
      );
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

// Download auto index csv template
export const downloadAutoIndexCSVTemplate = createAsyncThunk(
  'drawer/downloadAutoIndexCSVTemplate',
  async (payload: { drawerId: number }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.get(
        `/auto-index/download/drawer/${payload.drawerId}`,
        {
          responseType: 'blob',
        },
      );
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

// Import key & data reference csv
export const importKeyDataReferenceCSV = createAsyncThunk(
  'drawer/importKeyDataReferenceCSV',
  async (payload: any, thunkAPI) => {
    try {
      const response = await axiosInterceptors.post('/reference/import', payload);
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

// Import auto index csv
export const importAutoIndexCSV = createAsyncThunk(
  'drawer/importAutoIndexCSV',
  async (payload: any, thunkAPI) => {
    try {
      const response = await axiosInterceptors.post('/auto-index/import', payload);
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

// Clear key & data reference data
export const clearKeyDataReferenceData = createAsyncThunk(
  'drawer/clearKeyDataReferenceData',
  async (params: { id: number }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.delete(`/reference?id=${params.id}`);
      const { data } = response;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

// Clear auto index data
export const clearAutoIndexData = createAsyncThunk(
  'drawer/clearAutoIndexData',
  async (params: { id: number }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.delete(`/auto-index?drawer-id=${params.id}`);
      const { data } = response;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

// Remove auto index
export const removeAutoIndex = createAsyncThunk(
  'drawer/removeAutoIndex',
  async (params: { id: number }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.delete(`/auto-index?auto-key=${params.id}`);
      const { data } = response;
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const drawSlice = createSlice({
  name: 'drawer',
  initialState,
  reducers: {
    updateMessage: (state, action) => {
      state.message = action.payload;
    },
    setDrawer: (state, action) => {
      state.currentDrawer = action.payload;
    },
    setDrawerList: (state, action) => {
      state.drawers = action.payload;
    },
    setSelectedDrawerId: (state, action) => {
      state.selectedDrawerId = action.payload;
    },
    resetCreateFolderData: (state) => {
      state.folderId = null;
      state.folderName = null;
    },
    setCreateFolderAutoIndex: (state, action) => {
      state.createFolderAutoIndex = action.payload;
    },
    reset: () => _.cloneDeep(initialState),
  },
  extraReducers: (builder) => {
    builder.addCase(getDrawerData.pending, (state: DrawerState) => {
      state.loading = true;
    });
    builder.addCase(getDrawerData.fulfilled, (state: DrawerState, result: any) => {
      const {
        payload: { payload },
      } = result;
      state.loading = false;
      state.drawers = payload.data.sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
      state.total = payload.total;
    });
    builder.addCase(getDrawerData.rejected, (state: DrawerState) => {
      state.loading = false;
    });

    // Create Drawer
    builder.addCase(createDrawer.fulfilled, (state: DrawerState, result: any) => {
      state.creating = false;
      const {
        payload: { payload: drawer },
      } = result;
      state.message = {
        title: 'Create drawer successfully',
        text: React.createElement('span', {}, [
          'Drawer ',
          React.createElement('b', { key: uuidv4() }, drawer.name),
          ' was created successfully',
        ]),
        type: 'success',
      };
    });
    builder.addCase(createDrawer.pending, (state: any) => {
      state.creating = true;
    });
    builder.addCase(createDrawer.rejected, (state: DrawerState) => {
      state.creating = false;
      state.message = {
        title: 'Failed',
        text: 'Something went wrong',
        type: 'error',
      };
    });

    // Update Drawer
    builder.addCase(updateDrawer.fulfilled, (state: DrawerState, result: any) => {
      state.loading = false;
      const {
        payload: { drawer },
      } = result;
      state.message = {
        title: 'Update drawer successfully',
        text: React.createElement('span', {}, [
          'Drawer ',
          React.createElement('b', { key: uuidv4() }, drawer.name),
          ' was updated successfully',
        ]),
        type: 'success',
      };
    });
    builder.addCase(updateDrawer.pending, (state: any) => {
      state.loading = true;
    });
    builder.addCase(updateDrawer.rejected, (state: DrawerState) => {
      state.loading = false;
      state.message = {
        title: 'Failed',
        text: 'Something went wrong',
        type: 'error',
      };
    });

    // Duplicate Drawer
    builder.addCase(duplicateDrawer.fulfilled, (state: DrawerState, result: any) => {
      state.creating = false;
      const {
        payload: { currentDrawer },
      } = result;
      const drawerName = currentDrawer ? currentDrawer.name : '';
      state.message = {
        title: 'Duplicate drawer successfully',
        text: React.createElement('span', {}, [
          'Drawer ',
          React.createElement('b', { key: uuidv4() }, drawerName),
          ' has been duplicated successfully. Please check your drawer',
        ]),
        type: 'success',
      };
    });
    builder.addCase(duplicateDrawer.pending, (state: any) => {
      state.creating = true;
    });
    builder.addCase(duplicateDrawer.rejected, (state: DrawerState) => {
      state.creating = false;
      state.message = {
        title: 'Failed',
        text: 'Something went wrong',
        type: 'error',
      };
    });

    // Remove Drawer
    builder.addCase(removeDrawer.fulfilled, (state: DrawerState, result: any) => {
      state.loading = false;
      const {
        payload: { currentDrawer },
      } = result;
      const drawerName = currentDrawer ? currentDrawer.name : '';
      state.message = {
        title: 'Remove drawer successfully',
        text: React.createElement('span', {}, [
          'Drawer ',
          React.createElement('b', { key: uuidv4() }, drawerName),
          ' has been removed',
        ]),
        type: 'success',
      };
    });
    builder.addCase(removeDrawer.pending, (state: any) => {
      state.loading = true;
    });
    builder.addCase(removeDrawer.rejected, (state: DrawerState) => {
      state.loading = false;
      state.message = {
        title: 'Failed',
        text: 'Something went wrong',
        type: 'error',
      };
    });

    // Purge Drawer
    builder.addCase(purgeDrawer.fulfilled, (state: DrawerState, result: any) => {
      state.loading = false;
      const {
        payload: { currentDrawer },
      } = result;
      const drawerName = currentDrawer ? currentDrawer.name : '';
      const location = currentDrawer ? currentDrawer.image_path : '';
      state.message = {
        title: React.createElement('span', {}, [
          'Drawer ',
          React.createElement('b', { key: uuidv4() }, drawerName),
          ' was cleared successfully',
        ]),
        text: '',
        type: 'success',
      };
    });
    builder.addCase(purgeDrawer.pending, (state: any) => {
      state.loading = true;
    });
    builder.addCase(purgeDrawer.rejected, (state: DrawerState) => {
      state.loading = false;
      state.message = {
        title: 'Failed',
        text: 'Something went wrong',
        type: 'error',
      };
    });

    // Drawer detail
    builder.addCase(getDrawerDetail.pending, (state: DrawerState) => {
      state.loading = true;
    });
    builder.addCase(getDrawerDetail.fulfilled, (state: DrawerState, result: any) => {
      state.loading = false;
      const {
        payload: { payload },
      } = result;
      if (payload) {
        state.currentDrawer = payload;
      }
    });
    builder.addCase(getDrawerDetail.rejected, (state: DrawerState) => {
      state.loading = false;
    });

    // Get Drawer by Drawer Id
    builder.addCase(getDrawerById.pending, (state: DrawerState) => {
      state.loading = true;
    });
    builder.addCase(getDrawerById.fulfilled, (state: DrawerState) => {
      state.loading = false;
    });
    builder.addCase(getDrawerById.rejected, (state: DrawerState) => {
      state.loading = false;
    });

    // Create Folder from BulkImport
    builder.addCase(bulkImport.pending, (state: DrawerState) => {
      state.createFolderLoading = true;
    });
    builder.addCase(bulkImport.fulfilled, (state: DrawerState, result: any) => {
      state.createFolderLoading = false;
      state.createFolderAutoIndex = true;
      const {
        payload: { payload },
      } = result;
      state.folderId = payload[0].id;
      state.folderName = payload[0].name;
      state.message = {
        title: 'Success',
        text: 'Create Folder Successfully!',
        type: 'success',
      };
    });
    builder.addCase(bulkImport.rejected, (state: DrawerState) => {
      state.createFolderLoading = false;
      state.message = {
        title: 'Failed',
        text: 'Something went wrong',
        type: 'error',
      };
    });

    // Upload Files
    builder.addCase(uploadFiles.pending, (state: DrawerState) => {
      state.createFolderLoading = true;
    });
    builder.addCase(uploadFiles.fulfilled, (state: DrawerState) => {
      state.createFolderLoading = false;
    });
    builder.addCase(uploadFiles.rejected, (state: DrawerState) => {
      state.createFolderLoading = false;
    });

    // Check file location path
    builder.addCase(checkFileLocationPath.pending, (state: DrawerState) => {
      state.loading = true;
    });
    builder.addCase(checkFileLocationPath.fulfilled, (state: DrawerState) => {
      state.loading = false;
    });
    builder.addCase(checkFileLocationPath.rejected, (state: DrawerState) => {
      state.loading = false;
    });

    // Get drawer permissions
    builder.addCase(getDrawerPermissions.pending, (state: DrawerState) => {
      state.loading = true;
    });
    builder.addCase(getDrawerPermissions.fulfilled, (state: DrawerState, result: any) => {
      state.loading = false;
      const {
        payload: { payload },
      } = result;
      if (payload && payload.length) {
        state.drawerPermissions = [...payload];
      }
    });
    builder.addCase(getDrawerPermissions.rejected, (state: DrawerState) => {
      state.loading = false;
    });
  },
});

export const {
  updateMessage,
  setDrawer,
  setSelectedDrawerId,
  resetCreateFolderData,
  setCreateFolderAutoIndex,
  reset,
  setDrawerList
} = drawSlice.actions;
export default drawSlice.reducer;
