import { Customer, Order } from "@/lib/types";
import { money, shortDate } from "@/lib/format";

export type FollowUpType = "balance" | "order_ready" | "overdue" | "review" | "birthday" | "general";

export const followUpLabels: Record<FollowUpType, string> = {
  balance: "Balance reminder",
  order_ready: "Order ready",
  overdue: "Order update",
  review: "Review request",
  birthday: "Birthday message",
  general: "Personal message",
};

export function followUpMessage(type: FollowUpType, customer: Customer, order?: Order) {
  const firstName = customer.name.trim().split(/\s+/)[0] || customer.name;
  const balance = order ? Math.max(0, order.total - order.paid) : 0;

  if (type === "balance" && order) {
    return `Hello ${firstName}, this is a friendly RoseDen Atelier reminder about your ${order.description}. Your remaining balance is ${money(balance)}. Please let us know when you would like to complete the payment. Thank you.`;
  }
  if (type === "order_ready" && order) {
    return `Hello ${firstName}, wonderful news from RoseDen Atelier. Your ${order.description} is ready for ${order.deliveryPlan}. Please let us know what time works best for you.`;
  }
  if (type === "overdue" && order) {
    return `Hello ${firstName}, we are following up about your ${order.description}, which was due on ${shortDate(order.dueDate)}. Please reply so we can confirm the latest ${order.deliveryPlan} arrangement. Thank you for choosing RoseDen Atelier.`;
  }
  if (type === "review" && order) {
    return `Hello ${firstName}, we hope you are enjoying your ${order.description}. Thank you for choosing RoseDen Atelier. We would love to hear how you feel about your piece and service. A short review or photo would mean a lot to us.`;
  }
  if (type === "birthday") {
    return `Happy birthday, ${firstName}. RoseDen Atelier wishes you a beautiful day filled with joy, confidence, and style. We appreciate having you in the RoseDen family.`;
  }
  return `Hello ${firstName}, this is RoseDen Atelier checking in. How are you doing, and how can we help with your next look?`;
}

export function whatsappUrl(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

