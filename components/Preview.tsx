'use client';
import { useState } from 'react';

/**
 * Lazy inline preview (FR-S-05a). The PDF is requested only when the student opens it, and the
 * shared `name` lets the browser keep just one preview open at a time. Hidden on small screens,
 * where phone browsers show PDFs in iframes badly; View opens the phone's own viewer instead.
 */
export default function Preview({ src, title, className }: { src: string; title: string; className: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      name="pdf-preview"
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="hidden md:block open:order-last open:basis-full"
    >
      <summary className={`${className} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
        {open ? 'Close preview' : 'Preview'}
      </summary>
      {open && <iframe src={src} title={`Preview of ${title}`} className="mt-2 mb-3 h-[75vh] w-full border border-rule bg-sheet" />}
    </details>
  );
}
