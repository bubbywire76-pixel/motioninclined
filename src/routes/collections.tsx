import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { Newsletter } from "@/components/Newsletter";
import banner from "@/assets/lifestyle-editorial.jpg";
import hero from "@/assets/hero-lifestyle.jpg";

const DESCRIPTION =
  "Explore Motion Inclined collections — Drop 001 essentials, the Faith Series and Motion Denim. Limited runs, premium materials, designed with purpose.";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Collections — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollectionsPage,
});

const COLLECTIONS = [
  {
    name: "Drop 001",
    caption: "Essentials — limited run",
    copy: "The foundation. Heavyweight jersey, quiet detailing, built to outlast a season.",
    image: hero,
  },
  {
    name: "Faith Series",
    caption: "Believe · Pray · Growth",
    copy: "Graphics that carry meaning long after the drop sells out.",
    image: banner,
  },
  {
    name: "Motion Denim",
    caption: "Two-piece · Made to order",
    copy: "Custom denim with cognac leather panelling and double-stitched lining.",
    image: banner,
  },
];

function CollectionsPage() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto w-full max-w-[1600px] px-5 pb-16 pt-24 sm:px-10 sm:pb-24 sm:pt-36">
        <Reveal>
          <p className="eyebrow">Collections</p>
          <h1 className="display-hd mt-8 max-w-3xl text-[13vw] leading-[0.9] sm:text-7xl lg:text-[6rem]">
            Every piece belongs
            <br />
            <span className="font-serif-display font-light italic">to a chapter.</span>
          </h1>
        </Reveal>
      </section>

      <section className="mx-auto grid w-full max-w-[1600px] gap-16 px-5 pb-28 sm:px-10 sm:pb-40">
        {COLLECTIONS.map((c, i) => (
          <Reveal key={c.name}>
            <Link
              to="/shop"
              className="group grid items-center gap-10 md:grid-cols-2 md:gap-20"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div
                className={`overflow-hidden rounded-[28px] bg-muted ${i % 2 ? "md:order-2" : ""}`}
              >
                <img
                  src={c.image}
                  alt={`${c.name} collection`}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div>
                <p className="eyebrow">{c.caption}</p>
                <h2 className="display-hd mt-6 text-4xl sm:text-6xl">{c.name}</h2>
                <p className="mt-7 max-w-md text-sm leading-loose text-muted-foreground">{c.copy}</p>
                <span className="link-underline mt-9 inline-block text-[10px] uppercase tracking-[0.3em]">
                  Shop the collection
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>

      <Newsletter />
    </div>
  );
}
