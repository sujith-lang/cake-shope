import { Skeleton } from "@/components/ui/skeleton"

export function ProductSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-pink-100 p-4 space-y-4">
      <Skeleton className="aspect-square w-full rounded-xl bg-pink-100/50" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/4 bg-pink-100/50" />
        <Skeleton className="h-5 w-3/4 bg-pink-100/50" />
        <Skeleton className="h-3 w-1/3 bg-pink-100/50" />
      </div>
      <div className="flex items-center justify-between pt-3">
        <Skeleton className="h-6 w-16 bg-pink-100/50" />
        <Skeleton className="h-9 w-20 rounded-full bg-pink-100/50" />
      </div>
    </div>
  )
}
