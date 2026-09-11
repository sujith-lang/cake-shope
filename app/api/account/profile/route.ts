import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/permissions'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name is required').optional(),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

export async function GET() {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
            reviews: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 })
  } catch (err) {
    console.error('Profile GET error:', err)
    return NextResponse.json({ success: false, message: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = updateProfileSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (validated.name) updateData.name = validated.name
    if (validated.phone !== undefined) updateData.phone = validated.phone

    // Password change verification
    if (validated.newPassword) {
      if (!validated.currentPassword) {
        return NextResponse.json({ success: false, message: 'Current password is required to set a new password' }, { status: 400 })
      }
      const isMatch = await bcrypt.compare(validated.currentPassword, user.password)
      if (!isMatch) {
        return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 })
      }
      updateData.password = await bcrypt.hash(validated.newPassword, 10)
    }

    const updated = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    })

    return NextResponse.json({ success: true, data: updated, message: 'Profile updated successfully' }, { status: 200 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Profile PUT error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 })
  }
}
