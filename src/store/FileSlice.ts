import React from 'react';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInterceptors from '../api';
import { FOLDER_MODEL_EXTENDED } from '~/pages/FolderManagement/interfaces';
// import { PDFDocument, PDFName } from 'pdf-lib';
// import { blobToURL } from '~/utils';

interface FileType {
  id: number;
  thumbnail: string;
  name: string;
  order_no: number;
}

interface ItemFolderDetail {
  fieldId: number;
  ff_id: number;
  name: string;
  description: string;
}

interface FileState {
  files: Array<FileType>;
  streamFile: any;
  base64File: any;
  currentFile: { id: number; name: string; thumbnail?: string };
  message: { title: React.ReactNode; text: React.ReactNode; type: string };
  folderId: number;
  loading: boolean;
  loadingList: boolean;
  folderDetail: ItemFolderDetail[];
  currentFolder: FOLDER_MODEL_EXTENDED;
  currentFilePosition: number;
  fileDrawerId: number;
  fileRemoveAnnoteString: string;
}

const initialState: FileState = {
  files: [],
  streamFile: null,
  base64File: null,
  currentFile: null,
  message: null,
  folderId: null,
  loading: false,
  loadingList: false,
  folderDetail: [],
  currentFolder: null,
  currentFilePosition: 0,
  fileDrawerId: null,
  fileRemoveAnnoteString: '',
};

export const getFilesByFolder = createAsyncThunk(
  'file/getFilesByFolder',
  async (folderId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInterceptors.get(`/file/folder?id=${folderId}`);
      const { data } = response;
      return data;
    } catch (error) {
      throw rejectWithValue(error);
    }
  },
);

export const streamFile = createAsyncThunk(
  'file/streamFile',
  async (fileId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInterceptors.get(`/file/${fileId}/stream`, {
        responseType: 'arraybuffer',
      });
      const { data } = response;
      return data;
    } catch (error) {
      throw rejectWithValue(error);
    }
  },
);

export const deleteFile = createAsyncThunk(
  'file/deleteFile',
  async (fileId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInterceptors.delete(`/file/${fileId}`);
      const { data } = response;
      return data;
    } catch (error) {
      throw rejectWithValue(error);
    }
  },
);

// Upload Files
export const uploadFiles = createAsyncThunk(
  'filemanagement/uploadFiles',
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

// Upload File to
export const copyFileTo = createAsyncThunk(
  'filemanagement/copyFileTo',
  async (body: any, { rejectWithValue }) => {
    try {
      const response = await axiosInterceptors.post('/file/copy', body);
      const { data } = response;
      return data;
    } catch (err) {
      throw rejectWithValue(err);
    }
  },
);

// Rearrange File
export const rearrangeFile = createAsyncThunk(
  'file/rearrangeFile',
  async (params: { id: number; files: { id: number; ordered: number }[] }, { rejectWithValue }) => {
    try {
      const { id, files } = params;
      const response = await axiosInterceptors.post('/folder/rearrange', {
        id,
        files,
      });
      const { data } = response;
      return data;
    } catch (error) {
      throw rejectWithValue(error);
    }
  },
);

// Get detail folder
export const getFolderDetail = createAsyncThunk(
  '/folder/getFolderDetail',
  async (folderId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInterceptors.get(`/folder/${folderId}`);
      const { data } = response;
      return data;
    } catch (error) {
      throw rejectWithValue(error);
    }
  },
);

// Update Folder
export const updateFolder = createAsyncThunk(
  'file/updateFolder',
  async (params: { folderId: number; fields: Array<any> }, { rejectWithValue }) => {
    try {
      const { folderId, fields } = params;
      const response = await axiosInterceptors.patch(`/folder/${folderId}`, {
        field_folders: fields,
      });
      const { data } = response;
      return data;
    } catch (error) {
      throw rejectWithValue(error);
    }
  },
);

