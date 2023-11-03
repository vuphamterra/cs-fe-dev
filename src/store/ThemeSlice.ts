import _ from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { ThemeConfig } from 'antd/es/config-provider';

interface THEME_STATE {
  theme: ThemeConfig;
}

const initialState: THEME_STATE = {
  theme: {
    token: {
      colorPrimary: '#3a52c5',
    },
  },
};

const ThemeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    updateTheme: (state, action) => {
      state.theme = action.payload;
    },
    reset: () => _.cloneDeep(initialState),
  },
});

export const { updateTheme, reset } = ThemeSlice.actions;
export default ThemeSlice.reducer;
