import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { z } from 'zod'

const categoryUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const validated = categoryUpdateSchema.parse(body)

    const existing = await prisma.category.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 })
    }

    if (validated.slug && validated.slug !== existing.slug) {
      const duplicateSlug = await prisma.category.findUnique({
        where: { slug: validated.slug },
      })
      if (duplicateSlug) {
        return NextResponse.json({ success: false, message: 'Slug already in use' }, { status: 400 })
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json({ success: true, data: updated, message: 'Category updated' }, { status: 200 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Category PUT error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update category' }, { status: 500 })
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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 })
    }

    if (category._count.products > 0) {
      // Soft-deactivate if products are assigned
      await prisma.category.update({
        where: { id },
        data: { isActive: false },
      })
      return NextResponse.json({
        success: true,
        message: 'Category has products assigned, so it has been deactivated rather than deleted to prevent broken product links.',
      }, { status: 200 })
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Category deleted successfully' }, { status: 200 })
  } catch (err) {
    console.error('Category DELETE error:', err)
    return NextResponse.json({ success: false, message: 'Failed to delete category' }, { status: 500 })
  }
}
