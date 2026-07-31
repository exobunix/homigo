import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BookingState, Booking, BookingRequest, BookingStatus, AppError } from '@/types';
import { bookingAPI } from '@/services/api';

const initialState: BookingState = {
  activeBookings: [],
  completedBookings: [],
  currentRequest: null,
  isRequestVisible: false,
  requestTimer: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchActiveBookings = createAsyncThunk(
  'booking/fetchActiveBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getActiveBookings();
      console.log('Fetched active bookings:', response.data);
      const bookings = response.data.data.map((b: any) => ({
        ...b,
        id: b._id || b.id,
      }));
      return bookings;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch bookings' });
    }
  }
);

export const fetchCompletedBookings = createAsyncThunk(
  'booking/fetchCompletedBookings',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getCompletedBookings(page);
      const data = response.data.data as any;
      const bookings = data.data.map((b: any) => ({
        ...b,
        id: b._id || b.id,
      }));
      return { ...data, data: bookings };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch completed bookings' });
    }
  }
);

export const acceptBooking = createAsyncThunk(
  'booking/acceptBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.acceptBooking(bookingId);
      const booking = response.data.data;
      return { ...booking, id: (booking as any)._id || booking.id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to accept booking' });
    }
  }
);

export const rejectBooking = createAsyncThunk(
  'booking/rejectBooking',
  async ({ bookingId, reason }: { bookingId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.rejectBooking(bookingId, reason);
      const booking = response.data.data;
      return { ...(booking as any), id: (booking as any)._id || (booking as any).id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to reject booking' });
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'booking/updateBookingStatus',
  async ({ bookingId, status, location }: { bookingId: string; status: BookingStatus; location?: any }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.updateBookingStatus(bookingId, status, location);
      const booking = response.data.data;
      return { ...booking, id: (booking as any)._id || booking.id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update booking status' });
    }
  }
);

export const addAdditionalCharges = createAsyncThunk(
  'booking/addAdditionalCharges',
  async ({ bookingId, charges }: { bookingId: string; charges: any[] }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.addAdditionalCharges(bookingId, charges);
      const booking = response.data.data;
      return { ...booking, id: (booking as any)._id || booking.id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add charges' });
    }
  }
);

export const uploadWorkImages = createAsyncThunk(
  'booking/uploadWorkImages',
  async ({ bookingId, images }: { bookingId: string; images: string[] }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.uploadWorkImages(bookingId, images);
      const booking = response.data.data;
      return { ...booking, id: (booking as any)._id || booking.id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to upload images' });
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCurrentRequest: (state, action: PayloadAction<BookingRequest | null>) => {
      state.currentRequest = action.payload;
      state.isRequestVisible = action.payload !== null;
      state.requestTimer = action.payload ? 60 : 0; // 60 seconds timer
    },
    showBookingRequest: (state, action: PayloadAction<BookingRequest>) => {
      state.currentRequest = action.payload;
      state.isRequestVisible = true;
      state.requestTimer = 60;
    },
    hideBookingRequest: (state) => {
      state.currentRequest = null;
      state.isRequestVisible = false;
      state.requestTimer = 0;
    },
    decrementTimer: (state) => {
      if (state.requestTimer > 0) {
        state.requestTimer -= 1;
      }
      if (state.requestTimer === 0) {
        state.currentRequest = null;
        state.isRequestVisible = false;
      }
    },
    updateBookingInList: (state, action: PayloadAction<Booking>) => {
      const booking = action.payload;
      const activeIndex = state.activeBookings.findIndex(b => b.id === booking.id);

      if (activeIndex !== -1) {
        if (['work_completed', 'cancelled'].includes(booking.status)) {
          // Move to completed bookings
          state.activeBookings.splice(activeIndex, 1);
          state.completedBookings.unshift(booking);
        } else {
          // Update in active bookings
          state.activeBookings[activeIndex] = booking;
        }
      }
    },
    addNewBooking: (state, action: PayloadAction<Booking>) => {
      state.activeBookings.unshift(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch active bookings
    builder
      .addCase(fetchActiveBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeBookings = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AppError;
      });

    // Fetch completed bookings
    builder
      .addCase(fetchCompletedBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompletedBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        const bookingsData = action.payload as { data: Booking[]; total: number; page: number; limit: number; hasMore: boolean };
        if (action.meta.arg === 1) {
          // First page - replace
          state.completedBookings = bookingsData.data;
        } else {
          // Subsequent pages - append
          state.completedBookings.push(...bookingsData.data);
        }
        state.error = null;
      })
      .addCase(fetchCompletedBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AppError;
      });

    // Accept booking
    builder
      .addCase(acceptBooking.pending, (state) => {
        state.error = null;
      })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.currentRequest = null;
        state.isRequestVisible = false;
        state.requestTimer = 0;

        const updatedBooking = action.payload;
        const index = state.activeBookings.findIndex(b => b.id === updatedBooking.id);
        if (index !== -1) {
          state.activeBookings[index] = updatedBooking;
        } else {
          state.activeBookings.unshift(updatedBooking);
        }
        state.error = null;
      })
      .addCase(acceptBooking.rejected, (state, action) => {
        state.error = action.payload as AppError;
      });

    // Reject booking
    builder
      .addCase(rejectBooking.pending, (state) => {
        state.error = null;
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.currentRequest = null;
        state.isRequestVisible = false;
        state.requestTimer = 0;
        state.error = null;

        const booking = action.payload;
        const index = state.activeBookings.findIndex(b => b.id === booking.id);
        if (index !== -1) {
          state.activeBookings.splice(index, 1);
          state.completedBookings.unshift(booking);
        }
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.error = action.payload as AppError;
      });

    // Update booking status
    builder
      .addCase(updateBookingStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const updatedBooking = action.payload;
        const index = state.activeBookings.findIndex(b => b.id === updatedBooking.id);
        if (index !== -1) {
          if (['work_completed', 'cancelled'].includes(updatedBooking.status)) {
            state.activeBookings.splice(index, 1);
            state.completedBookings.unshift(updatedBooking);
          } else {
            state.activeBookings[index] = updatedBooking;
          }
        }
        state.error = null;
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.error = action.payload as AppError;
      });

    // Add additional charges
    builder
      .addCase(addAdditionalCharges.fulfilled, (state, action) => {
        const updatedBooking = action.payload;
        const index = state.activeBookings.findIndex(b => b.id === updatedBooking.id);
        if (index !== -1) {
          state.activeBookings[index] = updatedBooking;
        }
      });

    // Upload work images
    builder
      .addCase(uploadWorkImages.fulfilled, (state, action) => {
        const updatedBooking = action.payload;
        const index = state.activeBookings.findIndex(b => b.id === updatedBooking.id);
        if (index !== -1) {
          state.activeBookings[index] = updatedBooking;
        }
      });
  },
});

export const {
  setCurrentRequest,
  showBookingRequest,
  hideBookingRequest,
  decrementTimer,
  updateBookingInList,
  addNewBooking,
  clearError,
} = bookingSlice.actions;

export default bookingSlice.reducer;
