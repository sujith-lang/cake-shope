'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App runtime error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center mx-auto text-rose-500">
          <AlertCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
            Something went wrong in the bakery!
          </h2>
          <p className="text-stone-500 text-sm">
            We encountered an unexpected recipe mishap. Please try refreshing or return to the storefront.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Link href="/" className={buttonVariants({ variant: 'outline', className: 'w-full sm:w-auto gap-2' })}>
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
