import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { withinLimit } from "@/lib/rate-limit";
import { createQuestionSchema } from "@/lib/validation";

const noStore = { headers: { "Cache-Control": "no-store" } };

export async function GET() {
  const rows = await db
    .select()
    .from(questions)
    .orderBy(desc(questions.votes), desc(questions.createdAt));
  return NextResponse.json(rows, noStore);
}

export async function POST(req: Request) {
  if (!(await withinLimit(req, "submit"))) {
    return NextResponse.json({ error: "Too many questions. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    // Honeypot tripped: pretend success without storing anything.
    return NextResponse.json(
      { id: crypto.randomUUID(), text: parsed.data.text, votes: 0, createdAt: new Date().toISOString() },
      { status: 201 },
    );
  }

  const [row] = await db.insert(questions).values({ text: parsed.data.text }).returning();
  return NextResponse.json(row, { status: 201 });
}
