import { createSlice, createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import { mockMessages } from "../mockData";
import io from "socket.io-client";
import axios from "axios";

let socket = null;

const initialState = {
  messages: [],
  participants: [],
  isConnected: false,
  loading: false,
  error: null,
};

// Fetch chat messages for a specific case
export const fetchChatMessages = createAsyncThunk(
  "chats/fetchMessages",
  async (caseId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/chats/messages/${caseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setChatHistory: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action) => {
      const { userId } = action.payload;
      if (!state.typingUsers.includes(userId)) {
        state.typingUsers.push(userId);
      }
    },
    removeTyping: (state, action) => {
      const { userId } = action.payload;
      state.typingUsers = state.typingUsers.filter((id) => id !== userId);
    },
    sendMessage: {
      reducer(state, action) {
        // Message will be added via socket 'newMessage' event
      },
      prepare({ caseId, from, to, text }) {
        return {
          payload: {
            id: nanoid(),
            caseId,
            from,
            to,
            text,
            timestamp: new Date().toISOString(),
          },
        };
      },
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("Started");
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages || [];
        state.participants = action.payload.participants || [];
        console.log(state.messages);
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  sendMessage,
  setConnected,
  setChatHistory,
  addMessage,
  setTyping,
  removeTyping,
} = chatSlice.actions;

// Socket.io helper functions
export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default chatSlice.reducer;
