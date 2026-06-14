"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

type AgentKey = 'lead' | 'content' | 'competitor' | 'workflow';

interface AgentDetails {
  id: AgentKey;
  name: string;
  role: string;
  icon: string;
  desc: string;
  placeholder: string;
}

const AGENTS: AgentDetails[] = [
  { id: 'lead', name: 'The Lead Agent', role: 'B2B Lead Generation', icon: '🎯', desc: 'High-accuracy, filtered B2B prospect lists for targeted marketing campaigns.', placeholder: 'e.g., Boutique coffee shops in Bangalore with public contact details.' },
  { id: 'content', name: 'The Content Agent', role: 'Conversion Copywriter', icon: '✍️', desc: 'Search-optimized long-form blogs paired with platform-specific social captions.', placeholder: 'e.g., Write a promo for an organic vitamin-E skincare lotion.' },
  { id: 'competitor', name: 'The Competitor Agent', role: 'SEO Strategist', icon: '🕵️', desc: 'Deep-dive SEO keyword gap reports comparing your site against a market rival.', placeholder: 'e.g., Compare my boutique fitness studio in Bangalore to local competitors...' },
  { id: 'workflow', name: 'The Workflow Agent', role: 'No-Code Architect', icon: '⚙️', desc: 'Text-based logic workflows mapping out how to connect disparate office systems.', placeholder: 'e.g., When an invoice hits Gmail, save to Drive and alert Slack.' },
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
      notes: {
        customer_email: email, 
        prompt: prompt,
        agent_type: agentName
      },
      theme: { color: "#000000" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-black selection:text-white">
        
        {/* 🌐 1. REAL NAVBAR COMPONENT */}
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo Group */}
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-sm tracking-tighter">
                TE
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">TaskEngine<span className="text-slate-400">.software</span></span>
            </div>
            
            {/* Nav Menu */}
            <div className="hidden sm:flex items-center space-x-6 text-sm font-medium text-slate-600">
              <a href="#how-it-works" className="hover:text-black transition">How it Works</a>
              <a href="#workspace" className="hover:text-black transition">Agents Workspace</a>
              <a href="#features" className="hover:text-black transition">Core Benefits</a>
            </div>

            {/* CTA Header Button */}
            <div>
              <a href="#workspace" className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-slate-800 transition">
                Launch Console
              </a>
            </div>
          </div>
        </nav>

        {/* 📢 2. PREMIUM HERO SECTION */}
        <header className="max-w-4xl mx-auto pt-24 pb-12 text-center px-4">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase bg-slate-200/50 px-3 py-1 rounded-full">
            Autonomous multi-agent platform
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-black via-slate-800 to-slate-900 bg-clip-text text-transparent leading-none">
            Outsource Operations to Digital Specialists
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Stop configuring complex AI rules. Select a pre-trained specialist agent, define your targets, and get flawless executive reports dropped straight into your inbox.
          </p>
        </header>

        {/* 💻 3. CORE INTERACTIVE WORKSPACE (OUR COMPONENT) */}
        <section id="workspace" className="max-w-4xl mx-auto px-4 pb-16 space-y-6 scroll-mt-20">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-extrabold tracking-tight">Agent Console</h2>
            <p className="text-sm text-slate-400 font-medium">Configure live parameters to immediately dispatch an execution worker.</p>
          </div>

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

          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{activeAgent.icon}</span>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{activeAgent.name}</h2>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{activeAgent.role}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {activeAgent.desc}
              </p>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Operational Parameters / Instructions
                </label>
                <textarea
                  rows={4}
                  placeholder={activeAgent.placeholder}
                  className="w-full text-sm p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none bg-slate-50/50 placeholder:text-slate-400 font-normal transition"
                  value={inputs[activeAgent.id].prompt}
                  onChange={(e) => handleInputChange(activeAgent.id, 'prompt', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Target Destination Inbox
                </label>
                <input
                  type="email"
                  placeholder="Your delivery email (e.g., operator@company.com)"
                  className="w-full text-sm p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-slate-50/50 placeholder:text-slate-400 font-normal transition"
                  value={inputs[activeAgent.id].email}
                  onChange={(e) => handleInputChange(activeAgent.id, 'email', e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={() => handleCheckout(activeAgent.id, activeAgent.name)}
              className="w-full bg-black text-white py-4 px-6 rounded-xl text-base font-bold hover:bg-slate-900 active:scale-[0.99] transition-all duration-150 shadow-md shadow-slate-900/10 flex items-center justify-center space-x-2"
            >
              <span>Initialize {activeAgent.name}</span>
              <span className="text-xs font-normal text-slate-400">|</span>
              <span className="text-sm font-medium text-slate-200">₹1,500 flat rate</span>
            </button>
          </div>
        </section>

        {/* 🛠️ 4. "HOW IT WORKS" COMPONENT */}
        <section id="how-it-works" className="bg-white border-y border-slate-200/80 py-20 px-4 scroll-mt-16">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Three Steps to Direct Execution</h2>
              <p className="text-slate-500 text-sm font-medium">TaskEngine abstracts standard API pipelines into a straightforward on-demand transaction model.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold border border-slate-200">1</div>
                <h4 className="font-bold text-lg">Define Target Scope</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Choose your targeted operational expert block and submit your structured goals or context prompts.</p>
              </div>
              <div className="space-y-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold border border-slate-200">2</div>
                <h4 className="font-bold text-lg">Secure Instant Escrow</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Authorize your specialized run directly via an encrypted Razorpay ledger gateway for a transparent flat fee.</p>
              </div>
              <div className="space-y-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold border border-slate-200">3</div>
                <h4 className="font-bold text-lg">Asynchronous Inbox Intake</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Our execution nodes run parallel loops alongside strict AI Critic verification before emailing cleanly compiled data modules.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ⚡ 5. VALUE PROPOSITION FEATURES COMPONENT */}
        <section id="features" className="max-w-5xl mx-auto px-4 py-20 scroll-mt-16 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Engineered for Accuracy</h2>
            <p className="text-slate-500 text-sm font-medium">Why tech operators run business workflows via TaskEngine nodes rather than prompt playgrounds.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4">
              <span className="text-2xl">🤖</span>
              <div className="space-y-1">
                <h5 className="font-bold text-base">Multi-Agent Critique Models</h5>
                <p className="text-xs text-slate-500 leading-relaxed">We process operations through sequential specialized layers: an initial high-throughput worker node evaluated by an automated quality-assurance validation critic.</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4">
              <span className="text-2xl">🔒</span>
              <div className="space-y-1">
                <h5 className="font-bold text-base">Ephemeral Serverless Runs</h5>
                <p className="text-xs text-slate-500 leading-relaxed">Your custom execution logic fires securely inside isolated cloud environments. Your context data vanishes instantly the moment fulfillment transfers over to your email server.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 📝 6. PREMIUM FOOTER COMPONENT */}
        <footer className="border-t border-slate-200 bg-white py-12 px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-400 font-medium">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white font-black text-xs">TE</div>
              <span className="font-bold text-slate-700">© 2026 TaskEngine.software</span>
            </div>
            <div className="flex space-x-6">
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <span>Fulfillment Status</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}