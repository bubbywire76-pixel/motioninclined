import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import hero from "@/assets/hero-lifestyle.jpg";
import lifestyle from "@/assets/lifestyle-editorial.jpg";

const DESCRIPTION =
  "The Motion Inclined story — a Nigerian streetwear house built for ambition, discipline and continuous progress. Built for those who move forward.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Built For Those Who Move Forward | Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Built For Those Who Move Forward — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-20 text-center sm:pt-40 sm:pb-32">
        <Reveal>
          <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">Our story</p>
          <h1 className="display-hd mt-8 text-4xl sm:text-7xl">
            Built For Those Who Move Forward.
          </h1>
        </Reveal>
      </section>

      <Reveal>
        <img
          src={hero}
          alt="Motion Inclined campaign imagery"
          loading="lazy"
          width={1920}
          height={1280}
          className="h-[60vh] w-full object-cover"
        />
      </Reveal>

      <section className="mx-auto max-w-3xl px-6 py-24 sm:py-40">
        <Reveal className="space-y-8 text-base leading-loose text-muted-foreground sm:text-lg">
          <p className="text-foreground">
            Motion Inclined started with a single conviction: progress is a decision you make daily,
            long before anyone applauds it.
          </p>
          <p>
            We design for the hours nobody sees — the early starts, the repeated attempts, the quiet
            discipline that turns intention into result. That is the material we build from. Garments
            are the outcome; the mindset is the product.
          </p>
          <p>
            Each collection is developed in small runs. We work with heavyweight cottons, honest
            construction and graphics that mean something to the people wearing them: growth,
            belief, forward motion. Nothing is added to fill a rack.
          </p>
          <p>
            To wear Motion Inclined is to make a statement you have to keep. It's a reminder on your
            back, in your reflection, in the room you walk into. You don't stand still.
          </p>
        </Reveal>
      </section>

      <section className="grid gap-0 border-y border-border md:grid-cols-2">
        <Reveal className="flex flex-col justify-center px-8 py-20 sm:px-16 sm:py-32">
          <h2 className="display-hd text-3xl sm:text-5xl">Purpose over product.</h2>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            Ambition. Discipline. Resilience. Confidence. Progress. Five words that decide every
            fabric, every fit, every drop we release.
          </p>
          <Link
            to="/shop"
            className="mt-12 w-fit rounded-full bg-foreground px-8 py-4 text-[10px] uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85"
          >
            Shop the collection
          </Link>
        </Reveal>
        <img
          src={lifestyle}
          alt="Detail of Motion Inclined garment construction"
          loading="lazy"
          width={1600}
          height={1200}
          className="h-full min-h-[360px] w-full object-cover"
        />
      </section>
    </div>
  );
}
