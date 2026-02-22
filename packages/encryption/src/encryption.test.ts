import { describe, it, expect, beforeEach } from "vitest";
import { encrypt, decrypt } from "./index";

const KEY_32 = Buffer.alloc(32, "a");

describe("encryption round-trip", () => {
  it("decrypt(encrypt(plaintext, key), key) === plaintext", () => {
    const key = KEY_32;
    const plaintexts = ["hello", "sk-1234", "", "a".repeat(1000)];
    for (const plain of plaintexts) {
      const cipher = encrypt(plain, key);
      expect(cipher).toBeTruthy();
      expect(cipher).not.toBe(plain);
      expect(decrypt(cipher, key)).toBe(plain);
    }
  });

  it("same plaintext produces different ciphertext each time (IV is random)", () => {
    const key = KEY_32;
    const c1 = encrypt("secret", key);
    const c2 = encrypt("secret", key);
    expect(c1).not.toBe(c2);
    expect(decrypt(c1, key)).toBe("secret");
    expect(decrypt(c2, key)).toBe("secret");
  });

  it("decrypt with wrong key throws", () => {
    const key = KEY_32;
    const other = Buffer.alloc(32, "b");
    const cipher = encrypt("secret", key);
    expect(() => decrypt(cipher, other)).toThrow();
  });
});
