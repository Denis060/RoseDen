"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { seedData } from "@/lib/seed";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import { AppData, Customer, Expense, InventoryItem, Order, Payment, PostBatch, ProductStatus, StockEntry } from "@/lib/types";

type Store = {
  data: AppData;
  loading: boolean;
  mode: "demo" | "supabase";
  userEmail: string | null;
  userName: string | null;
  userRole: "admin" | "staff" | null;
  roleLoading: boolean;
  isAdmin: boolean;
  connectionError: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  addCustomer: (item: Omit<Customer, "id">) => Promise<void>;
  updateCustomer: (id: string, item: Omit<Customer, "id">) => Promise<void>;
  addOrder: (item: Omit<Order, "id" | "createdAt" | "payments">) => Promise<void>;
  addStatusOrder: (customer: { id?: string; name: string; phone: string }, item: Omit<Order, "id" | "createdAt" | "customerId" | "payments">) => Promise<void>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
  updateOrder: (id: string, item: Omit<Order, "id" | "createdAt" | "paid" | "payments">) => Promise<void>;
  addPayment: (orderId: string, payment: Omit<Payment, "id" | "orderId" | "paidAt">) => Promise<void>;
  addInventory: (item: Omit<InventoryItem, "id" | "availableQuantity" | "reservedQuantity" | "soldQuantity" | "totalQuantity">) => Promise<void>;
  updateInventory: (id: string, item: Omit<InventoryItem, "id" | "quantity" | "availableQuantity" | "reservedQuantity" | "soldQuantity" | "totalQuantity">) => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
  restockInventory: (inventoryId: string, entry: Omit<StockEntry, "id" | "inventoryId" | "stockedAt">) => Promise<void>;
  adjustInventory: (id: string, amount: number) => Promise<void>;
  updateInventoryStatus: (id: string, status: ProductStatus) => Promise<void>;
  addExpense: (item: Omit<Expense, "id">) => Promise<void>;
  addBatch: (item: Omit<PostBatch, "id">) => Promise<void>;
  remove: (collection: keyof AppData, id: string) => Promise<void>;
};

const DataContext = createContext<Store | null>(null);
const id = () => crypto.randomUUID();
const today = () => new Date().toISOString().slice(0, 10);
const emptyData: AppData = { customers: [], orders: [], inventory: [], expenses: [], batches: [], stockEntries: [] };
const phoneKey = (value: string) => value.replace(/\D/g, "").slice(-8);

function upgradeData(saved: Partial<AppData>): AppData {
  return {
    customers: saved.customers || seedData.customers,
    expenses: saved.expenses || seedData.expenses,
    batches: saved.batches || seedData.batches,
    stockEntries: saved.stockEntries || seedData.stockEntries,
    inventory: (saved.inventory || seedData.inventory).map((item) => ({
      ...item,
      status: item.status || "available",
      size: item.size || "",
      color: item.color || "",
      supplierPhotoUrl: item.supplierPhotoUrl || "",
      shopPhotoUrl: item.shopPhotoUrl || "",
      productImages: item.productImages || (item.shopPhotoUrl ? [item.shopPhotoUrl] : []),
      tryOnUrl: item.tryOnUrl || "",
      availableQuantity: item.availableQuantity ?? item.quantity,
      reservedQuantity: item.reservedQuantity ?? 0,
      soldQuantity: item.soldQuantity ?? 0,
      totalQuantity: item.totalQuantity ?? item.quantity,
      isPublic: item.isPublic ?? false,
      isFeatured: item.isFeatured ?? false,
      publicStatus: item.publicStatus || "hidden",
      publicDescription: item.publicDescription || "",
      slug: item.slug || "",
      sizes: item.sizes || (item.size ? [item.size] : []),
      colors: item.colors || (item.color ? [item.color] : []),
      sourceType: item.sourceType || "ready-made",
    })),
    orders: (saved.orders || seedData.orders).map((order) => ({
      ...order,
      quantity: order.quantity || 1,
      channel: order.channel || "Walk-in",
      color: order.color || "",
      size: order.size || "",
      deliveryPlan: order.deliveryPlan || "pickup",
      payments: order.payments || [],
    })),
  };
}

