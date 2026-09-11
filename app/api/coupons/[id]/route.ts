import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        description: body.description,
        discountType: body.discountType,
        discountValue: body.discountValue,
        minimumOrderAmount: body.minimumOrderAmount,
        maximumDiscount: body.maximumDiscount,
        usageLimit: body.usageLimit,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive,
      },
    })

    return NextResponse.json({ success: true, data: updated, message: 'Coupon updated' }, { status: 200 })
  } catch (err) {
    console.error('Coupon PUT error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    await prisma.coupon.delete({
      where: { id },
    })
    return NextResponse.json({ success: true, message: 'Coupon deleted' }, { status: 200 })
  } catch (err) {
    console.error('Coupon DELETE error:', err)
    return NextResponse.json({ success: false, message: 'Failed to delete coupon' }, { status: 500 })
  }
}
