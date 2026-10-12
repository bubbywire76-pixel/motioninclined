import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listTransferOrders, markTransferPaid } from "@/lib/admin-orders.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/shopify";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({
    meta: [
      { title: "Transfer orders — Motion Inclined Admin" },
      { name: "description", content: "Review and verify Motion Inclined bank-transfer orders." },
      { property: "og:title", content: "Transfer orders — Motion Inclined Admin" },
      { property: "og:description", content: "Review and verify Motion Inclined bank-transfer orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOrders,
});

type Filter = "Pending Verification" | "Paid" | "All";

function AdminOrders() {
  const list = useServerFn(listTransferOrders);
  const markPaid = useServerFn(markTransferPaid);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("Pending Verification");
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-transfer-orders"], queryFn: () => list() });
  const verify = useMutation({
    mutationFn: (id: string) => markPaid({ data: { id } }),
    onSuccess: (row) => {
      toast.success(`${row.order_number} marked as paid.`);
      qc.invalidateQueries({ queryKey: ["admin-transfer-orders"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not verify."),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const orders = (data?.orders ?? []).filter((o) => filter === "All" || o.payment_status === filter);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pb-32 pt-24 sm:px-10 sm:pt-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="display-hd mt-6 text-5xl sm:text-6xl">Transfer orders.</h1>
        </div>
        <button onClick={signOut} className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">Sign out</button>
      </div>

      {isLoading && <p className="mt-16 text-sm text-muted-foreground">Loading orders…</p>}
      {error && <p className="mt-16 text-sm text-destructive">Orders could not be loaded.</p>}
      {data && !data.isAdmin && (
        <p className="mt-16 max-w-md text-sm leading-loose text-muted-foreground">
          This account doesn't have admin access. Ask the store owner to grant it.
        </p>
      )}

      {data?.isAdmin && (
        <>
          <div className="mt-12 flex gap-2">
            {(["Pending Verification", "Paid", "All"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors ${filter === f ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground"}`}>
                {f === "Pending Verification" ? "Pending" : f}
              </button>
            ))}
          </div>
          {orders.length === 0 && <p className="mt-12 text-sm text-muted-foreground">No orders here.</p>}
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {orders.map((o) => (
              <li key={o.id} className="grid gap-6 py-8 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2 text-sm">
                  <div className="flex flex-wrap items-baseline gap-4">
                    <span className="text-lg tracking-tight">{o.order_number}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{o.payment_status} · {o.order_status}</span>
                  </div>
                  <p>{o.customer_name} · {o.customer_phone} · {o.customer_email}</p>
                  <p className="text-muted-foreground">{o.delivery_address}</p>
                  <p className="text-muted-foreground">
                    {o.items.map((i) => `${i.name ?? "Item"}${i.size ? ` (${i.size})` : ""} × ${i.quantity ?? 1}`).join(", ")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Placed {new Date(o.created_at).toLocaleString("en-NG")}
                    {o.verified_at && ` · Verified ${new Date(o.verified_at).toLocaleString("en-NG")}`}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-4 sm:items-end">
                  <span className="text-lg tabular-nums">{formatPrice(o.amount)}</span>
                  {o.payment_status === "Pending Verification" && (
                    <button
                      disabled={verify.isPending}
                      onClick={() => {
                        if (confirm(`Confirm ${formatPrice(o.amount)} for ${o.order_number} arrived in your Moniepoint account?`)) verify.mutate(o.id);
                      }}
                      className="rounded-full bg-foreground px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-background disabled:opacity-50">
                      Verify & mark paid
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
