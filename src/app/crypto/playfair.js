"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunked = chunked;
exports.createSquareFromKey = createSquareFromKey;
exports.normalizeInput = normalizeInput;
exports.chooseFiller = chooseFiller;
exports.preparePairs = preparePairs;
exports.encryptPair = encryptPair;
exports.decryptPair = decryptPair;
exports.playfairEncrypt = playfairEncrypt;
exports.playfairDecrypt = playfairDecrypt;
function chunked(s, n) {
    var result = [];
    for (var i = 0; i < s.length; i += n) {
        result.push(s.slice(i, i + n));
    }
    return result;
}
function createSquareFromKey(key, size, mergeJ) {
    if (size === void 0) { size = 5; }
    if (mergeJ === void 0) { mergeJ = true; }
    key = (key || "").toUpperCase();
    var allowed;
    if (size === 5) {
        if (mergeJ)
            key = key.replace(/J/g, "I");
        allowed = mergeJ
            ? "ABCDEFGHIKLMNOPQRSTUVWXYZ" // no J
            : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    else if (size === 6) {
        allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    }
    else {
        throw new Error("size doit être 5 ou 6");
    }
    var seen = [];
    for (var _i = 0, key_1 = key; _i < key_1.length; _i++) {
        var ch = key_1[_i];
        if (allowed.includes(ch) && !seen.includes(ch)) {
            seen.push(ch);
        }
    }
    for (var _a = 0, allowed_1 = allowed; _a < allowed_1.length; _a++) {
        var ch = allowed_1[_a];
        if (!seen.includes(ch))
            seen.push(ch);
    }
    var square = [];
    for (var i = 0; i < size * size; i += size) {
        square.push(seen.slice(i, i + size));
    }
    var positions = {};
    for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
            positions[square[r][c]] = [r, c];
        }
    }
    return { square: square, positions: positions };
}
function normalizeInput(text, size, mergeJ) {
    if (size === void 0) { size = 5; }
    if (mergeJ === void 0) { mergeJ = true; }
    var s = text.toUpperCase();
    if (size === 5 && mergeJ)
        s = s.replace(/J/g, "I");
    var allowed = new Set(size === 5 && mergeJ
        ? "ABCDEFGHIKLMNOPQRSTUVWXYZ".split("")
        : (size === 6
            ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            : "ABCDEFGHIJKLMNOPQRSTUVWXYZ").split(""));
    return Array.from(s).filter(function (ch) { return allowed.has(ch); }).join("");
}
function chooseFiller(letters, size) {
    if (size === void 0) { size = 5; }
    var allowed = size === 5
        ? "ABCDEFGHIKLMNOPQRSTUVWXYZ"
        : "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    if (!letters.includes("X"))
        return "X";
    for (var _i = 0, allowed_2 = allowed; _i < allowed_2.length; _i++) {
        var ch = allowed_2[_i];
        if (!letters.includes(ch))
            return ch;
    }
    return "Z";
}
function preparePairs(textLetters, filler) {
    if (filler === void 0) { filler = "X"; }
    var pairs = [];
    var i = 0;
    while (i < textLetters.length) {
        var a = textLetters[i];
        var b = textLetters[i + 1];
        if (!b) {
            pairs.push([a, filler]);
            i += 1;
        }
        else if (a === b) {
            pairs.push([a, filler]);
            i += 1;
        }
        else {
            pairs.push([a, b]);
            i += 2;
        }
    }
    return pairs;
}
function encryptPair(pair, square, positions, size) {
    var a = pair[0], b = pair[1];
    var _a = positions[a], r1 = _a[0], c1 = _a[1];
    var _b = positions[b], r2 = _b[0], c2 = _b[1];
    if (r1 === r2) {
        return [square[r1][(c1 + 1) % size], square[r2][(c2 + 1) % size]];
    }
    if (c1 === c2) {
        return [square[(r1 + 1) % size][c1], square[(r2 + 1) % size][c2]];
    }
    return [square[r1][c2], square[r2][c1]];
}
function decryptPair(pair, square, positions, size) {
    var a = pair[0], b = pair[1];
    var _a = positions[a], r1 = _a[0], c1 = _a[1];
    var _b = positions[b], r2 = _b[0], c2 = _b[1];
    if (r1 === r2) {
        return [square[r1][(c1 - 1 + size) % size], square[r2][(c2 - 1 + size) % size]];
    }
    if (c1 === c2) {
        return [square[(r1 - 1 + size) % size][c1], square[(r2 - 1 + size) % size][c2]];
    }
    return [square[r1][c2], square[r2][c1]];
}
function playfairEncrypt(message, key, size, mergeJ) {
    if (size === void 0) { size = 5; }
    if (mergeJ === void 0) { mergeJ = true; }
    var _a = createSquareFromKey(key, size, mergeJ), square = _a.square, positions = _a.positions;
    var originalUpper = message.toUpperCase();
    var jPositions = Array.from(originalUpper).map(function (ch, i) { return (ch === "J" ? i : -1); }).filter(function (i) { return i >= 0; });
    var letters = normalizeInput(message, size, mergeJ);
    var filler = chooseFiller(letters, size);
    var pairs = preparePairs(letters, filler);
    var insertedPositions = pairs
        .map(function (p, i) { return (p[1] === filler ? 2 * i + 1 : -1); })
        .filter(function (i) { return i >= 0; });
    var xAddedEndFlag = letters.length % 2 === 1;
    var cipherChars = [];
    for (var _i = 0, pairs_1 = pairs; _i < pairs_1.length; _i++) {
        var p = pairs_1[_i];
        var _b = encryptPair(p, square, positions, size), ca = _b[0], cb = _b[1];
        cipherChars.push(ca, cb);
    }
    var ciphertext = cipherChars.join("");
    return {
        ciphertext: ciphertext,
        meta: {
            key: key,
            size: size,
            mergeJ: mergeJ,
            filler: filler,
            xAddedEnd: xAddedEndFlag,
            insertedFillerPositions: insertedPositions,
            jPositions: jPositions,
        },
    };
}
function playfairDecrypt(ciphertext, key, size, mergeJ, meta) {
    if (size === void 0) { size = 5; }
    if (mergeJ === void 0) { mergeJ = true; }
    var _a = createSquareFromKey(key, size, mergeJ), square = _a.square, positions = _a.positions;
    var t = normalizeInput(ciphertext, size, mergeJ);
    var pairs = [];
    for (var i = 0; i < t.length; i += 2) {
        pairs.push([t[i], t[i + 1]]);
    }
    var plainChars = [];
    for (var _i = 0, pairs_2 = pairs; _i < pairs_2.length; _i++) {
        var p = pairs_2[_i];
        var _b = decryptPair(p, square, positions, size), pa = _b[0], pb = _b[1];
        plainChars.push(pa, pb);
    }
    var plain = plainChars.join("");
    if (meta) {
        var filler = meta.filler, insertedFillerPositions = meta.insertedFillerPositions, jPositions = meta.jPositions;
        var inserted_1 = new Set(insertedFillerPositions);
        plain = Array.from(plain)
            .filter(function (_, idx) { return !inserted_1.has(idx); })
            .join("");
        if (plain.endsWith(filler))
            plain = plain.slice(0, -1);
        var plainArr = Array.from(plain);
        for (var _c = 0, jPositions_1 = jPositions; _c < jPositions_1.length; _c++) {
            var pos = jPositions_1[_c];
            if (pos < plainArr.length)
                plainArr[pos] = "J";
        }
        plain = plainArr.join("");
    }
    return plain;
}
