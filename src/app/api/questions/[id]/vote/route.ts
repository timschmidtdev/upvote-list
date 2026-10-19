import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { withinLimit } from "@/lib/rate-limit";
import { idSchema } from "@/lib/validation";

async function adjustVotes(
  req: Request,
  params: Promise<{ id: string }>,
  delta: 1 | -1,
) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid question id." }, { status: 400 });
  }
  if (!(await withinLimit(req, "vote"))) {
    return NextResponse.json({ error: "Too many votes. Try again later." }, { status: 429 });
  }

  const [row] = await db
    .update(questions)
    .set({
      votes: delta === 1 ? sql`${questions.votes} + 1` : sql`GREATEST(${questions.votes} - 1, 0)`,
    })
    .where(eq(questions.id, id))
    .returning({ votes: questions.votes });

  if (!row) return NextResponse.json({ error: "Question not found." }, { status: 404 });
  return NextResponse.json({ votes: row.votes });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return adjustVotes(req, ctx.params, 1);
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return adjustVotes(req, ctx.params, -1);
}
