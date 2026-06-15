import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const TASK_PRICE_IN_PAISE = 150000;
const VALID_TASK_TYPES = new Set(["lead", "content", "competitor", "workflow"]);
const MAX_PROMPT_LENGTH = 4000;

function createInternalOrderId() {
  return `te_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

// Initialize AWS DynamoDB Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const dynamodb = DynamoDBDocumentClient.from(client);

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
    const normalizedTaskType = String(taskType ?? "").toLowerCase();
    const email = String(userEmail ?? "").trim();
    const prompt = String(userInputs ?? "").trim();

    // --- Validation Block ---
    if (!VALID_TASK_TYPES.has(normalizedTaskType)) {
      return NextResponse.json({ error: "Please choose a valid agent." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid delivery email." }, { status: 400 });
    }
    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Please enter task instructions under ${MAX_PROMPT_LENGTH} characters.` },
        { status: 400 },
      );
    }

    const internalOrderId = createInternalOrderId();
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // --- 1. Create Razorpay Order ---
    const order = await razorpay.orders.create({
      amount: TASK_PRICE_IN_PAISE,
      currency: "INR",
      receipt: internalOrderId,
      notes: {
        internal_order_id: internalOrderId,
        agent_type: normalizedTaskType,
        customer_email: email,
        prompt: prompt,
      },
    });

    // --- 2. Record "Pending" Intent in DynamoDB ---
    const timestamp = Math.floor(Date.now() / 1000);
    
    await dynamodb.send(new PutCommand({
      TableName: "te_processed_payments",
      Item: {
        payment_id: order.id, // Primary Key: Matches Razorpay's generated order ID
        internal_id: internalOrderId,
        status: "pending",
        customer_email: email,
        agent_type: normalizedTaskType,
        prompt_snippet: prompt.substring(0, 100), // Save a safe snippet
        created_at: timestamp,
        ttl: timestamp + (7 * 24 * 60 * 60) // Auto-delete after 7 days
      }
    }));

    // --- 3. Return to Client ---
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