// Duplicate File
export const duplicateFile = createAsyncThunk(
  'file/duplicateFile',
  async (params: { fileId: number }, { rejectWithValue }) => {
    try {
      const { fileId } = params;
      const response = await axiosInterceptors.post('/file/duplicate', {
        id: fileId,
      });
      const { data } = response;
      return data;
    } catch (error) {
      throw rejectWithValue(error);
    }
  },
);

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setCurrentFile: (state, action) => {
      state.currentFile = action.payload;
    },
    updateMessage: (state, action) => {
      state.message = action.payload;
    },
    setCurrentFolderId: (state, action) => {
      state.folderId = action.payload;
    },
    setFolderData: (state, action) => {
      state.folderDetail = action.payload;
    },
    setDrawerId: (state, action) => {
      state.fileDrawerId = action.payload;
    },
    setFileRemoveAnnoteString: (state, action) => {
      state.fileRemoveAnnoteString = action.payload;
    },
    setFileBase64: (state, action) => {
      state.base64File = action.payload;
    },
    setCurrentFilePosition: (state, action) => {
      state.currentFilePosition = action.payload;
    },
    resetFileSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getFilesByFolder.fulfilled, (state: FileState, result: any) => {
      const {
        payload: { payload },
      } = result;
      state.files = payload.sort((a, b) => a.order_no - b.order_no);
      if (payload.length > 0) {
        state.currentFile = payload[0];
      }
    });

    // Stream File
    builder.addCase(streamFile.pending, (state: FileState) => {
      state.loading = true;
    });
    builder.addCase(streamFile.fulfilled, (state: FileState, result: any) => {
      const { payload } = result;
      const file = new Blob([payload], {
        type: state.currentFile?.name.includes('.pdf') ? 'application/pdf' : 'image/png',
      });
      state.streamFile = URL.createObjectURL(file);
      if (state.currentFile?.name.includes('.pdf')) {
        const base64String = btoa(
          new Uint8Array(payload).reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, ''),
        );
        state.base64File = base64String;
      }
      state.loading = false;
    });
    builder.addCase(streamFile.rejected, (state: FileState) => {
      state.loading = false;
    });

    // Remove File
    builder.addCase(deleteFile.pending, (state: FileState) => {
      state.loadingList = true;
    });
    builder.addCase(deleteFile.fulfilled, (state: FileState, result: any) => {
      state.message = {
        title: 'Remove file successfully',
        text: '',
        type: 'success',
      };
      console.log(result);
      state.loadingList = false;
    });

    // Upload Files
    builder.addCase(uploadFiles.pending, (state: FileState) => {
      state.loading = true;
    });
    builder.addCase(uploadFiles.fulfilled, (state: FileState) => {
      state.message = {
        title: 'Success',
        text: 'Upload files Successfully!',
        type: 'success',
      };
      state.loading = false;
    });
    builder.addCase(uploadFiles.rejected, (state: FileState) => {
      state.loading = false;
    });

    // Copy File to
    builder.addCase(copyFileTo.pending, (state: FileState) => {
      state.loading = true;
    });
    builder.addCase(copyFileTo.fulfilled, (state: FileState) => {
      state.message = {
        title: 'Success',
        text: 'Copy file Successfully!',
        type: 'success',
      };
      state.loading = false;
    });
    builder.addCase(copyFileTo.rejected, (state: FileState) => {
      state.loading = false;
    });

    // Duplicate File
    builder.addCase(duplicateFile.pending, (state: FileState) => {
      state.loading = true;
    });
    builder.addCase(duplicateFile.fulfilled, (state: FileState) => {
      state.message = {
        title: 'Success',
        text: 'Duplicate file Successfully!',
        type: 'success',
      };
      state.loading = false;
    });
    builder.addCase(duplicateFile.rejected, (state: FileState) => {
      state.loading = false;
    });

    // Rearrange File
    builder.addCase(rearrangeFile.pending, (state: FileState) => {
      state.loadingList = true;
    });
    builder.addCase(rearrangeFile.fulfilled, (state: FileState, result: any) => {
      state.loadingList = false;
      console.log(result);
    });
    builder.addCase(rearrangeFile.rejected, (state: FileState) => {
      state.loadingList = false;
      state.message = {
        title: 'Error',
        text: 'Something went wrong!',
        type: 'error',
      };
    });
    // Get detail folder
    builder.addCase(getFolderDetail.pending, (state: FileState) => {
      state.loadingList = true;
    });
    builder.addCase(getFolderDetail.fulfilled, (state: FileState, result: any) => {
      const {
        payload: { payload },
      } = result;
      if (payload) {
        state.currentFolder = payload;
        state.folderDetail = payload.fields;
      }
      state.loadingList = false;
    });
    builder.addCase(getFolderDetail.rejected, (state: FileState) => {
      state.loadingList = false;
      state.message = {
        title: 'Error',
        text: 'Something went wrong!',
        type: 'error',
      };
    });

    // Update Folder
    builder.addCase(updateFolder.pending, (state: FileState) => {
      state.loadingList = true;
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    builder.addCase(updateFolder.fulfilled, (state: FileState, result: any) => {
      state.loadingList = false;
      state.message = {
        title: 'Success',
        text: 'Update Folder Successfully!',
        type: 'success',
      };
    });
    builder.addCase(updateFolder.rejected, (state: FileState) => {
      state.loadingList = false;
      state.message = {
        title: 'Error',
        text: 'Something went wrong!',
        type: 'error',
      };
    });
  },
});

export const {
  setCurrentFile,
  updateMessage,
  setCurrentFolderId,
  setFolderData,
  setDrawerId,
  setFileRemoveAnnoteString,
  setFileBase64,
  resetFileSlice,
  setCurrentFilePosition,
} = fileSlice.actions;

export default fileSlice.reducer;
