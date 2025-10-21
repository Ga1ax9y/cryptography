const PI = [
    0xFC, 0xEE, 0xDD, 0x11, 0xCF, 0x6E, 0x31, 0x16, 0xFB, 0xC4, 0xFA, 0xDA, 0x23, 0xC5, 0x04, 0x4D,
    0xE9, 0x77, 0xF0, 0xDB, 0x93, 0x2E, 0x99, 0xBA, 0x17, 0x36, 0xF1, 0xBB, 0x14, 0xCD, 0x5F, 0xC1,
    0xF9, 0x18, 0x65, 0x5A, 0xE2, 0x5C, 0xEF, 0x21, 0x81, 0x1C, 0x3C, 0x42, 0x8B, 0x01, 0x8E, 0x4F,
    0x05, 0x84, 0x02, 0xAE, 0xE3, 0x6A, 0x8F, 0xA0, 0x06, 0x0B, 0xED, 0x98, 0x7F, 0xD4, 0xD3, 0x1F,
    0xEB, 0x34, 0x2C, 0x51, 0xEA, 0xC8, 0x48, 0xAB, 0xF2, 0x2A, 0x68, 0xA2, 0xFD, 0x3A, 0xCE, 0xCC,
    0xB5, 0x70, 0x0E, 0x56, 0x08, 0x0C, 0x76, 0x12, 0xBF, 0x72, 0x13, 0x47, 0x9C, 0xB7, 0x5D, 0x87,
    0x15, 0xA1, 0x96, 0x29, 0x10, 0x7B, 0x9A, 0xC7, 0xF3, 0x91, 0x78, 0x6F, 0x9D, 0x9E, 0xB2, 0xB1,
    0x32, 0x75, 0x19, 0x3D, 0xFF, 0x35, 0x8A, 0x7E, 0x6D, 0x54, 0xC6, 0x80, 0xC3, 0xBD, 0x0D, 0x57,
    0xDF, 0xF5, 0x24, 0xA9, 0x3E, 0xA8, 0x43, 0xC9, 0xD7, 0x79, 0xD6, 0xF6, 0x7C, 0x22, 0xB9, 0x03,
    0xE0, 0x0F, 0xEC, 0xDE, 0x7A, 0x94, 0xB0, 0xBC, 0xDC, 0xE8, 0x28, 0x50, 0x4E, 0x33, 0x0A, 0x4A,
    0xA7, 0x97, 0x60, 0x73, 0x1E, 0x00, 0x62, 0x44, 0x1A, 0xB8, 0x38, 0x82, 0x64, 0x9F, 0x26, 0x41,
    0xAD, 0x45, 0x46, 0x92, 0x27, 0x5E, 0x55, 0x2F, 0x8C, 0xA3, 0xA5, 0x7D, 0x69, 0xD5, 0x95, 0x3B,
    0x07, 0x58, 0xB3, 0x40, 0x86, 0xAC, 0x1D, 0xF7, 0x30, 0x37, 0x6B, 0xE4, 0x88, 0xD9, 0xE7, 0x89,
    0xE1, 0x1B, 0x83, 0x49, 0x4C, 0x3F, 0xF8, 0xFE, 0x8D, 0x53, 0xAA, 0x90, 0xCA, 0xD8, 0x85, 0x61,
    0x20, 0x71, 0x67, 0xA4, 0x2D, 0x2B, 0x09, 0x5B, 0xCB, 0x9B, 0x25, 0xD0, 0xBE, 0xE5, 0x6C, 0x52,
    0x59, 0xA6, 0x74, 0xD2, 0xE6, 0xF4, 0xB4, 0xC0, 0xD1, 0x66, 0xAF, 0xC2, 0x39, 0x4B, 0x63, 0xB6
];

const C = Array.from({ length: 12 }, (_, i) => {
    const c = new Uint8Array(64);
    for (let j = 0; j < 64; j++) {
        c[j] = (i * 64 + j) * 0x01010101 & 0xFF;
    }
    return c;
});

function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function stringToBytes(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

function xor(a, b) {
    const result = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}

function S(data) {
    const result = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
        result[i] = PI[data[i]];
    }
    return result;
}

