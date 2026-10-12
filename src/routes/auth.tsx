import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" && s.redirect.startsWith("/") && !s.redirect.startsWith("//") ? s.redirect : "/admin/orders",
  }),
  head: () => ({
    meta: [
      { title: "Staff sign in — Motion Inclined" },
      { name: "description", content: "Sign in to the Motion Inclined staff area." },
      { property: "og:title", content: "Staff sign in — Motion Inclined" },
      { property: "og:description", content: "Sign in to the Motion Inclined staff area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMessage(error.message);
      navigate({ to: redirect, replace: true });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth" } });
      setBusy(false);
      setMessage(error ? error.message : "Check your email to confirm your account, then sign in.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-32 pt-28 sm:pt-40">
      <p className="eyebrow">Staff</p>
      <h1 className="display-hd mt-6 text-5xl">{mode === "signin" ? "Sign in." : "Create account."}</h1>
      <form onSubmit={submit} className="mt-12 space-y-5">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
          className="w-full border-b border-border bg-transparent py-3 text-sm outline-none focus:border-foreground" />
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
          className="w-full border-b border-border bg-transparent py-3 text-sm outline-none focus:border-foreground" />
        <button disabled={busy} className="mt-6 w-full rounded-full bg-foreground py-4 text-[10px] uppercase tracking-[0.3em] text-background disabled:opacity-50">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
      {message && <p className="mt-6 text-sm text-muted-foreground">{message}</p>}
      <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground underline-offset-8 hover:underline">
        {mode === "signin" ? "Need an account? Create one" : "Have an account? Sign in"}
      </button>
    </div>
  );
}
