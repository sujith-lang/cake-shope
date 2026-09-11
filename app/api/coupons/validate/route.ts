import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, subtotal } = body

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ success: false, message: 'Coupon code and subtotal are required' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, message: 'Invalid or expired coupon code' }, { status: 400 })
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, message: 'This coupon has expired' }, { status: 400 })
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, message: 'Coupon usage limit has been reached' }, { status: 400 })
    }

    if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
      return NextResponse.json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon`,
      }, { status: 400 })
    }

    let discountAmount = 0
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountValue) / 100
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount
      }
    } else {
      // FIXED
      discountAmount = Math.min(coupon.discountValue, subtotal)
    }

    discountAmount = Math.round(discountAmount)

    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully!',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ success: false, message: 'Failed to validate coupon' }, { status: 500 })
  }
}
