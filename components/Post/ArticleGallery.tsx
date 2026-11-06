"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MdClose, MdChevronLeft, MdChevronRight } from "react-icons/md";

export interface ArticleImage {
  src: string;
  alt: string;
  caption?: ReactNode;
  href?: string;
}

export default function ArticleGallery({ images }: { images: ArticleImage[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const image = selected === null ? null : images[selected];

  useEffect(() => {
    if (selected !== null && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, [selected]);

  const close = () => {
    dialogRef.current?.close();
    setSelected(null);
    openerRef.current?.focus();
  };

  const navigate = (direction: number) => {
    setSelected(current => current === null ? null : (current + direction + images.length) % images.length);
  };

  return (
    <div className="article-gallery" aria-label="Afbeeldingen bij dit artikel">
      {images.map((item, index) => (
        <figure className="article-gallery-item" key={`${item.src}-${index}`}>
          <button
            type="button"
            className="article-gallery-open"
            aria-label={`Vergroot afbeelding: ${item.alt || index + 1}`}
            onClick={event => {
              openerRef.current = event.currentTarget;
              setSelected(index);
            }}
          >
            {/* CMS uploads can use hosts outside Next Image's configured allowlist. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
          </button>
          {item.caption && <figcaption>{item.caption}</figcaption>}
          {item.href && (
            <a href={item.href} className="article-gallery-link">Bijbehorende link</a>
          )}
        </figure>
      ))}
      <dialog
        ref={dialogRef}
        className="article-image-dialog"
        aria-label="Vergrote artikelafbeelding"
        onCancel={event => {
          event.preventDefault();
          close();
        }}
        onClose={() => {
          setSelected(null);
          openerRef.current?.focus();
        }}
        onClick={event => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={event => {
          if (images.length < 2) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            navigate(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        {image && (
          <div className="article-image-viewer">
            <div className="flex items-center justify-between gap-4 pb-3">
              <span className="text-sm text-gray-500" aria-live="polite">
                {selected! + 1} / {images.length}
              </span>
              <button type="button" onClick={close} aria-label="Sluiten" className="article-image-control">
                <MdClose size={24} />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt={image.alt} className="article-image-full" />
            {image.caption && <div className="mt-3 text-center text-sm">{image.caption}</div>}
            {images.length > 1 && (
              <div className="mt-3 flex justify-center gap-4">
                <button type="button" aria-label="Vorige afbeelding" onClick={() => navigate(-1)} className="article-image-control">
                  <MdChevronLeft size={28} />
                </button>
                <button type="button" aria-label="Volgende afbeelding" onClick={() => navigate(1)} className="article-image-control">
                  <MdChevronRight size={28} />
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
