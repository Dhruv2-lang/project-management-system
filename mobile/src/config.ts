import { Platform } from 'react-native';

/**
 * Single place where the API base URL is resolved.
 * Everything else imports API_URL from here (nothing else knows about hosts).
 *
 * Inside an Android emulator "localhost" is the emulator itself, so a localhost
 * value in EXPO_PUBLIC_API_URL is mapped to the emulator's host alias 10.0.2.2.
 * Any other value (LAN IP, https://<deployed-backend>/api) is used untouched.
 */
const raw = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api').trim();

function resolveApiUrl(url: string): string {
  let result = url.replace(/\/+$/, '');
  if (Platform.OS === 'android') {
    result = result.replace(
      /^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/i,
      (_m, scheme: string) => `${scheme}10.0.2.2`,
    );
  }
  return result;
}

export const API_URL = resolveApiUrl(raw);
export const REQUEST_TIMEOUT_MS = 15000;
