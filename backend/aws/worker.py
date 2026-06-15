"""AI worker Lambda for TaskEngine paid agent jobs.

Paste this into your private worker Lambda. The receiver Lambda invokes this in
background after webhook signature verification. The worker still performs core
payment checks, uses a DynamoDB conditional write for idempotency, runs AI + QA,
sends SES email, and marks the job delivered only after email succeeds.
"""

import csv
import hashlib
import hmac
import html
import io
import json
import os
import random
import time
import urllib.error
import urllib.request
import uuid
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import boto3
from botocore.exceptions import ClientError

NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY", "")
NVIDIA_MODEL = os.environ.get("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")
SES_SENDER_EMAIL = os.environ.get("SES_SENDER_EMAIL", "support@taskengine.software")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
JOBS_TABLE_NAME = os.environ.get("JOBS_TABLE_NAME", "te_processed_payments")
EXPECTED_AMOUNT = int(os.environ.get("TASK_PRICE_IN_PAISE", "150000"))
EXPECTED_CURRENCY = os.environ.get("TASK_CURRENCY", "INR")

ses_client = boto3.client("ses", region_name=AWS_REGION)
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
jobs_table = dynamodb.Table(JOBS_TABLE_NAME)

AGENTS = {
    "lead": {
        "name": "Lead Agent",
        "worker_prompt": (
            "You are a B2B lead research assistant. Analyze the user's target requirements and "
            "produce a curated list of up to 20 relevant companies. Return a clean markdown table with "
            "columns: | Company Name | Area | Contact Role | Contact Email | Website | Confidence |. "
            "Do not invent direct emails. If a public email is not known, leave Contact Email blank and "
            "use the Website field. Prefer accuracy over filling every cell."
        ),
        "critic_prompt": (
            "You are a data QC auditor. Clean the raw lead profiles into a markdown table with columns: "
            "| Company Name | Area | Contact Role | Contact Email | Website | Confidence |. Remove duplicates, "
            "remove placeholder rows, and output only the table."
        ),
    },
    "content": {
        "name": "Content Agent",
        "worker_prompt": (
            "You are a professional conversion copywriter and SEO marketer. Write one long-form blog section "
            "and two distinct social captions based on the provided product details. Do not use placeholder brackets. "
            "If details are missing, make reasonable assumptions and include a final ## Assumptions section."
        ),
        "critic_prompt": (
            "You are a chief content editor. Remove filler, improve clarity, and ensure markdown sections for "
            "## Blog Section, ## Social Captions, and ## Assumptions. Output only the finalized copy."
        ),
    },
    "competitor": {
        "name": "Competitor Agent",
        "worker_prompt": (
            "You are an SEO strategist. Based on the business description and competitor provided, suggest likely "
            "keyword gaps and content opportunities. State that this is a strategic estimate, not a live crawl."
        ),
        "critic_prompt": (
            "You are a technical SEO analyst. Organize the output into ## Strategic Keyword Gaps and "
            "## Content Action Steps. Keep the strategic-estimate framing. Output only markdown."
        ),
    },
    "workflow": {
        "name": "Workflow Agent",
        "worker_prompt": (
            "You are an automation architect specializing in Zapier and n8n. Map exact step-by-step conditional "
            "logic, node/module names, and variable mapping for the user's workflow. Avoid vague advice."
        ),
        "critic_prompt": (
            "You are a software logic auditor. Format the raw automation steps into a polished markdown technical "
            "blueprint. Use bold labels for Triggers, Actions, Variables, and Error Paths. Output only the blueprint."
        ),
    },
}


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


def normalize_agent_type(value):
    text = str(value or "").lower()
    if "lead" in text:
        return "lead"
    if "content" in text:
        return "content"
    if "competitor" in text:
        return "competitor"
    if "workflow" in text:
        return "workflow"
    return "lead"


def claim_job_once(payment_id, job_item):
    try:
        jobs_table.put_item(
            Item=job_item,
            ConditionExpression="attribute_not_exists(payment_id)",
        )
        return True
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") == "ConditionalCheckFailedException":
            return False
        raise


