import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { ceasar_encrypt } from "@/app/crypto/ceasar";

const prisma = new PrismaClient();
const key = 3;

export async function POST(req:NextRequest) {
  
        const { username, password } = await req.json();
        const user = await prisma.user.findFirst({
            where: { username },
        });
        if(!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
        }
        const encryptedInput = ceasar_encrypt(password, key);

        if (encryptedInput !== user.password) {
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
        }

            return NextResponse.json({ success: true, message: "Authentication successful", username: user.username });
        }