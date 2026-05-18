import { createSlice, createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import {
  mockUsers,
  mockCases,
  mockDocuments,
  mockMessages,
  mockReminders,
  mockActivityLog,
} from "../mockData";

import axios from "axios";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, email, password, role, bio }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/auth/register", {
        fullName: name,
        email,
        password,
        role,
        bio,
      });

      return res.data;
    } catch (err) {
      console.log(err);
      return rejectWithValue(err.response.data.msg);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userId = getState().auth.user?._id || getState().auth.user?.id;
      const res = await axios.put(`/api/users/${userId}`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.msg || "Failed to update profile"
      );
    }
  }
);

export const updateUserAvatar = createAsyncThunk(
  "auth/updateAvatar",
  async (formData, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userId = getState().auth.user?._id || getState().auth.user?.id;
      const res = await axios.put(`/api/users/upload/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.msg || "Failed to update avatar"
      );
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.userObj;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateUserAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAvatar.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.avatar) {
          state.user = { ...state.user, avatar: action.payload.avatar };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(updateUserAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

// const initialState = {
//   currentUser: null,
//   isAuthenticated: false,
//   users: mockUsers,
// };

// export const loginUser = createAsyncThunk(
//   "auth/loginUser",
//   async ({ email, password }, { rejectWithValue }) => {
//     try {
//       const res = await axios.post("http://localhost:5000/api/auth/login", {
//         email,
//         password,
//       });

//       return res.data; // token + user
//     } catch (err) {
//       return rejectWithValue(err.response.data.message);
//     }
//   }
// );

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     login: (state, action) => {
//       const { email, password } = action.payload;
//       const user = state.users.find(
//         (u) => u.email === email && u.password === password
//       );
//       if (user) {
//         state.currentUser = user;
//         state.isAuthenticated = true;
//       }
//     },
//     logout: (state) => {
//       state.currentUser = null;
//       state.isAuthenticated = false;
//     },
//     register: (state, action) => {
//       const newUser = {
//         id: nanoid(),
//         ...action.payload,
//         avatar: action.payload.role === "lawyer" ? "👨‍⚖️" : "👨‍💼",
//       };
//       state.users.push(newUser);
//     },
//   },
// });

// export const { login, logout, register } = authSlice.actions;
// export default authSlice.reducer;
