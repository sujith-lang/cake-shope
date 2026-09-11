import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { generateCryptoToken } from '@/lib/auth'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('Please enter a valid email address.'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 })
    }

    const parseResult = forgotPasswordSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        message: parseResult.error.issues[0]?.message || 'Validation error',
      }, { status: 400 })
    }

    const { email } = parseResult.data
    const normalizedEmail = email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, isActive: true },
    })

    let resetToken: string | null = null

    if (user && user.isActive) {
      resetToken = generateCryptoToken()
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      })

      console.log(`[PASSWORD RESET] Token generated for ${normalizedEmail}: /reset-password?token=${resetToken}`)
    }

    // Always respond with a generic success message to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been generated.',
      // Provide token in dev mode for easy browser verification
      resetUrl: resetToken ? `/reset-password?token=${resetToken}` : null,
    }, { status: 200 })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to process password reset request. Please try again.',
    }, { status: 500 })
  }
}
