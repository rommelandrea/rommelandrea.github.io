export function debugObject(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}
