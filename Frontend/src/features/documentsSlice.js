import { createSlice, createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import axios from "axios";
import { mockDocuments } from "../mockData";

export const addDocumentAsync = createAsyncThunk(
  "documents/addDocumentAsync",
  async ({ file, caseId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `/api/documents/upload/${caseId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add document"
      );
    }
  }
);
export const fetchDocuments = createAsyncThunk(
  "documents/fetchDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("/api/documents/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.log(error);

      return rejectWithValue(
        error.response?.data?.message || "Failed to load cases"
      );
    }
  }
);
export const deleteDocument = createAsyncThunk(
  "documents/deleteDocuments",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete("/api/documents/" + id, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.log(error);

      return rejectWithValue(
        error.response?.data?.message || "Failed to delete document"
      );
    }
  }
);

export const generateSummary = createAsyncThunk(
  "documents/generateSummary",
  async (docId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `/api/ai/summarize/${docId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate summary"
      );
    }
  }
);

const initialState = {
  items: mockDocuments,
  loading: false,
  error: null,
  summary: {},
  loadingSummary: false,
  summaryError: null,
};

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    addDocument: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare(data) {
        return { payload: { id: nanoid(), ...data } };
      },
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addDocumentAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(addDocumentAsync.fulfilled, (state, action) => {
        const document = {
          ...action.payload,
          id: action.payload._id || action.payload.id,
        };
        state.items.push(document);
      })
      .addCase(addDocumentAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        console.log(action.payload);
        state.items = action.payload;
      })
      .addCase(generateSummary.pending, (state) => {
        state.loadingSummary = true;
      })

      .addCase(generateSummary.fulfilled, (state, action) => {
        state.loadingSummary = false;
        const docId = action.meta.arg;
        const summary = action.payload.summary || action.payload;
        state.summary[docId] = summary;
      })

      .addCase(generateSummary.rejected, (state, action) => {
        state.loadingSummary = false;
        state.summaryError = action.payload;
      })
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.meta.arg;
        state.items = state.items.filter(
          (doc) => doc._id !== deletedId && doc.id !== deletedId
        );
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addDocument } = documentsSlice.actions;
export default documentsSlice.reducer;
