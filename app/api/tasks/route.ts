import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// ─── Validation schemas ──────────────────────────────────────────────────────

const CreateTaskSchema = z.object({
  text: z
    .string()
    .min(1, "Teks tugas tidak boleh kosong")
    .max(500)
    .transform((s) => s.trim()),
  priority: z.enum(["high", "medium", "low"]),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  category: z
    .string()
    .max(50)
    .transform((s) => s.trim() || null)
    .optional()
    .nullable(),
});

// ─── GET /api/tasks — list all tasks for authenticated user ──────────────────

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data });
}

// ─── POST /api/tasks — create a task ────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Validasi gagal.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const { text, priority, dueDate, category } = parsed.data;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      text,
      priority,
      completed: false,
      due_date: dueDate ?? null,
      category: category ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data }, { status: 201 });
}
