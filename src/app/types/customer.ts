export type Customer = {
  id: string;
  name: string;
  phone: string;
  address?: string;
  description?: string;
  email?: string;
  totalRepairs?: number;
  totalSpent?: number;
  createdAt?: string;
};

export type CustomerPayment = {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  method: string;
  note?: string;
  cashierId?: string;
  cashierName?: string;
  shiftId?: string;
};
