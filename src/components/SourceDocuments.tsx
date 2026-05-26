import { sourceDocuments } from '../data/sourceDocuments';

export function SourceDocuments() {
  return (
    <details className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-md text-sm font-semibold">
        Originalpläne & Quellen
        <span className="text-court-lime">+</span>
      </summary>
      <div className="mt-4 space-y-4">
        {sourceDocuments.map((document) => (
          <article key={document.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-white">{document.title}</h3>
              <a
                href={document.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-lg border border-court-lime/40 px-3 py-2 text-xs font-bold text-court-lime"
              >
                {document.title} öffnen
              </a>
            </div>
            {document.note && <p className="mt-2 text-xs leading-relaxed text-amber-100">{document.note}</p>}
            <a href={document.imageUrl} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-lg border border-white/10">
              <img
                src={document.imageUrl}
                alt={document.title}
                loading="lazy"
                className="h-auto w-full bg-white object-contain"
              />
            </a>
          </article>
        ))}
      </div>
    </details>
  );
}
