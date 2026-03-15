const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.update({
      where: { 
        tenantId_email: {
          tenantId: 'default',
          email: 'investor@cambobia.com'
        }
      },
      data: {
        isEmailVerified: true,
        status: 'ACTIVE'
      }
    })
    console.log('✅ User updated:', user.email, 'Verified:', user.isEmailVerified, 'Status:', user.status)
  } catch (e) {
    console.error('❌ Error:', e.message)
  }
}

main().finally(() => prisma.$disconnect())
