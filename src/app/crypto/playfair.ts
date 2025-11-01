export function chunked(s: string, n: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < s.length; i += n) {
    result.push(s.slice(i, i + n));
  }
  return result;
}

export function createSquareFromKey(key: string, size = 5, mergeJ = true) {
  key = (key || "").toUpperCase();
  let allowed: string;

  if (size === 5) {
    if (mergeJ) key = key.replace(/J/g, "I");
    allowed = mergeJ
      ? "ABCDEFGHIKLMNOPQRSTUVWXYZ" // no J
      : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  } else if (size === 6) {
    allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  } else {
    throw new Error("size doit être 5 ou 6");
  }

  const seen: string[] = [];
  for (const ch of key) {
    if (allowed.includes(ch) && !seen.includes(ch)) {
      seen.push(ch);
    }
  }
  for (const ch of allowed) {
    if (!seen.includes(ch)) seen.push(ch);
  }

  const square: string[][] = [];
  for (let i = 0; i < size * size; i += size) {
    square.push(seen.slice(i, i + size));
  }

  const positions: Record<string, [number, number]> = {};
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions[square[r][c]] = [r, c];
    }
  }

  return { square, positions };
}

export function normalizeInput(text: string, size = 5, mergeJ = true): string {
  let s = text.toUpperCase();
  if (size === 5 && mergeJ) s = s.replace(/J/g, "I");
  const allowed = new Set(
    size === 5 && mergeJ
      ? "ABCDEFGHIKLMNOPQRSTUVWXYZ".split("")
      : (size === 6
          ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
          : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        ).split("")
  );
  return Array.from(s).filter(ch => allowed.has(ch)).join("");
}

export function chooseFiller(letters: string, size = 5): string {
  const allowed = size === 5
    ? "ABCDEFGHIKLMNOPQRSTUVWXYZ"
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  if (!letters.includes("X")) return "X";
  for (const ch of allowed) {
    if (!letters.includes(ch)) return ch;
  }
  return "Z";
}

export function preparePairs(textLetters: string, filler = "X"): [string, string][] {
  const pairs: [string, string][] = [];
  let i = 0;
  while (i < textLetters.length) {
    const a = textLetters[i];
    const b = textLetters[i + 1];
    if (!b) {
      pairs.push([a, filler]);
      i += 1;
    } else if (a === b) {
      pairs.push([a, filler]);
      i += 1;
    } else {
      pairs.push([a, b]);
      i += 2;
    }
  }
  return pairs;
}

export function encryptPair(
  pair: [string, string],
  square: string[][],
  positions: Record<string, [number, number]>,
  size: number
): [string, string] {
  const [a, b] = pair;
  const [r1, c1] = positions[a];
  const [r2, c2] = positions[b];

  if (r1 === r2) {
    return [square[r1][(c1 + 1) % size], square[r2][(c2 + 1) % size]];
  }
  if (c1 === c2) {
    return [square[(r1 + 1) % size][c1], square[(r2 + 1) % size][c2]];
  }
  return [square[r1][c2], square[r2][c1]];
}

export function decryptPair(
  pair: [string, string],
  square: string[][],
  positions: Record<string, [number, number]>,
  size: number
): [string, string] {
  const [a, b] = pair;
  const [r1, c1] = positions[a];
  const [r2, c2] = positions[b];

  if (r1 === r2) {
    return [square[r1][(c1 - 1 + size) % size], square[r2][(c2 - 1 + size) % size]];
  }
  if (c1 === c2) {
    return [square[(r1 - 1 + size) % size][c1], square[(r2 - 1 + size) % size][c2]];
  }
  return [square[r1][c2], square[r2][c1]];
}

export interface PlayfairMeta {
  key: string;
  size: number;
  mergeJ: boolean;
  filler: string;
  xAddedEnd: boolean;
  insertedFillerPositions: number[];
  jPositions: number[];
}

export function playfairEncrypt(
  message: string,
  key: string,
  size = 5,
  mergeJ = true
): { ciphertext: string; meta: PlayfairMeta } {
  const { square, positions } = createSquareFromKey(key, size, mergeJ);
  const originalUpper = message.toUpperCase();
  const jPositions = Array.from(originalUpper).map((ch, i) => (ch === "J" ? i : -1)).filter(i => i >= 0);
  const letters = normalizeInput(message, size, mergeJ);
  const filler = chooseFiller(letters, size);
  const pairs = preparePairs(letters, filler);
  const insertedPositions = pairs
    .map((p, i) => (p[1] === filler ? 2 * i + 1 : -1))
    .filter(i => i >= 0);
  const xAddedEndFlag = letters.length % 2 === 1;

  const cipherChars: string[] = [];
  for (const p of pairs) {
    const [ca, cb] = encryptPair(p, square, positions, size);
    cipherChars.push(ca, cb);
  }
  const ciphertext = cipherChars.join("");

  return {
    ciphertext,
    meta: {
      key,
      size,
      mergeJ,
      filler,
      xAddedEnd: xAddedEndFlag,
      insertedFillerPositions: insertedPositions,
      jPositions,
    },
  };
}

export function playfairDecrypt(
  ciphertext: string,
  key: string,
  size = 5,
  mergeJ = true,
  meta?: PlayfairMeta
): string {
  const { square, positions } = createSquareFromKey(key, size, mergeJ);
  const t = normalizeInput(ciphertext, size, mergeJ);
  const pairs: [string, string][] = [];
  for (let i = 0; i < t.length; i += 2) {
    pairs.push([t[i], t[i + 1]]);
  }

  const plainChars: string[] = [];
  for (const p of pairs) {
    const [pa, pb] = decryptPair(p, square, positions, size);
    plainChars.push(pa, pb);
  }

  let plain = plainChars.join("");

  if (meta) {
    const { filler, insertedFillerPositions, jPositions } = meta;
    const inserted = new Set(insertedFillerPositions);
    plain = Array.from(plain)
      .filter((_, idx) => !inserted.has(idx))
      .join("");
    if (plain.endsWith(filler)) plain = plain.slice(0, -1);
    const plainArr = Array.from(plain);
    for (const pos of jPositions) {
      if (pos < plainArr.length) plainArr[pos] = "J";
    }
    plain = plainArr.join("");
  }

  return plain; 
}
