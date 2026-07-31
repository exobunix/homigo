import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, ChatRoom, ChatMessage, AppError } from '@/types';

const initialState: ChatState = {
  rooms: [],
  messages: {},
  activeRoom: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (_, { rejectWithValue }) => {
    try {
      // API call would go here
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch chat rooms' });
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (roomId: string, { rejectWithValue }) => {
    try {
      // API call would go here
      return { roomId, messages: [] };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch messages' });
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message: Omit<ChatMessage, 'id' | 'timestamp'>, { rejectWithValue }) => {
    try {
      // API call would go here
      const newMessage: ChatMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      return newMessage;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send message' });
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveRoom: (state, action: PayloadAction<string | null>) => {
      state.activeRoom = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const message = action.payload;
      const roomId = message.bookingId;
      
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      
      state.messages[roomId].push(message);
      
      // Update room's last message
      const roomIndex = state.rooms.findIndex(room => room.id === roomId);
      if (roomIndex !== -1) {
        state.rooms[roomIndex].lastMessage = message;
        if (message.senderType === 'customer') {
          state.rooms[roomIndex].unreadCount += 1;
        }
      }
    },
    markMessagesAsRead: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      const roomIndex = state.rooms.findIndex(room => room.id === roomId);
      if (roomIndex !== -1) {
        state.rooms[roomIndex].unreadCount = 0;
      }
      
      if (state.messages[roomId]) {
        state.messages[roomId] = state.messages[roomId].map(msg => ({
          ...msg,
          isRead: true,
        }));
      }
    },
    updateRoom: (state, action: PayloadAction<ChatRoom>) => {
      const room = action.payload;
      const index = state.rooms.findIndex(r => r.id === room.id);
      if (index !== -1) {
        state.rooms[index] = room;
      } else {
        state.rooms.push(room);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch chat rooms
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload;
        state.error = null;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AppError;
      });

    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { roomId, messages } = action.payload;
        state.messages[roomId] = messages;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AppError;
      });

    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const roomId = message.bookingId;
        
        if (!state.messages[roomId]) {
          state.messages[roomId] = [];
        }
        
        state.messages[roomId].push(message);
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as AppError;
      });
  },
});

export const {
  setActiveRoom,
  addMessage,
  markMessagesAsRead,
  updateRoom,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
