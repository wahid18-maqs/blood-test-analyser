"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { HealthProfile } from "@/lib/types";

const DEFAULT_PROFILE: HealthProfile = {
  name: "Alex Johnson",
  age: 32,
  dob: "1994-05-14",
  gender: "Male",
  phone: "+1 (555) 234-5678",
  email: "alex.johnson@example.com",
  emergencyContact: {
    name: "Sarah Johnson",
    phone: "+1 (555) 987-6543",
  },
  insurance: {
    provider: "Blue Cross Shield",
    memberId: "BCS-9948201",
  },
  vitals: {
    weight: 74, // kg
    height: 178, // cm
    bloodType: "O+",
    systolicBP: 120,
    diastolicBP: 80,
    restingHeartRate: 68,
  },
  medicalConditions: [
    { id: "1", name: "Mild Seasonal Allergies", notes: "Managed with OTC antihistamines during spring." },
  ],
  surgeries: [
    { id: "1", procedure: "Appendectomy", date: "2018-09-12" },
  ],
  medications: [
    { id: "1", name: "Vitamin D3", dosage: "2000 IU", schedule: "Daily with morning meal" },
    { id: "2", name: "Omega-3 Fish Oil", dosage: "1000 mg", schedule: "Twice daily" },
  ],
  allergies: ["Penicillin", "Dust Mites"],
  vaccinations: [
    { id: "1", name: "COVID-19 Booster (Pfizer)", date: "2023-10-15" },
    { id: "2", name: "Influenza Vaccine", date: "2023-11-01" },
    { id: "3", name: "Tetanus (Tdap)", date: "2020-04-20" },
  ],
};

export function useHealthProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["health-profile"],
    queryFn: async () => {
      try {
        return await api.profile();
      } catch {
        // Return initial structure if backend endpoint not wired yet
        return DEFAULT_PROFILE;
      }
    },
    initialData: DEFAULT_PROFILE,
  });

  const updateMutation = useMutation({
    mutationFn: async (updated: Partial<HealthProfile>) => {
      try {
        return await api.updateProfile(updated);
      } catch {
        // Fallback for UI responsiveness when backend endpoint is not yet mounted
        const current = query.data ?? DEFAULT_PROFILE;
        return { ...current, ...updated };
      }
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["health-profile"], newData);
    },
  });

  return {
    profile: query.data ?? DEFAULT_PROFILE,
    isLoading: query.isLoading,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
