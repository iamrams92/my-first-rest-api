import { webcrypto } from 'node:crypto';

if (!globalThis.crypto) {
  (globalThis as typeof globalThis & { crypto: Crypto }).crypto =
    webcrypto as unknown as Crypto;
}
