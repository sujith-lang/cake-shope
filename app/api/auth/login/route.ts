import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'
import { login } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 })
    }

    const parseResult = loginSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        message: parseResult.error.issues[0]?.message || 'Validation error',
      }, { status: 400 })
    }

    const { email, password } = parseResult.data
    const normalizedEmail = email.trim().toLowerCase()

    // Query only the fields required for authentication — never load orders/cart/wishlist
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, message: 'Account is inactive. Please contact support.' }, { status: 403 })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 })
    }

    // Create session cookie with only essential claims
    await login({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    // Return safe data (never return password or password hash)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: 'An unexpected error occurred during login. Please try again.' }, { status: 500 })
  }
}
