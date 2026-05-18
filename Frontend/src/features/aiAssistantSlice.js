import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const loadChatHistory = createAsyncThunk(
  "aiAssistant/loadChatHistory",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("/api/ai/getChat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.messages;
    } catch (error) {
      return rejectWithValue("Failed to load chat history");
    }
  }
);

export const clearChatHistory = createAsyncThunk(
  "aiAssistant/clearChatHistory",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete("/api/ai/deleteChat", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return true;
    } catch (error) {
      return rejectWithValue("Failed to clear chat history");
    }
  }
);

export const askAI = createAsyncThunk(
  "aiAssistant/askAI",
  async (message, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/ai/ask",
        { message: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "AI Error");
    }
  }
);
const initialState = {
  messages: [],
  isLoading: false,
  suggestions: [
    "What are the key elements of a breach of contract case?",
    "Explain the discovery process in civil litigation",
    "What evidence is needed for an IP infringement claim?",
    "How do I prepare for a deposition?",
    "What are the statute of limitations for employment disputes?",
  ],
};

const aiAssistantSlice = createSlice({
  name: "aiAssistant",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(askAI.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(askAI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push({
          id: Date.now(),
          role: "assistant",
          content: action.payload.reply, // backend response
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(askAI.rejected, (state, action) => {
        state.isLoading = false;
        state.messages.push({
          id: Date.now(),
          role: "assistant",
          content: `AI Error: ${action.payload}`,
        });
      })

      .addCase(loadChatHistory.fulfilled, (state, action) => {
        state.messages = action.payload.map((msg, index) => ({
          id: `${msg.timestamp}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }));
      })
      .addCase(loadChatHistory.rejected, (state) => {})

      // ---------- Clear chat from DB ----------
      .addCase(clearChatHistory.fulfilled, (state) => {
        state.messages = [];
      })
      .addCase(clearChatHistory.rejected, (state, action) => {
        state.messages.push({
          id: Date.now(),
          role: "assistant",
          content: `Error clearing chat: ${action.payload}`,
        });
      });
  },
});

export const { addMessage, setLoading, clearChat } = aiAssistantSlice.actions;
export default aiAssistantSlice.reducer;
