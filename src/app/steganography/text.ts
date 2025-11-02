// --- Zero-width constants ---
 const ZW0 = "\u200B"; // zero-width space -> bit 0
 const ZW1 = "\u200C"; // zero-width non-joiner -> bit 1
 const SEP = "\u200D"; // zero-width joiner (optional separator)

// --- Conversion Functions ---


 function textToBits(s: string): string {
  return Array.from(s)
    .map(c => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}

/**
 * Convert a bit string (length multiple of 8) back to text.
 */
 function bitsToText(bits: string): string {
  let chars: string[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8);
    if (byte.length < 8) break;
    chars.push(String.fromCharCode(parseInt(byte, 2)));
  }
  return chars.join("");
}
function bitsToZW(bits: string): string {
  return Array.from(bits)
    .map(b => (b === "0" ? ZW0 : ZW1))
    .join("");
}

 function zwToBits(s: string): string {
  let out: string[] = [];
  for (const ch of s) {
    if (ch === ZW0) out.push("0");
    else if (ch === ZW1) out.push("1");
  }
  return out.join("");
}

/**
 * Insert zero-width chars (ZW0/ZW1) into cover text.
 * Strategy: after each visible char, insert one bit.
 */
 function embedInCover(coverText: string, payloadBits: string): string {
  if (!payloadBits) return coverText;

  const result: string[] = [];
  let bitIndex = 0;
  const n = payloadBits.length;

  for (const ch of coverText) {
    result.push(ch);
    if (bitIndex < n) {
      result.push(payloadBits[bitIndex] === "0" ? ZW0 : ZW1);
      bitIndex++;
    }
  }

  // If there are remaining bits, append them at the end
  while (bitIndex < n) {
    result.push(payloadBits[bitIndex] === "0" ? ZW0 : ZW1);
    bitIndex++;
  }

  return result.join("");
}

/**
 * Extract all zero-width bits and decode message.
 */
 function extractFromText(stegoText: string): string {
  const bits = zwToBits(stegoText);
  return bitsToText(bits);
}

/**
 * Check how many invisible characters exist in a text.
 */
 function detectZWCount(s: string): number {
  let count = 0;
  for (const ch of s) {
    if (ch === ZW0 || ch === ZW1 || ch === SEP) count++;
  }
  return count;
}

/**
 * Compute approximate embedding capacity.
 * @returns bits capacity and char capacity (1 char = 8 bits)
 */
 function computeCapacity(coverText: string): { bits: number; chars: number } {
  const slots = Math.max(coverText.length - 1, 0);
  return {
    bits: slots,
    chars: Math.floor(slots / 8),
  };
}

const cover = "Hello world!";
const secret = "bro";

// Step 1: convert text → bits
const bits = textToBits(secret);
console.log("Bits:", bits);

// Step 2: embed the bits into the cover text
const stego = embedInCover(cover, bits);
console.log("Stego (invisible chars inside):", stego);

// Step 3: extract the hidden message back
const extracted = extractFromText(stego);
console.log("Extracted text:", extracted);

// Step 4: check invisible count just to confirm
console.log("Invisible chars count:", detectZWCount(stego));

// Optional: show the invisible chars as visible symbols for debugging
const visibleStego = stego
  .replace(/\u200B/g, "[0]")
  .replace(/\u200C/g, "[1]")
  .replace(/\u200D/g, "[SEP]");
console.log("Visible representation:", visibleStego);