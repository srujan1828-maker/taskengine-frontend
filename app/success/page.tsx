"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

const LOG_STEPS = [
  "Payment verified via Razorpay gateway.",
  "Establishing secure connection to us-east-1 cluster...",
  "Booting up meta/llama-3.1-70b-instruct...",
  "Parsing operational parameters and target constraints...",
  "Running Execution Worker phase...",
  "Cross-referencing output against industry data...",
  "Running strict QA Critic validation phase...",
  "Formatting output into production-ready markdown...",
  "Handing off payload to AWS SES for delivery...",
  "Agent task complete! Securely dispatched to your inbox."
];

export default function SuccessTerminal() {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < LOG_STEPS.length) {
      // Add a randomized delay between 1.5 and 4.5 seconds to make it feel "real"
      const delay = Math.random() * 3000 + 1500; 
      
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, LOG_STEPS[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-black selection:text-white">
      
      {/* Minimal Header */}
      <nav className="border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-sm tracking-tighter">
              TE
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">TaskEngine</span>
          </Link>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            Payment Secured
          </span>
        </div>
      </nav>

      {/* Main Terminal Area */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {isComplete ? "Execution Complete." : "Agent Dispatched."}
            </h1>
            <p className="text-slate-500 font-medium">
              {isComplete 
                ? "Your results have been sent. You may now close this window." 
                : "Please wait while our serverless architecture fulfills your request..."}
            </p>
          </div>

          {/* The Terminal Window */}
          <div className="bg-[#0D1117] rounded-xl shadow-2xl border border-slate-800 overflow-hidden text-sm font-mono flex flex-col h-[400px]">
            
            {/* Mac-style Window Header */}
            <div className="bg-[#161B22] border-b border-slate-800 p-3 flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="text-slate-500 ml-4 text-xs font-medium tracking-wider">taskengine-execution-node</span>
            </div>

            {/* Scrolling Log Output */}
            <div className="p-6 overflow-y-auto flex-grow flex flex-col space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="flex space-x-3 text-slate-300 animate-fade-in-up">
                  <span className="text-blue-400 select-none">~ %</span>
                  <span className={i === LOG_STEPS.length - 1 ? "text-green-400 font-bold" : ""}>
                    {log}
                  </span>
                </div>
              ))}
              
              {/* Blinking Cursor while running */}
              {!isComplete && (
                <div className="flex space-x-3 text-slate-300">
                  <span className="text-blue-400 select-none">~ %</span>
                  <span className="w-2 h-4 bg-slate-400 animate-pulse mt-0.5"></span>
                </div>
              )}
            </div>
          </div>

          {/* Return Home Button (Appears when done) */}
          {isComplete && (
            <div className="animate-fade-in text-center pt-4">
              <Link href="/">
                <button className="bg-white border-2 border-slate-200 text-slate-900 font-bold py-3 px-6 rounded-xl hover:border-black transition-all">
                  Return to Workspace
                </button>
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}