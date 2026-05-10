import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PaymentState =
  | "IDLE"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "TIMEOUT";

interface PaymentSliceState {
  transactionId: string;
  status: PaymentState;
  attempts: number;
  error: string | null;
}

const initialState: PaymentSliceState = {
  transactionId: crypto.randomUUID(),
  status: "IDLE",
  attempts: 0,
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    startPayment(state) {
      state.status = "PROCESSING";
      state.attempts += 1;
      state.error = null;
    },

    paymentSuccess(state) {
      state.status = "SUCCESS";
    },

    paymentFailed(state, action: PayloadAction<string>) {
      state.status = "FAILED";
      state.error = action.payload;
    },

    paymentTimeout(state) {
      state.status = "TIMEOUT";
      state.error = "Request timeout";
    },

    resetPayment(state) {
      state.status = "IDLE";
      state.error = null;
    },
  },
});

export const {
  startPayment,
  paymentSuccess,
  paymentFailed,
  paymentTimeout,
  resetPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;