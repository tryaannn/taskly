import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

const RegisterSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(80),
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .max(128)
    .regex(/[A-Z]/, "Harus ada 1 huruf kapital")
    .regex(/[0-9]/, "Harus ada 1 angka"),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 attempts per 15 minutes per IP
  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rl = rateLimit(`register:${ip}`, 5, 15 * 60 * 1_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // Validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request tidak valid." },
      { status: 400 }
    );
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Validasi gagal.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const { name, email, password } = parsed.data;

  // Supabase handles bcrypt hashing + salting internally
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    // Map Supabase errors to user-friendly messages
    if (error.message.toLowerCase().includes("already registered")) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
