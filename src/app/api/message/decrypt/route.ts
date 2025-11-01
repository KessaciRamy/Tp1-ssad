import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { ceasar_decrypt } from "@/app/crypto/ceasar";
import { hill_decrypt, parseHillKey } from "@/app/crypto/hill";
import { playfairDecrypt } from "@/app/crypto/playfair";

const prisma = new PrismaClient();

export async function POST( req: Request) {
    try{
      const { messageId, algorithm, key} = await req.json();

      const message = await prisma.message.findUnique({
        where : { id: messageId },
      });
      
      if (!message) return NextResponse.json({ success: false, error: "Message not found" });

      let decryptedContent = message.content;

      switch(algorithm) {
        case "Ceasar": decryptedContent = ceasar_decrypt(message.content, parseInt(key));
        break;
        case "Hill":
                    const parsedKey = parseHillKey(key);
                    decryptedContent = hill_decrypt(message.content, parsedKey);
        break;
        case "Playfair":
                    const meta = JSON.parse(message.key);
                    decryptedContent = playfairDecrypt(message.content, meta);
        break;
        default:
                    return NextResponse.json(
                    { success: false, error: "Unknown algorithm" },
                    { status: 400 }
            )
      }
      return NextResponse.json({ success: true, decryptedContent });
    } catch(error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to decrypt" },
      { status: 500 }
    );
  }
}