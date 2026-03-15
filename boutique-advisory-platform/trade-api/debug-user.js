
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'investor@cambobia.com' }
    })
    console.log('USER_DATA:' + JSON.stringify(user))
  } catch (e) {
    console.error('ERROR:' + e.message)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
