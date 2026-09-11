import { Cake } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-rose-200 dark:border-rose-950 border-t-rose-500 animate-spin" />
        <Cake className="w-7 h-7 text-rose-500 absolute inset-0 m-auto" />
      </div>
      <p className="text-sm font-medium text-stone-500 animate-pulse font-serif">
        Fresh confections are baking...
      </p>
    </div>
  )
}
