"use client";
import { X } from "lucide-react";
import AgentSummaryGrid from "./AgentSummaryGrid";
import DetailedBreakdownTable from "./DetailedBreakdownTable";
import RecommendationTabs from "./RecommendationTabs";
import ActionFooter from "./ActionFooter";
import type { AnalysisResult } from "@/lib/types";

export default function AnalysisDrawer({
  result,
  onClose,
}: {
  result: AnalysisResult;
  onClose: () => void;
}) {
  return (
    <aside className="w-[35%] min-w-[380px] bg-card border-l border-slate-100 h-screen sticky top-0 overflow-y-auto px-6 py-6 shadow-lg z-40">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-primary-dark">Analysis Result</h2>
          <p className="text-xs text-slate-400">
            Analysis ID: #{result.id} | {result.date}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
          <X size={18} />
        </button>
      </div>

      <h3 className="font-semibold text-primary-dark">{result.title}</h3>
      <p className="text-sm text-slate-500 mb-5">
        {result.date} | Source: {result.source}
      </p>

      <AgentSummaryGrid agents={result.agents} />
      <DetailedBreakdownTable markers={result.markers} />
      <RecommendationTabs agents={result.agents} />
      <ActionFooter />
    </aside>
  );
}
