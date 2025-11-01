import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ceasar_encrypt } from "@/app/crypto/ceasar";
import { hill_encrypt, parseHillKey } from "@/app/crypto/hill";
import { playfairEncrypt } from "@/app/crypto/playfair";
const prisma = new PrismaClient();

//Methode POST pour envoyer les messages encrypted

export async function POST(req: Request) {
    try{
        const data = await req.json();
        const { content, algorithm, key} = data;
        let encryptedContent = content;
        let finalKey = key;
        switch (algorithm) {
            case "Ceasar": encryptedContent = ceasar_encrypt( content, parseInt(key));
            break;
            case "Hill": 
                            const parsedKey = parseHillKey(key)
                            encryptedContent = hill_encrypt(content, parsedKey);
            break;
            case "Playfair": 
                            const result = playfairEncrypt( content, key);
                            encryptedContent = JSON.stringify(result.ciphertext);
                            finalKey = JSON.stringify(result.meta)
            break;
            default:
                    return NextResponse.json(
                    { success: false, error: "Unknown algorithm" },
                    { status: 400 }
                    );
        }
        
        const message = await prisma.message.create({
            data: {
                content: encryptedContent,
                algorithm,
                key: finalKey
            },
        });
        return NextResponse.json({ success: true, message});
    }
    catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to save message" }, { status: 500 });
  }
}

//methode de GET pour recevoir les messages de la bdd baby

export async function GET() { 
    try{
        const messages = await prisma.message.findMany();
        return NextResponse.json({ success: true, messages})
    }
    catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 });
    }
}