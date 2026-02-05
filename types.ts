
export interface GasReading {
  id: string;
  timestamp: number;
  value: number; // m3
  imageUrl?: string;
}

export interface UsageStats {
  totalUsage: number;
  averageDaily: number;
  lastReading: number;
  readingCount: number;
}

export enum View {
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  ADD = 'add'
}
