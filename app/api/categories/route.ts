import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'

    const categories = await prisma.category.findMany({
      where: all ? {} : { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: categories }, { status: 200 })
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json()
    const validated = categorySchema.parse(body)

    const existing = await prisma.category.findUnique({
      where: { slug: validated.slug },
    })

    if (existing) {
      return NextResponse.json({ success: false, message: 'Category with this slug already exists' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: validated,
    })

    return NextResponse.json({ success: true, data: category, message: 'Category created' }, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Category POST error:', err)
    return NextResponse.json({ success: false, message: 'Failed to create category' }, { status: 500 })
  }
}
