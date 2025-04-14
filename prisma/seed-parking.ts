import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  const provajder = await prisma.provajder.upsert({
    where: { name: 'Test Provider' },
    update: {},
    create: { name: 'Test Provider' },
  })

  for (let i = 0; i < 10; i++) {
    await prisma.parkingService.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        kpi: faker.word.words(3),
        status: faker.helpers.arrayElement(['active', 'paused', 'terminated']),
        remarks: faker.lorem.sentence(),
        provajderId: provajder.id,
      },
    })
  }
}

main()
  .then(() => console.log('✅ Seeded Parking servisi!'))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
