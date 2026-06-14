"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';

type AgentKey = 'lead' | 'content' | 'competitor' | 'workflow';

interface AgentDetails {
  id: AgentKey;
  name: string;
  role: string;
  icon: string;
  desc: string;
  placeholder: string;
  capabilities: string[];
}

const AGENTS: AgentDetails[] = [
  { 
    id: 'lead', 
    name: 'The Lead Agent', 
    role: 'B2B Lead Generation', 
    icon: '🎯', 
    desc: 'High-accuracy, filtered B2B prospect lists for targeted marketing campaigns.', 
    placeholder: 'e.g., Boutique coffee shops in Bangalore with public contact details.',
    capabilities: ['Cross-references public corporate registries', 'Verifies active inbox responses', 'Enriches with LinkedIn firmographic data']
  },
  { 
    id: 'content', 
    name: 'The Content Agent', 
    role: 'Conversion Copywriter', 
    icon: '✍️', 
    desc: 'Search-optimized long-form blogs paired with platform-specific social captions.', 
    placeholder: 'e.g., Write a promo for an organic vitamin-E skincare lotion.',
    capabilities: ['Analyzes top 10 live SERP competitors', 'Embeds semantic LSI keywords', 'Formats in production-ready Markdown']
  },
  { 
    id: 'competitor', 
    name: 'The Competitor Agent', 
    role: 'SEO Strategist', 
    icon: '🕵️', 
    desc: 'Deep-dive SEO keyword gap reports comparing your site against a market rival.', 
    placeholder: 'e.g., Compare my boutique fitness studio in Bangalore to local competitors...',
    capabilities: ['Extracts competitor sitemap structures', 'Identifies high-volume keyword gaps', 'Outputs direct technical action plans']
  },
  { 
    id: 'workflow', 
    name: 'The Workflow Agent', 
    role: 'No-Code Architect', 
    icon: '⚙️', 
    desc: 'Text-based logic workflows mapping out how to connect disparate office systems.', 
    placeholder: 'e.g., When an invoice hits Gmail, save to Drive and alert Slack.',
    capabilities: ['Maps exact JSON payload structures', 'Defines conditional branching logic', 'Outputs ready-to-build n8n/Zapier steps']
  },
];

export default function Home() {
  const router = useRouter();
  const [activeAgent, setActiveAgent] = useState<AgentDetails>(AGENTS[0]);
  
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

  const handleCheckout = async (agentKey: AgentKey, agentName: string) => {
    const { prompt, email } = inputs[agentKey];

    if (!prompt || !email) {
      alert("Please fill out both the instructions and your delivery email!");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
      amount: 150000, 
      currency: "INR",
      payment_capture: 1,
      name: "TaskEngine",
      description: `Hire ${agentName}`,
      image: "https://taskengine.software/logo.png", 
      handler: function (response: any) {
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
      
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-black selection:text-white">
        
        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-sm tracking-tighter">TE</div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">TaskEngine</span>
            </div>
            <div className="hidden sm:flex items-center space-x-6 text-sm font-medium text-slate-600">
              <a href="#workspace" className="hover:text-black transition">Agents</a>
              <a href="#pricing" className="hover:text-black transition">Pricing Model</a>
              <a href="#integrations" className="hover:text-black transition">Zero-Setup</a>
            </div>
            <div>
              <a href="#workspace" className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-slate-800 transition">
                Launch Console
              </a>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <header className="max-w-5xl mx-auto pt-24 pb-8 text-center px-4">
          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase bg-slate-200/50 px-3 py-1 rounded-full border border-slate-200">
            No subscriptions. No retainers. Just execution.
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-black via-slate-800 to-slate-900 bg-clip-text text-transparent leading-none">
            Outsource Operations to Digital Specialists
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Stop paying thousands for unused SaaS seats. Select a pre-trained agent, define your exact target, and get flawless executive reports dropped straight into your inbox.
          </p>
        </header>

        {/* INTERACTIVE WORKSPACE */}
        <section id="workspace" className="max-w-5xl mx-auto px-4 pb-20 pt-8 space-y-6 scroll-mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AGENTS.map((agent) => {
              const isActive = activeAgent.id === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent)}
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

          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8">
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

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Execution Pipeline</span>
                <ul className="space-y-2">
                  {activeAgent.capabilities.map((cap, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start space-x-2">
                      <span className="text-green-500 shrink-0">✓</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:w-1/2 space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Operational Instructions</label>
                <textarea
                  rows={3}
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
                
                <div className="flex items-center justify-between px-1">
                  <button onClick={() => alert("Sample output preview coming soon!")} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition underline underline-offset-2">
                    View Sample Output
                  </button>
                  <span className="text-xs font-medium text-slate-500">🔒 Guaranteed accurate, or the run is free.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING COMPARISON */}
        <section id="pricing" className="bg-black text-white py-20 px-4">
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
        <section id="integrations" className="bg-white py-20 px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Zero-Integration Setup
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">No IT Approval. No API Keys.</h2>
              <p className="text-slate-500 font-medium text-lg">Other platforms take 3 weeks to connect securely to your Salesforce instances. We engineered TaskEngine to bypass the red tape entirely.</p>
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
                <p className="text-sm text-slate-500 leading-relaxed">Your data is processed inside isolated cloud instances that destroy themselves the second the task completes.</p>
              </div>
              <div className="space-y-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold border border-slate-200">3</div>
                <h4 className="font-bold text-lg">Asynchronous Inbox Intake</h4>
                <p className="text-sm text-slate-500 leading-relaxed">The final structured data (CSV/Markdown) is emailed straight to you. Just forward it to your team and get to work.</p>
              </div>
            </div>
          </div>
        </section>

        {/* UPDATED FOOTER */}
        <footer className="border-t border-slate-200 bg-white py-12 px-4">
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