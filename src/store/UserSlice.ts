import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInterceptors from '~/api';

interface UserRole {
  id: number;
  name: string;
  code: string;
}

interface UserType {
  id: number;
  email: string;
  username: string;
  description: string;
  created_at: string;
  roles: Array<UserRole>;
}

interface PermissionType {
  id: number;
  code: string;
  name: string;
}

interface UserDrawerPermissionType {
  id: number;
  name: string;
  description: string;
  permission: Array<PermissionType>;
}

interface StateType {
  listUser: Array<UserType>;
  user: UserType;
  selectedUserId: number | null;
  loading: boolean;
  message: { message: string; description: string; type: string; fields?: string[] };
  listPermission: any;
  userPermission: Array<UserDrawerPermissionType> | null;
  currentUserPermission: Array<UserDrawerPermissionType>;
  selectedPermissionId: Array<any>;
}

const initialState: StateType = {
  listUser: [],
  user: null,
  selectedUserId: null,
  loading: false,
  message: null,
  listPermission: [],
  userPermission: [],
  selectedPermissionId: [],
  currentUserPermission: [],
};

export const getListUser = createAsyncThunk('user/getListUser', async () => {
  try {
    const response = await axiosInterceptors.get('/user/list?skip=0&take=100');
    const { data } = response;
    return data;
  } catch (err) {
    console.log(err);
  }
});

export const getUserById = createAsyncThunk('user/getUserById', async (id: any, { dispatch }) => {
  try {
    const response = await axiosInterceptors.get(`/user/${id}`);
    dispatch(setSelectedUserId(id));
    return response;
  } catch (err) {
    console.log(err);
  }
});

export const createUser = createAsyncThunk(
  'user/CreateUser',
  async (
    params: { email: string; userName: string; description: string; databaseId: number },
    { dispatch, rejectWithValue },
  ) => {
    const { email, userName, description, databaseId } = params;
    try {
      const response = await axiosInterceptors.post('/user', {
        email,
        username: userName,
        description: description || 'No description',
        role_id: [3],
        database_id: [databaseId],
      });

      const { data } = response;
      dispatch(getListUser());
      dispatch(getUserById(data.payload.id));
      return data;
    } catch (err) {
      console.log('errr', err);
      throw rejectWithValue(err);
    }
  },
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (userInfo: any, { rejectWithValue }) => {
    const { id, ...user } = userInfo;
    try {
      const response = await axiosInterceptors.put(`/user/${id}`, user);
      const { data } = response;
      return data;
    } catch (err) {
      throw rejectWithValue(err);
    }
  },
);

export const updateUserRole = createAsyncThunk(
  'user/updateUserRole',
  async (params: { userId: number; roleId: Array<number> }, { dispatch, rejectWithValue }) => {
    try {
      const { userId, roleId } = params;
      const response = await axiosInterceptors.patch(`/user/${userId}/update_role`, {
        role_id: roleId,
      });
      dispatch(getListUser());
      dispatch(getUserById(userId));
      return response;
    } catch (err) {
      throw rejectWithValue(err);
    }
  },
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId: any, { rejectWithValue }) => {
    try {
      const response = await axiosInterceptors.delete(`/user/${userId}`);
      return response;
    } catch (err) {
      throw rejectWithValue(err);
    }
  },
);

