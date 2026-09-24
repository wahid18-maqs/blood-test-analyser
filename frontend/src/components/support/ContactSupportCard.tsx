"use client";

import { useState } from "react";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export default function ContactSupportCard() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError("Please enter a subject line.");
      return;
    }

    if (message.trim().length < 10) {
      setError("Please enter a message of at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await api.submitSupportRequest({
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(err?.message || "Failed to send support request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="text-primary-dark" size={20} />
          <h2 className="text-lg font-semibold text-primary-dark">Contact Support</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Have a question or feedback? Send our team a message directly
        </p>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-emerald-800 mb-1">
              Message Received!
            </h3>
            <p className="text-xs text-emerald-700 leading-relaxed mb-4">
              Thank you for reaching out. We&apos;ve received your support request and will reply to{" "}
              <span className="font-semibold">{user?.email}</span> as soon as possible.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-medium bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                readOnly
                value={user?.email || "user@example.com"}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Question about my report analysis"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe your question or issue in detail (at least 10 characters)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-primary-dark text-white text-xs font-medium py-2.5 rounded-lg hover:bg-primary transition-colors cursor-pointer disabled:opacity-60"
            >
              <Send size={14} />
              {submitting ? "Sending Message..." : "Submit Support Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
