export class Sha256 {
  mathPow = Math.pow;
  maxWord = this.mathPow(2, 32);
  lengthProperty = 'length';
  j;
  i;
  result = '';
  words = [];

  rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  hashString(ascii) {
    let i;
    let j;
    const asciiBitLength = ascii[this.lengthProperty] * 8;
    // @ts-ignore
    let hash = (this.hashString.h = this.hashString.h || []);
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    // @ts-ignore
    const k = (this.hashString.k = this.hashString.k || []);
    let primeCounter = k[this.lengthProperty];
    /*/
    const hash = [], k = [];
    const primeCounter = 0;
    //*/

    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (this.mathPow(candidate, 0.5) * this.maxWord) | 0;
        k[primeCounter++] = (this.mathPow(candidate, 1 / 3) * this.maxWord) | 0;
      }
    }

    ascii += '\x80'; // Append Ƈ' bit (plus zero padding)
    while ((ascii[this.lengthProperty] % 64) - 56) {
      ascii += '\x00';
    } // More zero padding
    for (i = 0; i < ascii[this.lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) {
        return;
      } // ASCII check: only accept characters in range 0-255
      this.words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    this.words[this.words[this.lengthProperty]] = (asciiBitLength / this.maxWord) | 0;
    this.words[this.words[this.lengthProperty]] = asciiBitLength;

    // process each chunk
    for (j = 0; j < this.words[this.lengthProperty]; ) {
      const w = this.words.slice(j, (j += 16)); // The message is expanded into 64 words as part of the iteration
      const oldHash = hash;
      // This is now the undefinedworking hash", often labelled as constiables a...g
      // (we have to truncate as well, otherwise extra entries at the end accumulate
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        const i2 = i + j;
        // Expand the message into 64 words
        // Used below if
        const w15 = w[i - 15];
        const w2 = w[i - 2];

        // Iterate
        const a = hash[0];
        const e = hash[4];
        const temp1 =
          hash[7] +
          (this.rightRotate(e, 6) ^ this.rightRotate(e, 11) ^ this.rightRotate(e, 25)) + // S1
          ((e & hash[5]) ^ (~e & hash[6])) + // ch
          k[i] +
          // Expand the message schedule if needed
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                (this.rightRotate(w15, 7) ^ this.rightRotate(w15, 18) ^ (w15 >>> 3)) + // s0
                  w[i - 7] +
                  (this.rightRotate(w2, 17) ^ this.rightRotate(w2, 19) ^ (w2 >>> 10))) | // s1
                0);
        // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
        const temp2 =
          (this.rightRotate(a, 2) ^ this.rightRotate(a, 13) ^ this.rightRotate(a, 22)) + // S0
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj
        // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        const b = (hash[i] >> (j * 8)) & 255;
        this.result += (b < 16 ? 0 : '') + b.toString(16);
      }
    }
    return this.result;
  }
}