function mapCustomer(row: any, measurements: any[]): Customer {
  const measurement = measurements.find((item) => item.customer_id === row.id);
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address || "",
    notes: row.notes || "",
    measurements: measurement ? {
      bust: Number(measurement.bust || 0),
      waist: Number(measurement.waist || 0),
      hips: Number(measurement.hips || 0),
      shoulder: Number(measurement.shoulder || 0),
      height: Number(measurement.height || 0),
    } : undefined,
  };
}

function mapInventory(row: any, summary?: any): InventoryItem {
  const available = Number(summary?.available_quantity ?? row.quantity ?? 0);
  const reserved = Number(summary?.reserved_quantity || 0);
  const sold = Number(summary?.sold_quantity || 0);
  return {
    id: row.id,
    name: row.product_name,
    category: row.category,
    costPrice: Number(row.cost_price || 0),
    sellingPrice: Number(row.selling_price || 0),
    quantity: available,
    supplier: row.supplier_source || "",
    lowStockAt: Number(row.low_stock_at || 2),
    status: row.status || "available",
    size: row.size || "",
    color: row.color || "",
    supplierPhotoUrl: row.supplier_photo_url || "",
    shopPhotoUrl: row.shop_photo_url || row.photo_url || "",
    productImages: row.product_images || [row.shop_photo_url, row.supplier_photo_url, row.photo_url].filter(Boolean),
    tryOnUrl: row.try_on_url || "",
    batchId: row.batch_id || undefined,
    availableQuantity: available,
    reservedQuantity: reserved,
    soldQuantity: sold,
    totalQuantity: Number(summary?.total_quantity ?? available + reserved + sold),
    isPublic: Boolean(row.is_public),
    isFeatured: Boolean(row.is_featured),
    publicStatus: row.public_status || "hidden",
    publicDescription: row.public_description || "",
    slug: row.slug || "",
    sizes: row.sizes || (row.size ? [row.size] : []),
    colors: row.colors || (row.color ? [row.color] : []),
    sourceType: row.source_type || "ready-made",
  };
}

function mapBatch(row: any): PostBatch {
  return {
    id: row.id,
    name: row.batch_name,
    source: row.source,
    purchaseDate: row.purchase_date,
    totalCost: Number(row.total_cost || 0),
    transportCost: Number(row.transport_cost || 0),
    channels: row.channels || [],
    notes: row.notes || "",
    status: row.status || "open",
    allocationMethod: row.allocation_method || "per-unit",
  };
}

function mapExpense(row: any): Expense {
  return { id: row.id, date: row.expense_date, category: row.category, amount: Number(row.amount || 0), notes: row.notes || "", batchId: row.batch_id || undefined };
}

