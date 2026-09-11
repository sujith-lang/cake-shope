import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, requireAdmin } from '@/lib/permissions'
import { z } from 'zod'

const customCakeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  cakeType: z.string().min(1, 'Cake type is required'),
  flavor: z.string().min(1, 'Flavor is required'),
  size: z.string().min(1, 'Size is required'),
  budget: z.number().nullable().optional(),
  message: z.string().optional(),
  referenceImage: z.string().optional(),
  requestedDate: z.string().min(1, 'Requested delivery date is required'),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthUser()
    const { searchParams } = new URL(req.url)
    const isAdmin = session?.role === 'ADMIN'

    const where: any = {}
    if (!isAdmin) {
      if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      }
      where.userId = session.id
    }

    const requests = await prisma.customCakeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json({ success: true, data: requests }, { status: 200 })
  } catch (error) {
    console.error('Custom cake GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch custom cake requests' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser()
    const body = await req.json()
    const validated = customCakeSchema.parse(body)

    const request = await prisma.customCakeRequest.create({
      data: {
        userId: session?.id || null,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        cakeType: validated.cakeType,
        flavor: validated.flavor,
        size: validated.size,
        budget: validated.budget,
        message: validated.message,
        referenceImage: validated.referenceImage,
        requestedDate: new Date(validated.requestedDate),
      },
    })

    return NextResponse.json({
      success: true,
      data: request,
      message: 'Your custom cake request has been submitted! Our chef will review and get back to you shortly.',
    }, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Custom cake POST error:', err)
    return NextResponse.json({ success: false, message: 'Failed to submit custom cake request' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json()
    const { id, status, adminNotes } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 })
    }

    const updated = await prisma.customCakeRequest.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    })

    return NextResponse.json({ success: true, data: updated, message: 'Custom cake request updated' }, { status: 200 })
  } catch (err) {
    console.error('Custom cake PATCH error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update custom cake request' }, { status: 500 })
  }
}
