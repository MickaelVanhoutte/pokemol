/**
 * Splits a text into pages that each fit in a fixed text box, cutting between words
 * (`fits` measures a candidate page). Line breaks ("\n") are kept.
 */
export function paginate(text: string, fits: (page: string) => boolean): string[] {
  const tokens = text.split(/(\n)| /).filter((t) => t !== undefined && t !== '');
  const pages: string[] = [];
  let cur = '';
  for (const tok of tokens) {
    const join = !cur || tok === '\n' || cur.endsWith('\n') ? '' : ' ';
    const candidate = cur + join + tok;
    if (cur.trim() && !fits(candidate.trim())) {
      pages.push(cur.trim());
      cur = tok === '\n' ? '' : tok;
    } else {
      cur = candidate;
    }
  }
  if (cur.trim()) pages.push(cur.trim());
  return pages.length ? pages : [''];
}
