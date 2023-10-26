export default function ensureDefined<T>(value: T | undefined | null, key?: string): T {
  if (!value) throw Error(`Value has to be defined. ${key ? `Key: ${key}` : ''}`);
  return value;
}
