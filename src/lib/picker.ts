export function nextOption(
  active: number,
  count: number,
  key: string,
  open: boolean,
): number {
  if (!open || !count) return 0;
  const direction = key === "ArrowDown" ? 1 : -1;
  return (active + direction + count) % count;
}
