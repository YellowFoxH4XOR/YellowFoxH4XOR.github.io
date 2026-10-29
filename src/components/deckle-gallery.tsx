"use client";

import Image from "next/image";
import { useState } from "react";

const views = {
  library: {
    label: "Paper library",
    src: "/images/deckle-library.png",
    height: 1132,
    alt: "Deckle’s paper library with light and dark papers, filters, and material swatches",
  },
  desk: {
    label: "Your desk",
    src: "/images/deckle-desk.png",
    height: 1408,
    alt: "Deckle’s native desk interface with paper intensity, matte finish, and saved desk setups",
  },
};

export function DeckleGallery() {
  const [selected, setSelected] = useState<keyof typeof views>("library");
  const view = views[selected];
  return (
    <div className="product-gallery">
      <div className="product-image-frame">
        <Image
          id="deckle-image"
          src={view.src}
          width={740}
          height={view.height}
          alt={view.alt}
          sizes="(max-width: 640px) 268px, 380px"
        />
      </div>
      <div className="gallery-controls" role="group" aria-label="Deckle product views">
        {(Object.keys(views) as (keyof typeof views)[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={key === selected}
            aria-controls="deckle-image"
            onClick={() => setSelected(key)}
          >
            {views[key].label}
          </button>
        ))}
      </div>
    </div>
  );
}
