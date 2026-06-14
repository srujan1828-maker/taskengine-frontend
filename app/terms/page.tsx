import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 text-slate-900">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">← Back to Workspace</Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-slate-500">Last updated: June 2026</p>
        
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>Welcome to TaskEngine. By using our platform, you agree to these terms.</p>
          <h2 className="text-xl font-bold mt-6">1. Services Provided</h2>
          <p>We provide asynchronous, AI-powered task execution delivered via email based on a flat transactional fee.</p>
          <h2 className="text-xl font-bold mt-6">2. Refunds and Guarantees</h2>
          <p>If an execution fails to deliver the promised structure or data, we will refund your transaction or re-run the process free of charge.</p>
          {/* Add your actual terms here later */}
        </div>
      </div>
    </div>
  );
}