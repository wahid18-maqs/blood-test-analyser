import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAnalyzeReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, query }: { file: File; query: string }) => api.analyze(file, query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}
