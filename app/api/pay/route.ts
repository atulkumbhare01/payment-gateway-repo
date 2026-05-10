import { NextResponse } from "next/server";

export async function POST() {
  const random = Math.random();

  await new Promise((res) =>
    setTimeout(res, 2000)
  );

  // 60%
  if (random < 0.6) {
    return NextResponse.json({
      status: "success",
    });
  }

  // 25%
  if (random < 0.85) {
    return NextResponse.json({
      status: "failed",
      reason: "Insufficient funds",
    });
  }

  // 15% timeout
  await new Promise((res) =>
    setTimeout(res, 8000)
  );

  return NextResponse.json({
    status: "timeout",
  });
}