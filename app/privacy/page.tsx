import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 text-slate-900">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">← Back to Workspace</Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-slate-500">Last updated: June 2026</p>
        
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>TaskEngine respects your privacy and is committed to protecting your operational data.</p>
          <h2 className="text-xl font-bold mt-6">1. Data Ephemerality</h2>
          <p>We utilize serverless cloud functions. Your prompt instructions and target data are processed in memory and are not permanently stored on our servers after execution.</p>
          <h2 className="text-xl font-bold mt-6">2. Payment Processing</h2>
          <p>All financial transactions are handled securely via Razorpay. We do not store your credit card information.</p>
          {/* Add your actual privacy policy here later */}
        </div>
      </div>
    </div>
  );
}