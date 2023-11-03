import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import _ from 'lodash';
import axiosInterceptors from '~/api';

interface TYPE {
  id: number;
  name: string;
}

interface FORMAT {
  id: number;
  type_id: number;
  name: string;
}

type STATETYPE = {
  types: TYPE[];
  formats: FORMAT[];
  loading: boolean;
};

const initialState: STATETYPE = {
  types: [],
  formats: [],
  loading: false,
};

const IndexFieldSlice = createSlice({
  name: 'indexField',
  initialState,
  reducers: {
    reset: () => _.cloneDeep(initialState),
  },
  extraReducers: (builder) => {
    // Get Types
    builder.addCase(getTypes.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(getTypes.fulfilled, (state: STATETYPE, result: any) => {
      state.loading = false;
      const {
        payload: {
          payload: { data },
        },
      } = result;
      const types = data.map((item) => ({ id: item.id, name: item.name }));
      state.types = types;
    });
    builder.addCase(getTypes.rejected, (state: STATETYPE) => {
      state.loading = false;
    });

    // Get Formats
    builder.addCase(getFormats.pending, (state: STATETYPE) => {
      state.loading = true;
    });
    builder.addCase(getFormats.fulfilled, (state: STATETYPE, result: any) => {
      state.loading = false;
      const {
        payload: { payload },
      } = result;
      const formats = payload.map((item) => ({
        id: item.id,
        name: item.name,
        type_id: item.type_id,
      }));
      state.formats = formats;
    });
    builder.addCase(getFormats.rejected, (state: STATETYPE) => {
      state.loading = false;
    });
  },
});

export const getTypes = createAsyncThunk(
  'indexField/getTypes',
  async (params: { skip?: number; take?: number }, thunkAPI) => {
    params.skip = params.skip ?? 0;
    params.take = params.take ?? 100;
    try {
      const response: AxiosResponse = await axiosInterceptors.get('/type', { params });
      const { data } = response;
      thunkAPI.dispatch(getFormats());
      return data;
    } catch (error) {
      throw thunkAPI.rejectWithValue(error);
    }
  },
);

export const getFormats = createAsyncThunk('indexField/getFormats', async (_, thunkAPI) => {
  try {
    const response: AxiosResponse = await axiosInterceptors.get('/format/list');
    const { data } = response;
    return data;
  } catch (error) {
    throw thunkAPI.rejectWithValue(error);
  }
});

export const { reset } = IndexFieldSlice.actions;

export default IndexFieldSlice.reducer;
