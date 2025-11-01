// Table: printable ASCII characters (33–126)
function makeTable(): string[] {
  const table: string[] = [];
  for (let i = 33; i <= 126; i++) table.push(String.fromCharCode(i));
  return table;
}

function letterToNum(ch: string, table: string[]) {
  return table.indexOf(ch);
}

function numToLetter(num: number, table: string[]) {
  return table[((num % table.length) + table.length) % table.length];
}

// Euclidean GCD
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// Modular inverse
function modInverse(a: number, m: number): number {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
  throw new Error("No modular inverse found for determinant — invalid key matrix.");
}

// Determinant (recursive, mod-safe)
function determinant(matrix: number[][], mod: number): number {
  const n = matrix.length;
  if (n === 1) return matrix[0][0] % mod;
  if (n === 2)
    return (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) % mod;

  let det = 0;
  for (let c = 0; c < n; c++) {
    const minor = matrix.slice(1).map(row => row.filter((_, j) => j !== c));
    const sign = c % 2 === 0 ? 1 : -1;
    det = (det + sign * matrix[0][c] * determinant(minor, mod)) % mod;
  }
  return ((det % mod) + mod) % mod;
}

// Matrix-vector multiplication mod m
function multiplyMatrixVector(matrix: number[][], vector: number[], mod: number): number[] {
  const result = Array(matrix.length).fill(0);
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < vector.length; j++) {
      result[i] = (result[i] + matrix[i][j] * vector[j]) % mod;
    }
  }
  return result;
}

// Cofactor matrix
function cofactorMatrix(matrix: number[][], mod: number): number[][] {
  const n = matrix.length;
  const cofactors = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minor = matrix
        .filter((_, r) => r !== i)
        .map(row => row.filter((_, c) => c !== j));
      const sign = (i + j) % 2 === 0 ? 1 : -1;
      cofactors[i][j] = (sign * determinant(minor, mod) + mod) % mod;
    }
  }
  return cofactors;
}

// Transpose
function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

// Inverse matrix mod m
function inverseMatrix(matrix: number[][], mod: number): number[][] {
  const det = determinant(matrix, mod);
  const detInv = modInverse(det, mod);
  const cof = cofactorMatrix(matrix, mod);
  const adjugate = transpose(cof);
  const inv = adjugate.map(row => row.map(x => (x * detInv) % mod));
  return inv.map(row => row.map(x => ((x % mod) + mod) % mod));
}

// 🔸 Hill Encrypt (any n×n, with GCD validation)
export function hill_encrypt(text: string, key: number[][]) {
  const table = makeTable();
  const m = table.length;
  const n = key.length;

  if (key.some(row => row.length !== n))
    throw new Error("Key matrix must be square (n×n)");

  const det = determinant(key, m);
  if (gcd(det, m) !== 1)
    throw new Error("Invalid key: GCD(det(K), table.length) ≠ 1, matrix not invertible.");

  let cleanText = text;
  while (cleanText.length % n !== 0) cleanText += " "; // pad

  let encrypted = "";

  for (let i = 0; i < cleanText.length; i += n) {
    const block = cleanText.slice(i, i + n).split("").map(ch => letterToNum(ch, table));
    const cipherNums = multiplyMatrixVector(key, block, m);
    encrypted += cipherNums.map(num => numToLetter(num, table)).join("");
  }

  return encrypted;
}

// 🔸 Hill Decrypt (any n×n, also safe)
export function hill_decrypt(ciphertext: string, key: number[][]) {
  const table = makeTable();
  const m = table.length;
  const n = key.length;

  if (key.some(row => row.length !== n))
    throw new Error("Key matrix must be square (n×n)");

  const det = determinant(key, m);
  if (gcd(det, m) !== 1)
    throw new Error("Invalid key: GCD(det(K), table.length) ≠ 1, matrix not invertible.");

  const invKey = inverseMatrix(key, m);
  let decrypted = "";

  for (let i = 0; i < ciphertext.length; i += n) {
    const block = ciphertext.slice(i, i + n).split("").map(ch => letterToNum(ch, table));
    const plainNums = multiplyMatrixVector(invKey, block, m);
    decrypted += plainNums.map(num => numToLetter(num, table)).join("");
  }

  return decrypted;
}
// pour rendre le format de la cle de n1,n2;n3... a [n,m;n,m]
export function parseHillKey(keyString: string): number[][] {
  return keyString
    .split(";")              // split rows
    .map(row => row.split(",").map(num => Number(num)));  // split columns and convert to numbers
}
