"use client";

import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import UserProfileSummaryCard from "@/components/profile/UserProfileSummaryCard";
import ContactInsuranceCard from "@/components/profile/ContactInsuranceCard";
import BasicVitalsCard from "@/components/profile/BasicVitalsCard";
import MedicalHistoryCard from "@/components/profile/MedicalHistoryCard";
import CurrentMedicationsCard from "@/components/profile/CurrentMedicationsCard";
import AllergiesCard from "@/components/profile/AllergiesCard";
import VaccinationsCard from "@/components/profile/VaccinationsCard";
import BiomarkerTrendsCard from "@/components/profile/BiomarkerTrendsCard";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useHistory } from "@/hooks/useHistory";
import type { HistoryItem } from "@/lib/types";

export default function HealthProfilePage() {
  const { profile, updateProfile } = useHealthProfile();
  const { data: historyData } = useHistory({ page: 1, pageSize: 50 });

  const historyItems: HistoryItem[] = historyData?.items ?? [];

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeHref="/dashboard/profile" />

      <main className="flex-1 px-10 py-8 min-w-0">
        {/* Breadcrumb Header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-primary-dark transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-semibold text-primary-dark">Health Profile</span>
          </div>
          <h1 className="text-2xl font-semibold text-primary-dark">Health Profile</h1>
        </header>

        {/* 3-Column Card Grid (stacks to 1 on mobile/tablet) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UserProfileSummaryCard profile={profile} onUpdate={async (u) => { await updateProfile(u); }} />
          <ContactInsuranceCard profile={profile} onUpdate={async (u) => { await updateProfile(u); }} />
          <BasicVitalsCard profile={profile} onUpdate={async (u) => { await updateProfile(u); }} />
          <MedicalHistoryCard profile={profile} onUpdate={async (u) => { await updateProfile(u); }} />
          <CurrentMedicationsCard profile={profile} onUpdate={async (u) => { await updateProfile(u); }} />
          <AllergiesCard profile={profile} onUpdate={async (u) => { await updateProfile(u); }} />
          <VaccinationsCard profile={profile} onUpdate={async (u) => { await updateProfile(u); }} />
          <BiomarkerTrendsCard history={historyItems} />
        </div>
      </main>
    </div>
  );
}
