import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const UpdateTaskSchema = z.object({
  text: z
    .string()
    .min(1)
    .max(500)
    .transform((s) => s.trim())
    .optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  completed: z.boolean().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  category: z
    .string()
    .max(50)
    .transform((s) => s.trim() || null)
    .nullable()
    .optional(),
});

type Params = { params: Promise<{ id: string }> };

// ─── PATCH /api/tasks/[id] — update task ─────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
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

  const parsed = UpdateTaskSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Validasi gagal.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.text !== undefined) updates.text = parsed.data.text;
  if (parsed.data.priority !== undefined)
    updates.priority = parsed.data.priority;
  if (parsed.data.completed !== undefined) {
    updates.completed = parsed.data.completed;
    updates.completed_at = parsed.data.completed
      ? new Date().toISOString()
      : null;
  }
  if (parsed.data.dueDate !== undefined) updates.due_date = parsed.data.dueDate;
  if (parsed.data.category !== undefined)
    updates.category = parsed.data.category;

  // RLS guarantees user_id ownership, but we add .eq as defense-in-depth
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data });
}

// ─── DELETE /api/tasks/[id] — delete task ────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
