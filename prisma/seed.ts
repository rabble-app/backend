import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // add producer categories
  const producerCategories = [
    'Alcohol',
    'Bakery',
    'Coffee and Tea',
    'Dairy',
    'Drinks',
    'Fish and Seafood',
    'Fruits and Vegetables',
    'General',
    'Meat',
    'Speciality',
    'Supplies',
  ];
  for (let index = 0; index < producerCategories.length; index++) {
    const element = producerCategories[index];
    await prisma.producerCategoryOption.upsert({
      where: { name: element },
      update: {},
      create: {
        name: element,
      },
    });
  }

  // add product categories
  const productCategories = ['Fresh fruits', 'Fresh meat'];
  for (let index = 0; index < productCategories.length; index++) {
    const element = productCategories[index];
    await prisma.productCategory.upsert({
      where: { name: element },
      update: {},
      create: {
        name: element,
      },
    });
  }

  // save user record
  const userRecord = await prisma.user.upsert({
    where: { email: 'info@flyinghorsecoffee.com' },
    update: {},
    create: {
      email: 'info@flyinghorsecoffee.com',
      phone: '+234',
      password: 'rabble-info@flyinghorsecoffee.com',
      role: 'PRODUCER',
    },
  });

  // save producer record
  const producerRecord = await prisma.producer.upsert({
    where: { userId: userRecord.id },
    update: {},
    create: {
      userId: userRecord.id,
      imageUrl:
        'https://flyinghorsecoffee.com/cdn/shop/files/BLACK_80x@2x.png?v=1614324669',
      businessName: 'Flying Horse Coffee',
      businessAddress: '117 Mare Street, London, E8 4RU United Kingdom',
      accountsEmail: 'info@flyinghorsecoffee.com',
      salesEmail: 'info@flyinghorsecoffee.com',
      minimumTreshold: 88,
      website: 'https://flyinghorsecoffee.com/',
      description:
        'Flying Horse Coffee are on a mission to roast and deliver the highest quality and most sustainably sourced green beans from around the world. They source coffee beans seasonally, roasting in small batches for optimum freshness and flavour. Their packaging is 100% biobased and home compostable.',
    },
  });

  // get producer category id
  const producerCategoryOption = await prisma.producerCategoryOption.findFirst({
    where: {
      name: 'Coffee and Tea',
    },
    select: {
      id: true,
    },
  });

  // add producer id to the producer
  await prisma.producerCategory.create({
    data: {
      producerId: producerRecord.id,
      producerCategoryOptionId: producerCategoryOption.id,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
