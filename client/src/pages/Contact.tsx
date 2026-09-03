import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send to your backend endpoint
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-950 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-700 text-white">
            <Mail className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Contact</h1>
            <p className="mt-2 text-lg text-slate-600">Get in touch</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          {submitted ? (
            <div className="flex items-center gap-4 rounded-2xl bg-emerald-50 p-6 text-emerald-800">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <div>
                <h3 className="font-black">Thank you!</h3>
                <p>Your message has been sent. I'll get back to you soon.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-slate-800">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-800">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-slate-800">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  placeholder="Tell me about your project, inquiry, or collaboration idea..."
                />
              </div>
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm font-black text-slate-500">Email</p>
            <a href="mailto:lawalgoodness6@gmail.com" className="text-emerald-700 font-bold hover:underline">goodnesslawal6@gmail.com</a>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm font-black text-slate-500">GitHub</p>
            <a href="https://github.com/0xlawal" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline">0xlawal</a>
          </div>
        </div>
      </div>
    </div>
  );
}