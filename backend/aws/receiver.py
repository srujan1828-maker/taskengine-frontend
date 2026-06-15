"""Razorpay webhook receiver Lambda.

Paste this into your public Razorpay webhook Lambda. It verifies the raw
Razorpay signature, then invokes the worker Lambda asynchronously and returns
200 quickly so Razorpay does not retry while the AI job runs.
"""

import hashlib
import hmac
import json
import os

import boto3

RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")
WORKER_FUNCTION_NAME = os.environ.get(
    "WORKER_FUNCTION_NAME",
    "ai-agent-marketplace-dev-workerAgent",
)
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

lambda_client = boto3.client("lambda", region_name=AWS_REGION)


def json_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def normalize_headers(event):
    return {str(k).lower(): str(v) for k, v in (event.get("headers") or {}).items()}


def verify_razorpay_signature(raw_body, signature):
    if not RAZORPAY_WEBHOOK_SECRET or not signature:
        return False

    expected_signature = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        raw_body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected_signature, signature)


def lambda_handler(event, context):
    print("🛎️ Razorpay webhook received by receiver Lambda.")

    raw_body = event.get("body") or "{}"
    headers = normalize_headers(event)
    signature = headers.get("x-razorpay-signature", "")

    if not verify_razorpay_signature(raw_body, signature):
        print("❌ Invalid Razorpay signature. Worker was not invoked.")
        return json_response(401, {"error": "Invalid signature"})

    try:
        body = json.loads(raw_body)
    except json.JSONDecodeError:
        print("❌ Invalid JSON payload.")
        return json_response(400, {"error": "Invalid JSON"})

    event_name = body.get("event")
    payment = body.get("payload", {}).get("payment", {}).get("entity", {})
    payment_status = payment.get("status")

    if event_name and event_name != "payment.captured":
        print(f"⚠️ Ignoring Razorpay event: {event_name}")
        return json_response(200, {"message": "Ignored event"})

    if payment_status != "captured":
        print(f"⚠️ Ignoring payment status: {payment_status}")
        return json_response(200, {"message": "Ignored payment status"})

    lambda_client.invoke(
        FunctionName=WORKER_FUNCTION_NAME,
        InvocationType="Event",
        Payload=json.dumps(event).encode("utf-8"),
    )

    print("✅ Signature verified. Worker invoked asynchronously.")
    return json_response(200, {"message": "Order accepted for processing"})
