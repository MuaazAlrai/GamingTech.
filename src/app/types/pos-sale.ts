export type PosSaleItem = {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  quantity: number;
  discount?: number;
  itemType?: "repair_service" | "labour" | "diagnosis" | "inspection" | "replacement_part" | "software" | "cleaning" | "other";
  partCode?: string;
  warranty?: string;
  notes?: string;
  repairPartId?: string;
};

export type PosSale = {
  id: string;
  date: string;
  items: PosSaleItem[];
  subtotal: number;
  discount?: number;
  taxRate?: number;
  tax: number;
  total: number;
  paymentMethod: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  paidAmount?: number;
  pendingBalance?: number;
  cashierId?: string;
  cashierName?: string;
  cashierRole?: "admin" | "employee";
  shiftId?: string;
  repairId?: string;
  deviceNumber?: string;
  invoiceType?: "repair" | "sale";
  repairStatus?: string;
  repairProgress?: number;
  diagnosis?: string;
  repairWorkPerformed?: string;
  customerNote?: string;
  status?: "completed" | "cancelled" | "refunded";
  updatedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
};

export type HeldPosSale = {
  id: string;
  heldAt: string;
  items: PosSaleItem[];
  discount: number;
  taxRate: number;
  paymentMethod: string;
  customerId?: string;
  paidAmount?: number;
};
