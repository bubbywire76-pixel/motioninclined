import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { fetchProductByHandle } from "@/lib/shopify";

const productQueryOptions = (handle: string) => ({
  queryKey: ["product", handle],
  queryFn: () => fetchProductByHandle(handle),
});

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQueryOptions(params.handle));
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Merch Co.` },
          { name: "description", content: loaderData.description.slice(0, 160) },
          { property: "og:title", content: `${loaderData.title} — Merch Co.` },
          { property: "og:description", content: loaderData.description.slice(0, 160) },
        ]
      : [],
  }),
  component: ProductPage,
});

function ProductPage() {
  const initialProduct = Route.useLoaderData();
  const { data: product } = useSuspenseQuery({
    ...productQueryOptions(initialProduct.handle),
    initialData: initialProduct,
  });
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    product.options.forEach((option) => {
      defaults[option.name] = option.values[0];
    });
    return defaults;
  });

  const selectedVariant = product.variants.edges.find((edge) =>
    edge.node.selectedOptions.every((option) => selectedOptions[option.name] === option.value),
  )?.node;

  const image = product.images.edges[0]?.node;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </Link>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-[4/5] overflow-hidden rounded-lg bg-muted">
          {image ? (
            <img src={image.url} alt={image.altText || product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{product.title}</h1>
          <p className="mt-4 text-2xl font-semibold">
            {selectedVariant
              ? `${selectedVariant.price.currencyCode} ${parseFloat(selectedVariant.price.amount).toFixed(2)}`
              : `${product.priceRange.minVariantPrice.currencyCode} ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}`}
          </p>
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="mt-8 space-y-6">
            {product.options.map((option) => (
              <div key={option.name}>
                <label className="mb-2 block text-sm font-semibold">{option.name}</label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))}
                      className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedOptions[option.name] === value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="mt-10 w-full sm:w-auto"
            onClick={handleAddToCart}
            disabled={isLoading || !selectedVariant?.availableForSale}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingBag className="mr-2 h-4 w-4" />
            )}
            {selectedVariant?.availableForSale === false ? "Sold out" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
