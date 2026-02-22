import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./index";

const KEY_32 = Buffer.alloc(32, "a");

describe("encryption round-trip", () => {
  it("decrypt(encrypt(plaintext, key), key) === plaintext", () => {
    const plaintexts = ["hello", "sk-1234", "", "a".repeat(1000)];
    for (const plain of plaintexts) {
      const cipher = encrypt(plain, KEY_32);
      expect(cipher).toBeTruthy();
      expect(cipher).not.toBe(plain);
      expect(decrypt(cipher, KEY_32)).toBe(plain);
    }
  });

  it("same plaintext produces different ciphertext each time (IV is random)", () => {
    const c1 = encrypt("secret", KEY_32);
    const c2 = encrypt("secret", KEY_32);
    expect(c1).not.toBe(c2);
    expect(decrypt(c1, KEY_32)).toBe("secret");
    expect(decrypt(c2, KEY_32)).toBe("secret");
  });

  it("decrypt with wrong key throws", () => {
    const other = Buffer.alloc(32, "b");
    const cipher = encrypt("secret", KEY_32);
    expect(() => decrypt(cipher, other)).toThrow();
  });
});

describe("getKey via encrypt/decrypt with key argument", () => {
  it("64-char hex key: round-trip works", () => {
    const hexKey = Buffer.alloc(32, 0x41).toString("hex"); // 64 chars
    const key = Buffer.from(hexKey, "hex");
    expect(key.length).toBe(32);
    const cipher = encrypt("test", key);
    expect(decrypt(cipher, key)).toBe("test");
  });

  it("base64url key (32 bytes): round-trip works", () => {
    const key = Buffer.alloc(32, 0x42);
    const b64 = key.toString("base64url");
    const keyFromB64 = Buffer.from(b64, "base64url");
    expect(keyFromB64.length).toBe(32);
    const cipher = encrypt("test", keyFromB64);
    expect(decrypt(cipher, keyFromB64)).toBe("test");
  });
});
