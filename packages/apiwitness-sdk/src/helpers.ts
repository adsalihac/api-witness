export function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getTimestamp(): string {
  return new Date().toISOString();
}

export function isFailureStatus(status: number): boolean {
  return status >= 400;
}
