function rotateLeft(n, s) {
    return ((n << s) | (n >>> (32 - s))) >>> 0;
}

function wordsToBytes(words) {
    const bytes = new Uint8Array(words.length * 4);
    for (let i = 0; i < words.length; i++) {
        bytes[i * 4] = (words[i] >>> 24) & 0xFF;
        bytes[i * 4 + 1] = (words[i] >>> 16) & 0xFF;
        bytes[i * 4 + 2] = (words[i] >>> 8) & 0xFF;
        bytes[i * 4 + 3] = words[i] & 0xFF;
    }
    return bytes;
}

function stringToBytes(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function sha1(message) {
    const K = [
        0x5A827999,
        0x6ED9EBA1,
        0x8F1BBCDC,
        0xCA62C1D6
    ];

    let H = [
        0x67452301,
        0xEFCDAB89,
        0x98BADCFE,
        0x10325476,
        0xC3D2E1F0
    ];

    let bytes = stringToBytes(message);
    const originalBitLength = bytes.length * 8;

    const padded = new Uint8Array(bytes.length + 1);
    padded.set(bytes);
    padded[bytes.length] = 0x80;
    bytes = padded;

    const zeroPadding = (56 - (bytes.length % 64) + 64) % 64;
    const temp = new Uint8Array(bytes.length + zeroPadding);
    temp.set(bytes);
    bytes = temp;

    const lengthBytes = new Uint8Array(8);
    const length = originalBitLength;
    for (let i = 0; i < 8; i++) {
        lengthBytes[7 - i] = (length >>> (i * 8)) & 0xFF;
    }

    const finalBytes = new Uint8Array(bytes.length + 8);
    finalBytes.set(bytes);
    finalBytes.set(lengthBytes, bytes.length);
    bytes = finalBytes;

    for (let i = 0; i < bytes.length; i += 64) {
        const block = bytes.slice(i, i + 64);
        const W = new Array(80);

        for (let t = 0; t < 16; t++) {
            W[t] = (
                (block[t * 4] << 24) |
                (block[t * 4 + 1] << 16) |
                (block[t * 4 + 2] << 8) |
                (block[t * 4 + 3])
            ) >>> 0;
        }

        for (let t = 16; t < 80; t++) {
            W[t] = rotateLeft(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
        }

        let [a, b, c, d, e] = H;

        for (let t = 0; t < 80; t++) {
            let f, k;

            if (t < 20) {
                f = (b & c) | (~b & d);
                k = K[0];
            } else if (t < 40) {
                f = b ^ c ^ d;
                k = K[1];
            } else if (t < 60) {
                f = (b & c) | (b & d) | (c & d);
                k = K[2];
            } else {
                f = b ^ c ^ d;
                k = K[3];
            }

            const temp = (rotateLeft(a, 5) + f + e + k + W[t]) >>> 0;
            e = d;
            d = c;
            c = rotateLeft(b, 30);
            b = a;
            a = temp;
        }

        H[0] = (H[0] + a) >>> 0;
        H[1] = (H[1] + b) >>> 0;
        H[2] = (H[2] + c) >>> 0;
        H[3] = (H[3] + d) >>> 0;
        H[4] = (H[4] + e) >>> 0;
    }

    const resultBytes = wordsToBytes(H);
    return bytesToHex(resultBytes);
}
