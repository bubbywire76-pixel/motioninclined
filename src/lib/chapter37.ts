import board from "@/assets/ch37-board.jpg.asset.json";

export interface Chapter37Piece {
  name: string;
  caption: string;
  copy: string;
  image: string;
  alt: string;
}

export const CHAPTER_37_INTRO = {
  title: "Chapter 37",
  line: "A new angle of motion.",
  brand: "Motion Inclined™",
  sign: "Stay inclined.",
};

/** Pieces announced in Chapter 37 that are not yet purchasable. */
export const CHAPTER_37_COMING_SOON: Chapter37Piece[] = [
  {
    name: "∠37 Tracksuit",
    caption: "Coming soon",
    copy: "A dual-tone luxury tracksuit engineered around the 37° system. Finished with stone detailing, signature diagonal construction and a removable hood for multiple silhouettes.",
    image: board.url,
    alt: "∠37 Tracksuit — Chapter 37 design board",
  },
  {
    name: "Jersey 18",
    caption: "Coming soon",
    copy: "A premium sports jersey merging athletic construction with Motion Inclined's luxury design language. Refined contrast detailing, signature 37° elements and premium stone branding.",
    image: board.url,
    alt: "Jersey 18 — Chapter 37 design board",
  },
];
