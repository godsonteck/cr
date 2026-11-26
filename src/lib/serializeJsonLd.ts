export function serializeJsonLd(value: object): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new TypeError('Structured data could not be serialized');
  }
  return serialized.replace(/</g, '\\u003c');
}
