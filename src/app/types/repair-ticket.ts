export type RepairTicket = {
  id: string;
  repairId: string;
  jobNumber?: string;
  ticketNumber?: string;
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
  category?: string;
  deviceNumber?: string;
  deviceColor?: string;
  labourCharges?: number;
  discount?: number;
  paidAmount?: number;
  customerPhone?: string;
  customerDescription?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  accessories?: string;
  issueDescription?: string;
  condition?: string[];
  conditionComment?: string;
  customerId?: string;
  customerEmail?: string;
  customerAddress?: string;
  timeline?: RepairTimelineEvent[];
  partsUsed?: RepairPartUsed[];
};

export type RepairTimelineEvent = {
  date: string;
  status: string;
  note: string;
  technician?: string;
  diagnosis?: string;
  partsAdded?: string;
  progress?: number;
};

export type RepairPartUsed = {
  id: string;
  name: string;
  quantity: number;
  cost: number;
};
