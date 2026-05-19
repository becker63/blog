import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

/** Returns 32-byte key from base64-encoded env, or throws (fail-closed). */
export const requireEncryptionKey = (): Buffer => {
  const b64 = process.env.PUBLIC_PROOF_ENCRYPTION_KEY?.trim();
  if (!b64) {
    throw new Error("PUBLIC_PROOF_ENCRYPTION_KEY is required to encrypt OAuth secrets.");
  }
  const buf = Buffer.from(b64, "base64");
  if (buf.length !== 32) {
    throw new Error("PUBLIC_PROOF_ENCRYPTION_KEY must be base64 for exactly 32 bytes (AES-256).");
  }
  return buf;
};

/** ciphertext as base64: iv.authTag.blob */
export const encryptSecretPayload = (plaintext: string): string => {
  const key = requireEncryptionKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, tag, ciphertext]);
  return combined.toString("base64");
};

export const decryptSecretPayload = (payloadBase64: string): string => {
  const key = requireEncryptionKey();
  const blob = Buffer.from(payloadBase64, "base64");
  const iv = blob.subarray(0, IV_LEN);
  const tag = blob.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ciphertext = blob.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
};
