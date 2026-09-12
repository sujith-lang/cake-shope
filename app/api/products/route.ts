import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { z } from 'zod'

const productCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  shortDescription: z.string().optional(),
  description: z.string().min(10, 'Description is required'),
  price: z.number().min(1, 'Price must be greater than 0'),
  discountPrice: z.number().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string().min(1, 'Category is required'),
  image: z.string().min(1, 'Image URL or path is required'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  preparationTime: z.number().nullable().optional(),
})

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const sort = searchParams.get('sort') // price-asc, price-desc, name-asc, newest
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {}

    if (!includeInactive) {
      where.isActive = true
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    if (category) {
      where.category = {
        slug: category,
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price-asc') orderBy = { price: 'asc' }
    if (sort === 'price-desc') orderBy = { price: 'desc' }
    if (sort === 'name-asc') orderBy = { name: 'asc' }
    if (sort === 'newest') orderBy = { createdAt: 'desc' }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    })

    // Calculate average rating
    const productsWithRating = products.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
          : 5
      return {
        ...p,
        averageRating: Number(avgRating.toFixed(1)),
        reviewCount: p.reviews.length,
      }
    })

    return NextResponse.json({ success: true, data: productsWithRating }, { status: 200 })
  } catch (error: any) {
    console.error('Products GET error:', error)
    return NextResponse.json({ success: false, message: error?.message || 'Failed to fetch products', stack: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json()
    const validated = productCreateSchema.parse(body)

    const existingSlug = await prisma.product.findUnique({
      where: { slug: validated.slug },
    })

    if (existingSlug) {
      return NextResponse.json({ success: false, message: 'A product with this slug already exists' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        shortDescription: validated.shortDescription,
        description: validated.description,
        price: validated.price,
        discountPrice: validated.discountPrice,
        stock: validated.stock,
        categoryId: validated.categoryId,
        image: validated.image,
        isFeatured: validated.isFeatured,
        isActive: validated.isActive,
        preparationTime: validated.preparationTime,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ success: true, data: product, message: 'Product created successfully' }, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Product POST error:', err)
    return NextResponse.json({ success: false, message: 'Failed to create product' }, { status: 500 })
  }
}
