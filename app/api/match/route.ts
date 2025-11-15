import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/* -------------------------------------------------------
   SIMILARITY + SCORE FUNCTIONS
------------------------------------------------------- */

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

  score += similarity(u.connectionStyles, c.connectionStyles);
  score += similarity(u.communicationStyles, c.communicationStyles);
  score += similarity(u.socialStyles, c.socialStyles);

  score += 0.5 * similarity(u.healthAndFitness, c.healthAndFitness);
  score += 0.5 * similarity(u.family, c.family);
  score += 0.5 * similarity(u.spirituality, c.spirituality);
  score += 0.5 * similarity(u.politicalNews, c.politicalNews);
  score += 0.5 * similarity(u.incorrectHumor, c.incorrectHumor);

  score += arraySimilarity(u.kindOfPeople, c.kindOfPeople);

  if (u.cafeId && u.cafeId === c.cafeId) score += 1;

  return score;
}

/* -------------------------------------------------------
   GROUP FORMATION
------------------------------------------------------- */

function formGroups(users: any[], groupSize = 3) {
  const groups: any[] = [];
  const used = new Set<string>();

  if (users.length === 0) return [];

  const city = users[0].city;
  const country = users[0].country;

  const filtered = users.filter(
    (u) => u.city === city && u.country === country
  );

  for (let i = 0; i < filtered.length; i++) {
    const seed = filtered[i];
    if (used.has(seed.id)) continue;

    const candidates = filtered
      .filter((u) => u.id !== seed.id && !used.has(u.id))
      .map((u) => ({
        ...u,
        score: computeScore(seed, u),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, groupSize - 1);

    const group = [seed, ...candidates];
    group.forEach((u) => used.add(u.id));

    const avgScore =
      group.length > 1
        ? group.reduce((sum, u, _, arr) => {
            const others = arr.filter((x) => x.id !== u.id);
            const total = others.reduce((s, o) => s + computeScore(u, o), 0);
            return sum + total / others.length;
          }, 0) / group.length
        : 0;

    groups.push({ members: group, avgScore });
  }

  return groups.sort((a, b) => b.avgScore - a.avgScore);
}

/* -------------------------------------------------------
   POST HANDLER (NO MORE PREVIOUS GROUP FILTERING)
------------------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    const { userId, mode = "single", eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    let user: any = null;

    if (mode === "single") {
      if (!userId)
        return NextResponse.json(
          { error: "userId is required for single mode" },
          { status: 400 }
        );

      user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user)
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /* ---------------------------------------------------
       FETCH ELIGIBLE USERS (NO PREVIOUS GROUP FILTERING)
    --------------------------------------------------- */

    const users = await prisma.user.findMany({
      where: {
        payment: { some: { status: "paid" } },

        // Exclude logged-in user (PREVENT SELF-MATCHING)
        id: { not: userId },

        // Match same city + country when user is provided
        ...(user
          ? {
              city: user.city,
              country: user.country,
            }
          : {}),
      },
    });

    if (users.length === 0) {
      return NextResponse.json(
        { message: "No eligible users to match" },
        { status: 404 }
      );
    }

    /* ---------------------------------------------------
       SINGLE MATCHING
    --------------------------------------------------- */

    if (mode === "single" && user) {
      const scored = users
        .map((c) => ({
          user: c,
          score: computeScore(user, c),
        }))
        .sort((a, b) => b.score - a.score);

      return NextResponse.json({
        success: true,
        type: "single",
        matches: scored.slice(0, 5),
      });
    }

    /* ---------------------------------------------------
       GROUP MATCHING
    --------------------------------------------------- */

    const groups = formGroups(users);

    await Promise.all(
      groups.map((group, index) =>
        prisma.matchGroup.create({
          data: {
            eventId,
            members: group.members.map((m: any) => m.id),
            groupNumber: index + 1,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      type: "group",
      totalGroups: groups.length,
      groups: groups.map((g) => ({
        avgScore: g.avgScore.toFixed(2),
        members: g.members.map((m: any) => ({
          id: m.id,
          name: m.name,
          oneLiner: m.oneLiner,
          city: m.city,
          country: m.country,
          cafeId: m.cafeId,
          avatar: m.avatar,
        })),
      })),
    });
  } catch (err) {
    console.error("Match error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
