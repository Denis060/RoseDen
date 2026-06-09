import { AppData } from "@/lib/types";

type CsvValue = string | number | boolean | null | undefined;
type CsvRow = Record<string, CsvValue>;

function csvCell(value: CsvValue) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function csvText(rows: CsvRow[]) {
  if (rows.length === 0) return "";
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return [
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
  ].join("\r\n");
}

function download(name: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const stamp = () => new Date().toISOString().slice(0, 10);

export function exportCustomers(data: AppData) {
  const rows = data.customers.map((customer) => ({
    customer_id: customer.id,
    full_name: customer.name,
    phone: customer.phone,
    address: customer.address,
    notes: customer.notes,
    bust_inches: customer.measurements?.bust,
    waist_inches: customer.measurements?.waist,
    hips_inches: customer.measurements?.hips,
    shoulder_inches: customer.measurements?.shoulder,
    height_inches: customer.measurements?.height,
  }));
  download(`roseden-customers-${stamp()}.csv`, csvText(rows), "text/csv;charset=utf-8");
}

export function exportOrders(data: AppData) {
  const rows = data.orders.flatMap((order) => {
    const customer = data.customers.find((item) => item.id === order.customerId);
    const base = {
      order_id: order.id,
      order_date: order.createdAt,
      customer: customer?.name,
      customer_phone: customer?.phone,
      description: order.description,
      order_type: order.type,
      status: order.status,
      sales_channel: order.channel,
      quantity: order.quantity,
      size: order.size,
      color: order.color,
      total_price_nle: order.total,
      estimated_cost_nle: order.cost,
      amount_paid_nle: order.paid,
      balance_nle: Math.max(0, order.total - order.paid),
      due_date: order.dueDate,
      delivery_plan: order.deliveryPlan,
      notes: order.notes,
    };
    return order.payments.length
      ? order.payments.map((payment) => ({
          ...base,
          payment_id: payment.id,
          payment_date: payment.paidAt,
          payment_amount_nle: payment.amount,
          payment_method: payment.method,
          payment_notes: payment.notes,
        }))
      : [base];
  });
  download(`roseden-orders-payments-${stamp()}.csv`, csvText(rows), "text/csv;charset=utf-8");
}

export function exportInventory(data: AppData) {
  const rows = data.inventory.map((item) => ({
    product_id: item.id,
    product_name: item.name,
    category: item.category,
    size: item.size,
    color: item.color,
    cost_price_nle: item.costPrice,
    selling_price_nle: item.sellingPrice,
    available_quantity: item.availableQuantity,
    reserved_quantity: item.reservedQuantity,
    sold_quantity: item.soldQuantity,
    total_quantity: item.totalQuantity,
    supplier: item.supplier,
    low_stock_alert: item.lowStockAt,
    stock_status: item.status,
    website_status: item.publicStatus,
    show_on_website: item.isPublic,
    featured_product: item.isFeatured,
    product_images: item.productImages?.join(" | "),
    buying_trip_id: item.batchId,
  }));
  download(`roseden-inventory-${stamp()}.csv`, csvText(rows), "text/csv;charset=utf-8");
}

export function exportExpenses(data: AppData) {
  const rows = data.expenses.map((expense) => ({
    expense_id: expense.id,
    date: expense.date,
    category: expense.category,
    amount_nle: expense.amount,
    buying_trip_id: expense.batchId,
    notes: expense.notes,
  }));
  download(`roseden-expenses-${stamp()}.csv`, csvText(rows), "text/csv;charset=utf-8");
}

export function exportBuyingTrips(data: AppData) {
  const rows = data.batches.map((batch) => ({
    trip_id: batch.id,
    trip_name: batch.name,
    source: batch.source,
    purchase_date: batch.purchaseDate,
    stock_cost_nle: batch.totalCost,
    transport_cost_nle: batch.transportCost,
    status: batch.status,
    allocation_method: batch.allocationMethod,
    channels: batch.channels.join(" | "),
    notes: batch.notes,
  }));
  download(`roseden-buying-trips-${stamp()}.csv`, csvText(rows), "text/csv;charset=utf-8");
}

export function exportFullBackup(data: AppData) {
  download(
    `roseden-full-backup-${stamp()}.json`,
    JSON.stringify({ exportedAt: new Date().toISOString(), version: 1, data }, null, 2),
    "application/json"
  );
}
