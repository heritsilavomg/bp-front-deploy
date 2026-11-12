import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id?: string;
  username?: string;
  email?: string;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Omit<UserState, "isAuthenticated">>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.id = undefined;
      state.username = undefined;
      state.email = undefined;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;