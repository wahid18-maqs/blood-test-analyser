"use client";

import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import AccountCard from "@/components/settings/AccountCard";
import DataPrivacyCard from "@/components/settings/DataPrivacyCard";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeHref="/dashboard/settings" />

      <main className="flex-1 px-10 py-8 min-w-0">
        {/* Breadcrumb Header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-primary-dark transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-semibold text-primary-dark">Settings</span>
          </div>
          <h1 className="text-2xl font-semibold text-primary-dark">Settings</h1>
        </header>

        {/* Two Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          <AccountCard />
          <DataPrivacyCard />
        </div>
      </main>
    </div>
  );
}
