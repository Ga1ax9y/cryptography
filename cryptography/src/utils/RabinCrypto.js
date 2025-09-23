export async function isPrimeMillerRabin(n, k = 10) {
  if (n < 2n) return false;
  if (n === 2n) return true;
  if (n % 2n === 0n) return false;

  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    s++;
  }

  for (let i = 0; i < k; i++) {
    let a;
    do {
      a = await randomBigIntInRange(2n, n - 2n);
    } while (a <= 1n || a >= n - 1n);

    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;

    let composite = true;
    for (let r = 1n; r < s; r++) {
      x = mod(x * x, n);
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }

    if (composite) return false;
  }

  return true;
}

export async function randomBigIntInRange(min, max) {
  const range = max - min + 1n;
  if (range < 1n) throw new Error('Некорректный диапазон');

  const bitLength = range.toString(2).length;
  const bytes = Math.ceil(bitLength / 8);
  const array = new Uint8Array(bytes);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    throw new Error('crypto.getRandomValues не поддерживается');
  }

  let rand = 0n;
  for (let i = 0; i < bytes; i++) {
    rand = (rand << 8n) + BigInt(array[i]);
  }

  rand = min + (rand % range);

  return rand;
}

export async function generateLargePrime(bitLength = 512) {
  let candidate;

  do {
    const min = 1n << (BigInt(bitLength) - 1n);
    const max = (1n << BigInt(bitLength)) - 1n;

    candidate = await randomBigIntInRange(min, max);

    if (candidate % 2n === 0n) candidate++;

    if (candidate % 4n !== 3n) {
      candidate = candidate + (4n - (candidate % 4n)) - 1n;
      if (candidate % 2n === 0n) candidate++;
    }

    if (await isPrimeMillerRabin(candidate, 10)) {
      return candidate;
    }

    candidate += 4n;
    if (candidate > max) candidate = min + 3n;

  // eslint-disable-next-line no-constant-condition
  } while (true);
}

export function extendedGCD(a, b) {
  if (a === 0n) return [b, 0n, 1n];
  const [g, x, y] = extendedGCD(b % a, a);
  return [g, y - (b / a) * x, x];
}

export function mod(n, m) {
  const result = n % m;
  return result >= 0n ? result : result + m;
}

export function modPow(base, exponent, modulus) {
  if (modulus === 1n) return 0n;
  let result = 1n;
  base = mod(base, modulus);
  while (exponent > 0n) {
    if (exponent % 2n === 1n) result = mod(result * base, modulus);
    exponent /= 2n;
    base = mod(base * base, modulus);
  }
  return result;
}

export function modSqrt(c, p) {
  if (p % 4n === 3n) return modPow(c, (p + 1n) / 4n, p);
  throw new Error("Модуль не в форме 4k+3");
}

export function stringToBigInt(str) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let result = 0n;
  for (let i = 0; i < bytes.length; i++) {
    result = result * 256n + BigInt(bytes[i]);
  }
  return result;
}

export function bigIntToString(num) {
  if (num === 0n) return "";

  const bytes = [];
  let temp = num;
  while (temp > 0n) {
    bytes.push(Number(temp % 256n));
    temp = temp / 256n;
  }

  bytes.reverse();

  try {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(new Uint8Array(bytes));
  } catch (e) {
    console.error('Ошибка декодирования UTF-8:', e);
    return '[Ошибка UTF-8 декодирования]';
  }
}

export async function generateKeys(bitLength = 512) {
  const p = await generateLargePrime(bitLength);
  let q = await generateLargePrime(bitLength);
  while (q === p) {
    q = await generateLargePrime(bitLength);
  }
  const n = p * q;
  return { p: p.toString(), q: q.toString(), n: n.toString() };
}

export function encrypt(plaintext, n) {
  const numN = BigInt(n);
  const m = stringToBigInt(plaintext);

  if (m >= numN) {
    throw new Error(`Текст слишком длинный! m=${m} >= n=${numN}. Сгенерируйте большие ключи.`);
  }

  const c = mod(m * m, numN);
  return c.toString();
}

export function decrypt(ciphertext, p, q) {
  const numP = BigInt(p);
  const numQ = BigInt(q);
  const numN = numP * numQ;
  const c = BigInt(ciphertext);

  const mp = modSqrt(mod(c, numP), numP);
  const mq = modSqrt(mod(c, numQ), numQ);

  const [_gcd, yp, yq] = extendedGCD(numP, numQ);

  const r = mod(yp * numP * mq + yq * numQ * mp, numN);
  const minusR = mod(numN - r, numN);
  const s = mod(yp * numP * mq - yq * numQ * mp, numN);
  const minusS = mod(numN - s, numN);

  const roots = [r, minusR, s, minusS];

  return roots.map((root, idx) => {
    try {
      const text = bigIntToString(root);
      const isValid = [...text].every(char => {
        const code = char.charCodeAt(0);
        return (
          (code >= 32 && code <= 126) ||
          (code >= 1040 && code <= 1103) ||
          code === 1025 || code === 1105 ||
          code === 32 || code === 10 || code === 13
        );
      });
      return {
        value: root.toString(),
        text: text || '[пусто]',
        isValid: isValid,
        label: `Вариант ${idx + 1}`
      };
    } catch (e) {
      console.error(e);
      return {
        value: root.toString(),
        text: '[ошибка преобразования]',
        isValid: false,
        label: `Вариант ${idx + 1}`
      };
    }
  });
}
