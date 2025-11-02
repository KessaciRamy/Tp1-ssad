import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { ceasar_decrypt } from "@/app/crypto/ceasar";
import { hill_decrypt, parseHillKey } from "@/app/crypto/hill";
import { playfairDecrypt } from "@/app/crypto/playfair";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const messages = await prisma.message.findMany();

    const decryptedMessages = messages.map((msg) => {
      let decryptedContent = msg.content;

      try {
        switch (msg.algorithm) {
          case "Ceasar":
            decryptedContent = ceasar_decrypt(msg.content, parseInt(msg.key));
            break;
          case "Hill":
            const parsedKey = parseHillKey(msg.key);
            decryptedContent = hill_decrypt(msg.content, parsedKey);
            break;
          case "Playfair":
            const meta = JSON.parse(msg.key);
            decryptedContent = playfairDecrypt(
                                                      msg.content,
                                                      meta.key,
                                                      meta.size,
                                                      meta.mergeJ,
                                                      meta
                                                      );
            break;
          default:
            decryptedContent = msg.content; // Unknown algorithm, leave as is
        }
      } catch (e) {
        console.error(`Decryption failed for message ID ${msg.id}:`, e);
      }

      return {
        ...msg,
        decryptedContent,
      };
    });

    return NextResponse.json({ success: true, messages: decryptedMessages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}