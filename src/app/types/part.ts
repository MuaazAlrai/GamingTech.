export type Part = {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  reorderLevel: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  location: string;
};

export type StockAdjustment = {
  id: string;
  partId: string;
  partName: string;
  date: string;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: "sale" | "sale-edit" | "sale-cancel" | "refund" | "manual" | "stock-receipt";
  reference?: string;
};
