export type StaffActivity = {
  id: string;
  date: string;
  userId: string;
  userName: string;
  role: "admin" | "employee";
  action: string;
  details: string;
  reference?: string;
};

export type CashShift = {
  id: string;
  userId: string;
  cashierName: string;
  role: "admin" | "employee";
  openedAt: string;
  openingCash: number;
  status: "open" | "closed";
  closedAt?: string;
  expectedCash?: number;
  countedCash?: number;
  difference?: number;
  note?: string;
};
