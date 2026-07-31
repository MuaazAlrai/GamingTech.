export type RepairTicket = {
  id: string;
  repairId: string;
  jobNumber?: string;
  ticketNumber?: string;
  invoiceNumber?: string;
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
  physicalDeviceId?: string;
  currentTechnicianId?: string;
  timeline?: RepairTimelineEvent[];
  statusHistory?: RepairStatusHistoryEntry[];
  technicianAssignmentHistory?: RepairTechnicianAssignment[];
  partsUsed?: RepairPartUsed[];
  repairNotes?: RepairNote[];
  payments?: RepairPayment[];
  invoiceItems?: RepairInvoiceItem[];
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

export type RepairStatusHistoryEntry = {
  id: string;
  date: string;
  status: string;
  label?: string;
  note?: string;
  technician?: string;
  technicianId?: string;
  changedByName?: string;
  changedByEmail?: string;
  changedByUid?: string;
  progress?: number;
};

export type RepairTechnicianAssignment = {
  id: string;
  date: string;
  technician: string;
  technicianId?: string;
  assignedBy?: string;
  note?: string;
};

export type RepairNote = {
  id: string;
  date: string;
  note: string;
  author?: string;
  visibility?: "internal" | "customer";
};

export type RepairPayment = {
  id: string;
  date: string;
  amount: number;
  method: string;
  note?: string;
  cashierId?: string;
  cashierName?: string;
};

export type RepairInvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  type?: "labour" | "part" | "other";
  partId?: string;
};
