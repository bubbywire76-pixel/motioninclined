import tracksuitImg from "@/assets/ch37/ts-hero.jpg";
import jerseyImg from "@/assets/ch37/j-front.jpg";

export interface Chapter37Piece {
  name: string;
  handle: string;
  price: string;
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
    handle: "37-tracksuit",
    price: "NGN 150,000",
    caption: "Coming soon",
    copy: "Motion in two tones. A dual-tone luxury tracksuit engineered around the 37° system, with bold diagonal panel construction, premium detailing and a removable hood for multiple silhouettes.",
    image: tracksuitImg,
    alt: "∠37 Tracksuit — dual-tone luxury tracksuit",
  },
  {
    name: "Jersey 18",
    handle: "jersey-18",
    price: "NGN 50,000",
    caption: "Coming soon",
    copy: "Motion is Luxury. A premium sports jersey merging athletic construction with Motion Inclined's luxury design language — refined contrast detailing, signature 37° elements and premium MOTION branding.",
    image: jerseyImg,
    alt: "Jersey 18 — premium luxury sports jersey",
  },
];

