import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useHistory(params?: { page?: number; pageSize?: number; search?: string; reportType?: string }) {
  return useQuery({
    queryKey: ["history", params],
    queryFn: () => api.history(params),
  });
}

