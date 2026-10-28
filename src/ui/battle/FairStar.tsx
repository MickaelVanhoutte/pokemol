/** The gold felt-tip star of a fair copy (« mise au propre », src/data/fairCopies.ts). */
export function FairStar({ class: cls = '' }: { class?: string }) {
  return (
    <svg class={`fair-star ${cls}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5l2.8 6 6.6.7-5 4.4 1.5 6.5L12 16.8 6.1 20.1l1.5-6.5-5-4.4 6.6-.7z" fill="#f4b81c" stroke="#27232d" stroke-width="1.8" stroke-linejoin="round" />
    </svg>
  );
}
