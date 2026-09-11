import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        isActive: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            customCakeRequests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: customers }, { status: 200 })
  } catch (err) {
    console.error('Customers GET error:', err)
    return NextResponse.json({ success: false, message: 'Failed to fetch customers' }, { status: 500 })
  }
}
