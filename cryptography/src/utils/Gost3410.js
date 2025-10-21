
import { gost3411 } from "./Gost3411";
const CURVE_PARAMS = {
    p: 0x00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDC7n,
    a: 0x00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDC4n,
    b: 0x00E8C2505DEDFC86DDC1BD0B2B6667F1DA34B82574761CB0E879BD081CFD0B6265EE3CB090F30D27614CB4574010DA90DD862EF9D4EBEE4761503190785A71C760n,
    q: 0x00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF27E69532F48D89116FF22B8D4E0560609B4B38ABFAD2B85DCACDB1411F10B275n,
    x: 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003n,
    y: 0x7503CFE87A836AE3A61B8816E25450E6CE5E1C93ACF1ABC1778064FDCBEFA921DF1626BE4FD036E93D75E6A50E3A41E98028FE5FC235F5B889A589CB5215F2A4n
};

function mod(a, b) {
    const result = a % b;
    return result >= 0n ? result : result + b;
}

function modInverse(a, m) {
    let [old_r, r] = [a, m];
    let [old_s, s] = [1n, 0n];
    let [old_t, t] = [0n, 1n];

    while (r !== 0n) {
        const division = old_r / r;
        [old_r, r] = [r, old_r - division * r];
        [old_s, s] = [s, old_s - division * s];
        [old_t, t] = [t, old_t - division * t];
    }

    if (old_r !== 1n) throw new Error('Обратный элемент не существует');
    return mod(old_s, m);
}

function modMul(a, b, m) {
    return mod(a * b, m);
}

class ECPoint {
    constructor(x, y, isInfinity = false) {
        this.x = x;
        this.y = y;
        this.isInfinity = isInfinity;
    }

    static get INFINITY() {
        return new ECPoint(0n, 0n, true);
    }

    equals(other) {
        if (this.isInfinity && other.isInfinity) return true;
        if (this.isInfinity || other.isInfinity) return false;
        return this.x === other.x && this.y === other.y;
    }

    add(other) {
        if (this.isInfinity) return other;
        if (other.isInfinity) return this;

        const { p, a } = CURVE_PARAMS;

        if (this.x === other.x) {
            if (this.y === other.y) {
                if (this.y === 0n) return ECPoint.INFINITY;
                const lambda = modMul(
                    modMul(3n, modMul(this.x, this.x, p), p) + a,
                    modInverse(modMul(2n, this.y, p), p),
                    p
                );
                const x3 = mod(modMul(lambda, lambda, p) - modMul(2n, this.x, p), p);
                const y3 = mod(modMul(lambda, mod(this.x - x3, p), p) - this.y, p);
                return new ECPoint(x3, y3);
            } else {
                return ECPoint.INFINITY;
            }
        }

        const lambda = modMul(
            other.y - this.y,
            modInverse(mod(other.x - this.x, p), p),
            p
        );
        const x3 = mod(modMul(lambda, lambda, p) - this.x - other.x, p);
        const y3 = mod(modMul(lambda, mod(this.x - x3, p), p) - this.y, p);

        return new ECPoint(x3, y3);
    }

    multiply(k) {
        if (k === 0n || this.isInfinity) return ECPoint.INFINITY;

        let result = ECPoint.INFINITY;
        let addend = this;

        while (k > 0n) {
            if (k & 1n) {
                result = result.add(addend);
            }
            addend = addend.add(addend);
            k = k >> 1n;
        }

        return result;
    }
}

const G = new ECPoint(CURVE_PARAMS.x, CURVE_PARAMS.y);

export function generateKeyPair() {
    const { q } = CURVE_PARAMS;

    const privateKey = generateRandomBigInt(1n, q - 1n);

    const publicKey = G.multiply(privateKey);

    return {
        privateKey: privateKey.toString(16).toUpperCase(),
        publicKey: {
            x: publicKey.x.toString(16).toUpperCase(),
            y: publicKey.y.toString(16).toUpperCase()
        }
    };
}

function generateRandomBigInt(min, max) {
    const range = max - min;
    const bits = range.toString(2).length;
    const bytes = Math.ceil(bits / 8);

    let randomValue = 0n;
    const randomBytes = new Uint8Array(bytes);

    do {
        crypto.getRandomValues(randomBytes);
        randomValue = 0n;
        for (let i = 0; i < bytes; i++) {
            randomValue = (randomValue << 8n) | BigInt(randomBytes[i]);
        }
    } while (randomValue > range);

    return randomValue + min;
}

export function sign(message, privateKeyHex) {
    const { q } = CURVE_PARAMS;
    const privateKey = BigInt('0x' + privateKeyHex);

    const hashHex = gost3411(message, 512);
    let e = BigInt('0x' + hashHex) % q;
    if (e === 0n) e = 1n;

    let r, s;
    do {
        const k = generateRandomBigInt(1n, q - 1n);

        const R = G.multiply(k);
        r = R.x % q;
        if (r === 0n) continue;

        s = modMul(k, e, q) + modMul(r, privateKey, q);
        s %= q;

    } while (r === 0n || s === 0n);

    return {
        r: r.toString(16).toUpperCase(),
        s: s.toString(16).toUpperCase()
    };
}

export function verify(message, signature, publicKey) {
    const { q } = CURVE_PARAMS;
    const { r, s } = signature;

    const rBig = BigInt('0x' + r);
    const sBig = BigInt('0x' + s);

    if (rBig <= 0n || rBig >= q || sBig <= 0n || sBig >= q) {
        return false;
    }

    const hashHex = gost3411(message, 512);
    let e = BigInt('0x' + hashHex) % q;
    if (e === 0n) e = 1n;

    const v = modInverse(e, q);

    const z1 = modMul(sBig, v, q);
    const z2 = modMul(mod(-rBig, q), v, q);

    const publicKeyPoint = new ECPoint(
        BigInt('0x' + publicKey.x),
        BigInt('0x' + publicKey.y)
    );

    const R = G.multiply(z1).add(publicKeyPoint.multiply(z2));

    if (R.isInfinity) return false;

    const R_x_mod_q = R.x % q;
    return R_x_mod_q === rBig;
}
