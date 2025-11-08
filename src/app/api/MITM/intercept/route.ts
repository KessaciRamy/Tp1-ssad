import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { ceasar_decrypt } from "@/app/crypto/ceasar";
import { hill_decrypt, parseHillKey } from "@/app/crypto/hill";
import { playfairDecrypt } from "@/app/crypto/playfair";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get only the most recent message
    const message = await prisma.message.findFirst({
      orderBy: { id: "desc" },
    });

    if (!message) {
      return NextResponse.json({
        success: false,
        error: "No messages found",
      });
    }

    let decryptedContent = message.content;

    try {
      switch (message.algorithm) {
        case "Ceasar":
          decryptedContent = ceasar_decrypt(message.content, parseInt(message.key));
          break;

        case "Hill":
          const parsedKey = parseHillKey(message.key);
          decryptedContent = hill_decrypt(message.content, parsedKey);
          break;

        case "Playfair":
          const meta = JSON.parse(message.key);
          decryptedContent = playfairDecrypt(
            message.content,
            meta.key,
            meta.size,
            meta.mergeJ,
            meta
          );
          break;

        default:
          decryptedContent = message.content; // Unknown algorithm
      }
    } catch (e) {
      console.error(`Decryption failed for message ID ${message.id}:`, e);
    }

    return NextResponse.json({
      success: true,
      message: { ...message, decryptedContent },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}
