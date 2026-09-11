import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { z } from 'zod'

const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().min(1),
  minimumOrderAmount: z.number().nullable().optional(),
  maximumDiscount: z.number().nullable().optional(),
  usageLimit: z.number().int().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: coupons }, { status: 200 })
  } catch (err) {
    console.error('Coupons GET error:', err)
    return NextResponse.json({ success: false, message: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json()
    const validated = couponSchema.parse(body)

    const existing = await prisma.coupon.findUnique({
      where: { code: validated.code },
    })
    if (existing) {
      return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: validated.code,
        description: validated.description,
        discountType: validated.discountType,
        discountValue: validated.discountValue,
        minimumOrderAmount: validated.minimumOrderAmount,
        maximumDiscount: validated.maximumDiscount,
        usageLimit: validated.usageLimit,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        isActive: validated.isActive,
      },
    })

    return NextResponse.json({ success: true, data: coupon, message: 'Coupon created' }, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Coupon POST error:', err)
    return NextResponse.json({ success: false, message: 'Failed to create coupon' }, { status: 500 })
  }
}
