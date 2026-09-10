export interface User {
  name: string;
  email: string;
}

export interface HistoryItem {
  file: string;
  query: string;
  analysis: string;
  agents?: {
    medical: string;
    verification: string;
    nutrition: string;
    exercise: string;
  };
  markers?: Marker[];
  timestamp: string;
}

export interface Marker {
  name: string;
  value: number;
  unit: string;
  range: [number, number];
  status: "Low" | "High" | "Normal";
}

export interface AnalysisResult {
  id: string;
  date: string;
  title: string;
  source: string;
  agents: {
    medical: string;
    verification: string;
    nutrition: string;
    exercise: string;
  };
  markers: Marker[];
}
