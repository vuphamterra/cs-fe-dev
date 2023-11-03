import { ReactNode } from 'react';
import _ from 'lodash';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInterceptors from '~/api';
import { FIELD_UI, FOLDER_MODEL_EXTENDED } from '~/pages/FolderManagement/interfaces';
import { formatFileSize } from '~/utils';

export interface FIELD_UI_EXTENDED extends FIELD_UI {
  rowId?: string;
}

type STATETYPE = {
  folders: FOLDER_MODEL_EXTENDED[];
  fields: FIELD_UI[];
  importFile: boolean;
  selectedFolders: number[];
  loading: boolean;
  searchType?: string;
  searchCondition?: string;
  message: { title: ReactNode; text: ReactNode; type: string };
  foldersToDelete: FOLDER_MODEL_EXTENDED[];
  searchIndexFolder: FOLDER_MODEL_EXTENDED[];
  searchFullTextFolder: FOLDER_MODEL_EXTENDED[];
  foldersToMove: FOLDER_MODEL_EXTENDED[];
  fieldsToSelect: FIELD_UI_EXTENDED[];
  searchOption: FIELD_UI[];
  folderToOpen: { drawerId: number; selectedFolderId: number }[];
  openSingleFolder: boolean;
};

const initialState: STATETYPE = {
  folders: [],
  fields: [],
  importFile: false,
  selectedFolders: [],
  loading: false,
  searchType: 'searchIndexField',
  searchCondition: 'or',
  message: null,
  foldersToDelete: [],
  searchIndexFolder: [],
  searchFullTextFolder: [],
  foldersToMove: [],
  fieldsToSelect: [],
  searchOption: [],
  folderToOpen: [],
  openSingleFolder: false,
};

