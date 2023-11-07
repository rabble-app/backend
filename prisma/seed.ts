import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // add producer categories
  const producerCategories = [
    'Alcohol',
    'Bakery',
    'Coffee and Tea',
    'Drinks',
    'Fish and Seafood',
    'Fruits and Vegetables',
    'General',
    'Meat',
    'Speciality',
    'Farm and Diary',
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
  const productCategories = ['Fresh fruits', 'Fresh meat', 'Coffee', 'Eggs'];
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
      isVerified: true,
      userId: userRecord.id,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/flying-horse-coffee-espresso-blend-02+2+(1).jpg',
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

  // add category id to the producer
  await prisma.producerCategory.upsert({
    where: {
      producer_unique_category_option: {
        producerId: producerRecord.id,
        producerCategoryOptionId: producerCategoryOption.id,
      },
    },
    update: {},
    create: {
      producerId: producerRecord.id,
      producerCategoryOptionId: producerCategoryOption.id,
    },
  });

  // get producer product id
  const productCategoryA = await prisma.productCategory.findFirst({
    where: {
      name: 'Coffee',
    },
    select: {
      id: true,
    },
  });

  // add product A
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Espresso Blend Whole bean',
        producerId: producerRecord.id,
      },
    },
    update: {
      price: 20,
      orderUnit: 'Bag',
      subUnit: 'Bag',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Kg',
      measuresPerSubUnit: 1,
    },
    create: {
      name: 'Espresso Blend Whole bean',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/image+28.png',
      description: '1KG Whole bean',
      producerId: producerRecord.id,
      categoryId: productCategoryA.id,
      price: 20,
      orderUnit: 'Bag',
      subUnit: 'Bag',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Kg',
      measuresPerSubUnit: 1,
    },
  });

  // add product B
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Espresso Blend Ground',
        producerId: producerRecord.id,
      },
    },
    update: {
      price: 20,
      orderUnit: 'Bag',
      subUnit: 'Bag',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Kg',
      measuresPerSubUnit: 1,
    },
    create: {
      name: 'Espresso Blend Ground',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/image+28.png',
      description: '1KG Ground for Filter',
      producerId: producerRecord.id,
      categoryId: productCategoryA.id,
      price: 20,
      orderUnit: 'Bag',
      subUnit: 'Bag',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Kg',
      measuresPerSubUnit: 1,
    },
  });

  // producer B
  // save user record
  const userRecordB = await prisma.user.upsert({
    where: { email: 'claire@cacklebean.com' },
    update: {},
    create: {
      email: 'claire@cacklebean.com',
      phone: '+234...',
      password: 'rabble-info@claire@cacklebean.com',
      role: 'PRODUCER',
    },
  });

  // save producer record
  const producerRecordB = await prisma.producer.upsert({
    where: { userId: userRecordB.id },
    update: {},
    create: {
      isVerified: true,
      userId: userRecordB.id,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/138218168_184886313383283_3442809325911798953_n+2+(1).jpg',
      businessName: 'Cacklebean Farm',
      businessAddress:
        'Cackleberry Farm, Burford Road, Stow-on-the-Wold, Cheltenham, Gloucestershire GL54 1JY',
      accountsEmail: 'claire@cacklebean.com',
      salesEmail: 'orders@cacklebean.com',
      minimumTreshold: 48,
      website: 'https://www.cacklebean.com/',
      description:
        'Cackleberry Farm is nestled at the foot of a hill just outside Stow-on-the-Wold. Run by Paddy and Steph Bourns, their rare breed flocks are entirely free range and live in traditional chicken houses on 12 acres of land, with lots of perches.',
    },
  });

  // get producer category id
  const producerCategoryOptionB = await prisma.producerCategoryOption.findFirst(
    {
      where: {
        name: 'Farm and Diary',
      },
      select: {
        id: true,
      },
    },
  );

  // add category id to the producer
  await prisma.producerCategory.upsert({
    where: {
      producer_unique_category_option: {
        producerId: producerRecordB.id,
        producerCategoryOptionId: producerCategoryOptionB.id,
      },
    },
    update: {},
    create: {
      producerId: producerRecordB.id,
      producerCategoryOptionId: producerCategoryOptionB.id,
    },
  });

  // get producer product id
  const productCategoryAA = await prisma.productCategory.findFirst({
    where: {
      name: 'Eggs',
    },
    select: {
      id: true,
    },
  });

  // add product AA
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Cacklebean Eggs',
        producerId: producerRecord.id,
      },
    },
    update: {
      price: 2,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Carton',
      quantityOfSubUnitPerOrder: 20,
      unitsOfMeasurePerSubUnit: 'Egg',
      measuresPerSubUnit: 6,
    },
    create: {
      name: 'Cacklebean Eggs',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/image+29.png',
      description: 'Arlington White Cacklebean eggs from Cacklebean',
      producerId: producerRecordB.id,
      categoryId: productCategoryAA.id,
      price: 2,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Carton',
      quantityOfSubUnitPerOrder: 20,
      unitsOfMeasurePerSubUnit: 'Egg',
      measuresPerSubUnit: 6,
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
