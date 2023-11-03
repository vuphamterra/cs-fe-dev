import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInterceptors from '~/api';

interface AuditState {
  loading: boolean;
  url: string;
}

const initialState: AuditState = {
  loading: false,
  url: '',
};

export const getAuditReport = createAsyncThunk(
  'audit/getAuditReport',
  async (params: { from: string; to: string; actions: string[]; users: string[] }) => {
    try {
      const { from, to, actions, users } = params;
      const response = await axiosInterceptors
        // .get(`/audit-trail/download?from=${from}&to=${to}&actions[]=${actions}&users[]=${users}`, {
        .get(`/audit-trail/download?from=${from}&to=${to}`, {
          responseType: 'blob',
          params: {
            actions,
            users,
          },
        })
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Audit_Report_${new Date(Date.now())}.xlsx`);
          document.body.appendChild(link);
          link.click();
        });
      return response;
    } catch (err) {
      console.log(err);
    }
  },
);

export const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAuditReport.pending, (state: AuditState) => {
      state.loading = true;
    });
    builder.addCase(getAuditReport.fulfilled, (state: AuditState) => {
      state.loading = false;
    });
    builder.addCase(getAuditReport.rejected, (state: AuditState) => {
      state.loading = false;
    });
  },
});

export default auditSlice.reducer;
