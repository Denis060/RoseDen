import { AppData, Payment } from "@/lib/types";

export type PaymentRecord = Payment & {
  orderId: string;
  customerId: string;
  description: string;
};

export function paymentRecords(data: AppData): PaymentRecord[] {
  return data.orders.flatMap((order) =>
    order.status === "cancelled"
      ? []
      : order.payments.map((payment) => ({
          ...payment,
          orderId: order.id,
          customerId: order.customerId,
          description: order.description,
        }))
  );
}

export function amountReceivedOn(data: AppData, date: string) {
  return paymentRecords(data)
    .filter((payment) => payment.paidAt.slice(0, 10) === date)
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function amountReceivedInMonth(data: AppData, month: string) {
  return paymentRecords(data)
    .filter((payment) => payment.paidAt.slice(0, 7) === month)
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function businessOutstanding(data: AppData) {
  return data.orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Math.max(0, order.total - order.paid), 0);
}

