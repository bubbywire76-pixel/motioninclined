import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Instagram, Music2, MessageCircle, Clock } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const DESCRIPTION =
  "Contact Motion Inclined — email, WhatsApp, Instagram and TikTok. Our team replies within one business day.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Contact — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = `From: ${data.get("name")} (${data.get("email")})\n\n${data.get("message")}`;
    window.location.href = `mailto:bubbywire76@gmail.com?subject=${encodeURIComponent(
      String(data.get("subject") || "Motion Inclined enquiry"),
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
    toast.success("Opening your mail app — we reply within one business day.");
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-10 sm:py-40">
      <Reveal className="max-w-2xl">
        <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">Contact</p>
        <h1 className="display-hd mt-6 text-5xl sm:text-8xl">Let's talk.</h1>
        <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
          Questions about sizing, an order, a collaboration or wholesale? Reach us directly.
        </p>
      </Reveal>

      <div className="mt-20 grid gap-16 lg:grid-cols-[1fr_1.2fr] sm:mt-32">
        <Reveal className="space-y-10">
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Email</p>
            <a
              href="mailto:bubbywire76@gmail.com"
              className="mt-3 inline-flex items-center gap-3 text-lg transition-opacity hover:opacity-60"
            >
              <Mail className="h-4 w-4" strokeWidth={1.3} />
              bubbywire76@gmail.com
            </a>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">WhatsApp</p>
            <a
              href="https://wa.me/2347043602465"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-3 text-lg transition-opacity hover:opacity-60"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.3} />
              +234 704 360 2465
            </a>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Social</p>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-lg transition-opacity hover:opacity-60"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.3} />
                @motioninclined
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-lg transition-opacity hover:opacity-60"
              >
                <Music2 className="h-4 w-4" strokeWidth={1.3} />
                @motioninclined
              </a>
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
              Business hours
            </p>
            <p className="mt-3 inline-flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.3} />
              <span>
                Monday — Friday, 9:00 — 18:00 WAT
                <br />
                Saturday, 10:00 — 16:00 WAT
                <br />
                Sunday, closed
              </span>
            </p>
          </div>
          <Link
            to="/faq"
            className="inline-block text-[10px] uppercase tracking-[0.3em] underline-offset-8 hover:underline"
          >
            Read the FAQ →
          </Link>
        </Reveal>

        <Reveal delay={120}>
          <form onSubmit={submit} className="space-y-5 rounded-3xl border border-border p-8 sm:p-12">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="name" label="Name" />
              <Field name="email" label="Email" type="email" />
            </div>
            <Field name="subject" label="Subject" />
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-[9px] uppercase tracking-[0.3em] text-muted-foreground"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-sm outline-none transition-colors focus:border-foreground"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-foreground py-4 text-[10px] uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85"
            >
              {sent ? "Sent" : "Send message"}
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[9px] uppercase tracking-[0.3em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        className="w-full rounded-full border border-border bg-background px-5 py-3.5 text-sm outline-none transition-colors focus:border-foreground"
      />
    </div>
  );
}
