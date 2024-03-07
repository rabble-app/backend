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
    'Wine',
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
    'Red',
    'Orange',
    'White',
    'Pet Nat',
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

  // wine producer
  // save user record
  const userRecordD = await prisma.user.upsert({
    where: { email: 'sales@lescaves.co.uk' },
    update: {},
    create: {
      email: 'sales@lescaves.co.uk',
      phone: '01483 538820',
      password: 'rabble-sales@lescaves.co.uk',
      role: 'PRODUCER',
      postalCode: 'GU3 1LP',
    },
  });

  // save producer record
  const producerRecordD = await prisma.producer.upsert({
    where: { userId: userRecordD.id },
    update: {},
    create: {
      isVerified: true,
      userId: userRecordD.id,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/Producer+-+Les+Caves.jpg',
      businessName: 'Les Caves De Pyrene',
      businessAddress: 'Pew Corner, Old Portsmouth Rd, Guildford',
      accountsEmail: 'sales@lescaves.co.uk',
      salesEmail: 'sales@lescaves.co.uk',
      minimumTreshold: 320,
      website: 'https://www.lescaves.co.uk/',
      description: `Les Caves de Pyrene is an importer, agent, distributor and retailer of wines from around the world. They believe in promoting ‘natural’ wines: those that are expressive of their homeland; wines made by hand with minimal chemical intervention; and where the winemaking shows maximum respect for the environment.`,
    },
  });

  // get producer category id
  const producerCategoryOptionD = await prisma.producerCategoryOption.findFirst(
    {
      where: {
        name: 'Wine',
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
        producerId: producerRecordD.id,
        producerCategoryOptionId: producerCategoryOptionD.id,
      },
    },
    update: {},
    create: {
      producerId: producerRecordD.id,
      producerCategoryOptionId: producerCategoryOptionD.id,
    },
  });

  // get producer products(Red, Orange, White, Pet Nat) id
  const productCategoryRed = await prisma.productCategory.findFirst({
    where: {
      name: 'Red',
    },
    select: {
      id: true,
    },
  });

  const productCategoryOrange = await prisma.productCategory.findFirst({
    where: {
      name: 'Orange',
    },
    select: {
      id: true,
    },
  });

  const productCategoryWhite = await prisma.productCategory.findFirst({
    where: {
      name: 'White',
    },
    select: {
      id: true,
    },
  });

  const productCategoryPet = await prisma.productCategory.findFirst({
    where: {
      name: 'Pet Nat',
    },
    select: {
      id: true,
    },
  });

  // add product 2
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Beck Ink, 2021',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Beck Ink, 2021',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Weingut Judith Beck',
      producerId: producerRecordD.id,
      categoryId: productCategoryRed.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 13.54,
      wholesalePrice: 12.31,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '17.00',
    },
  });

  // add product 3
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Birch Barbera, 2022',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Birch Barbera, 2022',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Agricola Gaia Di Chiari Azzetti Gaia',
      producerId: producerRecordD.id,
      categoryId: productCategoryRed.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 12.18,
      wholesalePrice: 11.07,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '15.00',
    },
  });

  // add product 4
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Rainbow Juice, 2022',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Rainbow Juice, 2022',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Gentle Folk',
      producerId: producerRecordD.id,
      categoryId: productCategoryRed.id,
      type: 'SINGLE',
      orderUnit: 'Bottle',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 20.2,
      wholesalePrice: 18.36,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '26.00',
    },
  });

  // add product 6
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Baglio Antico Bianco, 2022',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Baglio Antico Bianco, 2022',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Ciello',
      producerId: producerRecordD.id,
      categoryId: productCategoryOrange.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 14.08,
      wholesalePrice: 12.8,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '18.00',
    },
  });

  // add product 7
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Saliciorino Malvasia, 2022',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Saliciorino Malvasia, 2022',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Finca Casa Balaguer',
      producerId: producerRecordD.id,
      categoryId: productCategoryOrange.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 16.99,
      wholesalePrice: 15.44,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '22.00',
    },
  });

  // add product 8
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Tragolargo Blanco, 2023',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Tragolargo Blanco, 2023',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Finca Casa Balaguer',
      producerId: producerRecordD.id,
      categoryId: productCategoryOrange.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 16.16,
      wholesalePrice: 14.69,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '19.00',
    },
  });

  // add product 9
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Calcarius Nu Litre Orange, NV',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Calcarius Nu Litre Orange, NV',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Azienda Agricola Passalacqua Valentina',
      producerId: producerRecordD.id,
      categoryId: productCategoryOrange.id,
      type: 'SINGLE',
      orderUnit: 'Bottle',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 1000,
      price: 19.31,
      wholesalePrice: 17.55,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '25.00',
    },
  });

  // add product 10
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Schele Amber, 2022',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Schele Amber, 2022',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Ma Arndorfer, Martin & Anna Arndorfer',
      producerId: producerRecordD.id,
      categoryId: productCategoryOrange.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 15.38,
      wholesalePrice: 13.99,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '19.50',
    },
  });

  // add product 11
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Runer Veltliner Handcrafted, 2023',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Runer Veltliner Handcrafted, 2023',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Ma Arndorfer, Martin & Anna Arndorfer',
      producerId: producerRecordD.id,
      categoryId: productCategoryWhite.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 14.37,
      wholesalePrice: 13.07,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '17.50',
    },
  });

  // add product 12
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Chianti Podere Gamba, 2021',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Chianti Podere Gamba, 2021',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'San Ferdinando, Val Di Chiana',
      producerId: producerRecordD.id,
      categoryId: productCategoryRed.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 13.66,
      wholesalePrice: 12.42,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '18.00',
    },
  });

  // add product 13
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Le Roc Ambulle, 2022 (single)',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Le Roc Ambulle, 2022 (single)',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Chateau Le Roc, Famille Ribes',
      producerId: producerRecordD.id,
      categoryId: productCategoryPet.id,
      type: 'SINGLE',
      orderUnit: 'Bottle',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 1500,
      price: 27.5,
      wholesalePrice: 25.0,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '33.00',
    },
  });

  // add product 14
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Le Roc Ambulle, 2022 (shared)',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Le Roc Ambulle, 2022 (shared)',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Chateau Le Roc, Famille Ribes',
      producerId: producerRecordD.id,
      categoryId: productCategoryPet.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 13.37,
      wholesalePrice: 12.15,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '16.50',
    },
  });

  // add product 15
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Cora Bianco, 2022',
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: 'Cora Bianco, 2022',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Loxarel, Mitjans',
      producerId: producerRecordD.id,
      categoryId: productCategoryWhite.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 13.19,
      wholesalePrice: 11.99,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '16.50',
    },
  });

  // add product 16
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Lo Petit Fantet D'Hippolyte Blanc, 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Lo Petit Fantet D'Hippolyte Blanc, 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Chateaux Ollieux Romanis, Domaine Pierre Bories',
      producerId: producerRecordD.id,
      categoryId: productCategoryWhite.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 12.18,
      wholesalePrice: 11.07,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '15.00',
    },
  });

  // add product 17
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Lo Petit Fantet D'Hippolyte Rouge, 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Lo Petit Fantet D'Hippolyte Rouge, 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Chateaux Ollieux Romanis, Domaine Pierre Bories',
      producerId: producerRecordD.id,
      categoryId: productCategoryRed.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 12.0,
      wholesalePrice: 10.91,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '15.00',
    },
  });

  // add product 18
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Trebbiano D'Abruzzo Frentang, 2023`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Trebbiano D'Abruzzo Frentang, 2023`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Cantina Sociale Frentana',
      producerId: producerRecordD.id,
      categoryId: productCategoryWhite.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 8.61,
      wholesalePrice: 7.83,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '11.55',
    },
  });

  // add product 19
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Gran Cerdo Blanco, 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Gran Cerdo Blanco, 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Gran Cerdo',
      producerId: producerRecordD.id,
      categoryId: productCategoryWhite.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 9.92,
      wholesalePrice: 9.02,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '12.50',
    },
  });

  // add product 20
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Trebbiano Secco, 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Trebbiano Secco, 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Camillo Donati',
      producerId: producerRecordD.id,
      categoryId: productCategoryPet.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 16.81,
      wholesalePrice: 15.28,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '21.00',
    },
  });

  // add product 21
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Lambrusco Rosso, 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Lambrusco Rosso, 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Camillo Donati',
      producerId: producerRecordD.id,
      categoryId: productCategoryPet.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 16.81,
      wholesalePrice: 15.28,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '22.00',
    },
  });

  // add product 22
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Malvasia Secco, 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Malvasia Secco, 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Camillo Donati',
      producerId: producerRecordD.id,
      categoryId: productCategoryPet.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 16.81,
      wholesalePrice: 15.28,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '22.00',
    },
  });

  // add product 23
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `IGT Marche Bianco "Di Gino", 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `IGT Marche Bianco "Di Gino", 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Fattoria San Lorenzo',
      producerId: producerRecordD.id,
      categoryId: productCategoryWhite.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 13.07,
      wholesalePrice: 11.88,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '16.25',
    },
  });

  // add product 24
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Saint Cyrgues VDF "Salamandre", 2023`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Saint Cyrgues VDF "Salamandre", 2023`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Chateaux Saint Cyrgues',
      producerId: producerRecordD.id,
      categoryId: productCategoryOrange.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 12.3,
      wholesalePrice: 11.18,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '16.00',
    },
  });

  // add product 25
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Rosso Piceno "Bacchus", 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Rosso Piceno "Bacchus", 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Ciu Ciu',
      producerId: producerRecordD.id,
      categoryId: productCategoryRed.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 10.63,
      wholesalePrice: 9.67,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '13.50',
    },
  });

  // add product 26
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Calcarius Frecciabomb Pet Nat Rosato, NV`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Calcarius Frecciabomb Pet Nat Rosato, NV`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Azienda Agricola Passalacqua Valentina',
      producerId: producerRecordD.id,
      categoryId: productCategoryPet.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 16.57,
      wholesalePrice: 15.07,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '21.00',
    },
  });

  // add product 27
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Pet Nat Rose, 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Pet Nat Rose, 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Fuchs Und Hase',
      producerId: producerRecordD.id,
      categoryId: productCategoryPet.id,
      type: 'SINGLE',
      orderUnit: 'Bottle',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 21.56,
      wholesalePrice: 19.6,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '26.00',
    },
  });

  // add product 28
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Moussamoussettes, 2021`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Moussamoussettes, 2021`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Domaine Rene Mosse',
      producerId: producerRecordD.id,
      categoryId: productCategoryPet.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 20.2,
      wholesalePrice: 18.36,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '27.00',
    },
  });

  // add product 29
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Salicornio Moscatel, 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Salicornio Moscatel, 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Finca Casa Balaguer',
      producerId: producerRecordD.id,
      categoryId: productCategoryOrange.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 16.99,
      wholesalePrice: 15.44,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '21.00',
    },
  });

  // add product 30
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Calcarius Nu Litre Bianco, NV`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Calcarius Nu Litre Bianco, NV`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Azienda Agricola Passalacqua Valentina',
      producerId: producerRecordD.id,
      categoryId: productCategoryWhite.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 1000,
      price: 19.01,
      wholesalePrice: 17.28,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '24.40',
    },
  });

  // add product 31
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Orange Wine, NV`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Orange Wine, NV`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Ancre Hill Estates',
      producerId: producerRecordD.id,
      categoryId: productCategoryOrange.id,
      type: 'SINGLE',
      orderUnit: 'Bottle',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 21.86,
      wholesalePrice: 19.87,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '28.00',
    },
  });

  // add product 32
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Vincenzo Bianco, 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Vincenzo Bianco, 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Fattoria Di Vaira',
      producerId: producerRecordD.id,
      categoryId: productCategoryOrange.id,
      type: 'PORTIONED_SINGLE_PRODUCT',
      orderUnit: 'Box',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 6,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 12.47,
      wholesalePrice: 11.34,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '16.00',
    },
  });

  // add product 33
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: `Crazy Crazy Pet Nat, 2022`,
        producerId: producerRecordD.id,
      },
    },
    update: {},
    create: {
      name: `Crazy Crazy Pet Nat, 2022`,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+-+Les+Caves.jpg',
      description: 'Marto Wines',
      producerId: producerRecordD.id,
      categoryId: productCategoryPet.id,
      type: 'SINGLE',
      orderUnit: 'Bottle',
      subUnit: 'Bottle',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'ML',
      measuresPerSubUnit: 750,
      price: 19.54,
      wholesalePrice: 17.77,
      approvalStatus: 'APPROVED',
      vat: '20',
      rrp: '27.00',
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
