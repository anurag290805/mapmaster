/** Preserve the existing case-insensitive substring search semantics. */
export function matchesCountry(name: string, query: string): boolean {
  return name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}
