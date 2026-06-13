import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { taskType, userEmail, userInputs } = await request.json();
    
    // Flat rate for all agents: ₹1,500 (150000 paise)
    const amount = 150000; 

    const options = {
      amount: amount, 
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        taskType: taskType,
        userEmail: userEmail,
        userInputs: userInputs 
      }
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ orderId: order.id, amount: order.amount });
    
  } catch (error) {
    console.error("Payment routing error:", error);
    return NextResponse.json({ error: "Failed to initialize checkout" }, { status: 500 });
  }
}