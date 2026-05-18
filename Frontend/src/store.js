import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import casesReducer from "./features/casesSlice";
import documentsReducer from "./features/documentsSlice";
import chatReducer from "./features/chatSlice";
import aiAssistantReducer from "./features/aiAssistantSlice";
import casePredictorReducer from "./features/casePredictorSlice";
import usersReducer from "./features/usersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cases: casesReducer,
    documents: documentsReducer,
    chat: chatReducer,
    aiAssistant: aiAssistantReducer,
    casePredictor: casePredictorReducer,
    users: usersReducer,
  },
});
