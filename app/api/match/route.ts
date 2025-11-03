import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  return a.toLowerCase() === b.toLowerCase() ? 1 : 0;
}

function arraySimilarity(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const overlap = a.filter((item) => b.includes(item)).length;
  return overlap / Math.max(a.length, b.length);
}

function computeScore(u: any, c: any): number {
  let score = 0;
  score += 1 * similarity(u.connectionStyles, c.connectionStyles);
  score += 1 * similarity(u.communicationStyles, c.communicationStyles);
  score += 1 * similarity(u.socialStyles, c.socialStyles);
  score += 0.5 * similarity(u.healthAndFitness, c.healthAndFitness);
  score += 0.5 * similarity(u.family, c.family);
  score += 0.5 * similarity(u.spirituality, c.spirituality);
  score += 0.5 * similarity(u.politicalNews, c.politicalNews);
  score += 0.5 * similarity(u.incorrectHumor, c.incorrectHumor);
  score += 1 * arraySimilarity(u.kindOfPeople, c.kindOfPeople);
  if (u.cafeId && u.cafeId === c.cafeId) score += 1;
  return score;
}

function formGroups(users: any[], groupSize = 3) {
  const groups: any[] = [];
  const used = new Set<string>();

  for (let i = 0; i < users.length; i++) {
    if (used.has(users[i].id)) continue;
    const seed = users[i];
    const candidates = users
      .filter((u) => u.id !== seed.id && !used.has(u.id))
      .map((u) => ({
        ...u,
        score: computeScore(seed, u),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, groupSize - 1);

    const group = [seed, ...candidates];
    group.forEach((u) => used.add(u.id));

    groups.push({
      members: group,
      avgScore:
        group.reduce((sum, u, _, arr) => {
          const others = arr.filter((x) => x.id !== u.id);
          const total = others.reduce((s, o) => s + computeScore(u, o), 0);
          return sum + total / others.length;
        }, 0) / group.length,
    });
  }

  return groups.sort((a, b) => b.avgScore - a.avgScore);
}

export async function POST(req: NextRequest) {
  try {
    const { userId, mode = "single" } = await req.json();

    // Get base user (for single mode)
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null;

    // Fetch relevant users
    const users = await prisma.user.findMany({
      where: {
        ...(user
          ? { city: user.city, country: user.country, id: { not: user.id } }
          : {}),
        isLoggedIn: true,
      },
    });

    if (!users.length)
      return NextResponse.json({ message: "No users found" }, { status: 404 });

    // ---------- 1:1 MATCH ----------
    if (mode === "single" && user) {
      const scored = users.map((c) => ({
        user: c,
        score: computeScore(user, c),
      }));
      scored.sort((a, b) => b.score - a.score);
      return NextResponse.json({
        success: true,
        type: "single",
        matches: scored.slice(0, 5),
      });
    }

    // ---------- GROUP MATCH ----------
    if (mode === "group") {
      const groups = formGroups(users);
      return NextResponse.json({
        success: true,
        type: "group",
        totalGroups: groups.length,
        groups: groups.map((g) => ({
          avgScore: g.avgScore.toFixed(2),
          members: g.members.map((m: any) => ({
            id: m.id,
            name: m.name,
            city: m.city,
            cafeId: m.cafeId,
          })),
        })),
      });
    }

    return NextResponse.json(
      { error: "Invalid mode or missing userId" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Match error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
