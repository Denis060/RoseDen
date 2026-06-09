import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type StaffRole = "admin" | "staff";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !secretKey) {
    return jsonError(
      "Staff creation is not configured yet. Add SUPABASE_SECRET_KEY to the server environment.",
      503
    );
  }

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!accessToken) return jsonError("Please sign in again.", 401);

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const adminClient = createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data: userData, error: userError } =
    await authClient.auth.getUser(accessToken);
  const currentUser = userData.user;

  if (userError || !currentUser) {
    return jsonError("Your session has expired. Please sign in again.", 401);
  }

  const { data: currentProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (profileError || currentProfile?.role !== "admin") {
    return jsonError("Only administrators can add staff members.", 403);
  }

  let body: {
    fullName?: string;
    email?: string;
    password?: string;
    role?: StaffRole;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("The staff details could not be read.", 400);
  }

  const fullName = body.fullName?.trim() || "";
  const email = body.email?.trim().toLowerCase() || "";
  const password = body.password || "";
  const role: StaffRole = body.role === "admin" ? "admin" : "staff";

  if (fullName.length < 2) {
    return jsonError("Enter the staff member's full name.", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Enter a valid email address.", 400);
  }
  if (password.length < 8) {
    return jsonError("The starting password must contain at least 8 characters.", 400);
  }

  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (createError || !created.user) {
    const duplicate = createError?.message.toLowerCase().includes("already");
    return jsonError(
      duplicate
        ? "A staff account already uses this email address."
        : createError?.message || "The staff account could not be created.",
      400
    );
  }

  const { error: updateError } = await adminClient
    .from("profiles")
    .update({ full_name: fullName, email, role })
    .eq("id", created.user.id);

  if (updateError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return jsonError(
      "The login was created but its access could not be assigned. Please try again.",
      500
    );
  }

  return NextResponse.json({
    member: {
      id: created.user.id,
      full_name: fullName,
      email,
      role,
      created_at: created.user.created_at,
    },
  });
}
