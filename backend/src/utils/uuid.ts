export function generateUuidV7(): string {
  const now = Date.now();
  const hexTime = now.toString(16).padStart(12, '0');

  // 12 bits random A
  const randA = Math.floor(Math.random() * 0x1000).toString(16).padStart(3, '0');

  // 16 bits variant (first two bits set to 1 and 0) + random
  // variant prefix 10xx, so hex range is 8000 to bfff
  const variant = (0x8000 + Math.floor(Math.random() * 0x4000)).toString(16).padStart(4, '0');

  // 48 bits random B
  const randB = Math.floor(Math.random() * 0x1000000000000).toString(16).padStart(12, '0');

  const part1 = hexTime.slice(0, 8);
  const part2 = hexTime.slice(8, 12);
  const part3 = '7' + randA;
  const part4 = variant;
  const part5 = randB;

  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

export function extractTimestampFromUuidV7(uuid: string): Date {
  const cleanUuid = uuid.replace(/-/g, '');
  const timestampHex = cleanUuid.slice(0, 12);
  const timestampMs = parseInt(timestampHex, 16);
  return new Date(timestampMs);
}
