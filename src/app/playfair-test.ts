import { playfairEncrypt, playfairDecrypt } from "./crypto/playfair";

const { ciphertext, meta } = playfairEncrypt("HELLO WORLD", "SECRET");
console.log("Encrypted:", ciphertext);

const decrypted = playfairDecrypt(ciphertext, "SECRET", 5, true, meta);
console.log("Decrypted:", decrypted);
