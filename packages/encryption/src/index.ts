import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Parse APP_ENCRYPTION_KEY: 64-char hex => 32 bytes, or base64url => 32 bytes. Otherwise throws.
 */
function getKey(envKey: string): Buffer {
  const raw = process.env[envKey] ?? "";
  if (!raw) {
    throw new Error("APP_ENCRYPTION_KEY must be set (64-char hex or 43+ char base64url)");
  }
  // 64-char hex => 32 bytes
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  // base64url => must decode to exactly 32 bytes
  try {
    const decoded = Buffer.from(raw, "base64url");
    if (decoded.length === KEY_LENGTH) {
      return decoded;
    }
  } catch {
    // fall through to throw
  }
  throw new Error(
    "APP_ENCRYPTION_KEY must be 64-char hex or base64url string that decodes to 32 bytes"
  );
}

/**
 * Encrypt plaintext with AES-256-GCM. Uses APP_ENCRYPTION_KEY by default.
 * Output format: iv (16) + tag (16) + ciphertext, all base64url.
 */
export function encrypt(plaintext: string, key?: Buffer): string {
  const keyBuf = key ?? getKey("APP_ENCRYPTION_KEY");
  if (keyBuf.length !== KEY_LENGTH) {
    throw new Error("Encryption key must be 32 bytes");
  }
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, keyBuf, iv, { authTagLength: TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString("base64url");
}

/**
 * Decrypt ciphertext produced by encrypt(). Uses APP_ENCRYPTION_KEY by default.
 */
export function decrypt(ciphertext: string, key?: Buffer): string {
  const keyBuf = key ?? getKey("APP_ENCRYPTION_KEY");
  if (keyBuf.length !== KEY_LENGTH) {
    throw new Error("Encryption key must be 32 bytes");
  }
  const combined = Buffer.from(ciphertext, "base64url");
  if (combined.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error("Invalid ciphertext");
  }
  const iv = combined.subarray(0, IV_LENGTH);
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, keyBuf, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
}
