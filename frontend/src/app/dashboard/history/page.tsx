"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ZoomIn, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import AnalysisDrawer from "@/components/analysis/AnalysisDrawer";
import { useHistory } from "@/hooks/useHistory";
import type { HistoryItem, AnalysisResult } from "@/lib/types";

const FILTER_PILLS = ["All Reports", "Routine", "Comprehensive", "Specialized"];

export default function ReportsHistoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPill, setSelectedPill] = useState("All Reports");

  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);

  const { data: historyData, isLoading } = useHistory({
    page,
    pageSize,
    search: searchQuery,
    reportType: selectedPill,
  });

  const items: HistoryItem[] = historyData?.items ?? [];
  const totalCount = historyData?.total ?? 0;
  const totalPages = historyData?.pages ?? 1;

  const startRange = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, totalCount);

  function handleSelectRow(item: HistoryItem) {
    const formattedDate = isNaN(new Date(item.timestamp).getTime())
      ? item.timestamp
      : new Date(item.timestamp).toLocaleDateString();

    setActiveResult({
      id: item.analysis_id || item.file,
      date: formattedDate,
      title: item.query || "Blood Test Analysis",
      source: item.file,
      agents: item.agents || {
        medical: item.analysis,
        verification: "",
        nutrition: "",
        exercise: "",
      },
      markers: item.markers || [],
    });
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeHref="/dashboard/history" />

      <main className="flex-1 px-10 py-8 min-w-0">
        {/* Breadcrumb Header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-primary-dark transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-semibold text-primary-dark">Report History</span>
          </div>
          <h1 className="text-2xl font-semibold text-primary-dark">Reports History</h1>
        </header>

        {/* Summary + Search Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Stat Card */}
          <div className="bg-card rounded-xl shadow-sm p-6 border border-slate-100 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Reports
            </span>
            <div className="text-4xl font-bold text-primary-dark mt-2">
              {isLoading ? "..." : totalCount}
            </div>
          </div>

          {/* Right Search & Filter Card */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-sm p-6 border border-slate-100 flex flex-col justify-between gap-4">
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_PILLS.map((pill) => {
                const isSelected = selectedPill === pill;
                return (
                  <button
                    key={pill}
                    onClick={() => {
                      setSelectedPill(pill);
                      setPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary-dark text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reports Table Card */}
        <section className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="font-medium px-6 py-3.5">Analysis ID</th>
                  <th className="font-medium px-6 py-3.5">Date Analyzed</th>
                  <th className="font-medium px-6 py-3.5">Report Type</th>
                  <th className="font-medium px-6 py-3.5">Diagnostic Center</th>
                  <th className="font-medium px-6 py-3.5">Status</th>
                  <th className="font-medium px-6 py-3.5">Doctor Notes</th>
                  <th className="font-medium px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Loading report history...
                    </td>
                  </tr>
                )}
                {!isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No reports found matching your criteria.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  items.map((item, idx) => {
                    const formattedDate = isNaN(new Date(item.timestamp).getTime())
                      ? item.timestamp
                      : new Date(item.timestamp).toLocaleDateString();

                    const doctorNotes = item.agents?.medical || item.analysis || "No doctor notes available.";

                    return (
                      <tr
                        key={(item.analysis_id || item.file) + item.timestamp + idx}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                          #{item.analysis_id || `BTA-2026-${(idx + 1).toString().padStart(3, "0")}`}
                        </td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{formattedDate}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {item.report_type || "Routine"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {item.diagnostic_center || "Central Health Lab"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-medical-bg text-medical-text text-xs font-medium px-3 py-1 rounded-full inline-block">
                            {item.status || "Completed - Reviewed"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs max-w-xs">
                          <p className="line-clamp-2 leading-relaxed">{doctorNotes}</p>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSelectRow(item)}
                              title="View Details"
                              className="p-1.5 text-slate-500 hover:text-primary-dark hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                              <ZoomIn size={16} />
                            </button>
                            <button
                              onClick={() => alert("PDF Export functionality is coming soon!")}
                              title="Export PDF"
                              className="p-1.5 text-slate-500 hover:text-primary-dark hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                              <FileText size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-card border-t border-slate-100 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{startRange}</span>-
              <span className="font-semibold text-slate-700">{endRange}</span> of{" "}
              <span className="font-semibold text-slate-700">{totalCount}</span> results
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-3 py-1 rounded-lg bg-primary-dark text-white font-medium text-xs">
                {page}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Analysis Drawer right-side overlay */}
      {activeResult && (
        <AnalysisDrawer result={activeResult} onClose={() => setActiveResult(null)} />
      )}
    </div>
  );
}
