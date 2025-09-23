export class ByteUtils {
  static stringToBytes(str) {
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(str));
  }

  static bytesToString(bytes) {
    const uint8Array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(uint8Array);
  }


  static hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  static bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static xorBytes(a, b) {
    const result = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] ^ b[i];
    }
    return result;
  }

  static concatBytes(...arrays) {
    const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }

  static isValidHex(hex) {
    return /^[0-9a-fA-F]*$/.test(hex) && hex.length % 2 === 0;
  }
}
