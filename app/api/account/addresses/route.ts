import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/permissions'
import { z } from 'zod'

const addressSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
})

export async function GET() {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ success: true, data: addresses }, { status: 200 })
  } catch (err) {
    console.error('Addresses GET error:', err)
    return NextResponse.json({ success: false, message: 'Failed to fetch addresses' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = addressSchema.parse(body)

    if (validated.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.id },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: session.id,
        name: validated.name,
        phone: validated.phone,
        addressLine1: validated.addressLine1,
        addressLine2: validated.addressLine2,
        city: validated.city,
        state: validated.state,
        postalCode: validated.postalCode,
        country: validated.country,
        isDefault: validated.isDefault,
      },
    })

    return NextResponse.json({ success: true, data: address, message: 'Address added' }, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Address POST error:', err)
    return NextResponse.json({ success: false, message: 'Failed to create address' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'Address ID is required' }, { status: 400 })
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.id },
        data: { isDefault: false },
      })
    }

    const updated = await prisma.address.update({
      where: { id, userId: session.id },
      data,
    })

    return NextResponse.json({ success: true, data: updated, message: 'Address updated' }, { status: 200 })
  } catch (err) {
    console.error('Address PUT error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update address' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'Address ID is required' }, { status: 400 })
    }

    await prisma.address.delete({
      where: { id, userId: session.id },
    })

    return NextResponse.json({ success: true, message: 'Address deleted' }, { status: 200 })
  } catch (err) {
    console.error('Address DELETE error:', err)
    return NextResponse.json({ success: false, message: 'Failed to delete address' }, { status: 500 })
  }
}
