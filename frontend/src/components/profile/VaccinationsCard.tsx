"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import EditableCardModal, { FieldConfig } from "./EditableCardModal";
import type { HealthProfile } from "@/lib/types";

export default function VaccinationsCard({
  profile,
  onUpdate,
}: {
  profile: HealthProfile;
  onUpdate: (updated: Partial<HealthProfile>) => Promise<void> | void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const fields: FieldConfig[] = [
    {
      key: "vaccinationsText",
      label: "Vaccinations (format: Name | YYYY-MM-DD per line)",
      type: "textarea",
      placeholder: "COVID-19 Booster | 2023-10-15",
    },
  ];

  const initialText = profile.vaccinations
    .map((v) => `${v.name} | ${v.date}`)
    .join("\n");

  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-primary-dark">Vaccinations</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-slate-400 hover:text-primary-dark hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          title="Edit Vaccinations"
        >
          <Edit2 size={15} />
        </button>
      </div>

      <div>
        {profile.vaccinations.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No vaccinations recorded.</p>
        ) : (
          <div className="space-y-2">
            {profile.vaccinations.map((vac, idx) => (
              <div
                key={vac.id || idx}
                className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-xs"
              >
                <span className="font-medium text-slate-700">{vac.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">{vac.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditableCardModal
        title="Vaccinations"
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        fields={fields}
        initialValues={{ vaccinationsText: initialText }}
        onSave={async (vals) => {
          const parsed = (vals.vaccinationsText || "")
            .split("\n")
            .filter((l: string) => l.trim())
            .map((line: string, i: number) => {
              const [name, date] = line.split("|");
              return {
                id: String(i + 1),
                name: (name || "").trim(),
                date: (date || "").trim(),
              };
            });

          await onUpdate({ vaccinations: parsed });
        }}
      />
    </div>
  );
}
