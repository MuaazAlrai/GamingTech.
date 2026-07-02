export type PosSaleItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type PosSale = {
  id: string;
  date: string;
  items: PosSaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
};
