import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const predictCaseOutcomeAsync = createAsyncThunk(
  "ai/predictOutcome",
  async ({ file }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const form = new FormData();
      form.append("file", file);

      const res = await axios.post("/api/ai/predict", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Prediction failed");
    }
  }
);

const initialState = {
  currentPrediction: null,
  uploadedDocument: null,
  isAnalyzing: false,
};

const casePredictorSlice = createSlice({
  name: "casePredictor",
  initialState,
  reducers: {
    setUploadedDocument: (state, action) => {
      state.uploadedDocument = action.payload;
    },
    setAnalyzing: (state, action) => {
      state.isAnalyzing = action.payload;
    },
    generatePrediction: (state, action) => {
      const { documentType, fileName } = action.payload;

      let predictionData;
      if (
        documentType?.toLowerCase().includes("contract") ||
        fileName?.toLowerCase().includes("contract")
      ) {
        predictionData = mockPredictions.contract;
      } else if (
        documentType?.toLowerCase().includes("ip") ||
        documentType?.toLowerCase().includes("patent") ||
        fileName?.toLowerCase().includes("patent")
      ) {
        predictionData = mockPredictions.ip;
      } else if (
        documentType?.toLowerCase().includes("employment") ||
        fileName?.toLowerCase().includes("employment")
      ) {
        predictionData = mockPredictions.employment;
      } else {
        // Random selection for demo
        const types = Object.keys(mockPredictions);
        const randomType = types[Math.floor(Math.random() * types.length)];
        predictionData = mockPredictions[randomType];
      }

      const prediction = {
        id: Date.now(),
        fileName,
        ...predictionData,
        analyzedAt: new Date().toISOString(),
      };

      state.currentPrediction = prediction;
      state.predictions.push(prediction);
      state.analysisHistory.unshift({
        id: prediction.id,
        fileName,
        outcome: prediction.outcome,
        confidence: prediction.confidence,
        analyzedAt: prediction.analyzedAt,
      });
      state.isAnalyzing = false;
    },
    clearCurrentPrediction: (state) => {
      state.currentPrediction = null;
      state.uploadedDocument = null;
    },
    loadPrediction: (state, action) => {
      const prediction = state.predictions.find((p) => p.id === action.payload);
      if (prediction) {
        state.currentPrediction = prediction;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(predictCaseOutcomeAsync.pending, (state) => {
        state.isAnalyzing = true;
      })
      .addCase(predictCaseOutcomeAsync.fulfilled, (state, action) => {
        state.isAnalyzing = false;

        // Backend returns nested object, extract prediction
        const response = action.payload.prediction || action.payload;
        const predictionStr =
          typeof response === "object" ? response.prediction : response;

        const winProbability =
          typeof predictionStr === "string"
            ? parseInt(predictionStr.replace("%", ""), 10) || 0
            : parseInt(predictionStr, 10) || 0;

        state.currentPrediction = {
          id: Date.now(),
          fileName: state.uploadedDocument?.name || "Document",
          winProbability: winProbability,
          analyzedAt: new Date().toISOString(),
        };
      })
      .addCase(predictCaseOutcomeAsync.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload;
      });
  },
});

export const {
  setUploadedDocument,
  setAnalyzing,
  generatePrediction,
  clearCurrentPrediction,
  loadPrediction,
} = casePredictorSlice.actions;

export default casePredictorSlice.reducer;
