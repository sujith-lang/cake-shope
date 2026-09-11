import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, requireAdmin } from '@/lib/permissions'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        ...(session.role !== 'ADMIN' ? { userId: session.id } : {}),
      },
      include: {
        address: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, image: true } },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 })
  } catch (error) {
    console.error('Order GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const { status, paymentStatus } = body

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      },
      include: {
        user: { select: { name: true, email: true } },
        address: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Order status updated to ${status || paymentStatus}`,
    }, { status: 200 })
  } catch (err) {
    console.error('Order PATCH error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update order status' }, { status: 500 })
  }
}
