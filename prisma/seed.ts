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
    'Farm and Dairy',
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
  const productCategories = [
    'Fresh Fruits',
    'Meat & Poultry',
    'Coffee',
    'Eggs',
  ];
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
      description:
        'Our signature brew. It’s easy to understand why this coffee is our best-seller. Two coffee regions roasted to perfection.',
      producerId: producerRecord.id,
      categoryId: productCategoryA.id,
      price: 20,
      wholesalePrice: 18.45,
      orderUnit: 'Bag',
      subUnit: 'Bag',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Kg',
      measuresPerSubUnit: 1,
      approvalStatus: 'APPROVED',
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
      description:
        'Our signature brew. It’s easy to understand why this coffee is our best-seller. Two coffee regions roasted to perfection.',
      producerId: producerRecord.id,
      categoryId: productCategoryA.id,
      price: 20,
      orderUnit: 'Bag',
      subUnit: 'Bag',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Kg',
      measuresPerSubUnit: 1,
      wholesalePrice: 18.45,
      approvalStatus: 'APPROVED',
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
      minimumTreshold: 40,
      website: 'https://www.cacklebean.com/',
      description:
        'Cackleberry Farm is nestled at the foot of a hill just outside Stow-on-the-Wold. Run by Paddy and Steph Bourns, their rare breed flocks are entirely free range and live in traditional chicken houses on 12 acres of land, with lots of perches.',
    },
  });

  // get producer category id
  const producerCategoryOptionB = await prisma.producerCategoryOption.findFirst(
    {
      where: {
        name: 'Farm and Dairy',
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
        producerId: producerRecordB.id,
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
      description:
        'One carton of 6 farm fresh Cacklebean eggs. This product is shipped as a 20 carton box and all cartons must be sold to your team before it is processed.',
      producerId: producerRecordB.id,
      categoryId: productCategoryAA.id,
      price: 2,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Carton',
      quantityOfSubUnitPerOrder: 20,
      unitsOfMeasurePerSubUnit: 'Egg',
      measuresPerSubUnit: 6,
      wholesalePrice: 1.7,
      approvalStatus: 'APPROVED',
    },
  });

  // producer C
  // save user record
  const userRecordC = await prisma.user.upsert({
    where: { email: 'www.fossemeadows.co.uk' },
    update: {},
    create: {
      email: 'www.fossemeadows.co.uk',
      phone: '01858 88 1000',
      password: 'rabble-www.fossemeadows.co.uk',
      role: 'PRODUCER',
    },
  });

  // save producer record
  const producerRecordC = await prisma.producer.upsert({
    where: { userId: userRecordC.id },
    update: {},
    create: {
      isVerified: true,
      userId: userRecordC.id,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/Fosse+-+Producer.jpg',
      businessName: 'Fosse Meadows',
      businessAddress:
        'Stud Farm  Station Road  North KilworthLeicestershire LE17 6JD',
      accountsEmail: 'www.fossemeadows.co.uk',
      salesEmail: 'orders@fossemeadows.co.uk',
      minimumTreshold: 180,
      website: 'https://fossemeadows.com',
      description:
        'At Fosse Meadows we pride ourselves on the welfare we deliver for our birds. We grow our birds slowly and traditionally. The Fosse bird is totally free ranging and grown naturally in small flocks to a minimum of 81 days. That’s three times longer than standard commercially-reared supermarket chicken, and two weeks longer than organic birds. Like the much-admired French chicken, we use three strains of French breeds and grow them to full maturity. This means our birds have longer legs, allowing them to roam and forage on rich, wildflower pasture. They are fed a cereal-based diet that is locally sourced where possible, with no antibiotics, additives or hormones. Fosse chicken simply has richer and more succulent meat, with stronger, nutritionally-rich bones too. Just how chicken should, and used to, taste.',
    },
  });

  // get producer category id
  const producerCategoryOptionC = await prisma.producerCategoryOption.findFirst(
    {
      where: {
        name: 'Meat',
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
        producerId: producerRecordC.id,
        producerCategoryOptionId: producerCategoryOptionC.id,
      },
    },
    update: {},
    create: {
      producerId: producerRecordC.id,
      producerCategoryOptionId: producerCategoryOptionC.id,
    },
  });

  // get producer product id
  const productCategoryCC = await prisma.productCategory.findFirst({
    where: {
      name: 'Meat & Poultry',
    },
    select: {
      id: true,
    },
  });

  // add product 1
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Whole Chicken + 3KG Breast',
        producerId: producerRecordC.id,
      },
    },
    update: {},
    create: {
      name: 'Whole Chicken + 3KG Breast',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Fosse+-+Product.jpg',
      description:
        '1 x Fosse 81 Day Total Freedom Free Range Chicken along with a 3KG vacuum pack of skin on breast',
      producerId: producerRecordC.id,
      categoryId: productCategoryCC.id,
      type: 'SINGLE',
      orderUnit: 'Box',
      subUnit: 'Box',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Bundle',
      measuresPerSubUnit: 1,
      price: 54.78,
      wholesalePrice: 49.8,
      approvalStatus: 'APPROVED',
    },
  });

  // add product 2
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: '2 Whole Chickens + 3KG Breast',
        producerId: producerRecordC.id,
      },
    },
    update: {},
    create: {
      name: '2 Whole Chickens + 3KG Breast',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Fosse+-+Product.jpg',
      description:
        '2 x Fosse 81 Day Total Freedom Free Range Chicken along with a 3KG vacuum pack of skin on breast',
      producerId: producerRecordC.id,
      categoryId: productCategoryCC.id,
      type: 'SINGLE',
      orderUnit: 'Box',
      subUnit: 'Box',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Bundle',
      measuresPerSubUnit: 1,
      price: 68.51,
      wholesalePrice: 49.8,
      approvalStatus: 'APPROVED',
    },
  });

  // add product 3
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Whole Chicken + 3KG Thigh',
        producerId: producerRecordC.id,
      },
    },
    update: {},
    create: {
      name: 'Whole Chicken + 3KG Thigh',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Fosse+-+Product.jpg',
      description:
        '1 x Fosse 81 Day Total Freedom Free Range Chicken along with a 3KG vacuum pack of thigh',
      producerId: producerRecordC.id,
      categoryId: productCategoryCC.id,
      type: 'SINGLE',
      orderUnit: 'Box',
      subUnit: 'Box',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Bundle',
      measuresPerSubUnit: 1,
      price: 49.1,
      wholesalePrice: 44.64,
      approvalStatus: 'APPROVED',
    },
  });

  // add product 4
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: '2 Whole Chickens + 3KG Thigh',
        producerId: producerRecordC.id,
      },
    },
    update: {},
    create: {
      name: '2 Whole Chickens + 3KG Thigh',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Fosse+-+Product.jpg',
      description:
        '2 x Fosse 81 Day Total Freedom Free Range Chicken along with a 3KG vacuum pack of thigh',
      producerId: producerRecordC.id,
      categoryId: productCategoryCC.id,
      type: 'SINGLE',
      orderUnit: 'Box',
      subUnit: 'Box',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Bundle',
      measuresPerSubUnit: 1,
      price: 62.83,
      wholesalePrice: 57.12,
      approvalStatus: 'APPROVED',
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