def mark_job_status(payment_id, status, extra=None):
    extra = extra or {}
    names = {"#status": "status", "#updated_at": "updated_at"}
    values = {":status": status, ":updated_at": int(time.time())}
    parts = ["#status = :status", "#updated_at = :updated_at"]

    for index, (key, value) in enumerate(extra.items()):
        name_key = f"#field_{index}"
        value_key = f":value_{index}"
        names[name_key] = key
        values[value_key] = value
        parts.append(f"{name_key} = {value_key}")

    jobs_table.update_item(
        Key={"payment_id": payment_id},
        UpdateExpression="SET " + ", ".join(parts),
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=values,
    )


def call_ai_with_retry(system_instruction, user_prompt, max_retries=3, base_delay=2):
    if not NVIDIA_API_KEY:
        raise RuntimeError("NVIDIA_API_KEY is not configured")

    payload = {
        "model": NVIDIA_MODEL,
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.4,
        "max_tokens": 2000,
    }

    data = json.dumps(payload).encode("utf-8")

    for attempt in range(max_retries):
        request = urllib.request.Request(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {NVIDIA_API_KEY}",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=35) as response:
                response_data = json.loads(response.read().decode("utf-8"))
                return response_data["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as error:
            error_body = error.read().decode("utf-8", errors="replace")
            retryable = error.code in {408, 409, 429, 500, 502, 503, 504}
            print(f"⚠️ AI HTTP error {error.code} attempt {attempt + 1}: {error_body[:500]}")
            if not retryable or attempt == max_retries - 1:
                raise RuntimeError(f"AI API failed with status {error.code}")
        except Exception as error:
            print(f"⚠️ AI connection error attempt {attempt + 1}: {error}")
            if attempt == max_retries - 1:
                raise

        sleep_for = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
        time.sleep(sleep_for)

    raise RuntimeError("AI API failed after retries")


def markdown_table_to_csv(markdown):
    csv_buffer = io.StringIO()
    writer = csv.writer(csv_buffer)
    rows = []

    for line in markdown.strip().splitlines():
        if "|" not in line:
            continue
        row = [cell.strip() for cell in line.split("|") if cell.strip() and not cell.strip().startswith("---")]
        if row:
            rows.append(row)
            writer.writerow(row)

    records_found = max(0, len(rows) - 1) if rows else 0
    return csv_buffer.getvalue(), records_found, rows


def send_delivery_email(recipient_email, llm_content, agent_name, prompt, job_id):
    csv_text, records_found, rows = markdown_table_to_csv(llm_content)
    safe_agent_name = html.escape(agent_name)
    safe_prompt = html.escape(prompt)
    safe_job_id = html.escape(job_id)

    preview_html = ""
    if records_found > 0:
        preview_items = []
        for row in rows[1:4]:
            first = html.escape(row[0] if row else "Unknown")
            last = html.escape(row[-1] if len(row) > 1 else "")
            preview_items.append(f"<li><strong>{first}</strong> <span style='color:#64748b'>({last})</span></li>")
        preview_html = f"<ul>{''.join(preview_items)}</ul>"

    body_text = f"""
TaskEngine job complete.

Job ID: {job_id}
Agent: {agent_name}
Records: {records_found}
Prompt: {prompt}

Your result is attached.
""".strip()

    body_html = f"""
<html>
  <body style="font-family:Arial,sans-serif;background:#f8fafc;color:#1e293b;padding:20px">
    <div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#0f172a;color:#fff;padding:24px;border-bottom:4px solid #3b82f6">
        <h2 style="margin:0">TaskEngine Console</h2>
      </div>
      <div style="padding:28px">
        <p>Hello,</p>
        <p>Your automated agent finished successfully.</p>
        <div style="background:#f8fafc;border-left:4px solid #3b82f6;padding:16px;margin:20px 0">
          <p><strong>Job ID:</strong> {safe_job_id}</p>
          <p><strong>Agent:</strong> {safe_agent_name}</p>
          <p><strong>Status:</strong> Completed Successfully</p>
          <p><strong>Records:</strong> {records_found}</p>
          <p><strong>Target:</strong> {safe_prompt}</p>
        </div>
        <h3>Data Preview</h3>
        {preview_html or '<p>No table preview available. Full result is attached.</p>'}
        <p>Your full payload is attached to this email.</p>
      </div>
      <div style="background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#64748b">
        Need help? Contact support@taskengine.software
      </div>
    </div>
  </body>
</html>
""".strip()

    message = MIMEMultipart("mixed")
    message["Subject"] = f"Task Complete: {agent_name} Delivery [ID: {job_id}]"
    message["From"] = f"TaskEngine Notifications <{SES_SENDER_EMAIL}>"
    message["To"] = recipient_email

    alternative = MIMEMultipart("alternative")
    alternative.attach(MIMEText(body_text, "plain", "utf-8"))
    alternative.attach(MIMEText(body_html, "html", "utf-8"))
    message.attach(alternative)

    if csv_text.strip():
        file_data = csv_text.encode("utf-8")
        filename = f"taskengine_{job_id}.csv"
    else:
        file_data = llm_content.encode("utf-8")
        filename = f"taskengine_{job_id}.md"

    attachment = MIMEApplication(file_data)
    attachment.add_header("Content-Disposition", "attachment", filename=filename)
    message.attach(attachment)

    return ses_client.send_raw_email(
        Source=SES_SENDER_EMAIL,
        Destinations=[recipient_email],
        RawMessage={"Data": message.as_string()},
    )


def lambda_handler(event, context):
    print("👨‍🍳 Worker received verified Razorpay event.")

    raw_body = event.get("body") or "{}"
    headers = normalize_headers(event)
    signature = headers.get("x-razorpay-signature", "")

    if not verify_razorpay_signature(raw_body, signature):
        print("❌ Worker rejected event because signature verification failed.")
        return json_response(401, {"error": "Invalid signature"})

    body = json.loads(raw_body)
    payment = body.get("payload", {}).get("payment", {}).get("entity", {})
    notes = payment.get("notes") or {}

    payment_id = payment.get("id")
    payment_status = payment.get("status")
    amount = int(payment.get("amount") or 0)
    currency = payment.get("currency")

    if not payment_id:
        return json_response(400, {"error": "Missing payment ID"})

    if payment_status != "captured":
        return json_response(200, {"message": "Ignored payment status"})

    if amount != EXPECTED_AMOUNT or currency != EXPECTED_CURRENCY:
        print(f"❌ Payment validation failed for {payment_id}: {amount} {currency}")
        return json_response(400, {"error": "Payment amount or currency mismatch"})

    prompt = str(notes.get("prompt") or "").strip()
    customer_email = str(notes.get("customer_email") or notes.get("userEmail") or "").strip()
    agent_type = normalize_agent_type(notes.get("agent_type") or notes.get("taskType"))
    agent = AGENTS[agent_type]
    job_id = str(notes.get("internal_order_id") or f"job_{uuid.uuid4().hex[:12]}")

    if not prompt or not customer_email:
        return json_response(400, {"error": "Missing prompt or customer email"})

    now = int(time.time())
    created = claim_job_once(
        payment_id,
        {
            "payment_id": payment_id,
            "job_id": job_id,
            "status": "processing",
            "agent_type": agent_type,
            "customer_email": customer_email,
            "created_at": now,
            "updated_at": now,
            "ttl": now + 30 * 24 * 60 * 60,
        },
    )

    if not created:
        print(f"⚠️ Payment {payment_id} already processed or processing. Skipping duplicate.")
        return json_response(200, {"message": "Already processed"})

    try:
        raw_output = call_ai_with_retry(agent["worker_prompt"], prompt)
        final_output = call_ai_with_retry(agent["critic_prompt"], raw_output)
        send_delivery_email(customer_email, final_output, agent["name"], prompt, job_id)
        mark_job_status(payment_id, "delivered", {"delivered_at": int(time.time())})
        print(f"✅ Job {job_id} delivered to {customer_email}")
        return json_response(200, {"message": "Agent task complete", "job_id": job_id})
    except Exception as error:
        print(f"❌ Job {job_id} failed: {error}")
        mark_job_status(payment_id, "failed", {"error_message": str(error)[:1000]})
        raise
