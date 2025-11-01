import { NextRequest, NextResponse } from "next/server";

const STORE = globalThis.__horseCaptchaStore || new Map<string, any>();
// ensure same store reference if module reloaded (dev)
globalThis.__horseCaptchaStore = STORE;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, sequence } = body as { token?: string; sequence?: number[] };

  if (!token || !Array.isArray(sequence) || sequence.length !== 4) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const entry = STORE.get(token);
  if (!entry) {
    return NextResponse.json({ error: "Captcha expired or invalid" }, { status: 400 });
  }

  const { correctSeq, expiresAt } = entry as { correctSeq: number[]; expiresAt: number };

  if (Date.now() > expiresAt) {
    STORE.delete(token);
    return NextResponse.json({ error: "Captcha expired" }, { status: 400 });
  }

  // compare sequences exactly
  const ok = sequence.length === correctSeq.length && sequence.every((v, i) => v === correctSeq[i]);

  // use-once token: delete regardless of OK or not to prevent replay
  STORE.delete(token);

  if (ok) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Incorrect order" }, { status: 401 });
  }
}
