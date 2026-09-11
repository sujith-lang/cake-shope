import Link from 'next/link'
import { Cake, ArrowLeft, Home, Sparkles } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="relative inline-block">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
            <Cake className="w-14 h-14 sm:w-18 sm:h-18 animate-bounce" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-stone-900 font-bold text-xs shadow-md">
            <Sparkles className="w-4 h-4" />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl sm:text-7xl font-bold font-serif text-rose-500">404</h1>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
            Oops! This crumb went missing
          </h2>
          <p className="text-stone-500 text-sm max-w-sm mx-auto">
            The confection you are looking for might have been eaten, renamed, or is currently baking in another oven.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className={buttonVariants({ variant: 'outline', className: 'w-full sm:w-auto gap-2' })}>
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link href="/cakes" className={buttonVariants({ className: 'w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white gap-2' })}>
            <Cake className="w-4 h-4" />
            Browse Fresh Cakes
          </Link>
        </div>
      </div>
    </div>
  )
}
