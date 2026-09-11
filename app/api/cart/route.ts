import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/permissions'
import { z } from 'zod'

const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export async function GET() {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: true, data: { items: [], totalCount: 0, subtotal: 0 } }, { status: 200 })
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: session.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                discountPrice: true,
                image: true,
                stock: true,
                isActive: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  discountPrice: true,
                  image: true,
                  stock: true,
                  isActive: true,
                  category: { select: { name: true } },
                },
              },
            },
          },
        },
      })
    }

    const items = cart.items.map((item) => {
      const unitPrice = item.product.discountPrice ?? item.product.price
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: unitPrice,
        total: unitPrice * item.quantity,
        product: item.product,
      }
    })

    const totalCount = items.reduce((acc, i) => acc + i.quantity, 0)
    const subtotal = items.reduce((acc, i) => acc + i.total, 0)

    return NextResponse.json({
      success: true,
      data: {
        id: cart.id,
        items,
        totalCount,
        subtotal,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Please login to save your cart' }, { status: 401 })
    }

    const body = await req.json()
    const { productId, quantity } = cartItemSchema.parse(body)

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product || !product.isActive) {
      return NextResponse.json({ success: false, message: 'Product is currently unavailable' }, { status: 404 })
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: session.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.id },
      })
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    const unitPrice = product.discountPrice ?? product.price

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          price: unitPrice,
        },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price: unitPrice,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Item added to cart' }, { status: 200 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Cart POST error:', err)
    return NextResponse.json({ success: false, message: 'Failed to add item to cart' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { productId, quantity } = body

    const cart = await prisma.cart.findUnique({
      where: { userId: session.id },
    })

    if (!cart) {
      return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 })
    }

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId,
        },
      })
    } else {
      await prisma.cartItem.updateMany({
        where: {
          cartId: cart.id,
          productId,
        },
        data: { quantity },
      })
    }

    return NextResponse.json({ success: true, message: 'Cart updated' }, { status: 200 })
  } catch (err) {
    console.error('Cart PUT error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update cart' }, { status: 500 })
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

    const cart = await prisma.cart.findUnique({
      where: { userId: session.id },
    })

    if (!cart) {
      return NextResponse.json({ success: true, message: 'Cart is already empty' }, { status: 200 })
    }

    if (productId) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId,
        },
      })
    } else {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      })
    }

    return NextResponse.json({ success: true, message: 'Item removed from cart' }, { status: 200 })
  } catch (err) {
    console.error('Cart DELETE error:', err)
    return NextResponse.json({ success: false, message: 'Failed to delete from cart' }, { status: 500 })
  }
}
