import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Loader2, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { DENIM_DETAILS, DENIM_HANDLE } from "@/lib/denim-launch";
import { subscribeToDenimLaunch } from "@/lib/denim-launch.functions";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

export function DenimLaunchPage({ product, announcement = false }: { product: ShopifyProduct["node"]; announcement?: boolean }) {
  const subscribe = useServerFn(subscribeToDenimLaunch);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
  const [error, setError] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const image = product.images.edges[0]?.node;

  return (
    <main className="mx-auto w-full max-w-[1600px] px-5 pb-24 pt-10 sm:px-10">
      <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] uppercase text-muted-foreground">
        <ArrowLeft className="h-3 w-3" /> Collection
      </Link>
      <section className="grid items-start gap-12 py-10 lg:grid-cols-[1.25fr_1fr] lg:gap-24 lg:py-16">
        <div className="relative overflow-hidden bg-muted">
          {image && <img src={image.url} alt={image.altText || product.title} fetchPriority="high" className="aspect-[2/3] w-full object-contain transition-transform duration-700 motion-safe:hover:scale-[1.02]" />}
          <span className="absolute left-5 top-5 bg-background/90 px-4 py-2 text-[10px] uppercase text-foreground">Coming soon</span>
          <Button variant="outline" size="icon" aria-label="View denim image full screen" title="View full image" onClick={() => setGalleryOpen(true)} className="absolute bottom-5 right-5 bg-background/90">
            <Maximize2 />
          </Button>
        </div>
        <div className="lg:sticky lg:top-32">
           <p className="eyebrow">{announcement ? "The next Motion — Drop announcement" : "The next Motion"}</p>
          <h1 className="display-hd mt-6 break-words text-4xl sm:text-5xl">{product.title}</h1>
          <p className="mt-7 text-xl">{formatPrice(product.priceRange.minVariantPrice.amount)}</p>
           {announcement && <div className="mt-8 border-y border-border py-6"><p className="text-[10px] uppercase text-muted-foreground">Launch date</p><p className="mt-3 text-2xl font-serif-display">To be announced</p></div>}
          <Button disabled variant="outline" className="mt-8 h-12 w-full rounded-none text-[10px] uppercase disabled:opacity-100">Coming soon</Button>
          <div className="mt-8 space-y-5 text-sm leading-loose text-muted-foreground">
            <p>A timeless statement piece engineered for those who move with intention.</p>
            <p>Crafted in a deep charcoal-black denim, the Motion Signature Denim pairs a relaxed contemporary silhouette with subtle tonal patterning and signature curved detailing.</p>
            <p>Every detail is intentionally understated — creating a piece that feels distinctive without demanding attention.</p>
            <p>Designed beyond seasons. Made to move with you.</p>
          </div>
          <div className="mt-10 border-y border-border py-6">
            {status === "success" ? <p role="status" className="text-sm leading-relaxed">You're on the list. We'll notify you when the Motion Signature Denim drops.</p> : open ? (
              <form onSubmit={async (event) => {
                event.preventDefault();
                setStatus("saving"); setError("");
                try {
                  await subscribe({ data: { email, productHandle: DENIM_HANDLE } });
                  setStatus("success");
                } catch { setStatus("idle"); setError("We couldn't save your email. Please try again."); }
              }}>
                <label htmlFor="denim-email" className="text-[10px] uppercase text-muted-foreground">Email address</label>
                <div className="mt-3 flex gap-2">
                  <input id="denim-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={status === "saving"} className="min-w-0 flex-1 border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground" />
                  <Button type="submit" disabled={status === "saving"} aria-label="Submit notification email" title="Join the launch list" className="h-12 w-12 rounded-none">
                    {status === "saving" ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                  </Button>
                </div>
                {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
              </form>
            ) : <Button variant="outline" onClick={() => setOpen(true)} className="h-12 w-full rounded-none text-[10px] uppercase">Notify Me <ArrowRight /></Button>}
          </div>
        </div>
      </section>
      <section className="border-t border-border py-16 sm:py-24">
        <Reveal><p className="eyebrow">Details</p><h2 className="display-hd mt-5 text-3xl sm:text-4xl">Designed beyond seasons.</h2></Reveal>
        <ul className="mt-10 grid gap-x-16 sm:grid-cols-2">
          {DENIM_DETAILS.map((detail) => <li key={detail} className="border-b border-border py-5 text-sm text-muted-foreground">{detail}</li>)}
        </ul>
      </section>
      {galleryOpen && image && (
        <div role="dialog" aria-modal="true" aria-label="Motion Signature Denim image" className="fixed inset-0 z-[80] flex flex-col bg-background" onKeyDown={(event) => { if (event.key === "Escape") setGalleryOpen(false); }}>
          <div className="flex justify-end p-5"><Button autoFocus variant="ghost" size="icon" aria-label="Close denim gallery" onClick={() => setGalleryOpen(false)}><X /></Button></div>
          <img src={image.url} alt={image.altText || product.title} className="min-h-0 flex-1 object-contain px-5 pb-8" />
        </div>
      )}
    </main>
  );
}