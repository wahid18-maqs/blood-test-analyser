"use client";

import { useState } from "react";
import { Edit2, Phone, Mail, ShieldAlert, Shield } from "lucide-react";
import EditableCardModal, { FieldConfig } from "./EditableCardModal";
import type { HealthProfile } from "@/lib/types";

export default function ContactInsuranceCard({
  profile,
  onUpdate,
}: {
  profile: HealthProfile;
  onUpdate: (updated: Partial<HealthProfile>) => Promise<void> | void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const fields: FieldConfig[] = [
    { key: "phone", label: "Phone Number" },
    { key: "email", label: "Email Address" },
    { key: "emergencyName", label: "Emergency Contact Name" },
    { key: "emergencyPhone", label: "Emergency Contact Phone" },
    { key: "insuranceProvider", label: "Insurance Provider" },
    { key: "insuranceMemberId", label: "Member ID" },
  ];

  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-primary-dark">Contact & Insurance</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-primary-dark hover:bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
        >
          <Edit2 size={13} />
          Edit Info
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2.5 text-slate-600">
          <Phone size={15} className="text-slate-400 shrink-0" />
          <span>{profile.phone}</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-600">
          <Mail size={15} className="text-slate-400 shrink-0" />
          <span className="truncate">{profile.email}</span>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <ShieldAlert size={14} className="text-amber-500" />
            <span>Emergency Contact</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">
            {profile.emergencyContact.name}{" "}
            <span className="font-normal text-slate-500">({profile.emergencyContact.phone})</span>
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Shield size={14} className="text-primary-dark" />
            <span>Insurance</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">
            {profile.insurance.provider}{" "}
            <span className="font-mono text-slate-500">ID: {profile.insurance.memberId}</span>
          </p>
        </div>
      </div>

      <EditableCardModal
        title="Contact & Insurance"
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        fields={fields}
        initialValues={{
          phone: profile.phone,
          email: profile.email,
          emergencyName: profile.emergencyContact.name,
          emergencyPhone: profile.emergencyContact.phone,
          insuranceProvider: profile.insurance.provider,
          insuranceMemberId: profile.insurance.memberId,
        }}
        onSave={async (vals) => {
          await onUpdate({
            phone: vals.phone,
            email: vals.email,
            emergencyContact: {
              name: vals.emergencyName,
              phone: vals.emergencyPhone,
            },
            insurance: {
              provider: vals.insuranceProvider,
              memberId: vals.insuranceMemberId,
            },
          });
        }}
      />
    </div>
  );
}
