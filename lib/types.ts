export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  measurements?: { bust: number; waist: number; hips: number; shoulder: number; height: number };
};

export type OrderStatus = "pending" | "in progress" | "ready" | "delivered" | "cancelled";
export type OrderType = "tailoring" | "ready-made" | "original";
export type SalesChannel = "WhatsApp Status" | "Facebook" | "TikTok" | "Instagram" | "Referral" | "Walk-in" | "Existing Customer" | "Website";
export type ProductStatus = "available" | "reserved" | "paid" | "delivered" | "cancelled";
export type DeliveryPlan = "pickup" | "delivery";

export type Order = {
  id: string;
  customerId: string;
  description: string;
  type: OrderType;
  total: number;
  paid: number;
  cost: number;
  dueDate: string;
  status: OrderStatus;
  notes: string;
  inventoryId?: string;
  quantity: number;
  channel: SalesChannel;
  color: string;
  size: string;
  deliveryPlan: DeliveryPlan;
  createdAt: string;
  payments: Payment[];
};

export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  paidAt: string;
  notes: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  supplier: string;
  lowStockAt: number;
  status: ProductStatus;
  size: string;
  color: string;
  supplierPhotoUrl: string;
  shopPhotoUrl: string;
  tryOnUrl: string;
  batchId?: string;
  availableQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  totalQuantity: number;
};

export type Expense = {
  id: string;
  date: string;
  category: string;
  amount: number;
  notes: string;
};

export type PostBatch = {
  id: string;
  name: string;
  source: string;
  purchaseDate: string;
  totalCost: number;
  transportCost: number;
  channels: SalesChannel[];
  notes: string;
};

export type StockEntry = {
  id: string;
  inventoryId: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  batchId?: string;
  notes: string;
  stockedAt: string;
};

export type AppData = {
  customers: Customer[];
  orders: Order[];
  inventory: InventoryItem[];
  expenses: Expense[];
  batches: PostBatch[];
  stockEntries: StockEntry[];
};
