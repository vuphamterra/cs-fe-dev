import { createSlice } from '@reduxjs/toolkit';

interface ScannerType {
  name: string;
}
interface SettingType {
  color: number;
  scanMode: number;
  resolution: number;
  pageSize: string;
}
interface FileState {
  listNameScanner: Array<ScannerType>;
  defaultScannerSetting: Array<SettingType>;
}

const initialState: FileState = {
  listNameScanner: [],
  defaultScannerSetting: [],
};

export const scannerSlice = createSlice({
  name: 'scanner',
  initialState,
  reducers: {
    setListNameScanner: (state, action) => {
      state.listNameScanner = action.payload;
    },
    setDefaultScannerSetting: (state, action) => {
      state.defaultScannerSetting = action.payload;
    },
  },
  extraReducers: (builder) => {},
});

export const { setListNameScanner, setDefaultScannerSetting } = scannerSlice.actions;

export default scannerSlice.reducer;
