import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: messages }, { status: 200 })
  } catch (err) {
    console.error('Contact GET error:', err)
    return NextResponse.json({ success: false, message: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = contactSchema.parse(body)

    const message = await prisma.contactMessage.create({
      data: validated,
    })

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Thank you for reaching out! We will respond within 24 hours.',
    }, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: err.issues[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Contact POST error:', err)
    return NextResponse.json({ success: false, message: 'Failed to submit contact message' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json()
    const { id, status } = body

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true, data: updated, message: 'Message status updated' }, { status: 200 })
  } catch (err) {
    console.error('Contact PATCH error:', err)
    return NextResponse.json({ success: false, message: 'Failed to update message' }, { status: 500 })
  }
}
