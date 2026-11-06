"use client";

import { useId, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";

export default function SocialCaption({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const longCaption = text.length > 160;
  const preview = longCaption ? `${text.slice(0, 160).trimEnd()}...` : text;

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <>
      <p className={`mt-2 break-words text-sm leading-relaxed text-gray-800 ${longCaption ? "line-clamp-3" : "whitespace-pre-line"}`}>
        {preview}
      </p>
      {longCaption && (
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(true)}
          className="mt-2 text-sm font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Meer lezen
        </button>
      )}
      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Volledig bericht"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              close();
            }
          }}
          className="absolute inset-0 z-10 flex flex-col overflow-hidden rounded-2xl"
        >
          <div className="flex h-16 shrink-0 justify-end bg-gradient-to-b from-white/40 via-white/75 to-white px-2 pt-2">
            <button
              type="button"
              autoFocus
              onClick={close}
              aria-label="Bericht sluiten"
              className="h-9 w-9 rounded-full bg-white/90 p-2 text-primary shadow-sm hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>
          <div tabIndex={0} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-5 pb-5 pt-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-gray-800">{text}</p>
          </div>
        </div>
      )}
    </>
  );
}
