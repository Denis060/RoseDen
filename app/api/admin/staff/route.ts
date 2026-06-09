import { NextRequest, NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

type StaffRole = "admin" | "staff";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function authorizedAdmin(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !secretKey) {
    return { error: jsonError("Staff management is not configured yet.", 503) };
  }

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!accessToken) return { error: jsonError("Please sign in again.", 401) };

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const adminClient = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return { error: jsonError("Your session has expired. Please sign in again.", 401) };
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return { error: jsonError("Only administrators can manage staff accounts.", 403) };
  }

  return { adminClient, currentUser: userData.user };
}

function isDisabled(user: User) {
  return Boolean(user.banned_until && new Date(user.banned_until).getTime() > Date.now());
}

export async function GET(request: NextRequest) {
  const auth = await authorizedAdmin(request);
  if ("error" in auth) return auth.error;

  const { data: profiles, error: profilesError } = await auth.adminClient
    .from("profiles")
    .select("id,full_name,email,role,created_at")
    .order("created_at", { ascending: true });
  if (profilesError) return jsonError(profilesError.message, 400);

  const users: User[] = [];
  let page = 1;
  while (page <= 10) {
    const { data, error } = await auth.adminClient.auth.admin.listUsers({ page, perPage: 100 });
    if (error) return jsonError(error.message, 400);
    users.push(...data.users);
    if (data.users.length < 100) break;
    page += 1;
  }
  const usersById = new Map(users.map((user) => [user.id, user]));

  return NextResponse.json({
    members: (profiles || []).map((profile) => {
      const authUser = usersById.get(profile.id);
      return {
        ...profile,
        email: profile.email || authUser?.email || "",
        disabled: authUser ? isDisabled(authUser) : true,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        is_current_user: profile.id === auth.currentUser.id,
      };
    }),
  });
}

export async function POST(request: NextRequest) {
  const auth = await authorizedAdmin(request);
  if ("error" in auth) return auth.error;

  let body: { fullName?: string; email?: string; password?: string; role?: StaffRole };
  try {
    body = await request.json();
  } catch {
    return jsonError("The staff details could not be read.", 400);
  }

  const fullName = body.fullName?.trim() || "";
  const email = body.email?.trim().toLowerCase() || "";
  const password = body.password || "";
  const role: StaffRole = body.role === "admin" ? "admin" : "staff";

  if (fullName.length < 2) return jsonError("Enter the staff member's full name.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("Enter a valid email address.", 400);
  if (password.length < 8) return jsonError("The starting password must contain at least 8 characters.", 400);

  const { data: created, error: createError } = await auth.adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    const duplicate = createError?.message.toLowerCase().includes("already");
    return jsonError(
      duplicate ? "A staff account already uses this email address." : createError?.message || "The staff account could not be created.",
      400
    );
  }

  const { error: updateError } = await auth.adminClient
    .from("profiles")
    .update({ full_name: fullName, email, role })
    .eq("id", created.user.id);

  if (updateError) {
    await auth.adminClient.auth.admin.deleteUser(created.user.id);
    return jsonError("The login was created but its access could not be assigned. Please try again.", 500);
  }

  return NextResponse.json({ member: { id: created.user.id, full_name: fullName, email, role } });
}

export async function PATCH(request: NextRequest) {
  const auth = await authorizedAdmin(request);
  if ("error" in auth) return auth.error;

  let body: {
    targetUserId?: string;
    action?: "reset_password" | "set_disabled";
    password?: string;
    disabled?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError("The account change could not be read.", 400);
  }

  const targetUserId = body.targetUserId || "";
  if (!targetUserId) return jsonError("Choose a staff account.", 400);

  if (body.action === "reset_password") {
    if (!body.password || body.password.length < 8) {
      return jsonError("The new temporary password must contain at least 8 characters.", 400);
    }
    const { error } = await auth.adminClient.auth.admin.updateUserById(targetUserId, {
      password: body.password,
    });
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ message: "Temporary password updated successfully." });
  }

  if (body.action === "set_disabled") {
    if (targetUserId === auth.currentUser.id && body.disabled) {
      return jsonError("You cannot disable the account you are currently using.", 400);
    }
    const { error } = await auth.adminClient.auth.admin.updateUserById(targetUserId, {
      ban_duration: body.disabled ? "876000h" : "none",
    });
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({
      message: body.disabled ? "Staff login disabled." : "Staff login restored.",
    });
  }

  return jsonError("Choose a supported account action.", 400);
}
