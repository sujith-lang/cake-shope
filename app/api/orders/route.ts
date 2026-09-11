import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, requireAdmin } from '@/lib/permissions'
import { z } from 'zod'

const createOrderSchema = z.object({
  addressId: z.string().min(1, 'Delivery address is required'),
  paymentMethod: z.string().default('Cash on Delivery'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  deliveryTime: z.string().optional(),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const isAdminQuery = session.role === 'ADMIN' && searchParams.get('all') === 'true'

    const where: any = {}
    if (!isAdminQuery) {
      where.userId = session.id
    }
    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        address: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: orders }, { status: 200 })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Please login to place an order' }, { status: 401 })
    }

    const body = await req.json()
    const validated = createOrderSchema.parse(body)

    // 1. Fetch User Cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, message: 'Your cart is empty' }, { status: 400 })
    }

    // 2. Validate Address
    const address = await prisma.address.findFirst({
      where: { id: validated.addressId, userId: session.id },
    })
    if (!address) {
      return NextResponse.json({ success: false, message: 'Delivery address not found' }, { status: 404 })
    }

    // 3. Calculate Pricing
    let subtotal = 0
    for (const item of cart.items) {
      const price = item.product.discountPrice ?? item.product.price
      subtotal += price * item.quantity
    }

    let discount = 0
    if (validated.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: validated.couponCode.toUpperCase().trim() },
      })
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (subtotal * coupon.discountValue) / 100
          if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
            discount = coupon.maximumDiscount
          }
        } else {
          discount = Math.min(coupon.discountValue, subtotal)
        }
        discount = Math.round(discount)

        // Increment coupon count
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        })
      }
    }

    const deliveryCharge = subtotal > 799 ? 0 : 50
    const totalAmount = Math.max(0, subtotal - discount + deliveryCharge)

    // 4. Generate unique orderNumber
    const orderNumber = `CAKE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`

    // 5. Create Order & Order Items in a Transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.id,
          addressId: validated.addressId,
          subtotal,
          discount,
          deliveryCharge,
          totalAmount,
          paymentMethod: validated.paymentMethod,
          paymentStatus: validated.paymentMethod === 'Online Payment' ? 'PAID' : 'PENDING',
          status: 'PENDING',
          notes: validated.notes,
          deliveryDate: new Date(validated.deliveryDate),
          deliveryTime: validated.deliveryTime || 'Standard Delivery (2 PM - 6 PM)',
          items: {
            create: cart.items.map((i) => {
              const itemPrice = i.product.discountPrice ?? i.product.price
              return {
                productId: i.productId,
                productName: i.product.name,
                quantity: i.quantity,
                price: itemPrice,
                total: itemPrice * i.quantity,
              }
            }),
          },
        },
        include: {
          items: true,
          address: true,
        },
      })

      // Empty the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      })

      // Deduct product stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      return newOrder
    })

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order placed successfully!',
    }, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Order creation error:', err)
    return NextResponse.json({ success: false, message: 'Failed to create order' }, { status: 500 })
  }
}