function P(data) {
    const result = new Uint8Array(64);
    const tau = [
        0, 8, 16, 24, 32, 40, 48, 56,
        1, 9, 17, 25, 33, 41, 49, 57,
        2, 10, 18, 26, 34, 42, 50, 58,
        3, 11, 19, 27, 35, 43, 51, 59,
        4, 12, 20, 28, 36, 44, 52, 60,
        5, 13, 21, 29, 37, 45, 53, 61,
        6, 14, 22, 30, 38, 46, 54, 62,
        7, 15, 23, 31, 39, 47, 55, 63
    ];
    for (let i = 0; i < 64; i++) {
        result[i] = data[tau[i]];
    }
    return result;
}

function L(data) {
    const result = new Uint8Array(64);
    const A = [
        0x8e20faa72ba0b470n, 0x47107ddd9b505a38n, 0xad08b0e0c3282d1cn, 0xd8045870ef14980en,
        0x6c022c38f90a4c07n, 0x3601161cf205268dn, 0x1b8e0b0e798c13c8n, 0x83478b07b2468764n
    ];

    for (let i = 0; i < 8; i++) {
        let r = 0n;
        for (let j = 0; j < 8; j++) {
            r = (r << 8n) | BigInt(data[i * 8 + j]);
        }

        let t = 0n;
        for (let j = 0; j < 64; j++) {
            if ((r >> BigInt(j)) & 1n) {
                t ^= A[j >> 3] >> BigInt(j & 7);
            }
        }

        for (let j = 0; j < 8; j++) {
            result[i * 8 + j] = Number((t >> BigInt(56 - j * 8)) & 0xFFn);
        }
    }

    return result;
}

function KeySchedule(K, i) {
    K = xor(K, C[i]);
    K = S(K);
    K = P(K);
    K = L(K);
    return K;
}

function E(K, m) {
    let state = xor(K, m);

    for (let i = 0; i < 12; i++) {
        state = S(state);
        state = P(state);
        state = L(state);
        K = KeySchedule(K, i);
        state = xor(state, K);
    }

    return state;
}

function g(N, m, h) {
    let K = xor(h, N);
    K = S(K);
    K = P(K);
    K = L(K);

    const t = E(K, m);
    const t_xor_h = xor(t, h);
    const G = xor(t_xor_h, m);

    return G;
}

function addMod512(a, b) {
    let aBig = 0n;
    let bBig = 0n;

    for (let i = 0; i < 64; i++) {
        aBig = (aBig << 8n) | BigInt(a[i]);
        bBig = (bBig << 8n) | BigInt(b[i]);
    }

    const mod = (1n << 512n) - 1n;
    const result = (aBig + bBig) & mod;

    const resultBytes = new Uint8Array(64);
    let temp = result;
    for (let i = 63; i >= 0; i--) {
        resultBytes[i] = Number(temp & 0xFFn);
        temp >>= 8n;
    }
    return resultBytes;
}

export function gost3411(message, size = 512) {
    let h, N, Sigma;

    if (size === 512) {
        h = new Uint8Array(64);
    } else {
        h = new Uint8Array(64);
        h.fill(0x01);
    }

    N = new Uint8Array(64);
    Sigma = new Uint8Array(64);

    let msgBytes = stringToBytes(message);
    let msgLength = msgBytes.length;
    let msgIndex = 0;

    while (msgLength - msgIndex >= 64) {
        const m = msgBytes.slice(msgIndex, msgIndex + 64);
        h = g(N, m, h);

        const N_inc = new Uint8Array(64);
        N_inc[63] = 0x02; 
        N = addMod512(N, N_inc);

        Sigma = addMod512(Sigma, m);
        msgIndex += 64;
    }

    const m = new Uint8Array(64);
    const remainingLength = msgLength - msgIndex;
    if (remainingLength > 0) {
        m.set(msgBytes.slice(msgIndex, msgLength));
    }

    m[remainingLength] = 0x01;

    h = g(N, m, h);

    const lengthBytes = new Uint8Array(64);
    const bitLength = remainingLength * 8;
    for (let i = 0; i < 8; i++) {
        lengthBytes[63 - i] = (bitLength >> (i * 8)) & 0xFF;
    }
    N = addMod512(N, lengthBytes);

    Sigma = addMod512(Sigma, m);

    h = g(new Uint8Array(64), N, h);
    h = g(new Uint8Array(64), Sigma, h);

    if (size === 256) {
        return bytesToHex(h.slice(32, 64));
    }
    return bytesToHex(h);
}
