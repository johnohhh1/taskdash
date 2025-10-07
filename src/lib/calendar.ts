import crypto from "crypto";

/**
 * Encryption key for storing Google OAuth tokens securely
 * Must be at least 32 characters for AES-256-CBC
 */
const ENC_KEY = process.env.GOOGLE_ENCRYPTION_KEY || "devdevdevdevdevdevdevdevdevdev12";
const IV_LENGTH = 16;

/**
 * Encrypts a string using AES-256-CBC encryption
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: "iv:encryptedData"
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENC_KEY.slice(0, 32)),
    iv
  );

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * Decrypts an encrypted string using AES-256-CBC
 * @param text - Encrypted string in format: "iv:encryptedData"
 * @returns Decrypted plain text
 */
export function decrypt(text: string): string {
  const [ivHex, dataHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(dataHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENC_KEY.slice(0, 32)),
    iv
  );

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

/**
 * Exchanges a refresh token for a new access token
 * @param refreshTokenEncrypted - Encrypted refresh token
 * @returns Access token for Google Calendar API calls
 */
export async function getAccessToken(refreshTokenEncrypted: string): Promise<string> {
  const refreshToken = decrypt(refreshTokenEncrypted);

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    throw new Error(tokenData.error || "Failed to exchange refresh token");
  }

  return tokenData.access_token as string;
}
