const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Resetting all user-generated content...')
  
  // List of models to clear. Using Prisma Client property names.
  const models = [
    'notification',
    'activity',
    'comment',
    'quoteLike',
    'quote',
    'listItem',
    'listLike',
    'list',
    'discussion',
    'favoriteMedia',
    'favoritePerson',
    'friendRequest',
    'friendship',
    'sharedSessionParticipant',
    'sharedSession',
    'mediaItem',
    'mediaStats',
    'report',
    'activity'
  ]

  for (const model of models) {
    if (prisma[model]) {
      try {
        const count = await prisma[model].deleteMany({})
        console.log(`Deleted ${count.count} records from ${model}`)
      } catch (err) {
        console.log(`Failed to delete from ${model}: ${err.message}`)
      }
    } else {
      console.log(`Model ${model} not found on prisma client.`)
    }
  }

  console.log('Reset complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
