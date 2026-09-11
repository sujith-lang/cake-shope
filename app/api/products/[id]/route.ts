import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { z } from 'zod'

const productUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  shortDescription: z.string().nullable().optional(),
  description: z.string().min(10).optional(),
  price: z.number().min(1).optional(),
  discountPrice: z.number().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  preparationTime: z.number().nullable().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 5

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        averageRating: Number(avgRating.toFixed(1)),
        reviewCount: product.reviews.length,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Product GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const validated = productUpdateSchema.parse(body)

    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    // Check slug collision if slug changed
    if (validated.slug && validated.slug !== existing.slug) {
      const duplicateSlug = await prisma.product.findUnique({
        where: { slug: validated.slug },
      })
      if (duplicateSlug) {
        return NextResponse.json({ success: false, message: 'Product slug already in use' }, { status: 400 })
      }
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: validated,
      include: { category: true },
    })

    return NextResponse.json({ success: true, data: updated, message: 'Product updated successfully' }, { status: 200 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Product PUT error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update product' }, { status: 500 })
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
    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    // Soft delete / deactivate or delete if no order dependencies
    const hasOrders = await prisma.orderItem.count({
      where: { productId: existing.id },
    })

    if (hasOrders > 0) {
      // Soft delete to protect historical order data
      await prisma.product.update({
        where: { id: existing.id },
        data: { isActive: false },
      })
      return NextResponse.json({
        success: true,
        message: 'Product has order history, so it was marked as inactive instead of permanently deleted.',
      }, { status: 200 })
    }

    await prisma.product.delete({
      where: { id: existing.id },
    })

    return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { status: 200 })
  } catch (err) {
    console.error('Product DELETE error:', err)
    return NextResponse.json({ success: false, message: 'Failed to delete product' }, { status: 500 })
  }
}
