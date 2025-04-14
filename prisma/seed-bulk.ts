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
    await prisma.bulkService.create({
      data: {
        provider_name: faker.company.companyName(),
        agreement_name: faker.lorem.words(2),
        service_name: faker.commerce.productName(),
        step_name: faker.word.noun(),
        sender_name: faker.name.firstName(),
        requests: faker.number.int({ min: 100, max: 5000 }),
        message_parts: faker.number.int({ min: 1, max: 10 }),
        kpi: faker.word.words(3),
        status: faker.helpers.arrayElement(['active', 'paused', 'terminated']),
        remarks: faker.lorem.sentence(),
        provajderId: provajder.id,
      },
    })
  }
}

main()
  .then(() => console.log('✅ Seeded Bulk servisi!'))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
