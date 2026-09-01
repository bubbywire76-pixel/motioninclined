import { Instagram } from "lucide-react";
import { Reveal } from "./Reveal";
import growth from "@/assets/growth-tee.jpg";
import believe from "@/assets/believe-tee.jpg";
import pray from "@/assets/pray-tee.jpg";
import polo from "@/assets/stay-inclined-polo.jpeg";
import inMotionTeeAsset from "@/assets/in-motion-tee-front.jpg.asset.json";
import keepMoving from "@/assets/keep-moving-forward.jpeg";

const TILES = [
  { src: growth, alt: "Growth Tee worn on the street" },
  { src: polo, alt: "Stay Inclined striped polo detail" },
  { src: believe, alt: "Believe Tee lotus graphic" },
  { src: inMotionTeeAsset.url, alt: "IN MOTION TEE front with rhinestone runner graphic" },
  { src: pray, alt: "Pray ringer tee close up" },
  { src: keepMoving, alt: "Keep Moving Forward ringer tee" },
];

export function InstagramGallery() {
  return (
    <section className="px-5 py-28 sm:px-10 sm:py-40">
      <Reveal className="mx-auto mb-14 max-w-[1600px] text-center">
        <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">@motioninclined</p>
        <h2 className="display-hd mt-5 text-3xl sm:text-5xl">Seen in Motion</h2>
      </Reveal>
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {TILES.map((tile, i) => (
          <Reveal key={tile.alt} delay={i * 60}>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-xl bg-muted"
            >
              <img
                src={tile.src}
                alt={tile.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all duration-500 group-hover:bg-foreground/35 group-hover:opacity-100">
                <Instagram className="h-5 w-5 text-background" strokeWidth={1.3} />
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
