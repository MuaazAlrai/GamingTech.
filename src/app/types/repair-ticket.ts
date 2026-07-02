export type RepairTicket = {
  id: string;
  repairId: string;
  openStatus: string;
  customer: string;
  device: string;
  issue: string;
  status: string;
  priority: string;
  technician: string;
  createdAt: string;
  estimatedCompletion: string;
  amount: number;
  customerPhone?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  accessories?: string;
};
