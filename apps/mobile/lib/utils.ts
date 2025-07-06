import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Crypto from "expo-crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// PKCE utilities for OAuth flow
export function generateCodeVerifier(): string {
  // Generate 32 random bytes and encode as base64url
  const randomBytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256)
  );
  const uint8Array = new Uint8Array(randomBytes);
  return base64URLEncode(uint8Array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  // Convert base64 to base64url
  return digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
