import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: true, data: { items: [], count: 0 } }, { status: 200 })
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
    })

    const items = wishlist?.items.map((i) => i.product) || []

    return NextResponse.json({
      success: true,
      data: {
        items,
        count: items.length,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Wishlist GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Please login to use your wishlist' }, { status: 401 })
    }

    const body = await req.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 })
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.id },
    })

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.id },
      })
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    })

    if (existing) {
      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({
        success: true,
        action: 'removed',
        message: 'Removed from wishlist',
      }, { status: 200 })
    } else {
      // Add to wishlist
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      })
      return NextResponse.json({
        success: true,
        action: 'added',
        message: 'Added to wishlist',
      }, { status: 200 })
    }
  } catch (err) {
    console.error('Wishlist POST error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update wishlist' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.id },
    })

    if (!wishlist) {
      return NextResponse.json({ success: true, message: 'Wishlist is empty' }, { status: 200 })
    }

    if (productId) {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          productId,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Item removed from wishlist' }, { status: 200 })
  } catch (err) {
    console.error('Wishlist DELETE error:', err)
    return NextResponse.json({ success: false, message: 'Failed to delete wishlist item' }, { status: 500 })
  }
}
