const CURVE = {
  a: 0n,
  b: 7n,
  p: 115792089237316195423570985008687907853269984665640564039457584007908834671663n,
  n: 115792089237316195423570985008687907852837564279074904382605163141518161494337n,
  G: {
    x: 55066263022277343669578718895168534326250603453777594175500187360389116729240n,
    y: 32670510020758816978083085130507043184471273380659243275938904335757337482424n
  }
};

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

class EG {
  constructor() {
    this.curve = CURVE;
  }

  mod(a, b) {
    const result = ((a % b) + b) % b;
    return result;
  }

  modInverse(a, m) {
    if (m === 0n) {
      throw new Error("modul not zero");
    }
    if (m < 0n) {
      throw new Error("modul not negative");
    }

    a = this.mod(a, m);
    if (a === 0n) {
      throw new Error("cant find inverse of zero");
    }

    let [old_r, r] = [a, m];
    let [old_s, s] = [1n, 0n];

    while (r !== 0n) {
      const quotient = old_r / r;
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
    }

    if (old_r !== 1n) {
      throw new Error("number has no inverse");
    }

    return this.mod(old_s, m);
  }

  isOnCurve(point) {
    if (point.x === null && point.y === null) return true;

    const { a, b, p } = this.curve;
    const left = this.mod(point.y * point.y, p);
    const right = this.mod(this.mod(point.x * point.x * point.x, p) + this.mod(a * point.x, p) + b, p);
    return left === right;
  }

  addPoints(P, Q) {
    const { p } = this.curve;

    if (P.x === null && P.y === null) return Q;
    if (Q.x === null && Q.y === null) return P;

    if (P.x === Q.x && P.y !== Q.y) {
      return new Point(null, null);
    }

    let lambda;
    if (P.equals(Q)) {
      if (P.y === 0n) {
        return new Point(null, null);
      }
      const numerator = this.mod(3n * P.x * P.x + this.curve.a, p);
      const denominator = this.mod(2n * P.y, p);
      lambda = this.mod(numerator * this.modInverse(denominator, p), p);
    } else {
      const numerator = this.mod(Q.y - P.y, p);
      const denominator = this.mod(Q.x - P.x, p);
      lambda = this.mod(numerator * this.modInverse(denominator, p), p);
    }

    const x3 = this.mod(lambda * lambda - P.x - Q.x, p);
    const y3 = this.mod(lambda * (P.x - x3) - P.y, p);

    return new Point(x3, y3);
  }

  multiplyPoint(k, point) {
    if (k === 0n) return new Point(null, null);
    if (k < 0n) {
      const positiveResult = this.multiplyPoint(-k, point);
      return new Point(positiveResult.x, this.mod(-positiveResult.y, this.curve.p));
    }
    if (k === 1n) return new Point(point.x, point.y);

    let result = new Point(null, null);
    let addend = new Point(point.x, point.y);
    let kTemp = k;

    while (kTemp > 0n) {
      if (kTemp & 1n) {
        result = this.addPoints(result, addend);
      }
      addend = this.addPoints(addend, addend);
      kTemp = kTemp >> 1n;
    }

    return result;
  }

  generateKeys() {
    const privateKey = this.generatePrivateKey();
    const publicKey = this.multiplyPoint(privateKey, new Point(this.curve.G.x, this.curve.G.y));

    return {
      privateKey: privateKey.toString(),
      publicKey: publicKey.toString()
    };
  }

  generatePrivateKey() {
    const max = this.curve.n - 1n;
    return 1n + BigInt(Math.floor(Math.random() * Number(max)));
  }

  messageToBigInt(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    let result = 0n;

    for (let i = 0; i < data.length; i++) {
      result = (result << 8n) + BigInt(data[i]);
    }

    return result;
  }

  bigIntToMessage(bigInt) {
    if (bigInt === 0n) {
      return "";
    }

    let temp = bigInt;
    const bytes = [];

    while (temp > 0n) {
      bytes.unshift(Number(temp & 255n));
      temp = temp >> 8n;
    }

    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
  }

  modSqrt(a, p) {
    if (p % 4n === 3n) {
      const r = this.modPow(a, (p + 1n) / 4n, p);
      if (this.mod(r * r, p) === a) return r;
      return null;
    }
    
    return null;
  }

  modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    if (exponent < 0n) {
      return this.modPow(this.modInverse(base, modulus), -exponent, modulus);
    }

    base = this.mod(base, modulus);
    let result = 1n;

    while (exponent > 0n) {
      if (exponent % 2n === 1n) {
        result = this.mod(result * base, modulus);
      }
      exponent = exponent >> 1n;
      base = this.mod(base * base, modulus);
    }

    return result;
  }

  messageToPoint(message) {
    const m = this.messageToBigInt(message);
    if ((m << 8n) >= this.curve.p) {
      throw new Error("too long message");
    }
    for (let i = 0; i < 256; i++) {
      const x = (m << 8n) | BigInt(i);
      const y_sq = this.mod(x*x*x + this.curve.a*x + this.curve.b, this.curve.p);
      const y = this.modSqrt(y_sq, this.curve.p);
      if (y !== null) {
        return new Point(x, y);
      }
    }
      throw new Error("invalid message");
  }

  pointToMessage(point) {
    const m = point.x >> 8n;
    return this.bigIntToMessage(m);
  }

  encrypt(publicKeyStr, message) {
    const publicKey = this.parsePoint(publicKeyStr);

    if (!this.isOnCurve(publicKey)) {
      throw new Error("Public key not on curve");
    }

    const messagePoint = this.messageToPoint(message);

    const k = this.generatePrivateKey();

    //C1=k*G
    const C1 = this.multiplyPoint(k, new Point(this.curve.G.x, this.curve.G.y));

    //C2=M+k*pbkey
    const kTimesPubKey = this.multiplyPoint(k, publicKey);
    const C2 = this.addPoints(messagePoint, kTimesPubKey);

    return {
      C1: C1.toString(),
      C2: C2.toString()
    };
  }

  decrypt(privateKeyStr, ciphertext) {
    const privateKey = BigInt(privateKeyStr);

    if (privateKey <= 0n || privateKey >= this.curve.n) {
      throw new Error("invalid private key");
    }

    const C1 = this.parsePoint(ciphertext.C1);
    const C2 = this.parsePoint(ciphertext.C2);

    if (!this.isOnCurve(C1) || !this.isOnCurve(C2)) {
      throw new Error("points not on curve");
    }

    //S=prkey*C1
    const S = this.multiplyPoint(privateKey, C1);

    //M=C2-S
    const minusS = new Point(S.x, this.mod(-S.y, this.curve.p));
    const messagePoint = this.addPoints(C2, minusS);

    return this.pointToMessage(messagePoint);
  }

  parsePoint(pointStr) {
    if (pointStr === "(null, null)") {
      return new Point(null, null);
    }

    const match = pointStr.match(/\((\d+n?), (\d+n?)\)/);
    if (!match) {
      throw new Error('invalid point');
    }

    const x = BigInt(match[1].replace('n', ''));
    const y = BigInt(match[2].replace('n', ''));

    const point = new Point(x, y);

    if (!this.isOnCurve(point)) {
      throw new Error('point not on curve');
    }

    return point;
  }
}

export default EG;
