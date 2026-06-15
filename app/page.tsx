"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";

type AgentKey = "lead" | "content" | "competitor" | "workflow";

type RazorpayCheckoutOptions = {
  key?: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image: string;
  handler: () => void;
  prefill: { email: string };
  notes: Record<string, string>;
  theme: { color: string };
  modal?: { ondismiss: () => void };
};

type CheckoutResponse = {
  orderId: string;
  amount: number;
  currency: string;
  internalOrderId: string;
  keyId: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

interface AgentDetails {
  id: AgentKey;
  name: string;
  role: string;
  icon: string;
  desc: string;
  placeholder: string;
  deliverable: string;
  proof: string;
  capabilities: string[];
  dataPoints: string[];
}

const AGENTS: AgentDetails[] = [
  {
    id: "lead",
    name: "Lead Agent",
    role: "B2B prospect research",
    icon: "🎯",
    desc: "Builds targeted prospect lists from a plain-language brief, then returns a cleaned CSV your sales team can use immediately.",
    placeholder:
      "Example: 20 boutique coffee shops in Bangalore with public websites and contact pages.",
    deliverable: "Up to 20 researched rows in CSV",
    proof:
      "QA reviewed for duplicates, location fit, and usable company details.",
    capabilities: [
      "Target-account research",
      "Public contact discovery",
      "CSV formatting",
      "Duplicate cleanup",
    ],
    dataPoints: ["Company", "Location", "Best contact", "Website", "Notes"],
  },
  {
    id: "content",
    name: "Content Agent",
    role: "SEO content production",
    icon: "✍️",
    desc: "Turns a keyword and offer into a publish-ready article plus social distribution assets for your marketing calendar.",
    placeholder:
      "Example: Write a landing-page style blog for an organic vitamin E skincare lotion.",
    deliverable: "1 long-form article + 2 social assets",
    proof:
      "Includes meta title, description, heading hierarchy, and campaign-ready captions.",
    capabilities: [
      "SEO outline",
      "Long-form copy",
      "Meta tags",
      "LinkedIn and X drafts",
    ],
    dataPoints: ["Markdown", "Meta copy", "CTA", "Social posts", "Keywords"],
  },
  {
    id: "competitor",
    name: "Competitor Agent",
    role: "Market gap analysis",
    icon: "🕵️",
    desc: "Compares your positioning against a named competitor and returns practical opportunities to win search demand.",
    placeholder:
      "Example: Compare my boutique fitness studio to two local Pilates competitors in Bangalore.",
    deliverable: "Keyword-gap report + action plan",
    proof:
      "Prioritized by intent, difficulty, local relevance, and fastest execution path.",
    capabilities: [
      "Keyword ideation",
      "Positioning review",
      "Priority scoring",
      "Next-step roadmap",
    ],
    dataPoints: ["Gaps", "Difficulty", "Intent", "Actions", "Messaging"],
  },
  {
    id: "workflow",
    name: "Workflow Agent",
    role: "Automation blueprinting",
    icon: "⚙️",
    desc: "Maps the exact no-code automation steps needed to connect tools like Gmail, Sheets, Slack, Notion, and CRMs.",
    placeholder:
      "Example: When an invoice PDF hits Gmail, save it to Drive, log it in Sheets, and alert Slack.",
    deliverable: "Node-by-node automation blueprint",
    proof:
      "Includes trigger logic, field mapping, error paths, and implementation notes.",
    capabilities: [
      "Trigger design",
      "Data mapping",
      "Error handling",
      "n8n/Zapier logic",
    ],
    dataPoints: ["Trigger", "Actions", "Fields", "Fallbacks", "JSON"],
  },
];

const FAQS = [
  [
    "How fast is delivery?",
    "Most executions are accepted instantly after payment, queued safely, and delivered when the worker finishes the run.",
  ],
  [
    "What happens if the output misses the brief?",
    "Email support@taskengine.software within 48 hours. We will re-run the task or refund it if we cannot fix it.",
  ],
  [
    "Do you need access to my accounts?",
    "No. TaskEngine only needs written instructions and your delivery email. Never share passwords or API keys.",
  ],
  [
    "Is this a subscription?",
    "No. Every execution is a flat ₹1,500 task with no recurring billing, and every paid order receives a trackable job ID.",
  ],
];

const METRICS = [
  ["Instant", "payment acceptance"],
  ["₹1,500", "flat per task"],
  ["Queued", "retry-safe jobs"],
  ["48 hr", "re-run window"],
];

const PIPELINE_STEPS = [
  ["Signed payment", "Razorpay webhook is verified before any work starts."],
  ["Idempotent job", "DynamoDB conditional writes stop duplicate retries."],
  [
    "Queued worker",
    "AWS async invocation/SQS-style handoff keeps checkout fast.",
  ],
  ["Inbox delivery", "SES sends the result after AI + QA succeeds."],
];

export default function Home() {
  const router = useRouter();
  const [activeAgent, setActiveAgent] = useState<AgentDetails>(AGENTS[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputs, setInputs] = useState<
    Record<AgentKey, { prompt: string; email: string }>
  >({
    lead: { prompt: "", email: "" },
    content: { prompt: "", email: "" },
    competitor: { prompt: "", email: "" },
    workflow: { prompt: "", email: "" },
  });

  const handleInputChange = (
    agent: AgentKey,
    field: "prompt" | "email",
    value: string,
  ) => {
    setInputs((prev) => ({
      ...prev,
      [agent]: { ...prev[agent], [field]: value },
    }));
  };

  const handleCheckout = async (agentKey: AgentKey, agentName: string) => {
    const { prompt, email } = inputs[agentKey];
    if (!prompt.trim() || !email.trim()) {
      alert("Please add your instructions and delivery email before checkout.");
      return;
    }

    if (!window.Razorpay) {
      alert("Checkout is still loading. Please try again in a few seconds.");
      return;
    }

    setIsProcessing(true);

    try {
      // Ensure your backend API route is located exactly at `app/api/checkout/route.ts`
      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: agentKey,
          userEmail: email,
          userInputs: prompt,
        }),
      });

      const checkout =
        (await checkoutResponse.json()) as Partial<CheckoutResponse> & {
          error?: string;
        };

      if (
        !checkoutResponse.ok ||
        !checkout.orderId ||
        !checkout.amount ||
        !checkout.currency ||
        !checkout.keyId
      ) {
        alert(
          checkout.error ??
            "Unable to initialize checkout. Please contact support@taskengine.software.",
        );
        setIsProcessing(false);
        return;
      }

      const options: RazorpayCheckoutOptions = {
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        order_id: checkout.orderId,
        name: "TaskEngine",
        description: `Hire ${agentName}`,
        image: "https://taskengine.software/logo.png",
        handler: () => {
          router.push(`/success?order=${checkout.internalOrderId ?? checkout.orderId}`);
        },
        modal: {
          ondismiss: () => {
            // Unlock the UI if the user closes the Razorpay window without paying
            setIsProcessing(false);
          }
        },
        prefill: { email },
        notes: {
          internal_order_id: checkout.internalOrderId ?? checkout.orderId,
          customer_email: email,
          prompt,
          agent_type: agentName,
        },
        theme: { color: "#111827" },
      };

      new window.Razorpay(options).open();
    } catch (error) {
      console.error("Checkout initialization failed:", error);
      alert(
        "Unable to initialize checkout. Please try again or contact support@taskengine.software.",
      );
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <main className="min-h-screen overflow-hidden bg-[#f7f8fb] text-slate-950 selection:bg-indigo-600 selection:text-white">
        <nav className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="TaskEngine home"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-950/15">
                TE
              </span>
              <span className="text-lg font-black tracking-tight">
                TaskEngine
              </span>
            </Link>
            <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
              <a href="#agents" className="hover:text-slate-950">
                Agents
              </a>
              <a href="#architecture" className="hover:text-slate-950">
                Architecture
              </a>
              <a href="#process" className="hover:text-slate-950">
                Process
              </a>
              <a href="#pricing" className="hover:text-slate-950">
                Pricing
              </a>
              <a href="#faq" className="hover:text-slate-950">
                FAQ
              </a>
            </div>
            <a
              href="#console"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-indigo-600"
            >
              Start a task
            </a>
          </div>
        </nav>

        <section className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div className="absolute left-1/2 top-8 -z-0 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl" />
          <div className="relative z-10 flex flex-col justify-center">
            <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-indigo-700 shadow-sm">
              production-ready AI task ops
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
              Sell AI agent tasks with a checkout flow customers can trust.
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-slate-600 sm:text-xl">
              TaskEngine now presents the production flow behind every order:
              Razorpay-signed payments, idempotent job creation, async AWS
              workers, QA validation, and inbox delivery.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#console"
                className="rounded-2xl bg-indigo-600 px-7 py-4 text-center text-sm font-black text-white shadow-xl shadow-indigo-600/20 transition hover:-translate-y-1 hover:bg-indigo-500"
              >
                Launch secure checkout
              </a>
              <a
                href="#architecture"
                className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-center text-sm font-black text-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-slate-300"
              >
                Review architecture
              </a>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {METRICS.map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm"
                >
                  <div className="text-2xl font-black tracking-tight">
                    {value}
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 rounded-[2rem] border border-white bg-slate-950 p-4 shadow-2xl shadow-slate-950/20">
            <div className="rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,#4338ca,transparent_30%),#0f172a] p-5 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-200">
                    Live operations board
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    Execution pipeline
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">
                  Online
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {PIPELINE_STEPS.map(([step, detail], index) => (
                  <div
                    key={step}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-sm font-black text-slate-950">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold">{step}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {detail}
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-indigo-300"
                          style={{ width: `${95 - index * 14}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-black/30 p-4 font-mono text-xs leading-6 text-slate-300">
                <p>
                  <span className="text-emerald-300">✓</span> webhook:
                  signature_verified
                </p>
                <p>
                  <span className="text-emerald-300">✓</span> job:
                  conditional_write_created
                </p>
                <p>
                  <span className="text-indigo-300">→</span> worker:
                  async_processing
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="architecture"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
        >
          <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-xl shadow-indigo-100/50 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-indigo-600">
                  Production architecture
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-tight">
                  Payment first. Work queued. Results delivered.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  The checkout no longer pretends a long AI job is finished
                  immediately. It creates a Razorpay order, lets AWS verify the
                  webhook, then hands the work to a background worker so retries
                  are safe.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "1",
                    "Create order",
                    "Frontend calls /api/checkout and receives a Razorpay order ID.",
                  ],
                  [
                    "2",
                    "Verify webhook",
                    "AWS receiver validates the raw Razorpay signature before invoking work.",
                  ],
                  [
                    "3",
                    "Run worker",
                    "The worker checks idempotency, runs AI + QA, and avoids duplicate emails.",
                  ],
                  [
                    "4",
                    "Deliver result",
                    "SES sends the polished attachment after the job succeeds.",
                  ],
                ].map(([num, title, body]) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                      {num}
                    </span>
                    <h3 className="mt-5 text-lg font-black">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="agents" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-indigo-600">
                Agent catalog
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">
                Choose the specialist for the job.
              </h2>
            </div>
            <p className="max-w-xl text-slate-600">
              Each agent is packaged around a concrete business deliverable, not
              a vague chatbot session.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent)}
                className={`rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-1 ${activeAgent.id === agent.id ? "border-indigo-300 bg-white shadow-indigo-100" : "border-white bg-white/70 hover:bg-white"}`}
              >
                <span className="text-3xl" aria-hidden>
                  {agent.icon}
                </span>
                <h3 className="mt-4 text-xl font-black">{agent.name}</h3>
                <p className="mt-1 text-sm font-bold text-indigo-600">
                  {agent.role}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {agent.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section id="console" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-slate-950 p-8 text-white lg:p-10">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{activeAgent.icon}</span>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-300">
                    Selected agent
                  </p>
                  <h2 className="text-3xl font-black">{activeAgent.name}</h2>
                </div>
              </div>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                {activeAgent.desc}
              </p>
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-black uppercase tracking-wide text-slate-400">
                  Deliverable
                </p>
                <p className="mt-2 text-xl font-black">
                  {activeAgent.deliverable}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {activeAgent.proof}
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-2">
                {activeAgent.dataPoints.map((point) => (
                  <span
                    key={point}
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-slate-200"
                  >
                    ✓ {point}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="grid gap-3 sm:grid-cols-2">
                {activeAgent.capabilities.map((capability) => (
                  <div
                    key={capability}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-700"
                  >
                    {capability}
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    Task instructions
                  </span>
                  <textarea
                    rows={6}
                    value={inputs[activeAgent.id].prompt}
                    onChange={(e) =>
                      handleInputChange(
                        activeAgent.id,
                        "prompt",
                        e.target.value,
                      )
                    }
                    placeholder={activeAgent.placeholder}
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    disabled={isProcessing}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    Delivery email
                  </span>
                  <input
                    type="email"
                    value={inputs[activeAgent.id].email}
                    onChange={(e) =>
                      handleInputChange(activeAgent.id, "email", e.target.value)
                    }
                    placeholder="operator@company.com"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    disabled={isProcessing}
                  />
                </label>
                <button
                  onClick={() =>
                    handleCheckout(activeAgent.id, activeAgent.name)
                  }
                  disabled={isProcessing}
                  className="w-full rounded-2xl bg-slate-950 px-6 py-4 text-base font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-1 hover:bg-indigo-600 disabled:bg-slate-400 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Initializing Secure Checkout..." : "Initialize execution · ₹1,500"}
                </button>
                <p className="text-center text-xs font-semibold text-slate-500">
                  Secure Razorpay order created server-side. AWS verifies
                  payment before the worker runs.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-indigo-600">
                Built for speed
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">
                A retry-safe operating model your customers can trust.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                [
                  "1",
                  "Write the brief",
                  "Describe the target, constraints, tone, tools, and exclusions in plain English.",
                ],
                [
                  "2",
                  "Pay once",
                  "Checkout creates a real Razorpay order instead of trusting browser-only payment data.",
                ],
                [
                  "3",
                  "Receive the file",
                  "The AWS worker runs in the background and sends a structured CSV, Markdown, report, or blueprint.",
                ],
              ].map(([num, title, body]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-7"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 font-black text-white">
                    {num}
                  </span>
                  <h3 className="mt-6 text-xl font-black">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="bg-slate-950 px-4 py-20 text-white sm:px-6"
        >
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-indigo-300">
                Anti-retainer pricing
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">
                Pay for outcomes, not unused dashboards.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                TaskEngine is designed for founders, agencies, and operators who
                need work completed occasionally and quickly.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
              <div className="text-6xl font-black">₹1,500</div>
              <p className="mt-2 font-bold text-indigo-200">per execution</p>
              <ul className="mt-8 space-y-4 text-slate-200">
                {[
                  "No monthly plan",
                  "No unused credits",
                  "Free re-run if the output misses the accepted brief",
                  "Human-readable deliverables for immediate handoff",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-emerald-300">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-4xl font-black tracking-tight">
            Questions before you dispatch an agent?
          </h2>
          <div className="mt-10 space-y-3">
            {FAQS.map(([q, a], index) => (
              <div
                key={q}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-black"
                >
                  <span>{q}</span>
                  <span className="text-xl text-indigo-600">
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>
                {openFaq === index && (
                  <p className="px-5 pb-5 leading-7 text-slate-600">{a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-sm font-semibold text-slate-500 md:flex-row">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-xs font-black text-white">
                TE
              </span>
              <span>© 2026 TaskEngine. On-demand AI operations.</span>
            </div>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-slate-950">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-slate-950">
                Privacy
              </Link>
              <a
                href="mailto:support@taskengine.software"
                className="hover:text-slate-950"
              >
                support@taskengine.software
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
