import { ByteUtils } from './byteUtils';

export class GostCrypto {
  constructor(key) {
    if (!key) throw new Error('Ключ не может быть пустым');
    this.key = this.prepareKey(key);
    this.initSBoxes();
  }

  prepareKey(key) {
    if (typeof key === 'string' && key.match(/^[0-9a-fA-F]{64}$/)) {
      return ByteUtils.hexToBytes(key);
    }

    if (typeof key === 'string') {
      const keyBytes = ByteUtils.stringToBytes(key);
      const result = new Uint8Array(32);

      if (keyBytes.length >= 32) {
        result.set(keyBytes.slice(0, 32));
      } else {
        result.set(keyBytes);
        for (let i = keyBytes.length; i < 32; i++) {
          result[i] = 0;
        }
      }

      return result;
    }

    throw new Error('Неверный формат ключа');
  }

  initSBoxes() {
    this.sBoxes = [
      [4, 10, 9, 2, 13, 8, 0, 14, 6, 11, 1, 12, 7, 15, 5, 3],
      [14, 11, 4, 12, 6, 13, 15, 10, 2, 3, 8, 1, 0, 7, 5, 9],
      [5, 8, 1, 13, 10, 3, 4, 2, 14, 15, 12, 7, 6, 0, 9, 11],
      [7, 13, 10, 1, 0, 8, 9, 15, 14, 4, 6, 12, 11, 2, 5, 3],
      [6, 12, 7, 1, 5, 15, 13, 8, 4, 10, 9, 14, 0, 3, 11, 2],
      [4, 11, 10, 0, 7, 2, 1, 13, 3, 6, 8, 5, 9, 12, 15, 14],
      [13, 11, 4, 1, 3, 15, 5, 9, 0, 10, 14, 7, 6, 8, 2, 12],
      [1, 15, 13, 0, 5, 7, 10, 4, 9, 2, 3, 14, 6, 11, 8, 12]
    ];
  }

  generateSubKeys() {
    const subKeys = [];

    for (let i = 0; i < 8; i++) {
      const subKey = new Uint32Array(1);
      const view = new DataView(subKey.buffer);

      for (let j = 0; j < 4; j++) {
        const byte = this.key[i * 4 + j];
        view.setUint8(j, byte);
      }

      subKeys.push(view.getUint32(0, false));
    }

    const extendedSubKeys = [];

    for (let i = 0; i < 24; i++) {
      extendedSubKeys.push(subKeys[i % 8]);
    }

    for (let i = 7; i >= 0; i--) {
      extendedSubKeys.push(subKeys[i]);
    }

    return extendedSubKeys;
  }

  f(input, subKey) {
    let temp = (input + subKey) >>> 0;

    let output = 0;
    for (let i = 0; i < 8; i++) {
      const nibble = (temp >>> (4 * i)) & 0x0F;
      const sboxValue = this.sBoxes[i][nibble];
      output |= (sboxValue << (4 * i));
    }

    return ((output << 11) | (output >>> 21)) >>> 0;
  }

  encryptBlock(block, subKeys) {
    let left = block[0];
    let right = block[1];

    for (let i = 0; i < 32; i++) {
      const fResult = this.f(right, subKeys[i]);
      const newRight = (left ^ fResult) >>> 0;
      left = right;
      right = newRight;
    }

    return [right, left];
  }

  blockToUint32(block) {
    const view = new DataView(block.buffer, block.byteOffset);
    return [
      view.getUint32(0, true),
      view.getUint32(4, true)
    ];
  }

  uint32ToBlock(left, right) {
    const block = new Uint8Array(8);
    const view = new DataView(block.buffer);
    view.setUint32(0, left, true);
    view.setUint32(4, right, true);
    return block;
  }

  generateGamma(syncMessage, length) {
    if (syncMessage.length !== 8) {
      throw new Error('Синхропосылка должна быть 8 байт');
    }

    const subKeys = this.generateSubKeys();
    const gamma = new Uint8Array(length);

    let counter = new Uint8Array(syncMessage);

    for (let i = 0; i < length; i += 8) {
      const block = this.blockToUint32(counter);
      const encryptedBlock = this.encryptBlock(block, subKeys);
      const gammaBlock = this.uint32ToBlock(encryptedBlock[0], encryptedBlock[1]);

      const blockLength = Math.min(8, length - i);
      for (let j = 0; j < blockLength; j++) {
        gamma[i + j] = gammaBlock[j];
      }

      this.incrementCounter(counter);
    }

    return gamma;
  }

  incrementCounter(counter) {
    for (let i = 0; i < 8; i++) {
      if (++counter[i] !== 0) {
        break;
      }
    }
  }

  async encryptText(text) {
    const textBytes = ByteUtils.stringToBytes(text);
    const syncMessage = crypto.getRandomValues(new Uint8Array(8));
    const gamma = this.generateGamma(syncMessage, textBytes.length);

    const encryptedBytes = ByteUtils.xorBytes(textBytes, gamma);
    const encryptedHex = ByteUtils.bytesToHex(encryptedBytes);
    const syncHex = ByteUtils.bytesToHex(syncMessage);

    return `${syncHex}:${encryptedHex}`;
  }

  async decryptText(encryptedData) {
    const colonIndex = encryptedData.indexOf(':');
    if (colonIndex === -1) {
      throw new Error('Неверный формат зашифрованных данных');
    }

    const syncHex = encryptedData.substring(0, colonIndex);
    const encryptedHex = encryptedData.substring(colonIndex + 1);

    if (!ByteUtils.isValidHex(syncHex) || syncHex.length !== 16) {
      throw new Error('Неверный формат синхропосылки');
    }

    if (!ByteUtils.isValidHex(encryptedHex)) {
      throw new Error('Неверный формат зашифрованных данных');
    }

    const syncMessage = ByteUtils.hexToBytes(syncHex);
    const encryptedBytes = ByteUtils.hexToBytes(encryptedHex);

    const gamma = this.generateGamma(syncMessage, encryptedBytes.length);
    const decryptedBytes = ByteUtils.xorBytes(encryptedBytes, gamma);

    return ByteUtils.bytesToString(decryptedBytes);
  }

  async encryptFile(file) {
    const text = await this.readFileAsText(file);
    const encrypted = await this.encryptText(text);
    return new Blob([encrypted], { type: 'text/plain; charset=utf-8' });
  }

  async decryptFile(file) {
    const encryptedText = await this.readFileAsText(file);
    const decrypted = await this.decryptText(encryptedText);
    return new Blob([decrypted], { type: 'text/plain; charset=utf-8' });
  }

  async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsText(file, 'UTF-8');
    });
  }
}
