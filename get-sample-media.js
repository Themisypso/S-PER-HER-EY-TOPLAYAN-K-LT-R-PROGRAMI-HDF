const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const media = await prisma.media.findFirst({
    select: { externalId: true, type: true }
  })
  console.log(JSON.stringify(media))
}

main().catch(console.error).finally(() => prisma.$disconnect())
