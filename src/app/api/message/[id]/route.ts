import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { content, algorithm, key } = await req.json();

    const existing = await prisma.message.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );

    const updated = await prisma.message.update({
      where: { id },
      data: {
        content: content ?? existing.content,
        algorithm: algorithm ?? existing.algorithm,
        key: key ?? existing.key,
      },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to update message" },
      { status: 500 }
    );
  }
}
