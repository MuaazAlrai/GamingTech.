export type GpuHistoryEvent = {
  date: string;
  status: string;
  note: string;
};

export type GpuItem = {
  id: string;
  model: string;
  status: string;
  customer: string;
  serial: string;
  createdAt?: string;
  updatedAt?: string;
  history?: GpuHistoryEvent[];
};