export const changePasswordUser = createAsyncThunk(
  'user/changePassword',
  async (
    params: { id: number; currentPassword: string; newPassword: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const { id, currentPassword, newPassword } = params;
      const response = await axiosInterceptors.patch(`/user/${id}/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      dispatch(getUserById(id));
      return response.data;
    } catch (err) {
      throw rejectWithValue(err);
    }
  },
);

export const getListPermission = createAsyncThunk(
  'user/getListPermission',
  async (params: { skip: number; take: number }) => {
    try {
      const { skip, take } = params;
      const response = await axiosInterceptors.get(`/permission/list?skip=${skip}&take=${take}`);
      const { data } = response;
      return data;
    } catch (err) {
      console.log(err);
    }
  },
);

export const getUserPermission = createAsyncThunk(
  'user/getUserPermission',
  async (userId: number) => {
    try {
      const response = await axiosInterceptors.get(`/permission/list-by-user/${userId}`);
      const { data } = response;
      return data;
    } catch (err) {
      console.log(err);
    }
  },
);

export const updateUserPermission = createAsyncThunk(
  'user/updateUserPermission',
  async (params: { userId: number; permissions: any }, { rejectWithValue }) => {
    try {
      const { userId, permissions } = params;
      const response = await axiosInterceptors.patch(`/permission/update-by-user/${userId}`, {
        drawer: permissions,
      });
      const { data } = response;
      return data;
    } catch (error) {
      throw rejectWithValue(error);
    }
  },
);

export const resetUserPassword = createAsyncThunk(
  'user/resetUserPassword',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInterceptors.patch(`/user/${userId}/reset-password`);
      return response.data;
    } catch (err) {
      throw rejectWithValue(err);
    }
  },
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setListUser: (state, action) => {
      state.listUser = action.payload;
    },
    handleSelectUserId: (state, action) => {
      state.selectedUserId = action.payload;
    },
    resetUserStore: () => initialState,
    setSelectedUserId: (state, action) => {
      state.selectedUserId = action.payload;
    },
    resetMessage: (state) => {
      state.message = null;
    },
    handleChangeUserPermission: (state, action) => {
      const { payload } = action;
      state.userPermission = payload;
    },
    handleSetSelectedPermissionId: (state, action) => {
      state.selectedPermissionId = action.payload;
    },
    handleSortByName: (state, action) => {
      const { payload } = action;
      if (payload) {
        state.listUser = [...state.listUser].sort((a, b) => (a.username > b.username ? 1 : -1));
      } else {
        state.listUser = [...state.listUser].sort((a, b) => (b.username > a.username ? 1 : -1));
      }
    },
    handleSortByCreateDate: (state, action) => {
      const { payload } = action;
      if (payload) {
        state.listUser = [...state.listUser].sort(
          (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
        );
      } else {
        state.listUser = [...state.listUser].sort(
          (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
        );
      }
    },
    resetCurrentUserPermisson: (state) => {
      state.userPermission = [...state.currentUserPermission];
    },
  },
  extraReducers: (builder) => {
    // Get list Users
    builder.addCase(getListUser.pending, (state: StateType) => {
      state.loading = true;
    });
    builder.addCase(getListUser.fulfilled, (state: StateType, result: any) => {
      state.loading = false;
      const {
        payload: { payload },
      } = result;
      const { data, total } = payload;
      if (Array.isArray(data) && data.length > 0 && total > 0) {
        state.listUser = data.sort((a, b) => b.id - a.id);
        state.selectedUserId = data[0].id;
      }
      if (data.length === 0) {
        state.listUser = [];
        state.currentUserPermission = null;
        state.listPermission = [];
        state.user = null;
        state.selectedUserId = null;
      }
    });
    builder.addCase(getListUser.rejected, (state: StateType) => {
      state.loading = false;
    });

    // Get User Details
    builder.addCase(getUserById.pending, (state: StateType) => {
      state.loading = true;
    });
    builder.addCase(getUserById.fulfilled, (state: StateType, { payload }: any) => {
      state.user = payload.data.payload;
      state.loading = false;
    });
    builder.addCase(getUserById.rejected, (state: StateType) => {
      state.loading = false;
      state.user = null;
    });

    // Create User
    builder.addCase(createUser.pending, (state: StateType) => {
      state.loading = true;
    });
    builder.addCase(createUser.fulfilled, (state: StateType, result: any) => {
      state.loading = false;
      const {
        payload: { payload, message, statusCode },
      } = result;
      if (statusCode === 201) {
        state.user = payload;
        state.message = { message, description: '', type: 'success' };
      } else {
        state.loading = false;
      }
    });
    builder.addCase(createUser.rejected, (state: StateType, result: any) => {
      state.loading = false;
      const { response } = result.payload;
      console.log(response);
      if (response) {
        state.message = {
          message: 'Create User Failed',
          description: response.data.message,
          type: 'error',
        };
      }
    });

    // Edit description
    builder.addCase(updateUser.pending, (state: StateType) => {
      state.loading = true;
    });
    builder.addCase(updateUser.fulfilled, (state: StateType, result: any) => {
      state.loading = false;
      const {
        payload: { message, statusCode },
      } = result;
      if (statusCode === 200) {
        state.message = { message, description: '', type: 'success' };
        state.user = state.listUser[0];
      }
    });
    builder.addCase(updateUser.rejected, (state: StateType) => {
      state.loading = false;
    });

    // Delete User
    builder.addCase(deleteUser.pending, (state: StateType) => {
      state.loading = true;
    });
    builder.addCase(deleteUser.fulfilled, (state: StateType) => {
      state.loading = false;
    });
    builder.addCase(deleteUser.rejected, (state: StateType) => {
      state.loading = false;
    });

    // Update User Role
    builder.addCase(updateUserRole.pending, (state: StateType) => {
      state.loading = true;
    });
    builder.addCase(updateUserRole.fulfilled, (state: StateType, { payload }: any) => {
      state.loading = false;
      const {
        data: { statusCode, message },
      } = payload;
      if (statusCode && statusCode === 200) {
        state.message = { message, description: '', type: 'success' };
      }
    });
    builder.addCase(updateUserRole.rejected, (state: StateType) => {
      state.message = { message: 'Update User Role Failed!', description: '', type: 'error' };
    });

    // Change password
    builder.addCase(changePasswordUser.pending, (state: StateType) => {
      state.loading = true;
    });
    builder.addCase(changePasswordUser.fulfilled, (state: StateType, { payload }: any) => {
      state.loading = false;
      if (payload && payload.statusCode === 200) {
        state.message = { message: payload.message, description: '', type: 'success' };
      }
    });
    builder.addCase(changePasswordUser.rejected, (state: StateType, result: any) => {
      state.loading = false;
      const {
        payload: { response },
      } = result;
      const {
        data: { statusCode, message },
      } = response;
      if (statusCode === 404) {
        state.message = { message: 'Change Password Failed!', description: message, type: 'error' };
      }
    });

    // Get list Permission
    builder.addCase(getListPermission.pending, (state: StateType) => {
      state.loading = true;
    });
    builder.addCase(getListPermission.fulfilled, (state: StateType, result: any) => {
      const {
        payload: { payload },
      } = result;
      if (payload.data) {
        // Filter Configuration permission
        state.listPermission = payload.data.filter((i) => i.id !== 9);
      }
    });
    builder.addCase(getListPermission.rejected, (state: StateType) => {
      state.loading = false;
      state.listPermission = [];
    });

    // Get permission by UserId
    builder.addCase(getUserPermission.pending, (state: StateType) => {
      state.loading = true;
    });
    builder.addCase(getUserPermission.fulfilled, (state: StateType, result: any) => {
      state.loading = false;
      const {
        payload: { payload },
      } = result;
      state.userPermission = payload;
      state.currentUserPermission = payload;
    });
    builder.addCase(getUserPermission.rejected, (state: StateType) => {
      state.loading = false;
    });

    // Update User permission
    builder.addCase(updateUserPermission.pending, (state: StateType) => {
      state.loading = true;
    });
    builder.addCase(updateUserPermission.fulfilled, (state: StateType, result: any) => {
      state.loading = false;
      const { message, statusCode } = result.payload;
      if (statusCode === 200) {
        state.message = { message, description: '', type: 'success' };
      }
    });
    builder.addCase(updateUserPermission.rejected, (state: StateType, result: any) => {
      state.loading = false;
      const {
        response: { data },
      } = result.payload;
      const { statusCode, message } = data;
      if (statusCode === 500) {
        state.message = { message, description: '', type: 'error' };
      }
    });

    // Reset Password
    builder.addCase(resetUserPassword.pending, (state: StateType) => {
      state.loading = true;
    });
    builder.addCase(resetUserPassword.fulfilled, (state: StateType, result: any) => {
      const { message, statusCode } = result.payload;
      if (statusCode === 200) {
        state.message = { message, description: '', type: 'success' };
      }
      state.loading = false;
    });
    builder.addCase(resetUserPassword.rejected, (state: StateType) => {
      state.loading = false;
    });
  },
});

export const {
  setListUser,
  setSelectedUserId,
  resetUserStore,
  resetMessage,
  handleChangeUserPermission,
  handleSetSelectedPermissionId,
  handleSortByName,
  handleSortByCreateDate,
  resetCurrentUserPermisson,
  handleSelectUserId,
} = userSlice.actions;

export default userSlice.reducer;
