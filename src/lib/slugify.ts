export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters
    .replace(/\s+/g, "-")     // Replace spaces with -
    .replace(/--+/g, "-");    // Remove multiple -
}
