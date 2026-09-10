"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UploadCard from "@/components/dashboard/UploadCard";
import RecentActivityTable from "@/components/dashboard/RecentActivityTable";
import AnalysisDrawer from "@/components/analysis/AnalysisDrawer";
import { useHistory } from "@/hooks/useHistory";
import { useAuth } from "@/hooks/useAuth";
import type { AnalysisResult } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: history, refetch } = useHistory();
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeHref="/dashboard" />

      <main className="flex-1 px-10 py-8">
        <DashboardHeader name={user?.name ?? "there"} />
        <UploadCard
          onAnalyzed={(result) => {
            setActiveResult(result);
            refetch();
          }}
        />
        <RecentActivityTable
          items={history ?? []}
          onSelect={(item) => setActiveResult(item)}
        />
      </main>

      {activeResult && (
        <AnalysisDrawer result={activeResult} onClose={() => setActiveResult(null)} />
      )}
    </div>
  );
}
