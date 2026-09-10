import React from "react";
import type { Marker } from "@/lib/types";
import RangeGauge from "./RangeGauge";

const STATUS_STYLE: Record<Marker["status"], string> = {
  Low: "bg-blue-50 text-blue-700 border-blue-200",
  High: "bg-red-50 text-red-700 border-red-200",
  Normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const MOCK_DEMO_MARKERS: Marker[] = [
  { name: "Hemoglobin", value: 15.0, unit: "g/dL", range: [13.0, 15.0], status: "Normal" },
  { name: "Fasting Glucose", value: 92.0, unit: "mg/dL", range: [8.5, 12.0], status: "High" },
  { name: "Vitamin D", value: 0.45, unit: "ng/mL", range: [13.0, 30.0], status: "Low" },
];

export default function DetailedBreakdownTable({ markers }: { markers: Marker[] }) {
  const displayMarkers = markers && markers.length > 0 ? markers : MOCK_DEMO_MARKERS;
  const isDemo = !markers || markers.length === 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm text-primary-dark">Detailed Breakdown</h4>
        {isDemo && (
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
            Sample Markers
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="py-2 font-medium">Marker Name</th>
              <th className="py-2 font-medium">Measured Value</th>
              <th className="py-2 font-medium">Reference Range</th>
              <th className="py-2 font-medium text-center">Visual Indicator</th>
              <th className="py-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayMarkers.map((m, idx) => (
              <tr key={m.name + idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="py-2.5 text-slate-700 font-medium">{m.name}</td>
                <td className="py-2.5 text-slate-800 font-semibold">
                  {m.value} <span className="text-xs text-slate-400 font-normal">{m.unit}</span>
                </td>
                <td className="py-2.5 text-slate-500 text-xs">
                  {m.range[0]} - {m.range[1]}
                </td>
                <td className="py-2.5 text-center align-middle">
                  <div className="flex justify-center items-center">
                    <RangeGauge value={m.value} range={m.range} status={m.status} size={48} />
                  </div>
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      STATUS_STYLE[m.status] || "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
