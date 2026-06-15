import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const TASK_PRICE_IN_PAISE = 150000;

export async function POST(request: Request) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Checkout is not configured. Please contact support@taskengine.software." },
      { status: 503 },
    );
  }

  try {
    const { taskType, userEmail, userInputs } = await request.json();
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: TASK_PRICE_IN_PAISE,
      currency: "INR",
      receipt: `taskengine_${Date.now()}`,
      notes: {
        taskType: String(taskType ?? "unknown"),
        userEmail: String(userEmail ?? ""),
        userInputs: String(userInputs ?? ""),
      },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount });
  } catch (error) {
    console.error("Payment routing error:", error);
    return NextResponse.json({ error: "Failed to initialize checkout" }, { status: 500 });
  }
}
