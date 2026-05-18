import { createSlice, createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import { mockCases, mockUsers } from "../mockData";
import axios from "axios";
export const fetchCases = createAsyncThunk(
  "cases/fetchCases",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("/api/cases/", {
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
export const fetchlawyers = createAsyncThunk(
  "cases/fetchlawyers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("/api/users/lawyer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);

      return rejectWithValue(
        error.response?.data?.message || "Failed to load lawyers"
      );
    }
  }
);

export const addCaseItem = createAsyncThunk(
  "cases/addCases",
  async (caseData, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post("/api/cases/", caseData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data?.msg);
    }
  }
);

const initialState = {
  items: mockCases,
  lawyers: mockUsers.filter((c) => c.role == "lawyer"),
  selectedCase: null,
};

const casesSlice = createSlice({
  name: "cases",
  initialState,
  reducers: {
    addCase: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare(data) {
        return { payload: { id: nanoid(), ...data } };
      },
    },
    updateStatus(state, action) {
      const { id, status } = action.payload;
      const found = state.items.find((c) => c.id === id);
      if (found) found.status = status;
    },
    selectCase(state, action) {
      state.selectedCase = action.payload;
    },
    addCase: {
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
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.items = action.payload.map((caseItem) => ({
          ...caseItem,
          id: caseItem._id || caseItem.id,
        }));
      })
      .addCase(fetchlawyers.fulfilled, (state, action) => {
        state.lawyers = action.payload;
      })
      .addCase(addCaseItem.fulfilled, (state, action) => {
        const newCase = {
          ...action.payload,
          id: action.payload._id,
        };
        state.items.push(newCase);
      })
      .addCase(addCaseItem.rejected, (state, action) => {
        console.error("Add case failed:", action.payload);
      });
  },
});

export const { addCase, updateStatus, selectCase } = casesSlice.actions;
export default casesSlice.reducer;
