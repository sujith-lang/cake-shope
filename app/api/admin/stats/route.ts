import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingCustomCakes,
      recentOrders,
      ordersByStatus,
      paidOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.customCakeRequest.count({ where: { status: 'PENDING' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
    ])

    const totalRevenue = paidOrders._sum?.totalAmount ?? 0

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingCustomCakes,
        recentOrders,
        ordersByStatus,
      },
    }, { status: 200 })
  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json({ success: false, message: 'Failed to fetch admin stats' }, { status: 500 })
  }
}
