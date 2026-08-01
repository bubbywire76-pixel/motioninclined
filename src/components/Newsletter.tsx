import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "./Reveal";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    toast.success("You're on the list. Stay inclined.");
    setEmail("");
  };

  return (
    <section className="border-t border-border bg-card px-6 py-28 sm:py-40">
      <Reveal className="mx-auto max-w-xl text-center">
        <h2 className="display-hd text-4xl sm:text-6xl">Stay Inclined.</h2>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Join our community for early access to exclusive drops.
        </p>
        <form onSubmit={submit} className="mx-auto mt-12 flex max-w-md flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 rounded-full border border-border bg-background px-6 py-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
          />
          <button
            type="submit"
            className="rounded-full bg-foreground px-8 py-4 text-[10px] uppercase tracking-[0.3em] text-background transition-all duration-300 hover:opacity-85"
          >
            Join
          </button>
        </form>
      </Reveal>
    </section>
  );
}
