import { AppData } from "./types";

const today = new Date().toISOString().slice(0, 10);

export const seedData: AppData = {
  stockEntries: [
    { id: "s1", inventoryId: "i1", quantity: 5, unitCost: 430, supplier: "RoseDen Original", batchId: "b1", notes: "Opening stock", stockedAt: today },
    { id: "s2", inventoryId: "i2", quantity: 1, unitCost: 180, supplier: "Sani Abacha Street", batchId: "b1", notes: "Opening stock", stockedAt: today },
    { id: "s3", inventoryId: "i3", quantity: 2, unitCost: 320, supplier: "Conakry", batchId: "b1", notes: "Opening stock", stockedAt: today },
    { id: "s4", inventoryId: "i4", quantity: 8, unitCost: 95, supplier: "Malama Thomas Street", notes: "Opening stock", stockedAt: today },
  ],
  batches: [
    { id: "b1", name: "Freetown Stock - June 7", source: "Freetown", purchaseDate: today, totalCost: 1025, transportCost: 75, channels: ["WhatsApp Status", "Facebook", "Instagram"], notes: "New weekend stock post" },
  ],
  customers: [
    { id: "c1", name: "Mariama Kamara", phone: "+232 76 234 901", address: "Wilberforce, Freetown", notes: "Prefers WhatsApp", measurements: { bust: 36, waist: 29, hips: 41, shoulder: 15, height: 65 } },
    { id: "c2", name: "Hawa Sesay", phone: "+232 79 112 405", address: "Lumley, Freetown", notes: "Regular customer", measurements: { bust: 38, waist: 31, hips: 43, shoulder: 16, height: 64 } },
    { id: "c3", name: "Aminata Bangura", phone: "+232 77 805 221", address: "Hill Station", notes: "", measurements: { bust: 34, waist: 27, hips: 38, shoulder: 14, height: 63 } },
  ],
  inventory: [
    { id: "i1", name: "Adire wrap dress", category: "dress", costPrice: 430, sellingPrice: 850, quantity: 4, availableQuantity: 4, reservedQuantity: 0, soldQuantity: 1, totalQuantity: 5, supplier: "RoseDen Original", lowStockAt: 2, status: "available", size: "M-L", color: "Blue / cream", supplierPhotoUrl: "", shopPhotoUrl: "", tryOnUrl: "", batchId: "b1" },
    { id: "i2", name: "Gold evening bag", category: "bag", costPrice: 180, sellingPrice: 350, quantity: 1, availableQuantity: 1, reservedQuantity: 0, soldQuantity: 0, totalQuantity: 1, supplier: "Sani Abacha Street", lowStockAt: 2, status: "available", size: "One size", color: "Gold", supplierPhotoUrl: "", shopPhotoUrl: "", tryOnUrl: "", batchId: "b1" },
    { id: "i3", name: "Burgundy heels", category: "shoes", costPrice: 320, sellingPrice: 600, quantity: 2, availableQuantity: 2, reservedQuantity: 0, soldQuantity: 0, totalQuantity: 2, supplier: "Conakry", lowStockAt: 2, status: "available", size: "39", color: "Burgundy", supplierPhotoUrl: "", shopPhotoUrl: "", tryOnUrl: "", batchId: "b1" },
    { id: "i4", name: "Cream linen fabric", category: "fabric", costPrice: 95, sellingPrice: 160, quantity: 8, availableQuantity: 8, reservedQuantity: 0, soldQuantity: 0, totalQuantity: 8, supplier: "Malama Thomas Street", lowStockAt: 3, status: "available", size: "Per yard", color: "Cream", supplierPhotoUrl: "", shopPhotoUrl: "", tryOnUrl: "" },
  ],
  orders: [
    { id: "o1", customerId: "c1", description: "Wedding guest fitted dress", type: "tailoring", total: 1250, paid: 750, cost: 420, dueDate: today, status: "in progress", notes: "Final fitting Thursday", quantity: 1, channel: "Referral", color: "Burgundy", size: "Custom", deliveryPlan: "pickup", createdAt: today, payments: [{ id: "p1", orderId: "o1", amount: 750, method: "cash", paidAt: today, notes: "Deposit" }] },
    { id: "o2", customerId: "c2", description: "Adire wrap dress", type: "ready-made", total: 850, paid: 850, cost: 430, dueDate: today, status: "delivered", notes: "", inventoryId: "i1", quantity: 1, channel: "WhatsApp Status", color: "Blue / cream", size: "M-L", deliveryPlan: "delivery", createdAt: today, payments: [{ id: "p2", orderId: "o2", amount: 850, method: "Orange Money", paidAt: today, notes: "Paid in full" }] },
    { id: "o3", customerId: "c3", description: "RD-O-004 redesigned two-piece", type: "original", total: 980, paid: 500, cost: 300, dueDate: today, status: "ready", notes: "Send pickup message", quantity: 1, channel: "Instagram", color: "Black / gold", size: "M", deliveryPlan: "pickup", createdAt: today, payments: [{ id: "p3", orderId: "o3", amount: 500, method: "cash", paidAt: today, notes: "Deposit" }] },
  ],
  expenses: [
    { id: "e1", date: today, category: "transport", amount: 75, notes: "Fabric collection" },
    { id: "e2", date: today, category: "tailoring labor", amount: 220, notes: "Two finished pieces" },
    { id: "e3", date: `${today.slice(0, 8)}01`, category: "internet", amount: 180, notes: "Monthly data" },
  ],
};
