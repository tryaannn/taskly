import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

const LoginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi").max(128),
});

export async function POST(req: NextRequest) {
  // Rate limit: 10 attempts per 15 minutes per IP (stricter per email below)
  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const ipRl = rateLimit(`login:ip:${ip}`, 10, 15 * 60 * 1_000);
  if (!ipRl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((ipRl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request tidak valid." },
      { status: 400 }
    );
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Validasi gagal.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const { email, password } = parsed.data;

  // Per-email rate limit: 5 attempts per 15 minutes
  const emailRl = rateLimit(
    `login:email:${email.toLowerCase()}`,
    5,
    15 * 60 * 1_000
  );
  if (!emailRl.allowed) {
    return NextResponse.json(
      {
        error:
          "Terlalu banyak percobaan untuk akun ini. Coba lagi dalam 15 menit.",
      },
      { status: 429 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Always return a generic message to avoid user enumeration
    return NextResponse.json(
      { error: "Email atau kata sandi salah." },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
