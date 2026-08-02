export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="skeleton aspect-[4/5] w-full rounded-[20px]" />
      <div className="skeleton mt-5 h-3 w-2/3 rounded-full" />
      <div className="skeleton mt-3 h-3 w-1/3 rounded-full" />
      <div className="skeleton mt-5 h-10 w-full rounded-full" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-24 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
