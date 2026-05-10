"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  paymentFailed,
  paymentSuccess,
  paymentTimeout,
  resetPayment,
  startPayment,
} from "../redux/paymentSlice";
import { RootState } from "../redux/store";
import CardPreview from "./CardPreview";
import PaymentStatus from "./PaymentStatus";

const getCardType = (num: string) => {
  const cleaned = num.replace(/\s/g, "");

  if (/^4/.test(cleaned)) return "Visa";
  if (/^5[1-5]/.test(cleaned)) return "Mastercard";
  if (/^3[47]/.test(cleaned)) return "Amex";

  return "";
};

export default function PaymentForm() {
  const dispatch = useDispatch();
  const payment = useSelector((state: RootState) => state.payment);

  const [form, setForm] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    amount: "",
    currency: "INR",
  });

  const [errors, setErrors] = useState<any>({});

  const cardType = getCardType(form.cardNumber);

  const validate = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name required";
        break;

      case "cardNumber":
        if (value.replace(/\s/g, "").length < 16)
          error = "Invalid card number";
        break;

      case "expiry":
        const [mm, yy] = value.split("/");
        const exp = new Date(Number(`20${yy}`), Number(mm) - 1);
        if (!mm || !yy || exp < new Date()) {
          error = "Card expired";
        }
        break;

      case "cvv":
        if (cardType === "Amex") {
          if (!/^\d{4}$/.test(value)) error = "4 digit CVV required";
        } else {
          if (!/^\d{3}$/.test(value)) error = "3 digit CVV required";
        }
        break;

      case "amount":
        if (Number(value) <= 0) error = "Amount required";
        break;
    }

    setErrors((prev: any) => ({
      ...prev,
      [name]: error,
    }));

    return !error;
  };

  const handleChange = (e: any) => {
    let { name, value } = e.target;

    if (name === "cardNumber") {
      value = value
        .replace(/\D/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
    }

    if (name === "expiry") {
      value = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2");
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    validate(name, value);
  };

  const isValid =
    Object.values(errors).every((e) => !e) &&
    form.name &&
    form.cardNumber &&
    form.expiry &&
    form.cvv &&
    form.amount;

  const handlePayment = async () => {
    dispatch(startPayment());

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 6000);

    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: payment.transactionId,
        }),
      });

      clearTimeout(timeout);

      const data = await res.json();

      if (data.status === "success") {
        dispatch(paymentSuccess());
      } else {
        dispatch(paymentFailed(data.reason));
      }
    } catch (err) {
      dispatch(paymentTimeout());
    }
  };

  if (payment.status !== "IDLE") {
    return (
      <PaymentStatus
        status={payment.status}
        error={payment.error}
        attempts={payment.attempts}
        retry={
          payment.attempts < 3 &&
          payment.status !== "SUCCESS"
        }
        onRetry={() => {
          dispatch(resetPayment());
        }}
      />
    );
  }

  return (
    <div className="wrapper">
      <CardPreview
        number={form.cardNumber}
        name={form.name}
        expiry={form.expiry}
        cardType={cardType}
      />

      <div className="form">
        <input
          type="text"
          name="name"
          placeholder="Cardholder Name"
          onChange={handleChange}
        />
        <p>{errors.name}</p>

        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          maxLength={19}
          onChange={handleChange}
        />
        <p>{errors.cardNumber}</p>

        <input
          type="text"
          name="expiry"
          placeholder="MM/YY"
          maxLength={5}
          onChange={handleChange}
        />
        <p>{errors.expiry}</p>

        <input
          type="password"
          name="cvv"
          placeholder="CVV"
          maxLength={cardType === "Amex" ? 4 : 3}
          onChange={handleChange}
        />
        <p>{errors.cvv}</p>

        <div className="amount-row">
          <select
            name="currency"
            onChange={handleChange}
          >
            <option>INR</option>
            <option>USD</option>
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            onChange={handleChange}
          />
        </div>

        <p>{errors.amount}</p>

        <button
          disabled={!isValid}
          onClick={handlePayment}
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}