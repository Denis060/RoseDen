import { AppData } from "@/lib/types";
import { money } from "@/lib/format";

export type BusinessInsight = {
  id: string;
  title: string;
  detail: string;
  action: string;
  href: string;
  priority: "urgent" | "important" | "opportunity";
  category: "cash" | "orders" | "inventory" | "profit" | "marketing";
};

const dateValue = (value: string) => new Date(`${value.slice(0, 10)}T12:00:00`).getTime();

export function buildBusinessInsights(data: AppData, now = new Date()): BusinessInsight[] {
  const insights: BusinessInsight[] = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const month = now.toISOString().slice(0, 7);
  const activeOrders = data.orders.filter((order) => order.status !== "cancelled");
  const monthOrders = activeOrders.filter((order) => order.createdAt.startsWith(month));

  const unpaid = activeOrders
    .map((order) => ({ order, balance: Math.max(0, order.total - order.paid) }))
    .filter(({ balance }) => balance > 0)
    .sort((a, b) => b.balance - a.balance);
  const outstanding = unpaid.reduce((sum, item) => sum + item.balance, 0);

  if (outstanding > 0) {
    const largest = unpaid[0];
    const customer = data.customers.find((item) => item.id === largest.order.customerId);
    insights.push({
      id: "collect-balances",
      title: `Collect ${money(outstanding)} in outstanding balances`,
      detail: `${unpaid.length} order${unpaid.length === 1 ? "" : "s"} still need payment. The largest balance is ${money(largest.balance)}${customer ? ` from ${customer.name}` : ""}.`,
      action: "Review balances",
      href: "/admin/reports",
      priority: "urgent",
      category: "cash",
    });
  }

  const overdue = activeOrders.filter((order) =>
    order.dueDate &&
    !["ready", "delivered"].includes(order.status) &&
    dateValue(order.dueDate) < today
  );
  if (overdue.length > 0) {
    const oldest = overdue.toSorted((a, b) => dateValue(a.dueDate) - dateValue(b.dueDate))[0];
    insights.push({
      id: "overdue-orders",
      title: `${overdue.length} order${overdue.length === 1 ? " is" : "s are"} past the due date`,
      detail: `${oldest.description} is the oldest unfinished order. Update its progress or contact the customer today.`,
      action: "Open oldest order",
      href: `/admin/orders/${oldest.id}`,
      priority: "urgent",
      category: "orders",
    });
  }

  const provenLowStock = data.inventory
    .filter((item) => item.availableQuantity <= item.lowStockAt && item.soldQuantity > 0)
    .toSorted((a, b) => b.soldQuantity - a.soldQuantity);
  if (provenLowStock.length > 0) {
    const product = provenLowStock[0];
    insights.push({
      id: "restock-seller",
      title: `Consider restocking ${product.name}`,
      detail: `${product.soldQuantity} sold and only ${product.availableQuantity} available. This is a stronger restock candidate than an item with no recorded sales.`,
      action: "Review product",
      href: `/admin/inventory/${product.id}`,
      priority: "important",
      category: "inventory",
    });
  }

  const weakMargin = data.inventory
    .filter((item) => item.sellingPrice > 0 && item.costPrice > 0)
    .map((item) => ({
      item,
      margin: ((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100,
    }))
    .filter(({ margin }) => margin < 20)
    .toSorted((a, b) => a.margin - b.margin)[0];
  if (weakMargin) {
    insights.push({
      id: "weak-margin",
      title: `${weakMargin.item.name} has a low estimated margin`,
      detail: `Its gross margin is about ${Math.round(weakMargin.margin)}%. Review transport, buying costs, and selling price before the next restock.`,
      action: "Check pricing",
      href: `/admin/inventory/${weakMargin.item.id}`,
      priority: "important",
      category: "profit",
    });
  }

  const revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
  const expenses = data.expenses
    .filter((expense) => expense.date.startsWith(month))
    .reduce((sum, expense) => sum + expense.amount, 0);
  if (revenue > 0 && expenses / revenue >= 0.4) {
    insights.push({
      id: "expense-ratio",
      title: "Expenses are high compared with this month’s sales",
      detail: `${money(expenses)} in expenses equals about ${Math.round((expenses / revenue) * 100)}% of recorded revenue. Review the largest categories before spending more.`,
      action: "Review expenses",
      href: "/admin/expenses",
      priority: "important",
      category: "profit",
    });
  }

  const channelTotals = new Map<string, { orders: number; revenue: number }>();
  for (const order of monthOrders) {
    const current = channelTotals.get(order.channel) || { orders: 0, revenue: 0 };
    channelTotals.set(order.channel, {
      orders: current.orders + 1,
      revenue: current.revenue + order.total,
    });
  }
  const bestChannel = [...channelTotals.entries()].toSorted((a, b) => b[1].revenue - a[1].revenue)[0];
  if (bestChannel && bestChannel[1].orders >= 2) {
    insights.push({
      id: "best-channel",
      title: `${bestChannel[0]} is your strongest channel this month`,
      detail: `${bestChannel[1].orders} orders generated ${money(bestChannel[1].revenue)}. Keep posting there and reuse the product styles that converted.`,
      action: "See channel report",
      href: "/admin/reports",
      priority: "opportunity",
      category: "marketing",
    });
  }

  const hiddenAvailable = data.inventory.filter((item) =>
    item.availableQuantity > 0 && (!item.isPublic || item.publicStatus === "hidden")
  );
  if (hiddenAvailable.length > 0) {
    insights.push({
      id: "publish-products",
      title: `${hiddenAvailable.length} available product${hiddenAvailable.length === 1 ? " is" : "s are"} hidden from the website`,
      detail: "Publishing good photos and prices gives customers more products to order without messaging first.",
      action: "Review inventory",
      href: "/admin/inventory",
      priority: "opportunity",
      category: "marketing",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "record-data",
      title: "Keep recording daily activity",
      detail: "Add orders, payments, inventory, expenses, and customer sources. RoseDen Advisor becomes more useful as the business history grows.",
      action: "Record an order",
      href: "/admin/orders?new=1",
      priority: "opportunity",
      category: "orders",
    });
  }

  const rank = { urgent: 0, important: 1, opportunity: 2 };
  return insights.toSorted((a, b) => rank[a.priority] - rank[b.priority]);
}
