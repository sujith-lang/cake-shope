import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/permissions'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'Image must be under 5MB' }, { status: 400 })
    }

    const blob = await put(`cakes/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    return NextResponse.json({ success: true, url: blob.url }, { status: 200 })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 })
  }
}
