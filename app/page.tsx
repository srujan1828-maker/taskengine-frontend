"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';

// ⚠️ NOTE: This file is a Client Component ("use client"), so it CANNOT export
// Next.js `metadata`. Add the page <title>, description, and JSON-LD structured
// data via `app/layout.tsx` instead — see layout-metadata-snippet.tsx provided
// alongside this file.

type AgentKey = 'lead' | 'content' | 'competitor' | 'workflow';

interface AgentDetails {
  id: AgentKey;
  name: string;
  role: string;
  icon: string;
  desc: string;
  placeholder: string;
  capabilities: string[];
  estimatedYield?: string;
  dataPoints?: string[];
  deliverability?: string;
  promptGuide?: string;
  previewLabel: string;
  previewTitle: string;
  previewFormat: string;
}

const AGENTS: AgentDetails[] = [
  {
    id: 'lead',
    name: 'The Lead Agent',
    role: 'B2B Lead Generation',
    icon: '🎯',
    desc: 'AI-researched B2B prospect lists, formatted and ready to drop into your outreach sequence.',
    placeholder: 'e.g., Boutique coffee shops in Bangalore with public contact details...',
    capabilities: ['Researches businesses matching your target description', 'Builds standardized corporate inbox addresses where direct emails aren\'t public', 'Cleans and structures results into a ready-to-use CSV'],
    estimatedYield: "Typical yield: 100-150 prospects per run",
    deliverability: "Free re-run if your list doesn't meet the brief",
    dataPoints: ["Company Name", "Target Job Title (if specified)", "Best-Match Contact Email", "Area / Location", "Company Website"],
    promptGuide: "Pro Tip: Specify exact titles (e.g., 'Founders'), company size, location, and exclusions for best results.",
    previewLabel: "View Sample CSV Output",
    previewTitle: "te_leads_export.csv",
    previewFormat: "CSV Data Grid"
  },
  {
    id: 'content',
    name: 'The Content Agent',
    role: 'Conversion Copywriter',
    icon: '✍️',
    desc: 'Search-optimized long-form blogs paired with platform-specific social captions.',
    placeholder: 'e.g., Write a promo for an organic vitamin-E skincare lotion.',
    capabilities: ['Writes a long-form, SEO-structured blog post', 'Generates ready-to-post social captions', 'Delivers in clean, production-ready Markdown'],
    estimatedYield: "1 Long-Form Blog (1,000+ words) & 2 Social Assets",
    deliverability: "Free revision if the tone or angle misses your brief",
    dataPoints: ["SEO-Structured Markdown File", "Suggested Meta Title & Description", "LinkedIn Post Draft", "Twitter/X Thread"],
    promptGuide: "Pro Tip: Provide your primary keyword, brand voice (e.g., 'professional but witty'), and target audience.",
    previewLabel: "View Sample Blog Draft",
    previewTitle: "skincare_seo_blog_final.md",
    previewFormat: "Markdown Syntax"
  },
  {
    id: 'competitor',
    name: 'The Competitor Agent',
    role: 'SEO Strategist',
    icon: '🕵️',
    desc: 'A keyword-gap strategy report comparing your business against a market rival.',
    placeholder: 'e.g., Compare my boutique fitness studio in Bangalore to local competitors...',
    capabilities: ['Identifies likely keyword gaps based on your business type and competitor', 'Suggests high-intent search terms you may be missing', 'Outputs a prioritized action plan'],
    estimatedYield: "Strategy Report & Prioritized Keyword Targets",
    deliverability: "Free re-run if the report doesn't match your business",
    dataPoints: ["Suggested Keyword Targets", "Relative Difficulty Notes", "Competitor Positioning Summary", "Actionable Next Steps"],
    promptGuide: "Pro Tip: Include your business type, location, and your top 1-2 competitors by name.",
    previewLabel: "View Sample SEO Report",
    previewTitle: "competitor_gap_analysis.csv",
    previewFormat: "SEO Audit Dashboard"
  },
  {
    id: 'workflow',
    name: 'The Workflow Agent',
    role: 'No-Code Architect',
    icon: '⚙️',
    desc: 'Text-based logic workflows mapping out how to connect disparate office systems.',
    placeholder: 'e.g., When an invoice hits Gmail, save to Drive and alert Slack.',
    capabilities: ['Maps out exact node-by-node automation logic', 'Specifies data fields to map between apps', 'Outputs a ready-to-build n8n/Zapier blueprint'],
    estimatedYield: "Step-by-step logic map & payload JSON",
    deliverability: "Free revision if a step doesn't match your tools",
    dataPoints: ["Trigger Configuration", "Action Steps & Order", "Data Mapping Notes", "Error Handling Suggestions"],
    promptGuide: "Pro Tip: Clearly state the trigger app, the exact data you want moved, and the final destination app.",
    previewLabel: "View Sample Logic Schema",
    previewTitle: "invoice_automation_schema.json",
    previewFormat: "Node Architecture & JSON"
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does it take to get my results?",
    a: "Most tasks are delivered to your inbox within 30-60 minutes of a successful payment. You'll get an email with your results attached as a CSV or Markdown file."
  },
  {
    q: "What if the output doesn't match what I asked for?",
    a: "Email support@taskengine.software within 48 hours with your Execution ID and a note on what's off. We'll re-run the task at no extra cost or refund you if we can't fix it."
  },
  {
    q: "Are the leads from the Lead Agent guaranteed to be 100% accurate?",
    a: "The Lead Agent researches businesses matching your description and builds a best-match contact list. Where a direct email isn't publicly listed, we generate a standard corporate inbox format (e.g. info@company.com). We don't claim every address is inbox-verified — if your list quality is below what you expected, we'll re-run it free."
  },
  {
    q: "Do I need to give TaskEngine access to my accounts or data?",
    a: "No. You just provide written instructions and an email address. We don't request API keys, database access, or login credentials for any task."
  },
  {
    q: "Is this a subscription?",
    a: "No. Every task is a single flat-fee payment of ₹1,500. There's nothing to cancel and no recurring charges."
  },
  {
    q: "Can I request something that isn't one of the four listed agents?",
    a: "Yes — email us your use case at support@taskengine.software and we'll let you know if we can run it as a custom one-off task."
  },
];

