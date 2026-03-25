import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Category, PostType, PostStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category") as Category | null;
    const type = searchParams.get("type") as PostType | null;
    const status = (searchParams.get("status") as PostStatus) || "ACTIVE";
    const search = searchParams.get("search") || "";
    const userIdParam = searchParams.get("userId") || undefined;
    const sort = searchParams.get("sort") || "newest";

    // Resolve "me" to actual session user id
    let userId = userIdParam;
    if (userIdParam === "me") {
      const session = await auth();
      userId = session?.user?.id;
    }

    const where: Record<string, unknown> = { status };
    if (category) where.category = category;
    if (type) where.type = type;
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { offerKeywords: { has: search.toLowerCase() } },
        { seekKeywords: { has: search.toLowerCase() } },
      ];
    }

    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" as const }
        : { createdAt: "desc" as const };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, type, offerKeywords, seekKeywords, images, estimatedValue } = body;

    if (!title || !description || !category || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        description,
        category,
        type,
        offerKeywords: offerKeywords || [],
        seekKeywords: seekKeywords || [],
        images: images || [],
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        userId: session.user.id,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
