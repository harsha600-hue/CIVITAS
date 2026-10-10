export const posterFor = (e: { posterUrl: string | null; category: string }) =>
  e.posterUrl || `/posters/${e.category.toLowerCase().replace(/[^a-z]+/g, "-")}.svg`;
