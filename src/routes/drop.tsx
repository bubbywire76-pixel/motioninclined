import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DenimLaunchPage } from "@/components/DenimLaunchPage";
import { DENIM_HANDLE } from "@/lib/denim-launch";
import { fetchProductByHandle } from "@/lib/shopify";

const dropQuery = {
  queryKey: ["product", DENIM_HANDLE],
  queryFn: () => fetchProductByHandle(DENIM_HANDLE),
};

export const Route = createFileRoute("/drop")({
  loader: async ({ context }) => {
    const product = await context.queryClient.ensureQueryData(dropQuery);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => {
    const title = "Motion Signature Denim — Drop Announcement | Motion Inclined";
    const description = "The next Motion. Discover Motion Signature Denim, coming soon at ₦150,000. Explore the official drop details and join the launch notification list.";
    const image = loaderData?.images.edges[0]?.node.url;
    return { meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(image?.startsWith("https://") ? [
        { property: "og:image", content: image },
        { name: "twitter:image", content: image },
      ] : []),
    ] };
  },
  component: DropAnnouncement,
});

function DropAnnouncement() {
  const { data: product } = useSuspenseQuery(dropQuery);
  if (!product) return null;
  return <DenimLaunchPage product={product} announcement />;
}