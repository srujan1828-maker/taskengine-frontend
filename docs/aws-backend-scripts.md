# Paste-ready AWS Lambda backend scripts

This repo includes two Python files you can paste into AWS Lambda:

- `backend/aws/receiver.py` — public Razorpay webhook receiver. It verifies `X-Razorpay-Signature`, checks captured payment events, invokes the worker asynchronously, and returns `200` quickly.
- `backend/aws/worker.py` — private worker. It re-checks the signature, validates payment amount/currency, uses DynamoDB conditional writes for idempotency, runs the AI worker + critic, sends SES email, and marks the job delivered only after email succeeds.

## Required environment variables

### Receiver Lambda

```text
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
WORKER_FUNCTION_NAME=ai-agent-marketplace-dev-workerAgent
AWS_REGION=us-east-1
```

### Worker Lambda

```text
NVIDIA_API_KEY=your_nvidia_api_key
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
SES_SENDER_EMAIL=support@taskengine.software
JOBS_TABLE_NAME=te_processed_payments
TASK_PRICE_IN_PAISE=150000
TASK_CURRENCY=INR
AWS_REGION=us-east-1
```

## DynamoDB table

Use a DynamoDB table named `te_processed_payments` or set `JOBS_TABLE_NAME` to your table name.

Partition key:

```text
payment_id string
```

Recommended TTL attribute:

```text
ttl
```

## IAM permissions

Receiver Lambda needs:

```text
lambda:InvokeFunction on your worker Lambda
```

Worker Lambda needs:

```text
dynamodb:PutItem
dynamodb:UpdateItem
ses:SendRawEmail
```

## Important production note

This is a safer version of your current direct receiver → worker setup. The next upgrade should be replacing async Lambda invoke with SQS + DLQ so failed jobs can retry and land in a dead-letter queue for manual support.
