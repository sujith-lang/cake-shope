import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is missing or invalid.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string().min(1, 'Please confirm your password.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 })
    }

    const parseResult = resetPasswordSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        message: parseResult.error.issues[0]?.message || 'Validation error',
      }, { status: 400 })
    }

    const { token, password } = parseResult.data

    // Find user with this reset token and verify expiry
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new link.',
      }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Invalidate reset token and update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully updated. You can now log in.',
    }, { status: 200 })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to reset password. Please try again.',
    }, { status: 500 })
  }
}
