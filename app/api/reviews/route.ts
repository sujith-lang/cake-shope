import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, requireAdmin } from '@/lib/permissions'
import { z } from 'zod'

const reviewSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, 'Review comment must be at least 3 characters'),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const all = searchParams.get('all') === 'true'

    if (all) {
      const { error } = await requireAdmin()
      if (error) return error

      const reviews = await prisma.review.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, image: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ success: true, data: reviews }, { status: 200 })
    }

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 })
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: reviews }, { status: 200 })
  } catch (err) {
    console.error('Reviews GET error:', err)
    return NextResponse.json({ success: false, message: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Please login to leave a review' }, { status: 401 })
    }

    const body = await req.json()
    const validated = reviewSchema.parse(body)

    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    })
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    // Auto-approve or queue for moderation
    const review = await prisma.review.create({
      data: {
        userId: session.id,
        productId: validated.productId,
        rating: validated.rating,
        comment: validated.comment,
        isApproved: false, // queued for admin approval
      },
      include: {
        user: { select: { name: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Thank you! Your review has been submitted for moderation.',
    }, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Review POST error:', err)
    return NextResponse.json({ success: false, message: 'Failed to submit review' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json()
    const { id, isApproved } = body

    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved },
    })

    return NextResponse.json({ success: true, data: updated, message: 'Review status updated' }, { status: 200 })
  } catch (err) {
    console.error('Review PATCH error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 })
    }

    await prisma.review.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Review deleted successfully' }, { status: 200 })
  } catch (err) {
    console.error('Review DELETE error:', err)
    return NextResponse.json({ success: false, message: 'Failed to delete review' }, { status: 500 })
  }
}
