import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { Newsletter } from "@/components/Newsletter";
import hero from "@/assets/hero-lifestyle.jpg";
import lifestyle from "@/assets/lifestyle-editorial.jpg";
import growth from "@/assets/growth-tee.jpg";
import polo from "@/assets/stay-inclined-polo.jpeg";

const DESCRIPTION =
  "The Motion Inclined Journal — essays on discipline, design and progress from a streetwear house built for people in motion.";

const POSTS = [
  {
    title: "Discipline Is A Design Principle",
    excerpt:
      "Why we cut every collection down before we release it, and what restraint has to do with ambition.",
    category: "Philosophy",
    date: "July 2026",
    read: "5 min",
    image: hero,
  },
  {
    title: "Inside Drop 001",
    excerpt:
      "From the first sketch of the denim two-piece to the final stitch — a look at how the debut collection came together.",
    category: "Collection",
    date: "June 2026",
    read: "7 min",
    image: growth,
  },
  {
    title: "The Weight Of Good Cotton",
    excerpt:
      "Heavyweight jersey, honest construction, and why a garment should still hold its shape three years in.",
    category: "Craft",
    date: "May 2026",
    read: "4 min",
    image: lifestyle,
  },
  {
    title: "Stay Inclined: Notes On Momentum",
    excerpt:
      "Progress is rarely dramatic. It's a series of small, repeated decisions — here's how we think about that.",
    category: "Mindset",
    date: "April 2026",
    read: "6 min",
    image: polo,
  },
];

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Journal — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const [lead, ...rest] = POSTS;

  return (
    <div className="flex flex-col">
      <section className="mx-auto w-full max-w-[1600px] px-5 pt-24 sm:px-10 sm:pt-40">
        <Reveal>
          <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">Journal</p>
          <h1 className="display-hd mt-6 text-5xl sm:text-8xl">Notes In Motion</h1>
        </Reveal>

        <Reveal delay={100} className="mt-20 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-3xl bg-muted">
            <img
              src={lead.image}
              alt={lead.title}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-[1400ms] hover:scale-105"
            />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
              {lead.category} · {lead.date} · {lead.read}
            </p>
            <h2 className="display-hd mt-6 text-3xl sm:text-5xl">{lead.title}</h2>
            <p className="mt-6 text-sm leading-loose text-muted-foreground">{lead.excerpt}</p>
            <span className="mt-8 inline-block text-[10px] uppercase tracking-[0.3em] underline-offset-8">
              Coming soon
            </span>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-5 py-24 sm:px-10 sm:py-40">
        <div className="grid gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <Reveal key={post.title} delay={i * 90} as="article">
              <div className="overflow-hidden rounded-2xl bg-muted">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-[1400ms] hover:scale-105"
                />
              </div>
              <p className="mt-6 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                {post.category} · {post.date} · {post.read}
              </p>
              <h3 className="mt-4 text-xl tracking-tight">{post.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-24 text-center">
          <Link
            to="/shop"
            className="inline-block rounded-full border border-border px-8 py-4 text-[10px] uppercase tracking-[0.3em] transition-colors hover:border-foreground"
          >
            Shop the collection
          </Link>
        </Reveal>
      </section>

      <Newsletter />
    </div>
  );
}
