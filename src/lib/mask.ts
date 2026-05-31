export function maskAmount(value: string, hidden: boolean): string {
  return hidden ? "•••••" : value
}
