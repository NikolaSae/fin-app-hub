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
    await prisma.vasService.create({
      data: {
        proizvod: faker.commerce.productName(),
        jedinicna_cena: faker.number.float({ min: 0.5, max: 10, precision: 0.01 }),
        fakturisan_iznos: faker.number.float({ min: 1000, max: 10000, precision: 0.01 }),
        fakturisan_korigovan_iznos: faker.number.float({ min: 900, max: 9500, precision: 0.01 }),
        naplacen_iznos: faker.number.float({ min: 800, max: 9000, precision: 0.01 }),
        kumulativ_naplacenih_iznosa: faker.number.float({ min: 10000, max: 50000, precision: 0.01 }),
        nenaplacen_iznos: faker.number.float({ min: 100, max: 1000, precision: 0.01 }),
        nenaplacen_korigovan_iznos: faker.number.float({ min: 50, max: 900, precision: 0.01 }),
        storniran_iznos: faker.number.float({ min: 0, max: 500, precision: 0.01 }),
        otkazan_iznos: faker.number.float({ min: 0, max: 300, precision: 0.01 }),
        kumulativ_otkazanih_iznosa: faker.number.float({ min: 1000, max: 2000, precision: 0.01 }),
        iznos_za_prenos_sredstava: faker.number.float({ min: 100, max: 500, precision: 0.01 }),
        status: faker.helpers.arrayElement(['active', 'paused', 'terminated']),
        remarks: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(['prepaid', 'postpaid']),
        provajderId: provajder.id,
      },
    })
  }
}

main()
  .then(() => console.log('✅ Seeded VAS servisi!'))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
