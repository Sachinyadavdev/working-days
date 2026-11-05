/** Nest URI versioning adds the "v" prefix itself. Accept either env convention. */
export function normalizeApiVersion(value: string = '1'): string {
  return value.trim().replace(/^v/i, '') || '1';
}
