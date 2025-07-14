import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // create supplement tags
  await prisma.supplementTags.createMany({
    data: [
      {
        name: 'Boost Focus and Memory',
        type: 'GOALS',
      },
      {
        name: 'Reduce Anxiety and Stress',
        type: 'GOALS',
      },
      {
        name: 'Enhance Energy and Vitality',
        type: 'GOALS',
      },
      {
        name: 'Age Gracefully and Healthily',
        type: 'GOALS',
      },
      {
        name: 'Improve Physical Performance and Recovery',
        type: 'GOALS',
      },
      {
        name: 'Strengthen Immunity and Resilience',
        type: 'GOALS',
      },
      {
        name: 'Support Daily Wellness',
        type: 'GOALS',
      },
      {
        name: 'Improve Emotional Regulation',
        type: 'GOALS',
      },
      {
        name: 'Heart Health',
        type: 'CATEGORY',
      },
      {
        name: 'North East',
        type: 'CATEGORY',
      },
      {
        name: 'Fetility',
        type: 'CATEGORY',
      },
      {
        name: 'Sleep',
        type: 'CATEGORY',
      },
      {
        name: 'Healthy Aging',
        type: 'CATEGORY',
      },
      {
        name: 'Longevity',
        type: 'CATEGORY',
      },
      {
        name: 'Weight Training',
        type: 'CATEGORY',
      },
      {
        name: 'Athletics',
        type: 'CATEGORY',
      },
      {
        name: 'Immunity',
        type: 'CATEGORY',
      },
      {
        name: 'Cognitive Function',
        type: 'CATEGORY',
      },
      {
        name: 'Joint Health',
        type: 'CATEGORY',
      },
      {
        name: 'Gut Health',
        type: 'CATEGORY',
      },
      {
        name: 'Skin Health',
        type: 'CATEGORY',
      },
      {
        name: 'Mood and Anxiety',
        type: 'CATEGORY',
      },
      {
        name: 'Reduce Oxidative Stress',
        type: 'FUNCTION',
      },
      {
        name: 'Improve Cellular Health',
        type: 'FUNCTION',
      },
      {
        name: 'Boost Mitochondrial Function',
        type: 'FUNCTION',
      },
      {
        name: 'Enhance Recovery',
        type: 'FUNCTION',
      },
      {
        name: 'Build Strength and Endurance',
        type: 'FUNCTION',
      },
      {
        name: 'Support Hormonal Health',
        type: 'FUNCTION',
      },
      {
        name: 'Promote Relaxation and Sleep',
        type: 'FUNCTION',
      },
      {
        name: 'Strengthen Joints and Skin',
        type: 'FUNCTION',
      },
      {
        name: 'Improve Digestion',
        type: 'FUNCTION',
      },
      {
        name: 'Neurodivergent Support',
        type: 'AUDIENCE',
      },
      {
        name: 'Athletes & Weight Trainers',
        type: 'AUDIENCE',
      },
      {
        name: 'Longevity Enthusiasts',
        type: 'AUDIENCE',
      },
      {
        name: 'Women’s Health',
        type: 'AUDIENCE',
      },
      {
        name: 'Most Popular',
        type: 'SORT',
      },
    ],
  });

  // // create postal code regions
  await prisma.postalCodeRegion.createMany({
    data: [
      {
        id: '1',
        name: 'Scotland',
      },
      {
        id: '2',
        name: 'East of England',
      },
      {
        id: '3',
        name: 'West Midlands',
      },
      {
        id: '4',
        name: 'South West',
      },
      {
        id: '5',
        name: 'North West',
      },
      {
        id: '6',
        name: 'South East',
      },
      {
        id: '7',
        name: 'Greater London',
      },
      {
        id: '8',
        name: 'Northern Ireland',
      },
      {
        id: '9',
        name: 'Wales',
      },
      {
        id: '10',
        name: 'North East',
      },
      {
        id: '11',
        name: 'East Midlands',
      },
      {
        id: '12',
        name: 'Central London',
      },
      {
        id: '13',
        name: 'Channel Islands',
      },
      {
        id: '14',
        name: 'Isle of Man',
      },
    ],
  });

  // // create postal code areas
  await prisma.postalCodeArea.createMany({
    data: [
      // area 2
      {
        regionId: '1',
        code: 'AB',
        name: 'Aberdeen',
      },
      // area 3
      {
        regionId: '2',
        code: 'AL',
        name: 'St. Albans',
      },
      // area 4
      {
        regionId: '3',
        code: 'B',
        name: 'Birmingham',
      },
      // area 5
      {
        regionId: '4',
        code: 'BA',
        name: 'Bath',
      },
      // area 6
      {
        regionId: '5',
        code: 'BB',
        name: 'Blackburn',
      },
      // area 7
      {
        regionId: '5',
        code: 'BD',
        name: 'Bradford',
      },
      // area 8
      {
        regionId: '4',
        code: 'BH',
        name: 'Bournemouth',
      },
      // area 9
      {
        regionId: '5',
        code: 'BL',
        name: 'Bolton',
      },
      // area 10
      {
        regionId: '6',
        code: 'BN',
        name: 'Brighton',
      },
      // area 11
      {
        regionId: '7',
        code: 'BR',
        name: 'Bromley',
      },
      // area 12
      {
        regionId: '4',
        code: 'BS',
        name: 'Bristol',
      },
      // area 13
      {
        regionId: '8',
        code: 'BT',
        name: 'Belfast',
      },
      // area 14
      {
        regionId: '5',
        code: 'CA',
        name: 'Carlisle',
      },
      // area 15
      {
        regionId: '2',
        code: 'CB',
        name: 'Cambridge',
      },
      // area 16
      {
        regionId: '9',
        code: 'CF',
        name: 'Cardiff',
      },
      // area 17
      {
        regionId: '5',
        code: 'CH',
        name: 'Chester',
      },
      // area 18
      {
        regionId: '2',
        code: 'CM',
        name: 'Chelmsford',
      },
      // area 19
      {
        regionId: '2',
        code: 'CO',
        name: 'Colchester',
      },
      // area 20
      {
        regionId: '7',
        code: 'CR',
        name: 'Croydon',
      },
      // area 21
      {
        regionId: '6',
        code: 'CT',
        name: 'Canterbury',
      },
      // area 22
      {
        regionId: '3',
        code: 'CV',
        name: 'Coventry',
      },
      // area 23
      {
        regionId: '5',
        code: 'CW',
        name: 'Crewe',
      },
      // area 24
      {
        regionId: '7',
        code: 'DA',
        name: 'Dartford',
      },
      // area 25
      {
        regionId: '1',
        code: 'DD',
        name: 'Dundee',
      },
      // area 26
      {
        regionId: '11',
        code: 'DE',
        name: 'Derby',
      },
      // area 27
      {
        regionId: '1',
        code: 'DG',
        name: 'Dumfries',
      },
      // area 28
      {
        regionId: '10',
        code: 'DH',
        name: 'Durham',
      },
      // area 29
      {
        regionId: '10',
        code: 'DL',
        name: 'Darlington',
      },
      // area 30
      {
        regionId: '11',
        code: 'DN',
        name: 'Doncaster',
      },
      // area 31
      {
        regionId: '4',
        code: 'DT',
        name: 'Dorchester',
      },
      // area 32
      {
        regionId: '3',
        code: 'DY',
        name: 'Dudley',
      },
      // area 33
      {
        regionId: '12',
        code: 'E',
        name: 'London Eastern',
      },
      // area 34
      {
        regionId: '12',
        code: 'EC',
        name: 'London Eastern Central',
      },
      // area 35
      {
        regionId: '1',
        code: 'EH',
        name: 'Edinburgh',
      },
      // area 36
      {
        regionId: '7',
        code: 'EN',
        name: 'Enfield',
      },
      // area 37
      {
        regionId: '4',
        code: 'EX',
        name: 'Exeter',
      },
      // area 38
      {
        regionId: '1',
        code: 'FK',
        name: 'Falkirk',
      },
      // area 39
      {
        regionId: '5',
        code: 'FY',
        name: 'Blackpool',
      },
      // area 40
      {
        regionId: '1',
        code: 'G',
        name: 'Glasgow',
      },
      // area 41
      {
        regionId: '4',
        code: 'GL',
        name: 'Gloucester',
      },
      // area 42
      {
        regionId: '6',
        code: 'GU',
        name: 'Guilford',
      },
      // area 43
      {
        regionId: '13',
        code: 'GY',
        name: 'Guernsey',
      },
      // area 44
      {
        regionId: '7',
        code: 'HA',
        name: 'Harrow',
      },
      // area 45
      {
        regionId: '5',
        code: 'HD',
        name: 'Huddersfield',
      },
      // area 46
      {
        regionId: '10',
        code: 'HG',
        name: 'Harrogate',
      },
      // area 47
      {
        regionId: '2',
        code: 'HP',
        name: 'Hemel',
      },
      // area 48
      {
        regionId: '3',
        code: 'HR',
        name: 'Hereford',
      },
      // area 49
      {
        regionId: '1',
        code: 'HS',
        name: 'Comhairle nan Eilean Siar',
      },
      // area 50
      {
        regionId: '10',
        code: 'HU',
        name: 'Hull',
      },
      // area 51
      {
        regionId: '5',
        code: 'HX',
        name: 'Halifax',
      },
      // area 52
      {
        regionId: '7',
        code: 'IG',
        name: 'Ilford',
      },
      // area 53
      {
        regionId: '14',
        code: 'IM',
        name: 'Isle of Man',
      },
      // area 54
      {
        regionId: '2',
        code: 'IP',
        name: 'Ipswich',
      },
      // area 55
      {
        regionId: '1',
        code: 'IV',
        name: 'Inverness',
      },
      // area 56
      {
        regionId: '13',
        code: 'JE',
        name: 'Jersey',
      },
      // area 57
      {
        regionId: '1',
        code: 'KA',
        name: 'Kilmarnock',
      },
      // area 58
      {
        regionId: '7',
        code: 'KT',
        name: 'Kingston',
      },
      // area 59
      {
        regionId: '1',
        code: 'KW',
        name: 'Kirkwall',
      },
      // area 60
      {
        regionId: '1',
        code: 'KY',
        name: 'Kirkaldy',
      },
      // area 61
      {
        regionId: '5',
        code: 'L',
        name: 'Liverpool',
      },
      // area 62
      {
        regionId: '5',
        code: 'LA',
        name: 'Lancaster',
      },
      // area 63
      {
        regionId: '9',
        code: 'LD',
        name: 'Llandrindod',
      },
      // area 64
      {
        regionId: '11',
        code: 'LE',
        name: 'Leicester',
      },
      // area 65
      {
        regionId: '9',
        code: 'LL',
        name: 'Llandudno',
      },
      // area 66
      {
        regionId: '11',
        code: 'LN',
        name: 'Lincoln',
      },
      // area 67
      {
        regionId: '10',
        code: 'LS',
        name: 'Leeds',
      },
      // area 68
      {
        regionId: '2',
        code: 'LU',
        name: 'Luton',
      },
      // area 69
      {
        regionId: '5',
        code: 'M',
        name: 'Manchester',
      },
      // area 70
      {
        regionId: '6',
        code: 'ME',
        name: 'Medway',
      },
      // area 71
      {
        regionId: '6',
        code: 'MK',
        name: 'Milton Keynes',
      },
      // area 72
      {
        regionId: '1',
        code: 'ML',
        name: 'Motherwell',
      },
      // area 73
      {
        regionId: '12',
        code: 'N',
        name: 'London Northern',
      },
      // area 74
      {
        regionId: '10',
        code: 'NE',
        name: 'Newcastle',
      },
      // area 75
      {
        regionId: '11',
        code: 'NG',
        name: 'Nottingham',
      },
      // area 76
      {
        regionId: '3',
        code: 'NN',
        name: 'Northampton',
      },
      // area 77
      {
        regionId: '9',
        code: 'NP',
        name: 'Newport',
      },
      // area 78
      {
        regionId: '2',
        code: 'NR',
        name: 'Norwich',
      },
      // area 79
      {
        regionId: '12',
        code: 'NW',
        name: 'London North Western',
      },
      // area 80
      {
        regionId: '5',
        code: 'OL',
        name: 'Oldham',
      },
      // area 81
      {
        regionId: '6',
        code: 'OX',
        name: 'Oxford',
      },
      // area 82
      {
        regionId: '1',
        code: 'PA',
        name: 'Paisley',
      },
      // area 83
      {
        regionId: '2',
        code: 'PE',
        name: 'Peterborough',
      },
      // area 84
      {
        regionId: '1',
        code: 'PH',
        name: 'Perth',
      },
      // area 85
      {
        regionId: '4',
        code: 'PL',
        name: 'Plymouth',
      },
      // area 86
      {
        regionId: '6',
        code: 'PO',
        name: 'Portsmouth',
      },
      // area 87
      {
        regionId: '5',
        code: 'PR',
        name: 'Preston',
      },
      // area 88
      {
        regionId: '6',
        code: 'RG',
        name: 'Reading',
      },
      // area 89
      {
        regionId: '6',
        code: 'RH',
        name: 'Redhill',
      },
      // area 90
      {
        regionId: '7',
        code: 'RM',
        name: 'Romford',
      },
      // area 91
      {
        regionId: '11',
        code: 'S',
        name: 'Sheffield',
      },
      // area 92
      {
        regionId: '9',
        code: 'SA',
        name: 'Swansea',
      },
      // area 93
      {
        regionId: '12',
        code: 'SE',
        name: 'London South Eastern',
      },
      // area 94
      {
        regionId: '2',
        code: 'SG',
        name: 'Stevenage',
      },
      // area 95
      {
        regionId: '5',
        code: 'SK',
        name: 'Stockport',
      },
      // area 96
      {
        regionId: '6',
        code: 'SL',
        name: 'Slough',
      },
      // area 97
      {
        regionId: '7',
        code: 'SM',
        name: 'Sutton',
      },
      // area 98
      {
        regionId: '4',
        code: 'SN',
        name: 'Swindon',
      },
      // area 99
      {
        regionId: '6',
        code: 'SO',
        name: 'Southampton',
      },
      // area 100
      {
        regionId: '4',
        code: 'SP',
        name: 'Salisbury',
      },
      // area 101
      {
        regionId: '10',
        code: 'SR',
        name: 'Sunderland',
      },
      // area 102
      {
        regionId: '2',
        code: 'SS',
        name: 'Southend',
      },
      // area 103
      {
        regionId: '3',
        code: 'ST',
        name: 'Stoke on Trent',
      },
      // area 104
      {
        regionId: '12',
        code: 'SW',
        name: 'London South Western',
      },
      // area 105
      {
        regionId: '9',
        code: 'SY',
        name: 'Shrewsbury',
      },
      // area 106
      {
        regionId: '4',
        code: 'TA',
        name: 'Taunton',
      },
      // area 107
      {
        regionId: '1',
        code: 'TD',
        name: 'Galashiels',
      },
      // area 108
      {
        regionId: '3',
        code: 'TF',
        name: 'Telford',
      },
      // area 109
      {
        regionId: '6',
        code: 'TN',
        name: 'Tonbridge',
      },
      // area 110
      {
        regionId: '4',
        code: 'TQ',
        name: 'Torquay',
      },
      // area 111
      {
        regionId: '4',
        code: 'TR',
        name: 'Truro',
      },
      // area 112
      {
        regionId: '10',
        code: 'TS',
        name: 'Cleveland',
      },
      // area 113
      {
        regionId: '7',
        code: 'TW',
        name: 'Twickenham',
      },
      // area 114
      {
        regionId: '7',
        code: 'UB',
        name: 'Southall',
      },
      // area 115
      {
        regionId: '12',
        code: 'W',
        name: 'London Western',
      },
      // area 116
      {
        regionId: '5',
        code: 'WA',
        name: 'Warrington',
      },
      // area 117
      {
        regionId: '12',
        code: 'WC',
        name: 'London Western Central',
      },
      // area 118
      {
        regionId: '7',
        code: 'WD',
        name: 'Watford',
      },
      // area 119
      {
        regionId: '10',
        code: 'WF',
        name: 'Wakefield',
      },
      // area 120
      {
        regionId: '5',
        code: 'WN',
        name: 'Wigan',
      },
      // area 121
      {
        regionId: '3',
        code: 'WR',
        name: 'Worcester',
      },
      // area 122
      {
        regionId: '3',
        code: 'WS',
        name: 'Walsall',
      },
      // area 123
      {
        regionId: '3',
        code: 'WV',
        name: 'Wolverhampton',
      },
      // area 124
      {
        regionId: '10',
        code: 'YO',
        name: 'York',
      },
      // area 125
      {
        regionId: '1',
        code: 'ZE',
        name: 'Shetland',
      },
    ],
  });

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
  for (const element of producerCategories) {
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

  for (const element of productCategories) {
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Weingut+Judith+Beck+Beck+Ink%2C+2021Weingut+Judith+Beck+Beck+Ink%2C+2021-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Birch+Barbera%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Gentle+Folk+Rainbow+Juice%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Ciello+Baglio+Antico+Bianco%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Finca+Casa+Balaguer+Saliciorino+Malvasia%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Finca+Casa+Balaguer+Tragolargo+Blanco%2C+2023-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Azienda+Agricola+Passalacqua+Valentina+Calcarius+Nu+Litre+Orange%2C+NV-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Ma+Arndorfer%2C+Martin+%26+Anna+Arndorfer+Schele+Amber%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Ma+Arndorfer%2C+Martin+%26+Anna+Arndorfer+Runer+Veltliner+Handcrafted%2C+2023-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/San+Ferdinando%2C+Val+Di+Chiana+Chianti+Podere+Gamba%2C+2021-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Chateau+Le+Roc%2C+Famille+Ribes+Le+Roc+Ambulle%2C+2022+1L-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Chateau+Le+Roc%2C+Famille+Ribes+Le+Roc+Ambulle%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Loxarel%2C+Mitjans+Cora+Bianco%2C+2022-Photoroom.jpg',
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
      imageUrl: `https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Chateaux+Ollieux+Romanis%2C+Domaine+Pierre+Bories+Lo+Petit+Fantet+D'Hippolyte+Blanc%2C+2022-Photoroom.jpg`,
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
      imageUrl: `https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Chateaux+Ollieux+Romanis%2C+Domaine+Pierre+Bories+Lo+Petit+Fantet+D'Hippolyte+Rouge%2C+2022-Photoroom.jpg`,
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
      imageUrl: `https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Cantina+Sociale+Frentana+Trebbiano+D'Abruzzo+Frentang%2C+2023-Photoroom.jpg`,
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Gran+Cerdo+Gran+Cerdo+Blanco%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Camillo+Donati+Trebbiano+Secco%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Camillo+Donati+Lambrusco+Rosso%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Camillo+Donati+Malvasia+Secco%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Fattoria+San+Lorenzo+IGT+Marche+Bianco+%22Di+Gino%22%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Chateaux+Saint+Cyrgues+Saint+Cyrgues+VDF+%22Salamandre%22%2C+2023-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Ciu+Ciu+Rosso+Piceno+%22Bacchus%22%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Azienda+Agricola+Passalacqua+Valentina+Calcarius+Frecciabomb+Pet+Nat+Rosato%2C+NV-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Fuchs+Und+Hase+Pet+Nat+Rose%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Domaine+Rene+Mosse+Moussamoussettes%2C+2021-Photoroom.jpg',
      description: 'Domaine Rene Mosse',
      producerId: producerRecordD.id,
      categoryId: productCategoryPet.id,
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Finca+Casa+Balaguer+Salicornio+Moscatel%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Azienda+Agricola+Passalacqua+Valentina+Calcarius+Nu+Litre+Bianco%2C+NV-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Ancre+Hill+Estates+Orange+Wine%2C+NV-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Fattoria+Di+Vaira+Vincenzo+Bianco%2C+2022-Photoroom.jpg',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Marto+Wines+Crazy+Crazy+Pet+Nat%2C+2022-Photoroom.jpg',
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

  // producer E
  // save user record
  const userRecordE = await prisma.user.upsert({
    where: { email: 'info@herbfed.co.uk' },
    update: {},
    create: {
      email: 'info@herbfed.co.uk',
      phone: '234',
      password: 'rabble-www.info@herbfed.co.uk',
      role: 'PRODUCER',
    },
  });

  // save producer record
  const producerRecordE = await prisma.producer.upsert({
    where: { userId: userRecordE.id },
    update: {},
    create: {
      isVerified: true,
      userId: userRecordE.id,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/Herb+Fed+-+Producer+-+Dark.png',
      businessName: 'Herb Fed',
      businessAddress: 'Herb Fed Ltd, Shires Farm, North Yorkshire, YO61 3EH',
      accountsEmail: 'info@herbfed.co.uk',
      salesEmail: 'info@herbfed.co.uk',
      minimumTreshold: 110,
      website: 'www.herbfedpoultry.co.uk',
      description:
        'Herb Fed proudly farm free range award winning Chickens fed a unique diet which includes over 10 varieties of fresh herbs, and happily living out in the field as birds should. By maintaining the highest possible animal welfare standards and enhancing their free range diet with fresh herbs, our birds have a flavour that is difficult to beat.',
    },
  });

  // get producer category id
  const producerCategoryOptionE = await prisma.producerCategoryOption.findFirst(
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
        producerId: producerRecordE.id,
        producerCategoryOptionId: producerCategoryOptionE.id,
      },
    },
    update: {},
    create: {
      producerId: producerRecordE.id,
      producerCategoryOptionId: producerCategoryOptionE.id,
    },
  });

  // get producer product id
  const productCategoryEE = await prisma.productCategory.findFirst({
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
        name: 'Whole Herb Fed Chicken',
        producerId: producerRecordE.id,
      },
    },
    update: {},
    create: {
      name: 'Whole Herb Fed Chicken',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+1.png',
      description:
        'A truly range free chicken that has foraged in the fields here on the farm in Yorkshire. Their unique diet and thoughtful husbandry result in a large healthy and succulent bird with a delicious depth of flavour.',
      producerId: producerRecordE.id,
      categoryId: productCategoryEE.id,
      type: 'SINGLE',
      orderUnit: 'Chicken',
      subUnit: 'Chicken',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Kg',
      measuresPerSubUnit: 2,
      price: 12.705,
      wholesalePrice: 12.1,
      approvalStatus: 'APPROVED',
      rrp: 16.15,
    },
  });

  // add product 2
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Chicken Breast Fillets',
        producerId: producerRecordE.id,
      },
    },
    update: {},
    create: {
      name: 'Chicken Breast Fillets',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+3.png',
      description:
        '2 x 4 pack of sustainably reared, herb fed, large skinless chicken fillets. Approximately 2.4kg total.',
      producerId: producerRecordE.id,
      categoryId: productCategoryEE.id,
      type: 'SINGLE',
      orderUnit: 'Box',
      subUnit: 'Box',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Kg',
      measuresPerSubUnit: 2.4,
      price: 33.264,
      wholesalePrice: 31.68,
      approvalStatus: 'APPROVED',
      rrp: 42,
    },
  });

  // add product 3
  await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'Skinned and Boned Chicken Thighs',
        producerId: producerRecordE.id,
      },
    },
    update: {},
    create: {
      name: 'Skinned and Boned Chicken Thighs',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+2.png',
      description:
        '2 X 8 pack of sustainably reared, herb fed, bonless and skinned chicken thighs, 800g each, 1.6kg total',
      producerId: producerRecordE.id,
      categoryId: productCategoryEE.id,
      type: 'SINGLE',
      orderUnit: 'Box',
      subUnit: 'Box',
      quantityOfSubUnitPerOrder: 1,
      unitsOfMeasurePerSubUnit: 'Kg',
      measuresPerSubUnit: 1.6,
      price: 23.52,
      wholesalePrice: 22.4,
      approvalStatus: 'APPROVED',
      rrp: 28.4,
    },
  });
  // supplment app seeding section
  await prisma.reward.deleteMany();
  await prisma.reward.createMany({
    data: [
      {
        amount: 50000,
        rate: 10000,
      },
      {
        amount: 98000,
        rate: 9800,
      },
      {
        amount: 192000,
        rate: 9600,
      },
      {
        amount: 475000,
        rate: 9500,
      },
      {
        amount: 900000,
        rate: 9000,
      },
    ],
  });

  // save user record
  const supplementProducerUser1 = await prisma.user.upsert({
    where: { email: 'Vanessa.Colen@kaneka.be' },
    update: {},
    create: {
      email: 'Vanessa.Colen@kaneka.be',
      phone: 'Vanessa.Colen@kaneka.be',
      password: '$2b$10$GegxBoq52cRqlI6Jl56Q/ufCq5ZLsZK8rM7LghdgvHApvbzWz4VFq',
      role: 'PRODUCER',
    },
  });

  // save user record
  const supplementProducerUser2 = await prisma.user.upsert({
    where: { email: 'Oana.Caldararu@balchem.com' },
    update: {},
    create: {
      email: 'Oana.Caldararu@balchem.com',
      phone: 'Oana.Caldararu@balchem.com',
      password: '$2b$10$GegxBoq52cRqlI6Jl56Q/ufCq5ZLsZK8rM7LghdgvHApvbzWz4VFq',
      role: 'PRODUCER',
    },
  });

  // save user record
  const supplementProducerUser3 = await prisma.user.upsert({
    where: { email: 'Liandra.Melembe@alzchem.com' },
    update: {},
    create: {
      email: 'Liandra.Melembe@alzchem.com',
      phone: 'Liandra.Melembe@alzchem.com',
      password: '$2b$10$GegxBoq52cRqlI6Jl56Q/ufCq5ZLsZK8rM7LghdgvHApvbzWz4VFq',
      role: 'PRODUCER',
    },
  });

  // save supplement producer record 1
  const supplememtProducer1 = await prisma.producer.upsert({
    where: { userId: supplementProducerUser1.id },
    update: {},
    create: {
      isVerified: true,
      userId: supplementProducerUser1.id,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/Kaneka.png',
      businessName: 'Kaneka Corporation',
      businessAddress: '5-1-1 Torikainishi, Takasago, Hyogo 676-8688, Japan',
      salesEmail: 'Vanessa.Colen@kaneka.be',
      minimumTreshold: 110,
      website: 'https://www.kaneka.com',
      description:
        'Kaneka Corporation is a global leader in high-performance materials, pharmaceuticals, food products, and health ingredients. Founded in Japan in 1949, Kaneka focuses on research and development, ensuring innovative and high-quality products.',
    },
  });

  // save supplement producer record 2
  const supplememtProducer2 = await prisma.producer.upsert({
    where: { userId: supplementProducerUser2.id },
    update: {},
    create: {
      isVerified: true,
      userId: supplementProducerUser2.id,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/Balchem.png',
      businessName: 'Balchem Corporation',
      businessAddress: '67 South Main Street, Layton, Utah 84041, USA',
      salesEmail: 'Oana.Caldararu@balchem.com',
      minimumTreshold: 110,
      website: 'https://www.balchem.com',
      description:
        "Balchem Corporation, through its Albion Minerals division, specializes in high-quality chelated minerals, optimizing bioavailability and nutrient absorption. Albion's TRAACS® technology ensures superior solubility, stability, and effectiveness.",
    },
  });

  // save supplement producer record 3
  const supplememtProducer3 = await prisma.producer.upsert({
    where: { userId: supplementProducerUser3.id },
    update: {},
    create: {
      isVerified: true,
      userId: supplementProducerUser3.id,
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/Alzchem+(1).png',
      businessName: 'Alzchem Group AG',
      businessAddress: 'Dr.-Albert-Frank-Str. 32, 83308 Trostberg, Germany',
      salesEmail: 'Liandra.Melembe@alzchem.com',
      minimumTreshold: 110,
      website: 'https://www.creapure.com',
      description:
        'Alzchem Group AG is the exclusive producer of Creapure®, the highest-purity creatine monohydrate for muscle performance, cognitive function, and energy production. Manufactured in Germany under strict cGMP and ISO 9001 standards.',
    },
  });

  // add product 1
  const supplementProduct1 = await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'KANEKA UBIQUINOL',
        producerId: supplememtProducer1.id,
      },
    },
    update: {},
    create: {
      name: 'KANEKA UBIQUINOL',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/CO+without+Shadow.png',
      description:
        'Kaneka Ubiquinol is the active and bioavailable form of Coenzyme Q10 (CoQ10), directly sourced from Kaneka, the global leader in CoQ10 science. Essential for mitochondrial energy production, cardiovascular health, and cognitive function, Kaneka Ubiquinol offers superior absorption compared to standard CoQ10.',
      producerId: supplememtProducer1.id,
      categoryId: productCategoryEE.id,
      type: 'SINGLE',
      orderUnit: 'pouch',
      subUnit: 'capsules',
      quantityOfSubUnitPerOrder: 90,
      poucheSize: 90,
      alignmentPoucheSize: 30,
      unitsOfMeasurePerSubUnit: 'capsules',
      measuresPerSubUnit: 100,
      price: 90.53,
      wholesalePrice: 41.91,
      approvalStatus: 'APPROVED',
      rrp: 105.60,
      vat: 20,
      rabbleMarkUp: 80,
      tags: [
        "Heart Health",
        "Energy",
        "Longevity",
        "Brain Health"
      ],
      priceInfo: [
        {
          "percentageDiscount": 14.27,
          "teamMemberCount": 67
        },
        {
          "percentageDiscount": 18.27,
          "teamMemberCount": 167
        },
        {
          "percentageDiscount": 22.27,
          "teamMemberCount": 333
        },
        {
          "percentageDiscount": 26.27,
          "teamMemberCount": 667
        }
      ],
      capsuleInfo: [
        {
          "capsuleCount": 1,
          "title1": "General Wellness",
          "description1": "Heart health, energy, 40+.",
          "title2": "Early Fertility",
          "description2": "Mitochondrial support for egg/sperm quality.",
          "others": "One capsule provides essential CoQ10 support for mitochondrial function and cardiovascular health. Beneficial for adults looking to maintain energy levels and long-term cellular function."
        },
        {
          "capsuleCount": 2,
          "title1": "Mild Fatigue",
          "description1": "Energy, cardio boost, active individuals.",
          "title2": "Anti-Aging",
          "description2": "Mitochondrial function, antioxidant support.",
          "others": "Two capsules enhance mitochondrial energy production, supporting cardiovascular function and active recovery. Ideal for individuals seeking longevity and sustained daily energy."
        },
        {
          "capsuleCount": 3,
          "title1": "Moderate Fatigue",
          "description1": "Recovery, athletes, physical training.",
          "title2": "Advanced Fertility",
          "description2": "Energy support during IVF.",
          "others": "Three capsules optimize cellular energy for endurance and recovery. Recommended for athletes, individuals with moderate fatigue, and those supporting reproductive health during fertility treatments."
        },
        {
          "capsuleCount": 4,
          "title1": "Therapeutic Dose",
          "description1": "Heart health, weightlifting recovery.",
          "title2": "Advanced Anti-Aging",
          "description2": "High-dose longevity support.",
          "others": "Four capsules provide maximum Ubiquinol support for cardiovascular resilience, mitochondrial longevity, and high-performance physical recovery. Ideal for those on targeted longevity protocols."
        }
      ],
      formulationSummary: [
        "100% Kaneka Ubiquinol",
        "Superior bioavailability compared to CoQ10",
        "Clinically researched for heart and brain health"
      ],
      leadTime: 6,
      productBenefits: [
        {
          "benefit": "Boosts Cellular Energy",
          "whyItMatters": "Ubiquinol is essential for ATP production, the body's primary energy source. Without sufficient ATP, cells can't function optimally, leading to fatigue and decreased performance."
        },
        {
          "benefit": "Protects Against Free Radicals",
          "whyItMatters": "Ubiquinol acts as a potent antioxidant, neutralizing free radicals that cause oxidative stress, which can damage cells and accelerate aging."
        },
        {
          "benefit": "Supports Healthy Aging",
          "whyItMatters": "As you age, Ubiquinol levels decline, leading to decreased energy production and increased oxidative damage. Supplementing helps replenish levels to support longevity."
        },
        {
          "benefit": "Improves Heart Function",
          "whyItMatters": "The heart requires high energy levels to function efficiently. Ubiquinol supports mitochondrial energy production in heart cells, promoting cardiovascular health."
        },
        {
          "benefit": "Enhances Brain Health",
          "whyItMatters": "Ubiquinol supports brain function by improving mitochondrial efficiency and reducing oxidative stress, which can help with cognitive performance and neuroprotection."
        }
      ],
      healthCategories: [
        {
          "category": "Aging (40+)",
          "whyItMatters": "As you age, your body produces less Ubiquinol, reducing ATP production and antioxidant levels. This leads to fatigue, slower recovery, and reduced heart function.",
          "benefits": [
            "Increased energy levels",
            "Improved heart health",
            "Slows down aging by reducing oxidative damage"
          ]
        },
        {
          "category": "Heart Health",
          "whyItMatters": "Ubiquinol plays a vital role in mitochondrial function, supporting the heart's energy needs and reducing oxidative stress.",
          "benefits": [
            "Enhances cardiovascular function",
            "Improves circulation and oxygen delivery",
            "Protects against heart disease"
          ]
        },
        {
          "category": "Training/Athletics",
          "whyItMatters": "Exercise increases oxidative stress and energy demands. Ubiquinol helps optimize ATP production, supporting endurance and muscle recovery.",
          "benefits": [
            "Boosts endurance and physical performance",
            "Enhances muscle recovery",
            "Reduces exercise-induced fatigue"
          ]
        },
        {
          "category": "Anti-Aging",
          "whyItMatters": "Oxidative damage accelerates aging at a cellular level. Ubiquinol acts as an antioxidant, reducing cellular damage and supporting longevity.",
          "benefits": [
            "Reduces oxidative stress",
            "Supports mitochondrial health",
            "Promotes youthful energy levels"
          ]
        },
        {
          "category": "Fertility",
          "whyItMatters": "Mitochondrial energy is critical for egg and sperm quality. Ubiquinol enhances cellular energy production to support reproductive health.",
          "benefits": [
            "Supports egg and sperm mitochondrial function",
            "Improves reproductive health",
            "May enhance fertility outcomes"
          ]
        },
        {
          "category": "Energy & Fatigue",
          "whyItMatters": "ATP is the body's primary energy source. Ubiquinol helps fuel energy production at a cellular level, reducing fatigue and improving vitality.",
          "benefits": [
            "Increases ATP production",
            "Combats chronic fatigue",
            "Enhances mental and physical energy"
          ]
        },
        {
          "category": "Brain Health",
          "whyItMatters": "The brain requires high amounts of energy and antioxidant protection. Ubiquinol supports cognitive function and neurological health.",
          "benefits": [
            "Enhances mental clarity and focus",
            "Protects against neurodegeneration",
            "Supports overall cognitive function"
          ]
        }
      ]
    },
  });
 
  // add product 2
  const supplementProduct2 = await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'TRAACS MAGNESIUM BISGLYCINATE',
        producerId: supplememtProducer2.id,
      },
    },
    update: {},
    create: {
      name: 'TRAACS MAGNESIUM BISGLYCINATE',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/MB+without+Shadow.png',
      description:
        'Magnesium Bisglycinate TRAACS® is a fully chelated, high-absorption form of magnesium that maximizes bioavailability while minimizing digestive discomfort. It supports muscle relaxation, sleep quality, energy production, and cognitive function.',
      producerId: supplememtProducer2.id,
      categoryId: productCategoryEE.id,
      type: 'SINGLE',
      orderUnit: 'pouch',
      subUnit: 'capsule',
      quantityOfSubUnitPerOrder: 90,
      poucheSize: 90,
      alignmentPoucheSize: 30,
      unitsOfMeasurePerSubUnit: 'capsule',
      measuresPerSubUnit: 93,
      price: 41.67,
      wholesalePrice: 18.12,
      approvalStatus: 'APPROVED',
      rrp: 50.0,
      vat: 20,
      rabbleMarkUp: 100,
      tags: [
        'Sleep',
        'Energy & Fatigue',
        'Cognitive Function',
        'Muscle Recovery',
      ],
      priceInfo: [
        {
          percentageDiscount: 27.52,
          teamMemberCount: 60,
        },
        {
          percentageDiscount: 31.52,
          teamMemberCount: 150,
        },
        {
          percentageDiscount: 35.52,
          teamMemberCount: 300,
        },
        {
          percentageDiscount: 39.52,
          teamMemberCount: 600,
        },
      ],
      formulationSummary: ['100% Magnesium Bisglycinate TRAACS® (Chelated)'],
      leadTime: 6,
      capsuleInfo: [
        {
          capsuleCount: 2,
          title1: 'Light Support',
          description1: 'For stress, relaxation, and mild deficiency.',
          title2: 'Nervous System Balance',
          description2: 'Aids neurotransmitter function and sleep quality.',
          others:
            'A gentle daily dose for individuals with minor magnesium needs. Helps support relaxation, nervous system function, and sleep quality without excessive supplementation.',
        },
        {
          capsuleCount: 3,
          title1: 'Standard Daily Dose',
          description1: 'Optimal magnesium intake for daily health.',
          title2: 'Muscle Recovery & Energy',
          description2: 'Supports ATP metabolism and physical recovery.',
          others:
            'The recommended daily serving for most adults, promoting muscle relaxation, stress regulation, and energy metabolism. Chelated TRAACS® magnesium ensures high absorption and minimal digestive discomfort.',
        },
        {
          capsuleCount: 4,
          title1: 'Advanced Support',
          description1: 'For those with high magnesium demands.',
          title2: 'Athletic Recovery & Longevity',
          description2: 'Supports high-stress lifestyles and training.',
          others:
            'Ideal for athletes, individuals with muscle cramps, or those with high stress loads. This higher dose supports advanced recovery, cardiovascular function, and metabolic regulation.',
        },
      ],
      productBenefits: [
        {
          benefit: 'Highly Bioavailable & Gentle on Digestion',
          whyItMatters:
            'Magnesium Bisglycinate is fully chelated, ensuring superior absorption compared to other forms of magnesium while minimizing digestive discomfort.',
        },
        {
          benefit: 'Supports Muscle Relaxation & Recovery',
          whyItMatters:
            'Magnesium plays a key role in muscle contraction and relaxation, helping to prevent cramps, reduce muscle soreness, and support post-exercise recovery.',
        },
        {
          benefit: 'Promotes Restful Sleep & Stress Reduction',
          whyItMatters:
            'Magnesium Bisglycinate helps regulate neurotransmitters like GABA, promoting relaxation, reducing stress, and improving sleep quality.',
        },
        {
          benefit: 'Essential for Energy Production',
          whyItMatters:
            "Magnesium is a crucial cofactor in ATP production, the body's main energy source. It supports mitochondrial function and combats fatigue.",
        },
        {
          benefit: 'Supports Brain Function & Cognitive Health',
          whyItMatters:
            'Magnesium is involved in neurotransmitter function, helping with memory, focus, and neuroprotection against age-related cognitive decline.',
        },
      ],
      healthCategories: [
        {
          category: 'Sleep',
          whyItMatters:
            'Magnesium supports neurotransmitter function, promoting relaxation and improving sleep quality.',
          benefits: [
            'Enhances deep sleep cycles',
            'Reduces insomnia and sleep disturbances',
            'Supports natural melatonin production',
          ],
        },
        {
          category: 'Energy',
          whyItMatters:
            'Magnesium is involved in ATP production, providing sustained energy and reducing fatigue.',
          benefits: [
            'Boosts mitochondrial energy production',
            'Combats fatigue and sluggishness',
            'Improves metabolic efficiency',
          ],
        },
        {
          category: 'Healthy Aging',
          whyItMatters:
            'Magnesium is essential for cellular repair, reducing oxidative stress and supporting long-term health.',
          benefits: [
            'Reduces oxidative damage',
            'Supports cellular health and longevity',
            'Maintains optimal magnesium levels for aging bodies',
          ],
        },
        {
          category: 'Longevity',
          whyItMatters:
            'Optimal magnesium levels have been linked to increased lifespan and reduced risk of age-related diseases.',
          benefits: [
            'Supports cognitive longevity',
            'Enhances cardiovascular function',
            'Promotes long-term metabolic health',
          ],
        },
        {
          category: 'Athletes',
          whyItMatters:
            'Magnesium plays a key role in muscle contraction, energy metabolism, and recovery.',
          benefits: [
            'Prevents muscle cramps and spasms',
            'Enhances endurance and recovery',
            'Supports electrolyte balance during training',
          ],
        },
        {
          category: 'Weight Training',
          whyItMatters:
            'Magnesium aids in protein synthesis, muscle function, and post-workout recovery.',
          benefits: [
            'Supports muscle growth and strength',
            'Aids in faster muscle recovery',
            'Optimizes nutrient utilization',
          ],
        },
        {
          category: 'Cognitive Function',
          whyItMatters:
            'Magnesium is vital for brain function, neurotransmitter balance, and preventing mental decline.',
          benefits: [
            'Improves memory and learning',
            'Supports brain plasticity and function',
            'Reduces brain fog and cognitive fatigue',
          ],
        },
        {
          category: 'Mood & Anxiety',
          whyItMatters:
            'Magnesium helps regulate stress hormones and neurotransmitters linked to mood balance.',
          benefits: [
            'Reduces cortisol and stress response',
            'Supports serotonin production',
            'Enhances relaxation and mental clarity',
          ],
        },
        {
          category: 'Joint Health',
          whyItMatters:
            'Magnesium contributes to bone density and joint flexibility, reducing the risk of stiffness and discomfort.',
          benefits: [
            'Strengthens bones and connective tissue',
            'Reduces inflammation in joints',
            'Supports mobility and flexibility',
          ],
        },
        {
          category: 'Gut Health',
          whyItMatters:
            'Magnesium supports digestive enzyme function and smooth muscle movement in the intestines.',
          benefits: [
            'Promotes regular bowel movements',
            'Reduces bloating and constipation',
            'Supports gut microbiome balance',
          ],
        },
        {
          category: 'Heart Health',
          whyItMatters:
            'Magnesium helps regulate heart rhythm, blood pressure, and vascular function.',
          benefits: [
            'Supports healthy blood pressure',
            'Reduces cardiovascular stress',
            'Aids in proper heart rhythm function',
          ],
        },
      ],
    },
  });

  // add product 3
  const supplementProduct3 = await prisma.product.upsert({
    where: {
      name_unique_producer: {
        name: 'CREAPURE CREATINE MONOHYDRATE',
        producerId: supplememtProducer3.id,
      },
    },
    update: {},
    create: {
      name: 'CREAPURE CREATINE MONOHYDRATE',
      imageUrl:
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/CM+without+Shadow.png',
      description:
        'Creapure® is the purest form of creatine monohydrate, produced in Germany under strict quality controls. It enhances ATP production, supporting muscle strength, endurance, recovery, and cognitive function.',
      producerId: supplememtProducer3.id,
      categoryId: productCategoryEE.id,
      type: 'SINGLE',
      orderUnit: 'pouch',
      subUnit: 'grams',
      quantityOfSubUnitPerOrder: 450,
      poucheSize: 450,
      alignmentPoucheSize: 150,
      unitsOfMeasurePerSubUnit: 'grams',
      measuresPerSubUnit: 5,
      gramsPerCount: 5,
      price: 24.04,
      wholesalePrice: 10.45,
      approvalStatus: 'APPROVED',
      rrp: 35,
      vat: 20,
      rabbleMarkUp: 130,
      tags: [
        'Athletics',
        'Strength & Endurance',
        'Cognitive Function',
        'Energy & Fatigue',
        'Muscle Recovery',
      ],
      priceInfo: [
        {
          percentageDiscount: 18.39,
          teamMemberCount: 0,
        },
        {
          percentageDiscount: 22.39,
          teamMemberCount: 1111,
        },
        {
          percentageDiscount: 26.39,
          teamMemberCount: 2222,
        },
        {
          percentageDiscount: 30.39,
          teamMemberCount: 4444,
        },
      ],
      formulationSummary: ['100% Creapure® Creatine Monohydrate'],
      leadTime: 6,
      capsuleInfo: [
        {
          capsuleCount: 5,
          title1: 'Daily Performance',
          description1: 'Supports energy, cognitive function, and endurance.',
          title2: 'Optimal ATP Production',
          subtitle2: 'Enhances muscle strength and reduces fatigue.',
          others:
            '5g is the standard daily serving, fueling ATP production for energy, muscle recovery, and cognitive support. Helps maintain mental clarity, endurance, and long-term muscular performance.',
        },
        {
          capsuleCount: 10,
          title1: 'Athletic Overstacking',
          description1: 'For high-intensity training and advanced recovery.',
          title2: 'Maximizes Muscle Saturation',
          description2: 'Supports strength, neuroprotection, and endurance.',
          others:
            '10g is a high-dose protocol for elite athletes and those in demanding training cycles. Increases creatine storage, optimizing muscle power, recovery, and cognitive resilience under high stress.',
        },
      ],
      productBenefits: [
        {
          benefit: 'Increases Strength & Power Output',
          whyItMatters:
            'Creatine enhances phosphocreatine stores in muscles, allowing for greater ATP production, which improves strength, power, and peak performance during high-intensity exercise.',
        },
        {
          benefit: 'Enhances Muscle Growth & Recovery',
          whyItMatters:
            'Creatine supports muscle cell hydration, protein synthesis, and growth, while also reducing muscle damage and accelerating post-exercise recovery.',
        },
        {
          benefit: 'Boosts Cognitive Function & Mental Clarity',
          whyItMatters:
            'Creatine plays a key role in brain energy metabolism, supporting cognitive function, memory, and mental clarity, particularly under stress or fatigue.',
        },
        {
          benefit: 'Improves Endurance & Reduces Fatigue',
          whyItMatters:
            'By optimizing ATP production, creatine delays muscle fatigue, enhances endurance, and supports prolonged high-intensity efforts.',
        },
        {
          benefit: 'Supports Healthy Aging & Cellular Energy',
          whyItMatters:
            'Creatine has been shown to support mitochondrial function, combat age-related muscle loss, and help maintain energy levels as you age.',
        },
      ],
      healthCategories: [
        {
          category: 'Athletes',
          whyItMatters:
            'Creatine is one of the most researched supplements for improving athletic performance, helping athletes push harder and recover faster.',
          benefits: [
            'Increases explosive power and sprint performance',
            'Enhances strength and muscle mass',
            'Speeds up recovery between training sessions',
          ],
        },
        {
          category: 'Weight Training',
          whyItMatters:
            'Creatine is essential for muscle strength, power, and growth, making it a staple for weightlifters and bodybuilders.',
          benefits: [
            'Boosts maximal strength and power output',
            'Enhances lean muscle mass and size',
            'Supports increased reps and training volume',
          ],
        },
        {
          category: 'Energy',
          whyItMatters:
            "Creatine replenishes ATP stores, the body's primary energy currency, leading to improved stamina and sustained performance.",
          benefits: [
            'Increases ATP production for energy bursts',
            'Reduces perceived fatigue during exercise',
            'Enhances overall endurance capacity',
          ],
        },
        {
          category: 'Healthy Aging',
          whyItMatters:
            'Creatine has been shown to help preserve muscle mass and strength as we age, reducing the risk of sarcopenia (age-related muscle loss).',
          benefits: [
            'Supports muscle retention and strength',
            'Enhances mitochondrial energy function',
            'Combats age-related decline in muscle and cognitive function',
          ],
        },
        {
          category: 'Longevity',
          whyItMatters:
            'By supporting mitochondrial efficiency and reducing oxidative stress, creatine has potential benefits for longevity and healthspan.',
          benefits: [
            'Protects against neurodegeneration',
            'Supports long-term muscle and brain health',
            'Enhances resilience to age-related decline',
          ],
        },
        {
          category: 'Cognitive Function',
          whyItMatters:
            'Creatine provides energy to brain cells, improving mental clarity, reaction time, and focus, particularly in demanding cognitive tasks.',
          benefits: [
            'Enhances working memory and cognitive processing',
            'Supports brain energy metabolism under stress',
            'Reduces mental fatigue and brain fog',
          ],
        },
        {
          category: 'Mood & Anxiety',
          whyItMatters:
            'Creatine has been linked to neurotransmitter support, helping with mood stability and mental resilience.',
          benefits: [
            'Supports dopamine and serotonin balance',
            'May reduce symptoms of low mood and fatigue',
            'Enhances stress resilience',
          ],
        },
        {
          category: 'Heart Health',
          whyItMatters:
            'Creatine helps regulate cellular energy in the heart, supporting cardiovascular function and recovery.',
          benefits: [
            'Supports healthy heart energy metabolism',
            'May aid in recovery from intense cardiovascular strain',
            'Protects against oxidative stress in heart tissue',
          ],
        },
        {
          category: 'Immunity',
          whyItMatters:
            'Creatine plays a role in immune system function by supporting cellular energy required for immune response and tissue repair.',
          benefits: [
            'Supports immune cell energy production',
            'Aids in tissue healing and recovery',
            'Protects against excessive oxidative stress',
          ],
        },
        {
          category: 'Joint Health',
          whyItMatters:
            'Creatine helps maintain muscle mass and strength, which is crucial for joint stability and long-term mobility.',
          benefits: [
            'Supports muscle strength around joints',
            'Aids in reducing stiffness and soreness',
            'Helps with joint mobility and long-term resilience',
          ],
        },
      ],
    },
  });

  // create supplement team 1
  await prisma.buyingTeam.upsert({
    where: {
      name: 'Kaneka Ubiquinol Team',
      postalCode: '12345',
    },
    update: {},
    create: {
      name: 'Kaneka Ubiquinol Team',
      postalCode: '12345',
      producerId: supplememtProducer1.id,
      hostId: supplememtProducer1.userId,
      supplementTeamProducts: {
        create: {
          productId: supplementProduct1.id,
          orderTreashold: 333,
          status: 'PREORDER',
          foundingMembersDiscount: 10,
        },
      },
    },
  });

  // create supplement team 2
  await prisma.buyingTeam.upsert({
    where: {
      name: 'Magnesium Bisglycinate Team',
      postalCode: '12345',
    },
    update: {},
    create: {
      name: 'Magnesium Bisglycinate Team',
      postalCode: '12345',
      producerId: supplememtProducer2.id,
      hostId: supplememtProducer2.userId,
      supplementTeamProducts: {
        create: {
          productId: supplementProduct2.id,
          orderTreashold: 200,
          status: 'PREORDER',
          foundingMembersDiscount: 10,
        },
      },
    },
  });

  // create supplement team 3
  await prisma.buyingTeam.upsert({
    where: {
      name: 'Creapure® Team',
      postalCode: '12345',
    },
    update: {},
    create: {
      name: 'Creapure® Team',
      postalCode: '12345',
      producerId: supplememtProducer3.id,
      hostId: supplememtProducer3.userId,
      supplementTeamProducts: {
        create: {
          productId: supplementProduct3.id,
          orderTreashold: 67,
          status: 'ACTIVE',
          foundingMembersDiscount: 10
        }
      }
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
