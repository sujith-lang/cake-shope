import { getSession } from './auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cache } from 'react'

export interface SafeUser {
  id: string
  name: string
  email: string
  role: 'CUSTOMER' | 'ADMIN'
  isActive: boolean
  phone?: string | null
}

/**
 * Memoized per request using React.cache.
 * Returns the current authenticated user from PostgreSQL without password hash.
 */
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const session = await getSession()
  if (!session?.id) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
      },
    })

    if (!user || !user.isActive) return null
    return user
  } catch (err) {
    console.error('Error in getCurrentUser:', err)
    return null
  }
})

export async function getAuthUser() {
  return await getSession()
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.id) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, message: 'Authentication required. Please sign in.' },
        { status: 401 }
      ),
    }
  }
  return { session, error: null }
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session?.id) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, message: 'Authentication required. Please sign in.' },
        { status: 401 }
      ),
    }
  }
  if (session.role !== 'ADMIN') {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, message: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      ),
    }
  }
  return { session, error: null }
}
