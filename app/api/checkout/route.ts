import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const TASK_PRICE_IN_PAISE = 150000;
const VALID_TASK_TYPES = new Set(["lead", "content", "competitor", "workflow"]);
const MAX_PROMPT_LENGTH = 4000;

function createInternalOrderId() {
  return `te_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(request: Request) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      {
        error:
          "Checkout is not configured. Please contact support@taskengine.software.",
      },
      { status: 503 },
    );
  }

  try {
    const { taskType, userEmail, userInputs } = await request.json();
    const normalizedTaskType = String(taskType ?? "").toLowerCase();
    const email = String(userEmail ?? "").trim();
    const prompt = String(userInputs ?? "").trim();

    if (!VALID_TASK_TYPES.has(normalizedTaskType)) {
      return NextResponse.json(
        { error: "Please choose a valid agent." },
        { status: 400 },
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid delivery email." },
        { status: 400 },
      );
    }

    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        {
          error: `Please enter task instructions under ${MAX_PROMPT_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    const internalOrderId = createInternalOrderId();
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: TASK_PRICE_IN_PAISE,
      currency: "INR",
      receipt: internalOrderId,
      notes: {
        internal_order_id: internalOrderId,
        agent_type: normalizedTaskType,
        customer_email: email,
        prompt,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      internalOrderId,
      keyId,
    });
  } catch (error) {
    console.error("Payment routing error:", error);
    return NextResponse.json(
      { error: "Failed to initialize checkout" },
      { status: 500 },
    );
  }
}
