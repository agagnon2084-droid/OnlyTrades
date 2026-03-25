import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/keywords/suggestions?q=<query>
 * Returns the most-used offer keywords across all active posts
 * that match the optional query string. Creates a virtuous matching loop —
 * users see what others are offering and can seek those same things.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase().trim() || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Fetch all active posts' offer keywords
    const posts = await prisma.post.findMany({
      where: { status: "ACTIVE" },
      select: { offerKeywords: true },
    });

    // Count keyword frequency
    const freq = new Map<string, number>();
    for (const post of posts) {
      for (const kw of post.offerKeywords) {
        const normalized = kw.toLowerCase().trim();
        if (!q || normalized.includes(q)) {
          freq.set(normalized, (freq.get(normalized) || 0) + 1);
        }
      }
    }

    // Sort by frequency and return top N
    const suggestions = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([keyword, count]) => ({ keyword, count }));

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
