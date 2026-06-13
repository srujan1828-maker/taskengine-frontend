"use client";


import { useState } from 'react';
type AgentKey = 'lead' | 'content' | 'competitor' | 'workflow';

export default function Home() {
  // 1. Keep track of the user's inputs for each specific agent type
  const [inputs, setInputs] = useState({
    lead: { prompt: "", email: "" },
    content: { prompt: "", email: "" },
    competitor: { prompt: "", email: "" },
    workflow: { prompt: "", email: "" }
  });

  // Helper to handle updating the text values dynamically
  const handleInputChange = (agent: AgentKey, field: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [agent]: { ...prev[agent], [field]: value }
    }));
  };

  // 2. The upgraded Razorpay checkout function
  const handleCheckout = async (agentKey: AgentKey, agentName: string) => {
    const { prompt, email } = inputs[agentKey];

    if (!prompt || !email) {
      alert("Please fill out both the instructions and your delivery email!");
      return;
    }

    // Initialize Razorpay Standard Options
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
      amount: 150000, // ₹1,500 in paise
      currency: "INR",
      name: "TaskEngine",
      description: `Hire ${agentName}`,
      image: "https://taskengine.software/logo.png", // Optional logo path
      handler: function (response: any) {
        alert(`Payment successful! Order ID: ${response.razorpay_order_id}`);
      },
      prefill: {
        email: email, 
      },
      notes: {
        customer_email: email, 
        prompt: prompt,
        agent_type: agentName
      },
      theme: {
        color: "#000000", // Elegant matching black theme for checkout popup
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-black selection:text-white">
      {/* Premium Header Section */}
      <header className="max-w-4xl mx-auto pt-16 pb-12 text-center px-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-black via-slate-700 to-slate-900 bg-clip-text text-transparent">
          Autonomous Agent Workspace
        </h1>
        <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto font-medium">
          Select a digital task. Pay a flat rate. Get polished results in your inbox instantly.
        </p>
      </header>

      {/* Optimized Grid Layout */}
      <main className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CARD 1: THE LEAD AGENT */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">The Lead Agent</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">
                High-accuracy, filtered B2B prospect lists for targeted marketing campaigns.
              </p>
              
              <div className="mt-5 space-y-3">
                <textarea
                  rows={4}
                  placeholder="e.g., Boutique coffee shops in Bangalore with public contact details."
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none bg-slate-50/50 placeholder:text-slate-400 font-normal transition"
                  value={inputs.lead.prompt}
                  onChange={(e) => handleInputChange('lead', 'prompt', e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Your delivery email (e.g., mail@example.com)"
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-slate-50/50 placeholder:text-slate-400 font-normal transition"
                  value={inputs.lead.email}
                  onChange={(e) => handleInputChange('lead', 'email', e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={() => handleCheckout('lead', 'The Lead Agent')}
              className="mt-6 w-full bg-black text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-slate-900 active:scale-[0.99] transition-all duration-150 shadow-sm"
            >
              Hire Agent — ₹1,500
            </button>
          </div>

          {/* CARD 2: THE CONTENT AGENT */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">The Content Agent</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">
                Search-optimized long-form blogs paired with platform-specific social captions.
              </p>
              
              <div className="mt-5 space-y-3">
                <textarea
                  rows={4}
                  placeholder="e.g., Write a promo for an organic vitamin-E skincare lotion."
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none bg-slate-50/50 placeholder:text-slate-400 font-normal transition"
                  value={inputs.content.prompt}
                  onChange={(e) => handleInputChange('content', 'prompt', e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Your delivery email (e.g., mail@example.com)"
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-slate-50/50 placeholder:text-slate-400 font-normal transition"
                  value={inputs.content.email}
                  onChange={(e) => handleInputChange('content', 'email', e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={() => handleCheckout('content', 'The Content Agent')}
              className="mt-6 w-full bg-black text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-slate-900 active:scale-[0.99] transition-all duration-150 shadow-sm"
            >
              Hire Agent — ₹1,500
            </button>
          </div>

          {/* CARD 3: THE COMPETITOR AGENT */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">The Competitor Agent</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">
                Deep-dive SEO keyword gap reports comparing your site against a market rival.
              </p>
              
              <div className="mt-5 space-y-3">
                <textarea
                  rows={4}
                  placeholder="e.g., Compare my boutique fitness studio in Bangalore to local competitors..."
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none bg-slate-50/50 placeholder:text-slate-400 font-normal transition"
                  value={inputs.competitor.prompt}
                  onChange={(e) => handleInputChange('competitor', 'prompt', e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Your delivery email (e.g., mail@example.com)"
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-slate-50/50 placeholder:text-slate-400 font-normal transition"
                  value={inputs.competitor.email}
                  onChange={(e) => handleInputChange('competitor', 'email', e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={() => handleCheckout('competitor', 'The Competitor Agent')}
              className="mt-6 w-full bg-black text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-slate-900 active:scale-[0.99] transition-all duration-150 shadow-sm"
            >
              Hire Agent — ₹1,500
            </button>
          </div>

          {/* CARD 4: THE WORKFLOW AGENT */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">The Workflow Agent</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">
                Text-based logic workflows mapping out how to connect disparate office systems.
              </p>
              
              <div className="mt-5 space-y-3">
                <textarea
                  rows={4}
                  placeholder="e.g., When an invoice hits Gmail, save to Drive and alert Slack."
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none bg-slate-50/50 placeholder:text-slate-400 font-normal transition"
                  value={inputs.workflow.prompt}
                  onChange={(e) => handleInputChange('workflow', 'prompt', e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Your delivery email (e.g., mail@example.com)"
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-slate-50/50 placeholder:text-slate-400 font-normal transition"
                  value={inputs.workflow.email}
                  onChange={(e) => handleInputChange('workflow', 'email', e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={() => handleCheckout('workflow', 'The Workflow Agent')}
              className="mt-6 w-full bg-black text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-slate-900 active:scale-[0.99] transition-all duration-150 shadow-sm"
            >
              Hire Agent — ₹1,500
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}