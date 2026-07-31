import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LocationState, Location, AppError } from '@/types';

const initialState: LocationState = {
  currentLocation: null,
  isTracking: false,
  isLocationEnabled: false,
  error: null,
};

// Async thunks
export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    try {
      // Location service call would go here
      return {
        latitude: 0,
        longitude: 0,
        address: '',
        city: '',
        state: '',
        pincode: '',
      };
    } catch (error: any) {
      return rejectWithValue({ message: 'Failed to get current location' });
    }
  }
);

export const startLocationTracking = createAsyncThunk(
  'location/startLocationTracking',
  async (_, { rejectWithValue }) => {
    try {
      // Start background location tracking
      return true;
    } catch (error: any) {
      return rejectWithValue({ message: 'Failed to start location tracking' });
    }
  }
);

export const stopLocationTracking = createAsyncThunk(
  'location/stopLocationTracking',
  async (_, { rejectWithValue }) => {
    try {
      // Stop background location tracking
      return false;
    } catch (error: any) {
      return rejectWithValue({ message: 'Failed to stop location tracking' });
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
    },
    setLocationEnabled: (state, action: PayloadAction<boolean>) => {
      state.isLocationEnabled = action.payload;
    },
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get current location
    builder
      .addCase(getCurrentLocation.pending, (state) => {
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.currentLocation = action.payload;
        state.isLocationEnabled = true;
        state.error = null;
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.error = action.payload as AppError;
        state.isLocationEnabled = false;
      });

    // Start location tracking
    builder
      .addCase(startLocationTracking.pending, (state) => {
        state.error = null;
      })
      .addCase(startLocationTracking.fulfilled, (state) => {
        state.isTracking = true;
        state.error = null;
      })
      .addCase(startLocationTracking.rejected, (state, action) => {
        state.error = action.payload as AppError;
        state.isTracking = false;
      });

    // Stop location tracking
    builder
      .addCase(stopLocationTracking.fulfilled, (state) => {
        state.isTracking = false;
        state.error = null;
      })
      .addCase(stopLocationTracking.rejected, (state, action) => {
        state.error = action.payload as AppError;
      });
  },
});

export const {
  setCurrentLocation,
  setLocationEnabled,
  setTracking,
  clearError,
} = locationSlice.actions;

export default locationSlice.reducer;