const FolderSlice = createSlice({
  name: 'folder',
  initialState,
  reducers: {
    onClickImport: (state, action) => {
      state.importFile = action.payload;
    },
    handleSelectFolder: (state, action) => {
      let newArr = state.selectedFolders;
      if (newArr.includes(action.payload)) {
        newArr = newArr.filter((i) => i !== action.payload);
      } else {
        newArr = [...newArr, action.payload];
      }
      state.selectedFolders = newArr;
    },
    updateSelectedFolders: (state, action) => {
      state.selectedFolders = action.payload;
    },
    clearSelectedFolders: (state) => {
      state.selectedFolders = [];
    },
    updateFoldersToDelete: (state, action) => {
      state.foldersToDelete = action.payload;
    },
    updateFoldersToMove: (state, action) => {
      state.foldersToMove = action.payload;
    },
    reset: () => _.cloneDeep(initialState),
    resetSearchResult: (state) => {
      state.searchIndexFolder = [];
      state.searchFullTextFolder = [];
    },
    setSearchCondition: (state, action) => {
      state.searchCondition = action.payload;
    },
    setSearchType: (state, action) => {
      state.searchType = action.payload;
    },
    setOpenSingleFolder: (state, action) => {
      state.openSingleFolder = action.payload;
    },
    handleSelectSearchField: (state, action) => {
      const fields = [...state.fieldsToSelect];
      const { value: fieldId, rowId } = action.payload;

      const field = fields.find((item) => item.rowId === rowId);
      if (field && field.fieldId !== fieldId) {
        // CASE 1: CHANGE INDEX FIELD ON THE SAME SEARCHING ROW
        field.rowId = '';
      }
      // CASE 2: CHANGE INDEX FIELD ON DIFFERENT ROW
      const fieldToChange = fields.find((item) => item.fieldId === fieldId);
      if (fieldToChange) {
        fieldToChange.rowId = rowId;
      }

      state.fieldsToSelect = fields;
    },

    handleRemoveIndexSearchField: (state, action) => {
      state.fieldsToSelect = action.payload;
    },
    handleSetFolderToOpen: (state, action) => {
      const { payload } = action;
      const { drawerId, selectedFolderIds } = payload;
      let newArr = state.folderToOpen;
      // Create list folders selected
      const folderSelecteds = selectedFolderIds.map((i) => [{ drawerId, selectedFolderId: i }][0]);
      // Remove old folders and replace new selected folders
      const mergeArr = [...newArr.filter((i) => i.drawerId !== drawerId), ...folderSelecteds];
      // eslint-disable-next-line dot-notation
      newArr = [...new Map(mergeArr.map((i) => [i['selectedFolderId'], i])).values()];
      state.folderToOpen = newArr;
    },
    updateFolderToOpen: (state, action) => {
      state.folderToOpen = action.payload;
    },
    resetFolderSlice: () => initialState,
    clearFolderToOpen: (state) => {
      state.selectedFolders = [];
      state.folderToOpen = [];
    },
  },

  extraReducers: (builder) => {
    // Search folder
    builder.addCase(searchFoldersByIndexField.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(searchFoldersByIndexField.rejected, (state: STATETYPE) => {
      state.loading = false;
    });
    builder.addCase(searchFoldersByIndexField.fulfilled, (state: STATETYPE, result: any) => {
      const { payload: { payload: { data = {} } = {} } = {} } = result;
      if (data) {
        const { folders = [], fields = [] } = data;

        if (fields.length) {
          state.fields = fields;
        }

        const folderList = folders.reduce((accumulator, currentItem) => {
          const existedItem = accumulator.find((ele) => ele.id === currentItem.id);
          if (!existedItem) {
            const newItem = {
              // id: currentItem.id,
              csId: currentItem.id,
              csName: currentItem.name,
              updated_at: currentItem.updated_at || null,
              fileCount: currentItem.totalFile || 0,
              updatedBy: currentItem.userName || '',
              fileSize: formatFileSize(currentItem.fileSize, 2),
            };
            const { fields = [] } = currentItem;
            fields.forEach((field) => {
              newItem[field.name] = field.description;
            });
            accumulator.push(newItem);
          }
          return [...accumulator];
        }, []);

        state.folders = folderList;
      }

      state.loading = false;
    });

    // Search fulltext folder
    builder.addCase(searchFullText.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(searchFullText.rejected, (state: STATETYPE) => {
      state.loading = false;
    });
    builder.addCase(searchFullText.fulfilled, (state: STATETYPE, result: any) => {
      const { payload: { payload: { data = {} } = {} } = {} } = result;
      if (data) {
        const { folders = [], fields = [] } = data;
        if (fields.length) {
          state.fields = fields;
        }
        const folderList = folders.reduce((accumulator, currentItem) => {
          const existedItem = accumulator.find((ele) => ele.id === currentItem.id);
          if (!existedItem) {
            const newItem = {
              // id: currentItem.id,
              csId: currentItem.id,
              csName: currentItem.name,
              updated_at: currentItem.updated_at || null,
              fileCount: currentItem.totalFile || 0,
              updatedBy: currentItem.userName || '',
              fileSize: formatFileSize(currentItem.fileSize, 2),
            };
            const { fields = [] } = currentItem;
            fields.forEach((field) => {
              newItem[field.name] = field.description;
            });
            accumulator.push(newItem);
          }
          return [...accumulator];
        }, []);

        state.folders = folderList;
      }
      state.loading = false;
    });

    // Get folder detail
    builder.addCase(getFolders.fulfilled, (state: STATETYPE, result: any) => {
      const { payload: { payload: { data = {} } = {} } = {} } = result;
      if (data) {
        const { folders = [], fields = [] } = data;
        if (fields.length) {
          state.fields = fields;
          state.fieldsToSelect = fields;
          state.fieldsToSelect.map((field) => field.rowId === '');
        }
        const folderList = folders.reduce((accumulator, currentItem) => {
          const existedItem = accumulator.find((ele) => ele.id === currentItem.id);
          if (!existedItem) {
            const newItem = {
              // id: currentItem.id,
              // name: currentItem.name,
              csId: currentItem.id,
              csName: currentItem.name,
              updated_at: currentItem.updated_at || null,
              fileCount: currentItem.totalFile || 0,
              updatedBy: currentItem.userName || '',
              fileSize: formatFileSize(currentItem.fileSize, 2),
            };
            const { fields = [] } = currentItem;
            fields.forEach((field) => {
              newItem[field.name] = field.description;
            });
            accumulator.push(newItem);
          }
          return [...accumulator];
        }, []);
        state.folders = folderList;
      }
      state.loading = false;
    });

    builder.addCase(getFolders.pending, (state: STATETYPE) => {
      state.loading = true;
    });

    builder.addCase(getFolders.rejected, (state: STATETYPE) => {
      state.loading = false;
      state.message = {
        title: 'Get folders failed',
        text: 'Something went wrong',
        type: 'error',
      };
    });

    // Create folder
    builder.addCase(createFolder.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(createFolder.fulfilled, (state: STATETYPE) => {
      state.loading = false;
    });
    builder.addCase(createFolder.rejected, (state: STATETYPE) => {
      state.loading = false;
    });

    // Move folder
    builder.addCase(moveFolder.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(moveFolder.fulfilled, (state: STATETYPE) => {
      state.loading = false;
    });
    builder.addCase(moveFolder.rejected, (state: STATETYPE) => {
      state.loading = false;
    });

    // Move folder - checking the uniqueness of field's value
    builder.addCase(checkFieldValueUniqueness.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(checkFieldValueUniqueness.fulfilled, (state: STATETYPE) => {
      state.loading = false;
    });
    builder.addCase(checkFieldValueUniqueness.rejected, (state: STATETYPE) => {
      state.loading = false;
    });

    // Export File By Option
    builder.addCase(exportFileByOption.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(exportFileByOption.fulfilled, (state: STATETYPE) => {
      state.loading = false;
    });
    builder.addCase(exportFileByOption.rejected, (state: STATETYPE) => {
      state.message = {
        title: 'Failed',
        text: 'Export folder Failed!',
        type: 'success',
      };
      state.loading = false;
    });

    // Delete folder
    builder.addCase(deleteFolder.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(deleteFolder.fulfilled, (state: STATETYPE) => {
      state.loading = false;
    });
    builder.addCase(deleteFolder.rejected, (state: STATETYPE) => {
      state.loading = false;
    });
  },
});

export const getFolders = createAsyncThunk(
  'folder/getFolders',
  async (params: { drawer_id: number; skip?: number; take?: number }, thunkAPI) => {
    try {
      params.skip = params.skip ?? 0;
      params.take = params.take ?? 100;
      // const response = await axiosInterceptors.get('/folder', { params });
      const response = await axiosInterceptors.post('/folder/search-full', params);
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

export const searchFoldersByIndexField = createAsyncThunk(
  'folder/searchFoldersByIndexField',
  async (
    params: { drawer_id: number; skip?: number; take?: number; condition?: string; search?: any[] },
    thunkAPI,
  ) => {
    try {
      params.skip = params.skip ?? 0;
      params.take = params.take ?? 100;
      const response = await axiosInterceptors.post('/folder/search-full', params);
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

export const searchFullText = createAsyncThunk(
  'folder/searchFullText',
  async (
    params: { drawer_id: number; skip?: number; take?: number; description?: string },
    thunkAPI,
  ) => {
    try {
      params.skip = params.skip ?? 0;
      params.take = params.take ?? 100;
      const response = await axiosInterceptors.post('/folder/search-full', params);
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

export const createFolder = createAsyncThunk(
  'folder/createFolder',
  async (
    payload: { drawer_id: number; fields: { id: number; description: string }[] },
    thunkAPI,
  ) => {
    try {
      const response = await axiosInterceptors.post('/folder', payload);
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

export const deleteFolder = createAsyncThunk(
  'folder/deleteFolder',
  async (payload: { drawer_id: number; ids: number[] }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.post('/folder/delete-multiple', payload);
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

export const moveFolder = createAsyncThunk(
  'folder/moveFolder',
  async (
    payload: {
      drawer_new_id: number;
      drawer_old_id: number;
      folders: { id: number; fields: { id: number; description: string }[] }[];
      isDeletingSource: boolean;
    },
    thunkAPI,
  ) => {
    try {
      const response = await axiosInterceptors.post('/folder/move', payload);
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

export const checkFieldValueUniqueness = createAsyncThunk(
  'folder/checkFieldValueUniqueness',
  async (payload: any, thunkAPI) => {
    try {
      const response = await axiosInterceptors.post('/folder/check-field-conflict', payload);
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

// Export File By Option
export const exportFileByOption = createAsyncThunk(
  'folder/exportFileByOption',
  async (payload: {
    is_group_pdf: boolean,
    folder_id: number,
    file_ids: number[],
    isAll: boolean,
    isCurrentFile: boolean,
    from: number,
    to: number,
    format: string,
    includeAnnotations: boolean
  }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.post('/folder/export', payload, {
        responseType: 'blob',
      });
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

export const exportFolder = createAsyncThunk(
  'folder/exportFolder',
  async (payload: { folderIds: number[] }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.post('/folder/export', payload, {
        responseType: 'blob',
      });
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

export const downloadFolderTemplate = createAsyncThunk(
  'folder/downloadFolderTemplate',
  async (payload: { drawerId: number }, thunkAPI) => {
    try {
      const response = await axiosInterceptors.get(`/folder/download/drawer/${payload.drawerId}`, {
        responseType: 'blob',
      });
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

export const uploadFolders = createAsyncThunk(
  'folder/uploadFolders',
  async (formData: any, thunkAPI) => {
    try {
      const response = await axiosInterceptors.post('/folder/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data } = response;
      return data;
    } catch (err) {
      throw thunkAPI.rejectWithValue(err);
    }
  },
);

export const {
  onClickImport,
  handleSelectFolder,
  clearSelectedFolders,
  reset,
  resetFolderSlice,
  updateFoldersToDelete,
  resetSearchResult,
  updateFoldersToMove,
  updateSelectedFolders,
  setSearchCondition,
  setSearchType,
  setOpenSingleFolder,
  handleSelectSearchField,
  handleRemoveIndexSearchField,
  handleSetFolderToOpen,
  updateFolderToOpen,
  clearFolderToOpen,
} = FolderSlice.actions;
export default FolderSlice.reducer;
