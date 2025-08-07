import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  filter: string;
}

const initialState: UiState = { filter: "" };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<string>) {
      state.filter = action.payload;
    },
  },
});

export const { setFilter } = uiSlice.actions;
export default uiSlice.reducer;