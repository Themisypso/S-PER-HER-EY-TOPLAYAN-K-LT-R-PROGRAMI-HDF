const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const item = await prisma.mediaItem.findFirst({
    select: { id: true, tmdbId: true, type: true }
  })
  console.log(JSON.stringify(item))
}

main().catch(console.error).finally(() => prisma.$disconnect())