function mapStockEntry(row: any): StockEntry {
  return {
    id: row.id,
    inventoryId: row.inventory_id,
    quantity: Number(row.quantity || 0),
    unitCost: Number(row.unit_cost || 0),
    supplier: row.supplier_source || "",
    batchId: row.batch_id || undefined,
    notes: row.notes || "",
    stockedAt: String(row.stocked_at || "").slice(0, 10),
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(hasSupabaseConfig ? emptyData : seedData);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "staff" | null>(null);
  const [roleLoading, setRoleLoading] = useState(hasSupabaseConfig);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const useSupabase = Boolean(supabase && user);
  const isAdmin = !hasSupabaseConfig || userRole === "admin";

  useEffect(() => {
    let active = true;
    async function loadRole() {
      if (!supabase || !user) {
        if (active) {
          setUserName(hasSupabaseConfig ? null : "RoseDen");
          setUserRole(hasSupabaseConfig ? null : "admin");
          setRoleLoading(false);
        }
        return;
      }
      setRoleLoading(true);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name,role")
        .eq("id", user.id)
        .single();
      if (active) {
        const metadataName = String(user.user_metadata?.full_name || "").trim();
        const emailName = user.email?.split("@")[0] || "";
        setUserName(error ? metadataName || emailName : profile.full_name?.trim() || metadataName || emailName);
        setUserRole(error ? null : profile.role);
        setRoleLoading(false);
      }
    }
    loadRole();
    return () => { active = false; };
  }, [user]);

  const refresh = useCallback(async () => {
    if (!ready) return;

    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const [
      customersResult,
      measurementsResult,
      inventoryResult,
      expensesResult,
      batchesResult,
      stockEntriesResult,
      ordersResult,
      paymentsResult,
      orderItemsResult,
      quantitySummaryResult,
    ] = await Promise.all([
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("measurements").select("*"),
      supabase.from("inventory").select("*").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
      supabase.from("post_batches").select("*").order("purchase_date", { ascending: false }),
      supabase.from("inventory_stock_entries").select("*").order("stocked_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*"),
      supabase.from("order_items").select("*"),
      supabase.from("inventory_quantity_summary").select("*"),
    ]);

    const firstError = [
      customersResult.error,
      measurementsResult.error,
      inventoryResult.error,
      expensesResult.error,
      batchesResult.error,
      stockEntriesResult.error,
      ordersResult.error,
      paymentsResult.error,
      orderItemsResult.error,
    ].find(Boolean);

    if (firstError) {
      console.error("Supabase load failed", firstError);
      setConnectionError("Supabase is connected, but the core RoseDen database setup is incomplete. Run migrations 001 through 005.");
      setData(emptyData);
      setLoading(false);
      return;
    }

    const payments = paymentsResult.data || [];
    const orderItems = orderItemsResult.data || [];
    const orders = (ordersResult.data || []).map((row: any): Order => {
      const relatedPayments = payments.filter((payment: any) => payment.order_id === row.id);
      const relatedItems = orderItems.filter((item: any) => item.order_id === row.id);
      const firstItem = relatedItems[0];
      return {
        id: row.id,
        customerId: row.customer_id || "",
        description: row.item_description,
        type: row.order_type,
        total: Number(row.total_price || 0),
        paid: relatedPayments.reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0),
        cost: Number(row.estimated_cost || firstItem?.unit_cost || 0),
        dueDate: row.due_date || today(),
        status: row.status,
        notes: row.notes || "",
        inventoryId: firstItem?.inventory_id || undefined,
        quantity: relatedItems.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0) || 1,
        channel: row.acquisition_channel || "Walk-in",
        color: row.color || "",
        size: row.size || "",
        deliveryPlan: row.delivery_plan || "pickup",
        createdAt: String(row.created_at || today()).slice(0, 10),
        payments: relatedPayments
          .map((payment: any): Payment => ({
            id: payment.id,
            orderId: payment.order_id,
            amount: Number(payment.amount || 0),
            method: payment.payment_method || "cash",
            paidAt: payment.paid_at || row.created_at || today(),
            notes: payment.notes || "",
          }))
          .sort((a: Payment, b: Payment) => b.paidAt.localeCompare(a.paidAt)),
      };
    });

    setData({
      customers: (customersResult.data || []).map((row: any) => mapCustomer(row, measurementsResult.data || [])),
      inventory: (inventoryResult.data || []).map((row: any) =>
        mapInventory(row, (quantitySummaryResult.data || []).find((summary: any) => summary.inventory_id === row.id))
      ),
      expenses: (expensesResult.data || []).map(mapExpense),
      batches: (batchesResult.data || []).map(mapBatch),
      stockEntries: (stockEntriesResult.data || []).map(mapStockEntry),
      orders,
    });
    setConnectionError(quantitySummaryResult.error
      ? "Phase 1 database update is still needed. Run migration 006 to enable accurate reserved and sold quantities."
      : null);
    setLoading(false);
  }, [ready, user]);

  useEffect(() => {
    let active = true;

    async function init() {
      if (!supabase) {
        const saved = localStorage.getItem("roseden-data");
        if (saved) setData(upgradeData(JSON.parse(saved)));
        if (active) {
          setReady(true);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (active) {
          setUser(sessionData.session?.user || null);
          setReady(true);
          if (!sessionData.session?.user) setLoading(false);
        }
      } catch (error) {
        console.error("Could not restore RoseDen session", error);
        if (active) {
          setUser(null);
          setReady(true);
          setLoading(false);
          setConnectionError("Your saved sign-in could not be restored. Please sign in again.");
        }
      }
    }

    init();
    const authListener = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user || null);
      setReady(true);
      if (!session?.user) setLoading(false);
    });
    return () => {
      active = false;
      authListener?.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (ready && !supabase) localStorage.setItem("roseden-data", JSON.stringify(data));
  }, [data, ready]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function insertMeasurement(customerId: string, measurements?: Customer["measurements"]) {
    if (!supabase || !measurements) return;
    await supabase.from("measurements").upsert({
      customer_id: customerId,
      bust: measurements.bust || null,
      waist: measurements.waist || null,
      hips: measurements.hips || null,
      shoulder: measurements.shoulder || null,
      height: measurements.height || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "customer_id" });
  }

  async function findOrCreateCustomer(customer: { id?: string; name: string; phone: string }) {
    if (!supabase) return "";
    if (customer.id) return customer.id;
    const digits = phoneKey(customer.phone);
    const existing = data.customers.find((entry) => digits.length >= 6 && phoneKey(entry.phone) === digits);
    if (existing) return existing.id;
    const { data: inserted, error } = await supabase.from("customers").insert({
      name: customer.name,
      phone: customer.phone,
      address: "",
      notes: "Added from status/social order",
      created_by: user?.id,
    }).select("id").single();
    if (error) throw error;
    return inserted.id;
  }

  async function insertOrder(item: Omit<Order, "id" | "createdAt" | "payments">) {
    if (!supabase) return;
    if (item.inventoryId) {
      const { data: product, error: stockError } = await supabase
        .from("inventory")
        .select("quantity,product_name")
        .eq("id", item.inventoryId)
        .single();
      if (stockError) throw stockError;
      if (Number(product.quantity) < item.quantity) {
        throw new Error(`Only ${product.quantity} ${product.product_name} currently available.`);
      }
    }

    const { data: order, error } = await supabase.from("orders").insert({
      customer_id: item.customerId || null,
      order_type: item.type,
      item_description: item.description,
      total_price: item.total,
      estimated_cost: item.cost,
      due_date: item.dueDate,
      status: item.status,
      notes: item.notes,
      acquisition_channel: item.channel,
      color: item.color,
      size: item.size,
      delivery_plan: item.deliveryPlan,
      created_by: user?.id,
    }).select("id").single();
    if (error) throw error;

    try {
      if (item.inventoryId) {
        const { error: itemError } = await supabase.from("order_items").insert({
          order_id: order.id,
          inventory_id: item.inventoryId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.quantity > 0 ? item.total / item.quantity : item.total,
          unit_cost: item.quantity > 0 ? item.cost / item.quantity : item.cost,
        });
        if (itemError) throw itemError;
      }

      if (item.paid > 0) {
        const { error: paymentError } = await supabase.from("payments").insert({
          order_id: order.id,
          amount: item.paid,
          notes: "Initial payment",
          created_by: user?.id,
        });
        if (paymentError) throw paymentError;
      }
    } catch (cause) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw cause;
    }
  }

  const value = useMemo<Store>(() => ({
    data,
    loading,
    mode: useSupabase ? "supabase" : "demo",
    userEmail: user?.email || null,
    userName,
    userRole,
    roleLoading,
    isAdmin,
    connectionError,
    refresh,
    signOut: async () => {
      await supabase?.auth.signOut();
      setUser(null);
      setUserName(null);
      setUserRole(null);
      setData(hasSupabaseConfig ? emptyData : seedData);
    },
    addCustomer: async (item) => {
      if (useSupabase && supabase) {
        const { data: inserted, error } = await supabase.from("customers").insert({
          name: item.name,
          phone: item.phone,
          address: item.address,
          notes: item.notes,
          created_by: user?.id,
        }).select("id").single();
        if (error) throw error;
        await insertMeasurement(inserted.id, item.measurements);
        await refresh();
        return;
      }
      setData((d) => ({ ...d, customers: [{ ...item, id: id() }, ...d.customers] }));
    },
    updateCustomer: async (customerId, item) => {
      if (useSupabase && supabase) {
        const { error } = await supabase.from("customers").update({
          name: item.name,
          phone: item.phone,
          address: item.address,
          notes: item.notes,
        }).eq("id", customerId);
        if (error) throw error;
        await insertMeasurement(customerId, item.measurements);
        await refresh();
        return;
      }
      setData((d) => ({
        ...d,
        customers: d.customers.map((customer) => customer.id === customerId ? { ...item, id: customerId } : customer),
      }));
    },
    addOrder: async (item) => {
      if (useSupabase) {
        await insertOrder(item);
        await refresh();
        return;
      }
      setData((d) => {
        const orderId = id();
        const payments: Payment[] = item.paid > 0
          ? [{ id: id(), orderId, amount: item.paid, method: "cash", paidAt: new Date().toISOString(), notes: "Initial payment" }]
          : [];
        const order = { ...item, id: orderId, createdAt: today(), payments };
        const inventory = item.inventoryId
          ? d.inventory.map((product) => product.id === item.inventoryId
            ? { ...product, quantity: Math.max(0, product.quantity - item.quantity), availableQuantity: Math.max(0, product.availableQuantity - item.quantity), reservedQuantity: product.reservedQuantity + item.quantity }
            : product)
          : d.inventory;
        return { ...d, orders: [order, ...d.orders], inventory };
      });
    },
    addStatusOrder: async (customer, item) => {
      if (useSupabase) {
        const customerId = await findOrCreateCustomer(customer);
        await insertOrder({ ...item, customerId });
        await refresh();
        return;
      }
      setData((d) => {
        const existing = d.customers.find((entry) =>
          entry.id === customer.id ||
          (phoneKey(customer.phone).length >= 6 && phoneKey(entry.phone) === phoneKey(customer.phone))
        );
        const customerId = existing?.id || id();
        const customers = existing ? d.customers : [{ id: customerId, name: customer.name, phone: customer.phone, address: "", notes: "Added from status/social order" }, ...d.customers];
        const orderId = id();
        const payments: Payment[] = item.paid > 0
          ? [{ id: id(), orderId, amount: item.paid, method: "cash", paidAt: new Date().toISOString(), notes: "Initial payment" }]
          : [];
        const order = { ...item, customerId, id: orderId, createdAt: today(), payments };
        const inventory = item.inventoryId
          ? d.inventory.map((product) => product.id === item.inventoryId
            ? { ...product, quantity: Math.max(0, product.quantity - item.quantity), availableQuantity: Math.max(0, product.availableQuantity - item.quantity), reservedQuantity: product.reservedQuantity + item.quantity }
            : product)
          : d.inventory;
        return { ...d, customers, orders: [order, ...d.orders], inventory };
      });
    },
    updateOrderStatus: async (orderId, status) => {
      if (useSupabase && supabase) {
        const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
        if (error) throw error;
        await refresh();
        return;
      }
      setData((d) => {
        const existing = d.orders.find((order) => order.id === orderId);
        const inventory = existing?.inventoryId
          ? d.inventory.map((item) => {
              if (item.id !== existing.inventoryId) return item;
              if (status === "cancelled" && existing.status !== "cancelled") {
                return { ...item, quantity: item.quantity + existing.quantity, availableQuantity: item.availableQuantity + existing.quantity, reservedQuantity: Math.max(0, item.reservedQuantity - existing.quantity), totalQuantity: Math.max(0, item.totalQuantity - existing.quantity) };
              }
              if (status === "delivered" && existing.status !== "delivered") {
                return { ...item, reservedQuantity: Math.max(0, item.reservedQuantity - existing.quantity), soldQuantity: item.soldQuantity + existing.quantity };
              }
              return item;
            })
          : d.inventory;
        return { ...d, inventory, orders: d.orders.map((order) => order.id === orderId ? { ...order, status } : order) };
      });
    },
    updateOrder: async (orderId, item) => {
      if (useSupabase && supabase) {
        const { error } = await supabase.from("orders").update({
          customer_id: item.customerId || null,
          order_type: item.type,
          item_description: item.description,
          total_price: item.total,
          estimated_cost: item.cost,
          due_date: item.dueDate,
          status: item.status,
          notes: item.notes,
          acquisition_channel: item.channel,
          color: item.color,
          size: item.size,
          delivery_plan: item.deliveryPlan,
        }).eq("id", orderId);
        if (error) throw error;

        const existingLine = await supabase.from("order_items").select("id").eq("order_id", orderId).limit(1).maybeSingle();
        if (existingLine.error) throw existingLine.error;
        const line = {
          inventory_id: item.inventoryId || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.quantity > 0 ? item.total / item.quantity : item.total,
          unit_cost: item.quantity > 0 ? item.cost / item.quantity : item.cost,
        };
        if (existingLine.data) {
          const { error: lineError } = await supabase.from("order_items").update(line).eq("id", existingLine.data.id);
          if (lineError) throw lineError;
        } else if (item.inventoryId) {
          const { error: lineError } = await supabase.from("order_items").insert({ ...line, order_id: orderId });
          if (lineError) throw lineError;
        }
        await refresh();
        return;
      }
      setData((d) => ({
        ...d,
        orders: d.orders.map((order) => order.id === orderId ? { ...order, ...item, paid: order.paid, payments: order.payments } : order),
      }));
    },
    addPayment: async (orderId, payment) => {
      if (useSupabase && supabase) {
        const { error } = await supabase.from("payments").insert({
          order_id: orderId,
          amount: payment.amount,
          payment_method: payment.method,
          notes: payment.notes,
          created_by: user?.id,
        });
        if (error) throw error;
        await refresh();
        return;
      }
      setData((d) => ({
        ...d,
        orders: d.orders.map((order) => order.id === orderId ? {
          ...order,
          paid: order.paid + payment.amount,
          payments: [{ ...payment, id: id(), orderId, paidAt: new Date().toISOString() }, ...order.payments],
        } : order),
      }));
    },
    addInventory: async (item) => {
      if (!isAdmin) throw new Error("Only an administrator can add inventory.");
      if (useSupabase && supabase) {
        const { data: inserted, error } = await supabase.from("inventory").insert({
          product_name: item.name,
          category: item.category,
          cost_price: item.costPrice,
          selling_price: item.sellingPrice,
          quantity: item.quantity,
          supplier_source: item.supplier,
          low_stock_at: item.lowStockAt,
          status: item.status,
          size: item.size,
          color: item.color,
          supplier_photo_url: item.supplierPhotoUrl,
          shop_photo_url: item.shopPhotoUrl,
          product_images: item.productImages || [],
          try_on_url: item.tryOnUrl,
          batch_id: item.batchId || null,
          is_public: item.isPublic,
          is_featured: item.isFeatured,
          public_status: item.publicStatus,
          public_description: item.publicDescription,
          slug: item.slug || null,
          sizes: item.sizes,
          colors: item.colors,
          source_type: item.sourceType,
        }).select("id").single();
        if (error) throw error;
        if (item.quantity > 0) {
          await supabase.from("inventory_stock_entries").insert({
            inventory_id: inserted.id,
            quantity: item.quantity,
            unit_cost: item.costPrice,
            supplier_source: item.supplier,
            batch_id: item.batchId || null,
            notes: "Initial stock",
            created_by: user?.id,
          });
        }
        await refresh();
        return;
      }
      setData((d) => {
        const inventoryId = id();
        return {
          ...d,
          inventory: [{ ...item, id: inventoryId, availableQuantity: item.quantity, reservedQuantity: 0, soldQuantity: 0, totalQuantity: item.quantity }, ...d.inventory],
          stockEntries: item.quantity > 0 ? [{
            id: id(),
            inventoryId,
            quantity: item.quantity,
            unitCost: item.costPrice,
            supplier: item.supplier,
            batchId: item.batchId,
            notes: "Initial stock",
            stockedAt: today(),
          }, ...d.stockEntries] : d.stockEntries,
        };
      });
    },
    updateInventory: async (inventoryId, item) => {
      if (!isAdmin) throw new Error("Only an administrator can edit inventory.");
      if (useSupabase && supabase) {
        const { error } = await supabase.from("inventory").update({
          product_name: item.name,
          category: item.category,
          cost_price: item.costPrice,
          selling_price: item.sellingPrice,
          supplier_source: item.supplier,
          low_stock_at: item.lowStockAt,
          status: item.status,
          size: item.size,
          color: item.color,
          supplier_photo_url: item.supplierPhotoUrl || null,
          shop_photo_url: item.shopPhotoUrl || null,
          product_images: item.productImages || [],
          try_on_url: item.tryOnUrl || null,
          batch_id: item.batchId || null,
          is_public: item.isPublic,
          is_featured: item.isFeatured,
          public_status: item.publicStatus,
          public_description: item.publicDescription,
          slug: item.slug || null,
          sizes: item.sizes,
          colors: item.colors,
          source_type: item.sourceType,
        }).eq("id", inventoryId);
        if (error) throw error;
        await refresh();
        return;
      }
      setData((d) => ({
        ...d,
        inventory: d.inventory.map((inventory) => inventory.id === inventoryId ? { ...inventory, ...item, id: inventoryId } : inventory),
      }));
    },
    uploadProductImage: async (file) => {
      if (!isAdmin) throw new Error("Only an administrator can upload product images.");
      if (!supabase || !user) throw new Error("Sign in to upload product images.");
      if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
      if (file.size > 6 * 1024 * 1024) throw new Error("This photo is still too large. Choose a photo under 6 MB.");
      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/heic": "heic",
        "image/heif": "heif",
      };
      const extension = extensions[file.type] || file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${Date.now()}-${id()}.${extension}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type || undefined,
        upsert: false,
      });
      if (error) {
        if (/bucket not found/i.test(error.message)) throw new Error("The product-images bucket is missing. Run Phase 1 image setup.");
        if (/row-level security|policy/i.test(error.message)) throw new Error("Supabase blocked the upload. Sign in again and check the product-images policies.");
        if (/maximum|size|payload/i.test(error.message)) throw new Error("The image is too large for Supabase Storage.");
        throw new Error(`Image upload failed: ${error.message}`);
      }
      return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    },
    restockInventory: async (inventoryId, entry) => {
      if (!isAdmin) throw new Error("Only an administrator can restock inventory.");
      if (useSupabase && supabase) {
        const { error } = await supabase.rpc("restock_inventory", {
          target_inventory_id: inventoryId,
          stock_quantity: entry.quantity,
          new_unit_cost: entry.unitCost,
          new_supplier_source: entry.supplier,
          target_batch_id: entry.batchId || null,
          stock_notes: entry.notes,
        });
        if (error) throw error;
        await refresh();
        return;
      }
      setData((d) => ({
        ...d,
        stockEntries: [{ ...entry, id: id(), inventoryId, stockedAt: today() }, ...d.stockEntries],
        inventory: d.inventory.map((item) => item.id === inventoryId ? {
          ...item,
          quantity: item.quantity + entry.quantity,
          availableQuantity: item.availableQuantity + entry.quantity,
          totalQuantity: item.totalQuantity + entry.quantity,
          costPrice: entry.unitCost || item.costPrice,
          supplier: entry.supplier || item.supplier,
          batchId: entry.batchId || item.batchId,
          status: "available",
        } : item),
      }));
    },
    adjustInventory: async (itemId, amount) => {
      if (!isAdmin) throw new Error("Only an administrator can adjust inventory.");
      if (useSupabase && supabase) {
        const item = data.inventory.find((entry) => entry.id === itemId);
        if (!item) return;
        const { error } = await supabase.from("inventory").update({ quantity: Math.max(0, item.quantity + amount) }).eq("id", itemId);
        if (error) throw error;
        await refresh();
        return;
      }
      setData((d) => ({ ...d, inventory: d.inventory.map((item) => item.id === itemId ? {
        ...item,
        quantity: Math.max(0, item.quantity + amount),
        availableQuantity: Math.max(0, item.availableQuantity + amount),
        totalQuantity: Math.max(0, item.totalQuantity + amount),
      } : item) }));
    },
    updateInventoryStatus: async (itemId, status) => {
      if (!isAdmin) throw new Error("Only an administrator can change inventory status.");
      if (useSupabase && supabase) {
        const { error } = await supabase.from("inventory").update({ status }).eq("id", itemId);
        if (error) throw error;
        await refresh();
        return;
      }
      setData((d) => ({ ...d, inventory: d.inventory.map((item) => item.id === itemId ? { ...item, status } : item) }));
    },
    addExpense: async (item) => {
      if (useSupabase && supabase) {
        const { error } = await supabase.from("expenses").insert({
          expense_date: item.date,
          category: item.category,
          amount: item.amount,
          notes: item.notes,
          batch_id: item.batchId || null,
          created_by: user?.id,
        });
        if (error) throw error;
        await refresh();
        return;
      }
      setData((d) => ({ ...d, expenses: [{ ...item, id: id() }, ...d.expenses] }));
    },
    addBatch: async (item) => {
      if (!isAdmin) throw new Error("Only an administrator can create buying trips.");
      if (useSupabase && supabase) {
        const { error } = await supabase.from("post_batches").insert({
          batch_name: item.name,
          source: item.source,
          purchase_date: item.purchaseDate,
          total_cost: item.totalCost,
          transport_cost: item.transportCost,
          channels: item.channels,
          notes: item.notes,
          status: item.status || "open",
          allocation_method: item.allocationMethod || "per-unit",
          created_by: user?.id,
        });
        if (error) throw error;
        await refresh();
        return;
      }
      setData((d) => ({ ...d, batches: [{ ...item, id: id() }, ...d.batches] }));
    },
    remove: async (collection, itemId) => {
      if (!isAdmin) throw new Error("Only an administrator can delete records.");
      if (useSupabase && supabase) {
        const tables: Record<keyof AppData, string> = {
          customers: "customers",
          orders: "orders",
          inventory: "inventory",
          expenses: "expenses",
          batches: "post_batches",
          stockEntries: "inventory_stock_entries",
        };
        const { error } = await supabase.from(tables[collection]).delete().eq("id", itemId);
        if (error) throw error;
        await refresh();
        return;
      }
      setData((d) => ({ ...d, [collection]: d[collection].filter((item) => item.id !== itemId) }));
    },
  }), [connectionError, data, isAdmin, loading, refresh, roleLoading, useSupabase, user, userName, userRole]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error("useData must be used inside DataProvider");
  return value;
}
