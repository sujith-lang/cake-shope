import prisma from '../lib/prisma.ts'
import bcrypt from 'bcryptjs'

async function setAdmin() {
  const email = 'sujith7089@gmail.com'
  const passwordPlain = '12345'
  const hashedPassword = await bcrypt.hash(passwordPlain, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      name: 'Sujith (Admin)',
    },
    create: {
      email,
      name: 'Sujith (Admin)',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('SUCCESS: Admin user configured:', {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    name: admin.name,
    isActive: admin.isActive,
  })

  process.exit(0)
}

setAdmin().catch((err) => {
  console.error('ERROR:', err)
  process.exit(1)
})
