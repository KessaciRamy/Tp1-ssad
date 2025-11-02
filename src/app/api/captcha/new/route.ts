import { NextResponse } from "next/server";

const STORE = globalThis.__horseCaptchaStore || new Map<string, any>();
globalThis.__horseCaptchaStore = STORE;

export async function POST() {
  const token = crypto.randomUUID();
  const correctSeq = [0, 1, 2, 3]; // real logical order
  const shuffledIds = [...correctSeq].sort(() => Math.random() - 0.5); // clone before sorting
  const expiresAt = Date.now() + 1000 * 60; // 1 min TTL

  STORE.set(token, { correctSeq, expiresAt });

  return NextResponse.json({ token, shuffledIds });
}