export default function Home() {
  const router = useRouter();
  const [activeAgent, setActiveAgent] = useState<AgentDetails>(AGENTS[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [inputs, setInputs] = useState({
    lead: { prompt: "", email: "" },
    content: { prompt: "", email: "" },
    competitor: { prompt: "", email: "" },
    workflow: { prompt: "", email: "" }
  });

  const handleInputChange = (agent: AgentKey, field: 'prompt' | 'email', value: string) => {
    setInputs(prev => ({
      ...prev,
      [agent]: { ...prev[agent], [field]: value }
    }));
  };

  const handleTabSwitch = (agent: AgentDetails) => {
    setActiveAgent(agent);
    setShowPreview(false);
  };

  const handleCheckout = async (agentKey: AgentKey, agentName: string) => {
    const { prompt, email } = inputs[agentKey];

    if (!prompt || !email) {
      alert("Please fill out both the instructions and your delivery email!");
      return;
    }

    // ⚠️ RECOMMENDED: Before opening Razorpay checkout, call your backend to create
    // a Razorpay Order (POST /api/create-order) and pass the returned order_id below.
    // This lets you verify payment signatures server-side and avoids relying on
    // a purely client-side redirect to /success.
    //
    // const orderRes = await fetch('/api/create-order', {
    //   method: 'POST',
    //   body: JSON.stringify({ amount: 150000, prompt, email, agent: agentName }),
    // });
    // const { order_id } = await orderRes.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: 150000,
      currency: "INR",
      payment_capture: 1,
      name: "TaskEngine",
      description: `Hire ${agentName}`,
      image: "https://taskengine.software/logo.png",
      // order_id, // <- add once create-order endpoint exists
      handler: function () {
        router.push('/success');
      },
      prefill: { email: email },
      notes: { customer_email: email, prompt: prompt, agent_type: agentName },
      theme: { color: "#000000" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-black selection:text-white relative">

        {/* NAVBAR */}
        <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-sm tracking-tighter">TE</div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">TaskEngine</span>
            </div>
            <div className="hidden sm:flex items-center space-x-6 text-sm font-medium text-slate-600">
              <a href="#workspace" className="hover:text-black transition">Agents</a>
              <a href="#pricing" className="hover:text-black transition">Pricing Model</a>
              <a href="#integrations" className="hover:text-black transition">Zero-Setup</a>
              <a href="#faq" className="hover:text-black transition">FAQ</a>
            </div>
            <div>
              <a href="#workspace" className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-slate-800 transition">
                Launch Console
              </a>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <header className="max-w-5xl mx-auto pt-24 pb-8 text-center px-4 relative z-0">
          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase bg-slate-200/50 px-3 py-1 rounded-full border border-slate-200">
            No subscriptions. No retainers. Just execution.
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-black via-slate-800 to-slate-900 bg-clip-text text-transparent leading-none">
            Outsource Operations to Digital Specialists
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Stop paying thousands for unused SaaS seats. Select a pre-trained agent, define your exact target, and get a structured report dropped straight into your inbox.
          </p>
          <p className="mt-4 text-sm text-slate-400 font-medium">
            ⏱ Delivered within 30-60 minutes &nbsp;·&nbsp; 🔁 Free re-run if it misses the brief
          </p>
        </header>

        {/* INTERACTIVE WORKSPACE */}
        <section id="workspace" className="max-w-5xl mx-auto px-4 pb-20 pt-8 space-y-6 scroll-mt-20 relative z-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AGENTS.map((agent) => {
              const isActive = activeAgent.id === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => handleTabSwitch(agent)}
                  className={`p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    isActive
                      ? 'border-black bg-white shadow-sm scale-[1.02]'
                      : 'border-slate-200 bg-slate-100/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{agent.icon}</div>
                  <div className="font-bold text-sm text-slate-900 truncate">{agent.name}</div>
                  <div className="text-[11px] font-semibold text-slate-400 truncate">{agent.role}</div>
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 relative">

            {/* Left Column: Context & Parameters */}
            <div className="md:w-1/2 space-y-6">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{activeAgent.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">{activeAgent.name}</h2>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{activeAgent.role}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  {activeAgent.desc}
                </p>
              </div>

              <div className="space-y-4">
                {activeAgent.deliverability && (
                  <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>{activeAgent.deliverability}</span>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">The Deliverable</span>
                    {activeAgent.estimatedYield && (
                      <p className="text-sm text-slate-600 font-medium mt-1">{activeAgent.estimatedYield}</p>
                    )}
                  </div>

                  {activeAgent.dataPoints && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">What You'll Receive:</span>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {activeAgent.dataPoints.map((point, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium bg-white border border-slate-200 py-1 px-2 rounded-md">
                            <span className="text-blue-500">❖</span>
                            <span className="truncate">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Input & Checkout */}
            <div className="md:w-1/2 space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Operational Instructions</label>
                  {activeAgent.promptGuide && (
                    <span className="text-[10px] font-medium text-slate-400 max-w-[200px] text-right leading-tight">
                      {activeAgent.promptGuide}
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  placeholder={activeAgent.placeholder}
                  className="w-full text-sm p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none bg-slate-50/50 placeholder:text-slate-300 font-normal transition"
                  value={inputs[activeAgent.id].prompt}
                  onChange={(e) => handleInputChange(activeAgent.id, 'prompt', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Target Destination Inbox</label>
                <input
                  type="email"
                  placeholder="operator@company.com"
                  className="w-full text-sm p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-slate-50/50 placeholder:text-slate-300 font-normal transition"
                  value={inputs[activeAgent.id].email}
                  onChange={(e) => handleInputChange(activeAgent.id, 'email', e.target.value)}
                />
              </div>

              <div className="pt-2 flex flex-col space-y-3">
                <button
                  onClick={() => handleCheckout(activeAgent.id, activeAgent.name)}
                  className="w-full bg-black text-white py-4 px-6 rounded-xl text-base font-bold hover:bg-slate-900 active:scale-[0.99] transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Initialize Execution</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-200">₹1,500</span>
                </button>
                <p className="text-xs text-slate-400 text-center">
                  ⏱ Delivered to your inbox within 30-60 minutes
                </p>

                <div className="flex items-center justify-between px-1">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition underline underline-offset-2 flex items-center gap-1"
                  >
                    {activeAgent.previewLabel}
                  </button>
                  <span className="text-xs font-medium text-slate-500 ml-auto">🔒 Secure Escrow via Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ✨ DYNAMIC VISUAL PROOF MODAL */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPreview(false)}></div>
            <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-fade-in max-h-[90vh]">

              {/* Modal Header */}
              <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-200 shrink-0">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Sample Output Payload</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{activeAgent.previewTitle} • {activeAgent.previewFormat}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">Preview Only</span>
                  <button onClick={() => setShowPreview(false)} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-100 transition">
                    Close Preview
                  </button>
                </div>
              </div>

              {/* Modal Body / Scrollable Area */}
              <div className="p-6 overflow-y-auto bg-slate-100/50">

                {/* 1. LEAD AGENT */}
                {activeAgent.id === 'lead' && (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                      <div className="flex space-x-3 text-xs font-semibold text-slate-600">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">120 Rows Generated</span>
                        <span className="flex items-center text-slate-500"><span className="mr-1">✓</span> QA Reviewed</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">te_leads_export.csv</div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white text-slate-400 font-bold text-xs uppercase border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 w-8 text-center border-r border-slate-50">#</th>
                            <th className="px-4 py-3">Company Name</th>
                            <th className="px-4 py-3">Area</th>
                            <th className="px-4 py-3">Job Title</th>
                            <th className="px-4 py-3 bg-blue-50/30">Contact Email</th>
                            <th className="px-4 py-3">Website</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          <tr className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-300 text-center border-r border-slate-50 text-xs">1</td>
                            <td className="px-4 py-3 font-medium">Acme Robotics Pvt Ltd</td><td className="px-4 py-3">Thindlu, Bangalore</td><td className="px-4 py-3">Founder</td>
                            <td className="px-4 py-3 text-blue-600 font-mono text-xs bg-blue-50/30">info@acmerobotics.in</td><td className="px-4 py-3 text-blue-500 hover:underline text-xs">acmerobotics.in</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-300 text-center border-r border-slate-50 text-xs">2</td>
                            <td className="px-4 py-3 font-medium">GrowthCo Marketing</td><td className="px-4 py-3">Thindlu, Bangalore</td><td className="px-4 py-3">Head of Growth</td>
                            <td className="px-4 py-3 text-blue-600 font-mono text-xs bg-blue-50/30">hello@growthco.in</td><td className="px-4 py-3 text-blue-500 hover:underline text-xs">growthco.in</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-300 text-center border-r border-slate-50 text-xs">3</td>
                            <td className="px-4 py-3 font-medium">Rostova Studio</td><td className="px-4 py-3">Thindlu, Bangalore</td><td className="px-4 py-3">Owner</td>
                            <td className="px-4 py-3 text-blue-600 font-mono text-xs bg-blue-50/30">contact@rostovastudio.com</td><td className="px-4 py-3 text-blue-500 hover:underline text-xs">rostovastudio.com</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400">
                      Sample data shown for illustration. Where a direct email isn't publicly listed, a standard corporate inbox format is used.
                    </div>
                  </div>
                )}

                {/* 2. CONTENT AGENT */}
                {activeAgent.id === 'content' && (
                  <div className="bg-[#1E1E1E] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="bg-[#2D2D2D] px-4 py-2 border-b border-[#404040] flex items-center space-x-2">
                      <div className="flex space-x-1.5 mr-4">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="bg-[#1E1E1E] text-slate-300 text-xs font-mono px-3 py-1 rounded-t-md border-t border-l border-r border-[#404040] -mb-2 z-10">skincare_seo_blog_final.md</div>
                    </div>
                    <div className="p-6 text-[#D4D4D4] font-mono text-sm leading-relaxed overflow-x-auto">
                      <p><span className="text-blue-400 font-bold">#</span> <span className="text-blue-300 font-bold">The Future of Organic Skincare: Why Vitamin E is Essential</span></p>
                      <br/>
                      <p>In a world dominated by synthetic chemicals, the return to organic, plant-based skincare isn't just a trend—it's a necessity. At the forefront of this shift is <span className="text-orange-300">**Vitamin E**</span>.</p>
                      <br/>
                      <p><span className="text-blue-400 font-bold">##</span> <span className="text-blue-300 font-bold">Top 3 Benefits of Natural Vitamin E</span></p>
                      <br/>
                      <p><span className="text-purple-400">-</span> <span className="text-orange-300">**Cellular Repair:**</span> Supports healing of micro-abrasions.</p>
                      <p><span className="text-purple-400">-</span> <span className="text-orange-300">**Antioxidant Barrier:**</span> Helps defend against pollution and UV exposure.</p>
                      <p><span className="text-purple-400">-</span> <span className="text-orange-300">**Deep Hydration:**</span> Locks in moisture without clogging pores.</p>
                      <br/>
                      <p><span className="text-slate-500 italic">&lt;!-- Suggested Keyword: Organic Vitamin E Serum --&gt;</span></p>
                      <p><span className="text-slate-500 italic">&lt;!-- Suggested Meta Description: Discover why organic Vitamin E is... --&gt;</span></p>
                    </div>
                  </div>
                )}

                {/* 3. COMPETITOR AGENT */}
                {activeAgent.id === 'competitor' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Keyword Gaps Identified</div>
                        <div className="text-3xl font-black text-slate-900">40+</div>
                        <div className="text-xs text-slate-500 font-medium mt-2">Across core categories</div>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Action Steps</div>
                        <div className="text-3xl font-black text-slate-900">8-12</div>
                        <div className="text-xs text-slate-500 font-medium mt-2">Prioritized by impact</div>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm border-t-4 border-t-blue-500">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Top Opportunity</div>
                        <div className="text-lg font-bold text-slate-900 truncate">"Pilates near me"</div>
                        <div className="text-xs text-blue-600 font-medium mt-2">High intent, low competition</div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                        <h4 className="text-sm font-bold text-slate-900">Strategic Keyword Gaps</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3">Suggested Keyword Target</th>
                              <th className="px-4 py-3">Relative Difficulty</th>
                              <th className="px-4 py-3">Competitor Coverage</th>
                              <th className="px-4 py-3">Your Coverage</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            <tr className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold">"Boutique Pilates near me"</td>
                              <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Low</span></td>
                              <td className="px-4 py-3">Ranking <span className="text-xs text-slate-400">(urbanfit.com)</span></td><td className="px-4 py-3 text-red-500 font-medium">Not covered</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold">"Reformer classes Bangalore"</td>
                              <td className="px-4 py-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Medium</span></td>
                              <td className="px-4 py-3">Ranking <span className="text-xs text-slate-400">(urbanfit.com)</span></td><td className="px-4 py-3">Partial</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold">"Pilates vs Yoga weight loss"</td>
                              <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Low</span></td>
                              <td className="px-4 py-3">Ranking <span className="text-xs text-slate-400">(urbanfit.com)</span></td><td className="px-4 py-3 text-red-500 font-medium">Not covered</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. WORKFLOW AGENT */}
                {activeAgent.id === 'workflow' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 overflow-x-auto shadow-sm">
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm">1. Gmail Trigger</div>
                        <span className="text-[10px] text-slate-400 mt-1">Watch: "subject:invoice"</span>
                      </div>
                      <div className="text-slate-300 font-bold hidden md:block">→</div>
                      <div className="text-slate-300 font-bold md:hidden">↓</div>
                      <div className="flex flex-col items-center">
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm">2. Google Drive</div>
                        <span className="text-[10px] text-slate-400 mt-1">Action: Upload File</span>
                      </div>
                      <div className="text-slate-300 font-bold hidden md:block">→</div>
                      <div className="text-slate-300 font-bold md:hidden">↓</div>
                      <div className="flex flex-col items-center">
                        <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm">3. Slack Alert</div>
                        <span className="text-[10px] text-slate-400 mt-1">Action: Send Message</span>
                      </div>
                    </div>

                    <div className="bg-[#0D1117] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                      <div className="bg-[#161B22] px-4 py-2 border-b border-slate-800 text-xs font-mono text-slate-400">payload_schema.json</div>
                      <div className="p-4 overflow-x-auto">
                        <pre className="text-xs text-slate-300 font-mono leading-relaxed">
<span className="text-blue-400">{"{"}</span>
  <span className="text-blue-300">"name"</span>: <span className="text-green-300">"Invoice Parsing Workflow"</span>,
  <span className="text-blue-300">"nodes"</span>: <span className="text-yellow-300">[</span>
    <span className="text-purple-400">{"{"}</span>
      <span className="text-blue-300">"id"</span>: <span className="text-green-300">"gmail_trigger_01"</span>,
      <span className="text-blue-300">"type"</span>: <span className="text-green-300">"n8n-nodes-base.gmailTrigger"</span>,
      <span className="text-blue-300">"parameters"</span>: <span className="text-orange-300">{"{"}</span>
        <span className="text-blue-300">"q"</span>: <span className="text-green-300">"has:attachment filename:pdf subject:invoice"</span>
      <span className="text-orange-300">{"}"}</span>
    <span className="text-purple-400">{"}"}</span>,
    <span className="text-slate-500">// ... Google Drive and Slack nodes follow</span>
  <span className="text-yellow-300">]</span>
<span className="text-blue-400">{"}"}</span>
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRICING COMPARISON */}
        <section id="pricing" className="bg-black text-white py-20 px-4 relative z-0">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight">The Anti-SaaS Business Model</h2>
              <p className="text-slate-400 font-medium text-lg">Stop paying software retainers for agents you only use twice a month.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl opacity-75">
                <h3 className="text-red-400 font-bold text-sm tracking-wider uppercase mb-4">The Industry Standard</h3>
                <ul className="space-y-4 text-slate-300 text-sm">
                  <li className="flex items-center space-x-3"><span className="text-slate-600">✕</span><span>$500 to $2,000 monthly retainers</span></li>
                  <li className="flex items-center space-x-3"><span className="text-slate-600">✕</span><span>Unused credits expire at month end</span></li>
                  <li className="flex items-center space-x-3"><span className="text-slate-600">✕</span><span>Requires credit card on file to test</span></li>
                </ul>
              </div>
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase">Our Model</div>
                <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">The TaskEngine Approach</h3>
                <ul className="space-y-4 text-white text-sm font-medium">
                  <li className="flex items-center space-x-3"><span className="text-green-400">✓</span><span>Flat ₹1,500 transactional fee per run</span></li>
                  <li className="flex items-center space-x-3"><span className="text-green-400">✓</span><span>No subscriptions or hidden recurring charges</span></li>
                  <li className="flex items-center space-x-3"><span className="text-green-400">✓</span><span>Pay exactly and only for the operations you need</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section id="integrations" className="bg-white py-20 px-4 relative z-0">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Zero-Integration Setup
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">No IT Approval. No API Keys.</h2>
              <p className="text-slate-500 font-medium text-lg">Other platforms take weeks to connect securely to your business systems. We built TaskEngine to skip that entirely.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold border border-slate-200">1</div>
                <h4 className="font-bold text-lg">Define Target Scope</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Provide raw text instructions in our console. You do not need to give us database read/write access.</p>
              </div>
              <div className="space-y-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold border border-slate-200">2</div>
                <h4 className="font-bold text-lg">Secure Ephemeral Runs</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Your data is processed inside isolated cloud instances that are torn down once the task completes.</p>
              </div>
              <div className="space-y-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold border border-slate-200">3</div>
                <h4 className="font-bold text-lg">Asynchronous Inbox Intake</h4>
                <p className="text-sm text-slate-500 leading-relaxed">The final structured data (CSV/Markdown) is emailed straight to you. Just forward it to your team and get to work.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FOUNDER / TRUST SECTION */}
        <section className="bg-slate-50 py-20 px-4 border-t border-slate-200 relative z-0">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase bg-white px-3 py-1 rounded-full border border-slate-200">
              Built by one engineer, not a faceless platform
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Hi, I'm the person who built and runs TaskEngine
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              TaskEngine started as a way to apply hands-on AI and automation work to real business tasks
              at a fraction of typical agency pricing. Every task you run is reviewed by the same systems
              I build and test myself — if something doesn't land, email me directly and I'll make it right.
            </p>
            <a href="mailto:support@taskengine.software" className="inline-block text-sm font-bold text-black underline underline-offset-4 hover:text-slate-600 transition">
              support@taskengine.software
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-white py-20 px-4 border-t border-slate-200 relative z-0 scroll-mt-20">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-center text-slate-900">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full text-left px-5 py-4 flex justify-between items-center gap-4"
                    >
                      <span className="font-bold text-sm text-slate-900">{item.q}</span>
                      <span className={`text-slate-400 font-bold text-lg shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    {isOpen && (
                      <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">{item.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white py-12 px-4 relative z-0">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-400 font-medium">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white font-black text-xs">TE</div>
              <span className="font-bold text-slate-700">© 2026 TaskEngine</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
              <a href="mailto:support@taskengine.software" className="hover:text-slate-900 transition">Contact Operators</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
