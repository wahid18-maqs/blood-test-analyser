"use client";

import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import FAQCard from "@/components/support/FAQCard";
import ContactSupportCard from "@/components/support/ContactSupportCard";

export default function SupportPage() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeHref="/dashboard/support" />

      <main className="flex-1 px-10 py-8 min-w-0">
        {/* Breadcrumb Header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-primary-dark transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-semibold text-primary-dark">Support</span>
          </div>
          <h1 className="text-2xl font-semibold text-primary-dark">Help & Support</h1>
        </header>

        {/* Two Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
          <FAQCard />
          <ContactSupportCard />
        </div>
      </main>
    </div>
  );
}
