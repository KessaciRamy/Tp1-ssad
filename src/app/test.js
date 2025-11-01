"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hill_1 = require("./crypto/hill");
var hill_2 = require("./crypto/hill");
var key = [
    [6, 24, 1],
    [13, 16, 10],
    [20, 17, 15],
];
var id = 42;
var cipher = (0, hill_1.hill_encrypt)("Licence informatique", key, id);
console.log("🔒 Cipher:", cipher);
var plain = (0, hill_2.hill_decrypt)(cipher, key, id);
console.log("🔓 Plain:", plain);
