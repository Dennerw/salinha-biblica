export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesSearch(text: string, query: string): boolean {
  if (!query) return true
  return normalize(text).includes(normalize(query))
}
