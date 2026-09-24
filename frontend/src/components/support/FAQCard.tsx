"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    id: "formats",
    question: "What file formats can I upload?",
    answer: "We currently support standard PDF blood test report documents (.pdf). Make sure the text is readable and unencrypted for accurate multi-agent AI analysis.",
  },
  {
    id: "retention",
    question: "How long is my report history kept?",
    answer: "Your analyzed reports are stored securely in your private history indefinitely until you explicitly delete individual reports or export/delete your account data.",
  },
  {
    id: "security",
    question: "Is my health data encrypted?",
    answer: "Yes, all transmission occurs over TLS/HTTPS, and health records are isolated strictly to your authenticated session token.",
  },
  {
    id: "deletion",
    question: "Can I delete my data?",
    answer: (
      <span>
        Yes, you have full control over your health records. You can export your data or permanently delete your account anytime on the{" "}
        <Link href="/dashboard/settings" className="text-primary-dark font-medium underline hover:text-primary">
          Settings page
        </Link>
        .
      </span>
    ),
  },
  {
    id: "accuracy",
    question: "How accurate is the AI doctor analysis?",
    answer: "Our CrewAI multi-agent system uses specialized medical verifiers, doctors, nutritionists, and exercise agents to analyze markers against standard clinical ranges. Note that results are for informational summary purposes and should always be reviewed by a licensed healthcare provider.",
  },
];

export default function FAQCard() {
  const [openId, setOpenId] = useState<string | null>("formats");

  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="text-primary-dark" size={20} />
          <h2 className="text-lg font-semibold text-primary-dark">Frequently Asked Questions</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Quick answers to common questions regarding reports, privacy, and security
        </p>

        <div className="space-y-3">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-slate-200/80 rounded-lg overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-primary-dark" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 py-3 text-xs text-slate-600 leading-relaxed bg-card border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
