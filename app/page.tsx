'use client';
import { useState } from 'react';
import Script from 'next/script';

const AGENTS = [
  {
    id: 'lead',
    title: 'The Lead Agent',
    description: 'High-accuracy, filtered B2B prospect lists for targeted marketing campaigns.',
    placeholder: 'e.g., Boutique coffee shops in Bangalore with public contact details.'
  },
  {
    id: 'content',
    title: 'The Content Agent',
    description: 'Search-optimized long-form blogs paired with platform-specific social captions.',
    placeholder: 'e.g., Write a promo for an organic vitamin-E skincare lotion.'
  },
  {
    id: 'competitor',
    title: 'The Competitor Agent',
    description: 'Deep-dive SEO keyword gap reports comparing your site against a market rival.',
    placeholder: 'e.g., Compare my local dental clinic to Apollo Hospitals dental wing.'
  },
  {
    id: 'workflow',
    title: 'The Workflow Agent',
    description: 'Text-based logic workflows mapping out how to connect disparate office systems.',
    placeholder: 'e.g., When an invoice hits Gmail, save to Drive and alert Slack.'
  }
];

export default function Storefront() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (agentId: string, promptText: string) => {
    if (!promptText) return alert("Please provide task instructions for the agent.");
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: agentId,
          userEmail: 'customer@example.com', 
          userInputs: promptText
        })
      });
      const data = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.amount,
        currency: "INR",
        name: "AI Agent Marketplace",
        description: `Purchasing: ${agentId.toUpperCase()} Task`,
        order_id: data.orderId,
        handler: function (response: any) {
          alert(`Payment Successful! Order ID: ${response.razorpay_order_id}`);
        },
        theme: { color: "#000000" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Checkout failed to load.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-10 bg-gray-50 text-gray-900 font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <header className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Autonomous Agent Workspace</h1>
        <p className="text-lg text-gray-600">Select a digital task. Pay a flat rate. Get polished results in your inbox instantly.</p>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <h2 className="text-2xl font-semibold mb-2">{agent.title}</h2>
            <p className="text-gray-600 mb-6 flex-grow">{agent.description}</p>
            
            <textarea 
              id={`input-${agent.id}`}
              placeholder={agent.placeholder}
              className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-black outline-none resize-none h-24 text-sm"
            />
            
            <button 
              onClick={() => {
                const inputVal = (document.getElementById(`input-${agent.id}`) as HTMLTextAreaElement).value;
                handleCheckout(agent.id, inputVal);
              }}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Hire Agent — ₹1,500'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}