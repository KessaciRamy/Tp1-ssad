"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var playfair_1 = require("./crypto/playfair");
var _a = (0, playfair_1.playfairEncrypt)("HELLO WORLD", "SECRET"), ciphertext = _a.ciphertext, meta = _a.meta;
console.log("Encrypted:", ciphertext);
var decrypted = (0, playfair_1.playfairDecrypt)(ciphertext, "SECRET", 5, true, meta);
console.log("Decrypted:", decrypted);
