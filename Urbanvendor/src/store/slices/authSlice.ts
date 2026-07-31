import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, Vendor, AppError, LoginForm, OTPForm } from '@/types';
import { authAPI } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginWithPhone = createAsyncThunk(
  'auth/loginWithPhone',
  async (data: LoginForm, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendOTP(data.phone);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const loginWithPasswordAuth = createAsyncThunk(
  'auth/loginWithPasswordAuth',
  async (
    { phone, password }: { phone: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.loginWithPassword(phone, password);
      const { token, user } = response.data.data as { token: string; user: Vendor };

      await AsyncStorage.setItem('authToken', token);

      return { token, user };
    } catch (error: any) {
      console.log('loginWithPasswordAuth error:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });

      if (error?.response) {
        const status = error.response.status;
        const data = error.response.data || {};

        // 400/401: usually invalid credentials
        if (status === 400 || status === 401) {
          return rejectWithValue(data || { message: 'Invalid credentials' });
        }

        // Other server errors
        return rejectWithValue(
          data || { message: 'Login failed due to server error. Please try again.' }
        );
      }

      // No response -> network / connectivity issue
      return rejectWithValue({
        message: 'Login failed. Please check your internet connection and that the backend server is running.',
      });
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp }: { phone: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyOTP(phone, otp);
      const { token, user } = response.data.data;

      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', token);

      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'OTP verification failed' });
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadUserFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await authAPI.getProfile();
      const user = response.data.data as Vendor;
      return { token, user };
    } catch (error: any) {
      await AsyncStorage.removeItem('authToken');
      return rejectWithValue(error.response?.data || { message: 'Failed to load user' });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<Vendor>, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      return response.data.data as Vendor;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Profile update failed' });
    }
  }
);

export const toggleOnlineStatus = createAsyncThunk(
  'auth/toggleOnlineStatus',
  async (isOnline: boolean, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateOnlineStatus(isOnline);
      return response.data.data as Vendor;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Status update failed' });
    }
  }
);

export const updateVendorServices = createAsyncThunk(
  'auth/updateVendorServices',
  async (services: any[], { rejectWithValue }) => {
    try {
      const response = await authAPI.updateServices(services);
      return response.data.data as Vendor;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update services' });
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      await AsyncStorage.removeItem('authToken');
      return null;
    } catch (error: any) {
      // Even if API call fails, remove local token
      await AsyncStorage.removeItem('authToken');
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action: PayloadAction<Vendor>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<Vendor>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login with phone
    builder
      .addCase(loginWithPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPhone.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginWithPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AppError;
      });

    // Login with password
    builder
      .addCase(loginWithPasswordAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPasswordAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginWithPasswordAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AppError;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AppError;
      });

    // Load user from storage
    builder
      .addCase(loadUserFromStorage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        // Do not set an error here; failing to load user on app start should be silent
      });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AppError;
      });

    // Toggle online status
    builder
      .addCase(toggleOnlineStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleOnlineStatus.fulfilled, (state, action) => {
        if (state.user) {
          state.user.isOnline = action.payload.isOnline;
        }
        state.error = null;
      })
      .addCase(toggleOnlineStatus.rejected, (state, action) => {
        state.error = action.payload as AppError;
      });

    // Update Services
    builder
      .addCase(updateVendorServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVendorServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateVendorServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AppError;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
        state.isLoading = false;
      });
  },
});

export const { clearError, setLoading, setUser, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
