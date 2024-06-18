import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // await prisma.postalCodeRegion.createMany({
  //   data: [
  //     {
  //       id: '1',
  //       name: 'Scotland',
  //     },
  //     {
  //       id: '2',
  //       name: 'East of England',
  //     },
  //     {
  //       id: '3',
  //       name: 'West Midlands',
  //     },
  //     {
  //       id: '4',
  //       name: 'South West',
  //     },
  //     {
  //       id: '5',
  //       name: 'North West',
  //     },
  //     {
  //       id: '6',
  //       name: 'South East',
  //     },
  //     {
  //       id: '7',
  //       name: 'Greater London',
  //     },
  //     {
  //       id: '8',
  //       name: 'Northern Ireland',
  //     },
  //     {
  //       id: '9',
  //       name: 'Wales',
  //     },
  //     {
  //       id: '10',
  //       name: 'North East',
  //     },
  //     {
  //       id: '11',
  //       name: 'East Midlands',
  //     },
  //     {
  //       id: '12',
  //       name: 'Central London',
  //     },
  //     {
  //       id: '13',
  //       name: 'Channel Islands',
  //     },
  //     {
  //       id: '14',
  //       name: 'Isle of Man',
  //     },
  //   ],
  // });

  // await prisma.postalCodeArea.createMany({
  //   data: [
  //     // area 2
  //     {
  //       regionId: '1',
  //       code: 'AB',
  //       name: 'Aberdeen',
  //     },
  //     // area 3
  //     {
  //       regionId: '2',
  //       code: 'AL',
  //       name: 'St. Albans',
  //     },
  //     // area 4
  //     {
  //       regionId: '3',
  //       code: 'B',
  //       name: 'Birmingham',
  //     },
  //     // area 5
  //     {
  //       regionId: '4',
  //       code: 'BA',
  //       name: 'Bath',
  //     },
  //     // area 6
  //     {
  //       regionId: '5',
  //       code: 'BB',
  //       name: 'Blackburn',
  //     },
  //     // area 7
  //     {
  //       regionId: '5',
  //       code: 'BD',
  //       name: 'Bradford',
  //     },
  //     // area 8
  //     {
  //       regionId: '4',
  //       code: 'BH',
  //       name: 'Bournemouth',
  //     },
  //     // area 9
  //     {
  //       regionId: '5',
  //       code: 'BL',
  //       name: 'Bolton',
  //     },
  //     // area 10
  //     {
  //       regionId: '6',
  //       code: 'BN',
  //       name: 'Brighton',
  //     },
  //     // area 11
  //     {
  //       regionId: '7',
  //       code: 'BR',
  //       name: 'Bromley',
  //     },
  //     // area 12
  //     {
  //       regionId: '4',
  //       code: 'BS',
  //       name: 'Bristol',
  //     },
  //     // area 13
  //     {
  //       regionId: '8',
  //       code: 'BT',
  //       name: 'Belfast',
  //     },
  //     // area 14
  //     {
  //       regionId: '5',
  //       code: 'CA',
  //       name: 'Carlisle',
  //     },
  //     // area 15
  //     {
  //       regionId: '2',
  //       code: 'CB',
  //       name: 'Cambridge',
  //     },
  //     // area 16
  //     {
  //       regionId: '9',
  //       code: 'CF',
  //       name: 'Cardiff',
  //     },
  //     // area 17
  //     {
  //       regionId: '5',
  //       code: 'CH',
  //       name: 'Chester',
  //     },
  //     // area 18
  //     {
  //       regionId: '2',
  //       code: 'CM',
  //       name: 'Chelmsford',
  //     },
  //     // area 19
  //     {
  //       regionId: '2',
  //       code: 'CO',
  //       name: 'Colchester',
  //     },
  //     // area 20
  //     {
  //       regionId: '7',
  //       code: 'CR',
  //       name: 'Croydon',
  //     },
  //     // area 21
  //     {
  //       regionId: '6',
  //       code: 'CT',
  //       name: 'Canterbury',
  //     },
  //     // area 22
  //     {
  //       regionId: '3',
  //       code: 'CV',
  //       name: 'Coventry',
  //     },
  //     // area 23
  //     {
  //       regionId: '5',
  //       code: 'CW',
  //       name: 'Crewe',
  //     },
  //     // area 24
  //     {
  //       regionId: '7',
  //       code: 'DA',
  //       name: 'Dartford',
  //     },
  //     // area 25
  //     {
  //       regionId: '1',
  //       code: 'DD',
  //       name: 'Dundee',
  //     },
  //     // area 26
  //     {
  //       regionId: '11',
  //       code: 'DE',
  //       name: 'Derby',
  //     },
  //     // area 27
  //     {
  //       regionId: '1',
  //       code: 'DG',
  //       name: 'Dumfries',
  //     },
  //     // area 28
  //     {
  //       regionId: '10',
  //       code: 'DH',
  //       name: 'Durham',
  //     },
  //     // area 29
  //     {
  //       regionId: '10',
  //       code: 'DL',
  //       name: 'Darlington',
  //     },
  //     // area 30
  //     {
  //       regionId: '11',
  //       code: 'DN',
  //       name: 'Doncaster',
  //     },
  //     // area 31
  //     {
  //       regionId: '4',
  //       code: 'DT',
  //       name: 'Dorchester',
  //     },
  //     // area 32
  //     {
  //       regionId: '3',
  //       code: 'DY',
  //       name: 'Dudley',
  //     },
  //     // area 33
  //     {
  //       regionId: '12',
  //       code: 'E',
  //       name: 'London Eastern',
  //     },
  //     // area 34
  //     {
  //       regionId: '12',
  //       code: 'EC',
  //       name: 'London Eastern Central',
  //     },
  //     // area 35
  //     {
  //       regionId: '1',
  //       code: 'EH',
  //       name: 'Edinburgh',
  //     },
  //     // area 36
  //     {
  //       regionId: '7',
  //       code: 'EN',
  //       name: 'Enfield',
  //     },
  //     // area 37
  //     {
  //       regionId: '4',
  //       code: 'EX',
  //       name: 'Exeter',
  //     },
  //     // area 38
  //     {
  //       regionId: '1',
  //       code: 'FK',
  //       name: 'Falkirk',
  //     },
  //     // area 39
  //     {
  //       regionId: '5',
  //       code: 'FY',
  //       name: 'Blackpool',
  //     },
  //     // area 40
  //     {
  //       regionId: '1',
  //       code: 'G',
  //       name: 'Glasgow',
  //     },
  //     // area 41
  //     {
  //       regionId: '4',
  //       code: 'GL',
  //       name: 'Gloucester',
  //     },
  //     // area 42
  //     {
  //       regionId: '6',
  //       code: 'GU',
  //       name: 'Guilford',
  //     },
  //     // area 43
  //     {
  //       regionId: '13',
  //       code: 'GY',
  //       name: 'Guernsey',
  //     },
  //     // area 44
  //     {
  //       regionId: '7',
  //       code: 'HA',
  //       name: 'Harrow',
  //     },
  //     // area 45
  //     {
  //       regionId: '5',
  //       code: 'HD',
  //       name: 'Huddersfield',
  //     },
  //     // area 46
  //     {
  //       regionId: '10',
  //       code: 'HG',
  //       name: 'Harrogate',
  //     },
  //     // area 47
  //     {
  //       regionId: '2',
  //       code: 'HP',
  //       name: 'Hemel',
  //     },
  //     // area 48
  //     {
  //       regionId: '3',
  //       code: 'HR',
  //       name: 'Hereford',
  //     },
  //     // area 49
  //     {
  //       regionId: '1',
  //       code: 'HS',
  //       name: 'Comhairle nan Eilean Siar',
  //     },
  //     // area 50
  //     {
  //       regionId: '10',
  //       code: 'HU',
  //       name: 'Hull',
  //     },
  //     // area 51
  //     {
  //       regionId: '5',
  //       code: 'HX',
  //       name: 'Halifax',
  //     },
  //     // area 52
  //     {
  //       regionId: '7',
  //       code: 'IG',
  //       name: 'Ilford',
  //     },
  //     // area 53
  //     {
  //       regionId: '14',
  //       code: 'IM',
  //       name: 'Isle of Man',
  //     },
  //     // area 54
  //     {
  //       regionId: '2',
  //       code: 'IP',
  //       name: 'Ipswich',
  //     },
  //     // area 55
  //     {
  //       regionId: '1',
  //       code: 'IV',
  //       name: 'Inverness',
  //     },
  //     // area 56
  //     {
  //       regionId: '13',
  //       code: 'JE',
  //       name: 'Jersey',
  //     },
  //     // area 57
  //     {
  //       regionId: '1',
  //       code: 'KA',
  //       name: 'Kilmarnock',
  //     },
  //     // area 58
  //     {
  //       regionId: '7',
  //       code: 'KT',
  //       name: 'Kingston',
  //     },
  //     // area 59
  //     {
  //       regionId: '1',
  //       code: 'KW',
  //       name: 'Kirkwall',
  //     },
  //     // area 60
  //     {
  //       regionId: '1',
  //       code: 'KY',
  //       name: 'Kirkaldy',
  //     },
  //     // area 61
  //     {
  //       regionId: '5',
  //       code: 'L',
  //       name: 'Liverpool',
  //     },
  //     // area 62
  //     {
  //       regionId: '5',
  //       code: 'LA',
  //       name: 'Lancaster',
  //     },
  //     // area 63
  //     {
  //       regionId: '9',
  //       code: 'LD',
  //       name: 'Llandrindod',
  //     },
  //     // area 64
  //     {
  //       regionId: '11',
  //       code: 'LE',
  //       name: 'Leicester',
  //     },
  //     // area 65
  //     {
  //       regionId: '9',
  //       code: 'LL',
  //       name: 'Llandudno',
  //     },
  //     // area 66
  //     {
  //       regionId: '11',
  //       code: 'LN',
  //       name: 'Lincoln',
  //     },
  //     // area 67
  //     {
  //       regionId: '10',
  //       code: 'LS',
  //       name: 'Leeds',
  //     },
  //     // area 68
  //     {
  //       regionId: '2',
  //       code: 'LU',
  //       name: 'Luton',
  //     },
  //     // area 69
  //     {
  //       regionId: '5',
  //       code: 'M',
  //       name: 'Manchester',
  //     },
  //     // area 70
  //     {
  //       regionId: '6',
  //       code: 'ME',
  //       name: 'Medway',
  //     },
  //     // area 71
  //     {
  //       regionId: '6',
  //       code: 'MK',
  //       name: 'Milton Keynes',
  //     },
  //     // area 72
  //     {
  //       regionId: '1',
  //       code: 'ML',
  //       name: 'Motherwell',
  //     },
  //     // area 73
  //     {
  //       regionId: '12',
  //       code: 'N',
  //       name: 'London Northern',
  //     },
  //     // area 74
  //     {
  //       regionId: '10',
  //       code: 'NE',
  //       name: 'Newcastle',
  //     },
  //     // area 75
  //     {
  //       regionId: '11',
  //       code: 'NG',
  //       name: 'Nottingham',
  //     },
  //     // area 76
  //     {
  //       regionId: '3',
  //       code: 'NN',
  //       name: 'Northampton',
  //     },
  //     // area 77
  //     {
  //       regionId: '9',
  //       code: 'NP',
  //       name: 'Newport',
  //     },
  //     // area 78
  //     {
  //       regionId: '2',
  //       code: 'NR',
  //       name: 'Norwich',
  //     },
  //     // area 79
  //     {
  //       regionId: '12',
  //       code: 'NW',
  //       name: 'London North Western',
  //     },
  //     // area 80
  //     {
  //       regionId: '5',
  //       code: 'OL',
  //       name: 'Oldham',
  //     },
  //     // area 81
  //     {
  //       regionId: '6',
  //       code: 'OX',
  //       name: 'Oxford',
  //     },
  //     // area 82
  //     {
  //       regionId: '1',
  //       code: 'PA',
  //       name: 'Paisley',
  //     },
  //     // area 83
  //     {
  //       regionId: '2',
  //       code: 'PE',
  //       name: 'Peterborough',
  //     },
  //     // area 84
  //     {
  //       regionId: '1',
  //       code: 'PH',
  //       name: 'Perth',
  //     },
  //     // area 85
  //     {
  //       regionId: '4',
  //       code: 'PL',
  //       name: 'Plymouth',
  //     },
  //     // area 86
  //     {
  //       regionId: '6',
  //       code: 'PO',
  //       name: 'Portsmouth',
  //     },
  //     // area 87
  //     {
  //       regionId: '5',
  //       code: 'PR',
  //       name: 'Preston',
  //     },
  //     // area 88
  //     {
  //       regionId: '6',
  //       code: 'RG',
  //       name: 'Reading',
  //     },
  //     // area 89
  //     {
  //       regionId: '6',
  //       code: 'RH',
  //       name: 'Redhill',
  //     },
  //     // area 90
  //     {
  //       regionId: '7',
  //       code: 'RM',
  //       name: 'Romford',
  //     },
  //     // area 91
  //     {
  //       regionId: '11',
  //       code: 'S',
  //       name: 'Sheffield',
  //     },
  //     // area 92
  //     {
  //       regionId: '9',
  //       code: 'SA',
  //       name: 'Swansea',
  //     },
  //     // area 93
  //     {
  //       regionId: '12',
  //       code: 'SE',
  //       name: 'London South Eastern',
  //     },
  //     // area 94
  //     {
  //       regionId: '2',
  //       code: 'SG',
  //       name: 'Stevenage',
  //     },
  //     // area 95
  //     {
  //       regionId: '5',
  //       code: 'SK',
  //       name: 'Stockport',
  //     },
  //     // area 96
  //     {
  //       regionId: '6',
  //       code: 'SL',
  //       name: 'Slough',
  //     },
  //     // area 97
  //     {
  //       regionId: '7',
  //       code: 'SM',
  //       name: 'Sutton',
  //     },
  //     // area 98
  //     {
  //       regionId: '4',
  //       code: 'SN',
  //       name: 'Swindon',
  //     },
  //     // area 99
  //     {
  //       regionId: '6',
  //       code: 'SO',
  //       name: 'Southampton',
  //     },
  //     // area 100
  //     {
  //       regionId: '4',
  //       code: 'SP',
  //       name: 'Salisbury',
  //     },
  //     // area 101
  //     {
  //       regionId: '10',
  //       code: 'SR',
  //       name: 'Sunderland',
  //     },
  //     // area 102
  //     {
  //       regionId: '2',
  //       code: 'SS',
  //       name: 'Southend',
  //     },
  //     // area 103
  //     {
  //       regionId: '3',
  //       code: 'ST',
  //       name: 'Stoke on Trent',
  //     },
  //     // area 104
  //     {
  //       regionId: '12',
  //       code: 'SW',
  //       name: 'London South Western',
  //     },
  //     // area 105
  //     {
  //       regionId: '9',
  //       code: 'SY',
  //       name: 'Shrewsbury',
  //     },
  //     // area 106
  //     {
  //       regionId: '4',
  //       code: 'TA',
  //       name: 'Taunton',
  //     },
  //     // area 107
  //     {
  //       regionId: '1',
  //       code: 'TD',
  //       name: 'Galashiels',
  //     },
  //     // area 108
  //     {
  //       regionId: '3',
  //       code: 'TF',
  //       name: 'Telford',
  //     },
  //     // area 109
  //     {
  //       regionId: '6',
  //       code: 'TN',
  //       name: 'Tonbridge',
  //     },
  //     // area 110
  //     {
  //       regionId: '4',
  //       code: 'TQ',
  //       name: 'Torquay',
  //     },
  //     // area 111
  //     {
  //       regionId: '4',
  //       code: 'TR',
  //       name: 'Truro',
  //     },
  //     // area 112
  //     {
  //       regionId: '10',
  //       code: 'TS',
  //       name: 'Cleveland',
  //     },
  //     // area 113
  //     {
  //       regionId: '7',
  //       code: 'TW',
  //       name: 'Twickenham',
  //     },
  //     // area 114
  //     {
  //       regionId: '7',
  //       code: 'UB',
  //       name: 'Southall',
  //     },
  //     // area 115
  //     {
  //       regionId: '12',
  //       code: 'W',
  //       name: 'London Western',
  //     },
  //     // area 116
  //     {
  //       regionId: '5',
  //       code: 'WA',
  //       name: 'Warrington',
  //     },
  //     // area 117
  //     {
  //       regionId: '12',
  //       code: 'WC',
  //       name: 'London Western Central',
  //     },
  //     // area 118
  //     {
  //       regionId: '7',
  //       code: 'WD',
  //       name: 'Watford',
  //     },
  //     // area 119
  //     {
  //       regionId: '10',
  //       code: 'WF',
  //       name: 'Wakefield',
  //     },
  //     // area 120
  //     {
  //       regionId: '5',
  //       code: 'WN',
  //       name: 'Wigan',
  //     },
  //     // area 121
  //     {
  //       regionId: '3',
  //       code: 'WR',
  //       name: 'Worcester',
  //     },
  //     // area 122
  //     {
  //       regionId: '3',
  //       code: 'WS',
  //       name: 'Walsall',
  //     },
  //     // area 123
  //     {
  //       regionId: '3',
  //       code: 'WV',
  //       name: 'Wolverhampton',
  //     },
  //     // area 124
  //     {
  //       regionId: '10',
  //       code: 'YO',
  //       name: 'York',
  //     },
  //     // area 125
  //     {
  //       regionId: '1',
  //       code: 'ZE',
  //       name: 'Shetland',
  //     },
  //   ],
  // });

  // // add producer categories
  // const producerCategories = [
  //   'Alcohol',
  //   'Bakery',
  //   'Coffee and Tea',
  //   'Drinks',
  //   'Fish and Seafood',
  //   'Fruits and Vegetables',
  //   'General',
  //   'Meat',
  //   'Speciality',
  //   'Farm and Dairy',
  //   'Wine',
  // ];
  // for (let index = 0; index < producerCategories.length; index++) {
  //   const element = producerCategories[index];
  //   await prisma.producerCategoryOption.upsert({
  //     where: { name: element },
  //     update: {},
  //     create: {
  //       name: element,
  //     },
  //   });
  // }

  // // add product categories
  // const productCategories = [
  //   'Fresh Fruits',
  //   'Meat & Poultry',
  //   'Coffee',
  //   'Eggs',
  //   'Red',
  //   'Orange',
  //   'White',
  //   'Pet Nat',
  // ];
  // for (let index = 0; index < productCategories.length; index++) {
  //   const element = productCategories[index];
  //   await prisma.productCategory.upsert({
  //     where: { name: element },
  //     update: {},
  //     create: {
  //       name: element,
  //     },
  //   });
  // }

  // // save user record
  // const userRecord = await prisma.user.upsert({
  //   where: { email: 'info@flyinghorsecoffee.com' },
  //   update: {},
  //   create: {
  //     email: 'info@flyinghorsecoffee.com',
  //     phone: '+234',
  //     password: 'rabble-info@flyinghorsecoffee.com',
  //     role: 'PRODUCER',
  //   },
  // });

  // // save producer record
  // const producerRecord = await prisma.producer.upsert({
  //   where: { userId: userRecord.id },
  //   update: {},
  //   create: {
  //     isVerified: true,
  //     userId: userRecord.id,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/flying-horse-coffee-espresso-blend-02+2+(1).jpg',
  //     businessName: 'Flying Horse Coffee',
  //     businessAddress: '117 Mare Street, London, E8 4RU United Kingdom',
  //     accountsEmail: 'info@flyinghorsecoffee.com',
  //     salesEmail: 'info@flyinghorsecoffee.com',
  //     minimumTreshold: 88,
  //     website: 'https://flyinghorsecoffee.com/',
  //     description:
  //       'Flying Horse Coffee are on a mission to roast and deliver the highest quality and most sustainably sourced green beans from around the world. They source coffee beans seasonally, roasting in small batches for optimum freshness and flavour. Their packaging is 100% biobased and home compostable.',
  //   },
  // });

  // // get producer category id
  // const producerCategoryOption = await prisma.producerCategoryOption.findFirst({
  //   where: {
  //     name: 'Coffee and Tea',
  //   },
  //   select: {
  //     id: true,
  //   },
  // });

  // // add category id to the producer
  // await prisma.producerCategory.upsert({
  //   where: {
  //     producer_unique_category_option: {
  //       producerId: producerRecord.id,
  //       producerCategoryOptionId: producerCategoryOption.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     producerId: producerRecord.id,
  //     producerCategoryOptionId: producerCategoryOption.id,
  //   },
  // });

  // // get producer product id
  // const productCategoryA = await prisma.productCategory.findFirst({
  //   where: {
  //     name: 'Coffee',
  //   },
  //   select: {
  //     id: true,
  //   },
  // });

  // // add product A
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Espresso Blend Whole bean',
  //       producerId: producerRecord.id,
  //     },
  //   },
  //   update: {
  //     price: 20,
  //     orderUnit: 'Bag',
  //     subUnit: 'Bag',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'Kg',
  //     measuresPerSubUnit: 1,
  //   },
  //   create: {
  //     name: 'Espresso Blend Whole bean',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/image+28.png',
  //     description:
  //       'Our signature brew. It’s easy to understand why this coffee is our best-seller. Two coffee regions roasted to perfection.',
  //     producerId: producerRecord.id,
  //     categoryId: productCategoryA.id,
  //     price: 20,
  //     wholesalePrice: 18.45,
  //     orderUnit: 'Bag',
  //     subUnit: 'Bag',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'Kg',
  //     measuresPerSubUnit: 1,
  //     approvalStatus: 'APPROVED',
  //   },
  // });

  // // add product B
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Espresso Blend Ground',
  //       producerId: producerRecord.id,
  //     },
  //   },
  //   update: {
  //     price: 20,
  //     orderUnit: 'Bag',
  //     subUnit: 'Bag',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'Kg',
  //     measuresPerSubUnit: 1,
  //   },
  //   create: {
  //     name: 'Espresso Blend Ground',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/image+28.png',
  //     description:
  //       'Our signature brew. It’s easy to understand why this coffee is our best-seller. Two coffee regions roasted to perfection.',
  //     producerId: producerRecord.id,
  //     categoryId: productCategoryA.id,
  //     price: 20,
  //     orderUnit: 'Bag',
  //     subUnit: 'Bag',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'Kg',
  //     measuresPerSubUnit: 1,
  //     wholesalePrice: 18.45,
  //     approvalStatus: 'APPROVED',
  //   },
  // });

  // // producer B
  // // save user record
  // const userRecordB = await prisma.user.upsert({
  //   where: { email: 'claire@cacklebean.com' },
  //   update: {},
  //   create: {
  //     email: 'claire@cacklebean.com',
  //     phone: '+234...',
  //     password: 'rabble-info@claire@cacklebean.com',
  //     role: 'PRODUCER',
  //   },
  // });

  // // save producer record
  // const producerRecordB = await prisma.producer.upsert({
  //   where: { userId: userRecordB.id },
  //   update: {},
  //   create: {
  //     isVerified: true,
  //     userId: userRecordB.id,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/138218168_184886313383283_3442809325911798953_n+2+(1).jpg',
  //     businessName: 'Cacklebean Farm',
  //     businessAddress:
  //       'Cackleberry Farm, Burford Road, Stow-on-the-Wold, Cheltenham, Gloucestershire GL54 1JY',
  //     accountsEmail: 'claire@cacklebean.com',
  //     salesEmail: 'orders@cacklebean.com',
  //     minimumTreshold: 40,
  //     website: 'https://www.cacklebean.com/',
  //     description:
  //       'Cackleberry Farm is nestled at the foot of a hill just outside Stow-on-the-Wold. Run by Paddy and Steph Bourns, their rare breed flocks are entirely free range and live in traditional chicken houses on 12 acres of land, with lots of perches.',
  //   },
  // });

  // // get producer category id
  // const producerCategoryOptionB = await prisma.producerCategoryOption.findFirst(
  //   {
  //     where: {
  //       name: 'Farm and Dairy',
  //     },
  //     select: {
  //       id: true,
  //     },
  //   },
  // );

  // // add category id to the producer
  // await prisma.producerCategory.upsert({
  //   where: {
  //     producer_unique_category_option: {
  //       producerId: producerRecordB.id,
  //       producerCategoryOptionId: producerCategoryOptionB.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     producerId: producerRecordB.id,
  //     producerCategoryOptionId: producerCategoryOptionB.id,
  //   },
  // });

  // // get producer product id
  // const productCategoryAA = await prisma.productCategory.findFirst({
  //   where: {
  //     name: 'Eggs',
  //   },
  //   select: {
  //     id: true,
  //   },
  // });

  // // add product AA
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Cacklebean Eggs',
  //       producerId: producerRecordB.id,
  //     },
  //   },
  //   update: {
  //     price: 2,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Carton',
  //     quantityOfSubUnitPerOrder: 20,
  //     unitsOfMeasurePerSubUnit: 'Egg',
  //     measuresPerSubUnit: 6,
  //   },
  //   create: {
  //     name: 'Cacklebean Eggs',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/image+29.png',
  //     description:
  //       'One carton of 6 farm fresh Cacklebean eggs. This product is shipped as a 20 carton box and all cartons must be sold to your team before it is processed.',
  //     producerId: producerRecordB.id,
  //     categoryId: productCategoryAA.id,
  //     price: 2,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Carton',
  //     quantityOfSubUnitPerOrder: 20,
  //     unitsOfMeasurePerSubUnit: 'Egg',
  //     measuresPerSubUnit: 6,
  //     wholesalePrice: 1.7,
  //     approvalStatus: 'APPROVED',
  //   },
  // });

  // // producer C
  // // save user record
  // const userRecordC = await prisma.user.upsert({
  //   where: { email: 'www.fossemeadows.co.uk' },
  //   update: {},
  //   create: {
  //     email: 'www.fossemeadows.co.uk',
  //     phone: '01858 88 1000',
  //     password: 'rabble-www.fossemeadows.co.uk',
  //     role: 'PRODUCER',
  //   },
  // });

  // // save producer record
  // const producerRecordC = await prisma.producer.upsert({
  //   where: { userId: userRecordC.id },
  //   update: {},
  //   create: {
  //     isVerified: true,
  //     userId: userRecordC.id,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/Fosse+-+Producer.jpg',
  //     businessName: 'Fosse Meadows',
  //     businessAddress:
  //       'Stud Farm  Station Road  North KilworthLeicestershire LE17 6JD',
  //     accountsEmail: 'www.fossemeadows.co.uk',
  //     salesEmail: 'orders@fossemeadows.co.uk',
  //     minimumTreshold: 180,
  //     website: 'https://fossemeadows.com',
  //     description:
  //       'At Fosse Meadows we pride ourselves on the welfare we deliver for our birds. We grow our birds slowly and traditionally. The Fosse bird is totally free ranging and grown naturally in small flocks to a minimum of 81 days. That’s three times longer than standard commercially-reared supermarket chicken, and two weeks longer than organic birds. Like the much-admired French chicken, we use three strains of French breeds and grow them to full maturity. This means our birds have longer legs, allowing them to roam and forage on rich, wildflower pasture. They are fed a cereal-based diet that is locally sourced where possible, with no antibiotics, additives or hormones. Fosse chicken simply has richer and more succulent meat, with stronger, nutritionally-rich bones too. Just how chicken should, and used to, taste.',
  //   },
  // });

  // // get producer category id
  // const producerCategoryOptionC = await prisma.producerCategoryOption.findFirst(
  //   {
  //     where: {
  //       name: 'Meat',
  //     },
  //     select: {
  //       id: true,
  //     },
  //   },
  // );

  // // add category id to the producer
  // await prisma.producerCategory.upsert({
  //   where: {
  //     producer_unique_category_option: {
  //       producerId: producerRecordC.id,
  //       producerCategoryOptionId: producerCategoryOptionC.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     producerId: producerRecordC.id,
  //     producerCategoryOptionId: producerCategoryOptionC.id,
  //   },
  // });

  // // get producer product id
  // const productCategoryCC = await prisma.productCategory.findFirst({
  //   where: {
  //     name: 'Meat & Poultry',
  //   },
  //   select: {
  //     id: true,
  //   },
  // });

  // // add product 1
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Whole Chicken + 3KG Breast',
  //       producerId: producerRecordC.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Whole Chicken + 3KG Breast',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Fosse+-+Product.jpg',
  //     description:
  //       '1 x Fosse 81 Day Total Freedom Free Range Chicken along with a 3KG vacuum pack of skin on breast',
  //     producerId: producerRecordC.id,
  //     categoryId: productCategoryCC.id,
  //     type: 'SINGLE',
  //     orderUnit: 'Box',
  //     subUnit: 'Box',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'Bundle',
  //     measuresPerSubUnit: 1,
  //     price: 54.78,
  //     wholesalePrice: 49.8,
  //     approvalStatus: 'APPROVED',
  //   },
  // });

  // // add product 2
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: '2 Whole Chickens + 3KG Breast',
  //       producerId: producerRecordC.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: '2 Whole Chickens + 3KG Breast',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Fosse+-+Product.jpg',
  //     description:
  //       '2 x Fosse 81 Day Total Freedom Free Range Chicken along with a 3KG vacuum pack of skin on breast',
  //     producerId: producerRecordC.id,
  //     categoryId: productCategoryCC.id,
  //     type: 'SINGLE',
  //     orderUnit: 'Box',
  //     subUnit: 'Box',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'Bundle',
  //     measuresPerSubUnit: 1,
  //     price: 68.51,
  //     wholesalePrice: 49.8,
  //     approvalStatus: 'APPROVED',
  //   },
  // });

  // // add product 3
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Whole Chicken + 3KG Thigh',
  //       producerId: producerRecordC.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Whole Chicken + 3KG Thigh',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Fosse+-+Product.jpg',
  //     description:
  //       '1 x Fosse 81 Day Total Freedom Free Range Chicken along with a 3KG vacuum pack of thigh',
  //     producerId: producerRecordC.id,
  //     categoryId: productCategoryCC.id,
  //     type: 'SINGLE',
  //     orderUnit: 'Box',
  //     subUnit: 'Box',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'Bundle',
  //     measuresPerSubUnit: 1,
  //     price: 49.1,
  //     wholesalePrice: 44.64,
  //     approvalStatus: 'APPROVED',
  //   },
  // });

  // // add product 4
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: '2 Whole Chickens + 3KG Thigh',
  //       producerId: producerRecordC.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: '2 Whole Chickens + 3KG Thigh',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Fosse+-+Product.jpg',
  //     description:
  //       '2 x Fosse 81 Day Total Freedom Free Range Chicken along with a 3KG vacuum pack of thigh',
  //     producerId: producerRecordC.id,
  //     categoryId: productCategoryCC.id,
  //     type: 'SINGLE',
  //     orderUnit: 'Box',
  //     subUnit: 'Box',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'Bundle',
  //     measuresPerSubUnit: 1,
  //     price: 62.83,
  //     wholesalePrice: 57.12,
  //     approvalStatus: 'APPROVED',
  //   },
  // });

  // // wine producer
  // // save user record
  // const userRecordD = await prisma.user.upsert({
  //   where: { email: 'sales@lescaves.co.uk' },
  //   update: {},
  //   create: {
  //     email: 'sales@lescaves.co.uk',
  //     phone: '01483 538820',
  //     password: 'rabble-sales@lescaves.co.uk',
  //     role: 'PRODUCER',
  //     postalCode: 'GU3 1LP',
  //   },
  // });

  // // save producer record
  // const producerRecordD = await prisma.producer.upsert({
  //   where: { userId: userRecordD.id },
  //   update: {},
  //   create: {
  //     isVerified: true,
  //     userId: userRecordD.id,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/Producer+-+Les+Caves.jpg',
  //     businessName: 'Les Caves De Pyrene',
  //     businessAddress: 'Pew Corner, Old Portsmouth Rd, Guildford',
  //     accountsEmail: 'sales@lescaves.co.uk',
  //     salesEmail: 'sales@lescaves.co.uk',
  //     minimumTreshold: 320,
  //     website: 'https://www.lescaves.co.uk/',
  //     description: `Les Caves de Pyrene is an importer, agent, distributor and retailer of wines from around the world. They believe in promoting ‘natural’ wines: those that are expressive of their homeland; wines made by hand with minimal chemical intervention; and where the winemaking shows maximum respect for the environment.`,
  //   },
  // });

  // // get producer category id
  // const producerCategoryOptionD = await prisma.producerCategoryOption.findFirst(
  //   {
  //     where: {
  //       name: 'Wine',
  //     },
  //     select: {
  //       id: true,
  //     },
  //   },
  // );

  // // add category id to the producer
  // await prisma.producerCategory.upsert({
  //   where: {
  //     producer_unique_category_option: {
  //       producerId: producerRecordD.id,
  //       producerCategoryOptionId: producerCategoryOptionD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     producerId: producerRecordD.id,
  //     producerCategoryOptionId: producerCategoryOptionD.id,
  //   },
  // });

  // // get producer products(Red, Orange, White, Pet Nat) id
  // const productCategoryRed = await prisma.productCategory.findFirst({
  //   where: {
  //     name: 'Red',
  //   },
  //   select: {
  //     id: true,
  //   },
  // });

  // const productCategoryOrange = await prisma.productCategory.findFirst({
  //   where: {
  //     name: 'Orange',
  //   },
  //   select: {
  //     id: true,
  //   },
  // });

  // const productCategoryWhite = await prisma.productCategory.findFirst({
  //   where: {
  //     name: 'White',
  //   },
  //   select: {
  //     id: true,
  //   },
  // });

  // const productCategoryPet = await prisma.productCategory.findFirst({
  //   where: {
  //     name: 'Pet Nat',
  //   },
  //   select: {
  //     id: true,
  //   },
  // });

  // // add product 2
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Beck Ink, 2021',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Beck Ink, 2021',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Weingut+Judith+Beck+Beck+Ink%2C+2021Weingut+Judith+Beck+Beck+Ink%2C+2021-Photoroom.jpg',
  //     description: 'Weingut Judith Beck',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryRed.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 13.54,
  //     wholesalePrice: 12.31,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '17.00',
  //   },
  // });

  // // add product 3
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Birch Barbera, 2022',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Birch Barbera, 2022',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Birch+Barbera%2C+2022-Photoroom.jpg',
  //     description: 'Agricola Gaia Di Chiari Azzetti Gaia',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryRed.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 12.18,
  //     wholesalePrice: 11.07,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '15.00',
  //   },
  // });

  // // add product 4
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Rainbow Juice, 2022',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Rainbow Juice, 2022',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Gentle+Folk+Rainbow+Juice%2C+2022-Photoroom.jpg',
  //     description: 'Gentle Folk',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryRed.id,
  //     type: 'SINGLE',
  //     orderUnit: 'Bottle',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 20.2,
  //     wholesalePrice: 18.36,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '26.00',
  //   },
  // });

  // // add product 6
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Baglio Antico Bianco, 2022',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Baglio Antico Bianco, 2022',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Ciello+Baglio+Antico+Bianco%2C+2022-Photoroom.jpg',
  //     description: 'Ciello',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryOrange.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 14.08,
  //     wholesalePrice: 12.8,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '18.00',
  //   },
  // });

  // // add product 7
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Saliciorino Malvasia, 2022',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Saliciorino Malvasia, 2022',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Finca+Casa+Balaguer+Saliciorino+Malvasia%2C+2022-Photoroom.jpg',
  //     description: 'Finca Casa Balaguer',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryOrange.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 16.99,
  //     wholesalePrice: 15.44,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '22.00',
  //   },
  // });

  // // add product 8
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Tragolargo Blanco, 2023',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Tragolargo Blanco, 2023',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Finca+Casa+Balaguer+Tragolargo+Blanco%2C+2023-Photoroom.jpg',
  //     description: 'Finca Casa Balaguer',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryOrange.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 16.16,
  //     wholesalePrice: 14.69,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '19.00',
  //   },
  // });

  // // add product 9
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Calcarius Nu Litre Orange, NV',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Calcarius Nu Litre Orange, NV',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Azienda+Agricola+Passalacqua+Valentina+Calcarius+Nu+Litre+Orange%2C+NV-Photoroom.jpg',
  //     description: 'Azienda Agricola Passalacqua Valentina',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryOrange.id,
  //     type: 'SINGLE',
  //     orderUnit: 'Bottle',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 1000,
  //     price: 19.31,
  //     wholesalePrice: 17.55,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '25.00',
  //   },
  // });

  // // add product 10
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Schele Amber, 2022',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Schele Amber, 2022',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Ma+Arndorfer%2C+Martin+%26+Anna+Arndorfer+Schele+Amber%2C+2022-Photoroom.jpg',
  //     description: 'Ma Arndorfer, Martin & Anna Arndorfer',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryOrange.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 15.38,
  //     wholesalePrice: 13.99,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '19.50',
  //   },
  // });

  // // add product 11
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Runer Veltliner Handcrafted, 2023',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Runer Veltliner Handcrafted, 2023',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Ma+Arndorfer%2C+Martin+%26+Anna+Arndorfer+Runer+Veltliner+Handcrafted%2C+2023-Photoroom.jpg',
  //     description: 'Ma Arndorfer, Martin & Anna Arndorfer',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryWhite.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 14.37,
  //     wholesalePrice: 13.07,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '17.50',
  //   },
  // });

  // // add product 12
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Chianti Podere Gamba, 2021',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Chianti Podere Gamba, 2021',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/San+Ferdinando%2C+Val+Di+Chiana+Chianti+Podere+Gamba%2C+2021-Photoroom.jpg',
  //     description: 'San Ferdinando, Val Di Chiana',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryRed.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 13.66,
  //     wholesalePrice: 12.42,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '18.00',
  //   },
  // });

  // // add product 13
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Le Roc Ambulle, 2022 (single)',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Le Roc Ambulle, 2022 (single)',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Chateau+Le+Roc%2C+Famille+Ribes+Le+Roc+Ambulle%2C+2022+1L-Photoroom.jpg',
  //     description: 'Chateau Le Roc, Famille Ribes',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryPet.id,
  //     type: 'SINGLE',
  //     orderUnit: 'Bottle',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 1500,
  //     price: 27.5,
  //     wholesalePrice: 25.0,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '33.00',
  //   },
  // });

  // // add product 14
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Le Roc Ambulle, 2022 (shared)',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Le Roc Ambulle, 2022 (shared)',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Chateau+Le+Roc%2C+Famille+Ribes+Le+Roc+Ambulle%2C+2022-Photoroom.jpg',
  //     description: 'Chateau Le Roc, Famille Ribes',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryPet.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 13.37,
  //     wholesalePrice: 12.15,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '16.50',
  //   },
  // });

  // // add product 15
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: 'Cora Bianco, 2022',
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: 'Cora Bianco, 2022',
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Loxarel%2C+Mitjans+Cora+Bianco%2C+2022-Photoroom.jpg',
  //     description: 'Loxarel, Mitjans',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryWhite.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 13.19,
  //     wholesalePrice: 11.99,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '16.50',
  //   },
  // });

  // // add product 16
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Lo Petit Fantet D'Hippolyte Blanc, 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Lo Petit Fantet D'Hippolyte Blanc, 2022`,
  //     imageUrl: `https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Chateaux+Ollieux+Romanis%2C+Domaine+Pierre+Bories+Lo+Petit+Fantet+D'Hippolyte+Blanc%2C+2022-Photoroom.jpg`,
  //     description: 'Chateaux Ollieux Romanis, Domaine Pierre Bories',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryWhite.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 12.18,
  //     wholesalePrice: 11.07,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '15.00',
  //   },
  // });

  // // add product 17
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Lo Petit Fantet D'Hippolyte Rouge, 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Lo Petit Fantet D'Hippolyte Rouge, 2022`,
  //     imageUrl: `https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Chateaux+Ollieux+Romanis%2C+Domaine+Pierre+Bories+Lo+Petit+Fantet+D'Hippolyte+Rouge%2C+2022-Photoroom.jpg`,
  //     description: 'Chateaux Ollieux Romanis, Domaine Pierre Bories',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryRed.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 12.0,
  //     wholesalePrice: 10.91,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '15.00',
  //   },
  // });

  // // add product 18
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Trebbiano D'Abruzzo Frentang, 2023`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Trebbiano D'Abruzzo Frentang, 2023`,
  //     imageUrl: `https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Cantina+Sociale+Frentana+Trebbiano+D'Abruzzo+Frentang%2C+2023-Photoroom.jpg`,
  //     description: 'Cantina Sociale Frentana',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryWhite.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 8.61,
  //     wholesalePrice: 7.83,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '11.55',
  //   },
  // });

  // // add product 19
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Gran Cerdo Blanco, 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Gran Cerdo Blanco, 2022`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Gran+Cerdo+Gran+Cerdo+Blanco%2C+2022-Photoroom.jpg',
  //     description: 'Gran Cerdo',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryWhite.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 9.92,
  //     wholesalePrice: 9.02,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '12.50',
  //   },
  // });

  // // add product 20
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Trebbiano Secco, 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Trebbiano Secco, 2022`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Camillo+Donati+Trebbiano+Secco%2C+2022-Photoroom.jpg',
  //     description: 'Camillo Donati',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryPet.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 16.81,
  //     wholesalePrice: 15.28,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '21.00',
  //   },
  // });

  // // add product 21
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Lambrusco Rosso, 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Lambrusco Rosso, 2022`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Camillo+Donati+Lambrusco+Rosso%2C+2022-Photoroom.jpg',
  //     description: 'Camillo Donati',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryPet.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 16.81,
  //     wholesalePrice: 15.28,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '22.00',
  //   },
  // });

  // // add product 22
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Malvasia Secco, 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Malvasia Secco, 2022`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Camillo+Donati+Malvasia+Secco%2C+2022-Photoroom.jpg',
  //     description: 'Camillo Donati',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryPet.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 16.81,
  //     wholesalePrice: 15.28,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '22.00',
  //   },
  // });

  // // add product 23
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `IGT Marche Bianco "Di Gino", 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `IGT Marche Bianco "Di Gino", 2022`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Fattoria+San+Lorenzo+IGT+Marche+Bianco+%22Di+Gino%22%2C+2022-Photoroom.jpg',
  //     description: 'Fattoria San Lorenzo',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryWhite.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 13.07,
  //     wholesalePrice: 11.88,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '16.25',
  //   },
  // });

  // // add product 24
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Saint Cyrgues VDF "Salamandre", 2023`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Saint Cyrgues VDF "Salamandre", 2023`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Chateaux+Saint+Cyrgues+Saint+Cyrgues+VDF+%22Salamandre%22%2C+2023-Photoroom.jpg',
  //     description: 'Chateaux Saint Cyrgues',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryOrange.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 12.3,
  //     wholesalePrice: 11.18,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '16.00',
  //   },
  // });

  // // add product 25
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Rosso Piceno "Bacchus", 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Rosso Piceno "Bacchus", 2022`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Ciu+Ciu+Rosso+Piceno+%22Bacchus%22%2C+2022-Photoroom.jpg',
  //     description: 'Ciu Ciu',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryRed.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 10.63,
  //     wholesalePrice: 9.67,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '13.50',
  //   },
  // });

  // // add product 26
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Calcarius Frecciabomb Pet Nat Rosato, NV`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Calcarius Frecciabomb Pet Nat Rosato, NV`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Azienda+Agricola+Passalacqua+Valentina+Calcarius+Frecciabomb+Pet+Nat+Rosato%2C+NV-Photoroom.jpg',
  //     description: 'Azienda Agricola Passalacqua Valentina',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryPet.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 16.57,
  //     wholesalePrice: 15.07,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '21.00',
  //   },
  // });

  // // add product 27
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Pet Nat Rose, 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Pet Nat Rose, 2022`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Fuchs+Und+Hase+Pet+Nat+Rose%2C+2022-Photoroom.jpg',
  //     description: 'Fuchs Und Hase',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryPet.id,
  //     type: 'SINGLE',
  //     orderUnit: 'Bottle',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 21.56,
  //     wholesalePrice: 19.6,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '26.00',
  //   },
  // });

  // // add product 28
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Moussamoussettes, 2021`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Moussamoussettes, 2021`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Domaine+Rene+Mosse+Moussamoussettes%2C+2021-Photoroom.jpg',
  //     description: 'Domaine Rene Mosse',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryPet.id,
  //     type: 'SINGLE',
  //     orderUnit: 'Bottle',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 20.2,
  //     wholesalePrice: 18.36,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '27.00',
  //   },
  // });

  // // add product 29
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Salicornio Moscatel, 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Salicornio Moscatel, 2022`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Finca+Casa+Balaguer+Salicornio+Moscatel%2C+2022-Photoroom.jpg',
  //     description: 'Finca Casa Balaguer',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryOrange.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 16.99,
  //     wholesalePrice: 15.44,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '21.00',
  //   },
  // });

  // // add product 30
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Calcarius Nu Litre Bianco, NV`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Calcarius Nu Litre Bianco, NV`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Azienda+Agricola+Passalacqua+Valentina+Calcarius+Nu+Litre+Bianco%2C+NV-Photoroom.jpg',
  //     description: 'Azienda Agricola Passalacqua Valentina',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryWhite.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 1000,
  //     price: 19.01,
  //     wholesalePrice: 17.28,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '24.40',
  //   },
  // });

  // // add product 31
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Orange Wine, NV`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Orange Wine, NV`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Ancre+Hill+Estates+Orange+Wine%2C+NV-Photoroom.jpg',
  //     description: 'Ancre Hill Estates',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryOrange.id,
  //     type: 'SINGLE',
  //     orderUnit: 'Bottle',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 21.86,
  //     wholesalePrice: 19.87,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '28.00',
  //   },
  // });

  // // add product 32
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Vincenzo Bianco, 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Vincenzo Bianco, 2022`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Fattoria+Di+Vaira+Vincenzo+Bianco%2C+2022-Photoroom.jpg',
  //     description: 'Fattoria Di Vaira',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryOrange.id,
  //     type: 'PORTIONED_SINGLE_PRODUCT',
  //     orderUnit: 'Box',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 6,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 12.47,
  //     wholesalePrice: 11.34,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '16.00',
  //   },
  // });

  // // add product 33
  // await prisma.product.upsert({
  //   where: {
  //     name_unique_producer: {
  //       name: `Crazy Crazy Pet Nat, 2022`,
  //       producerId: producerRecordD.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     name: `Crazy Crazy Pet Nat, 2022`,
  //     imageUrl:
  //       'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/lescaves/Marto+Wines+Crazy+Crazy+Pet+Nat%2C+2022-Photoroom.jpg',
  //     description: 'Marto Wines',
  //     producerId: producerRecordD.id,
  //     categoryId: productCategoryPet.id,
  //     type: 'SINGLE',
  //     orderUnit: 'Bottle',
  //     subUnit: 'Bottle',
  //     quantityOfSubUnitPerOrder: 1,
  //     unitsOfMeasurePerSubUnit: 'ML',
  //     measuresPerSubUnit: 750,
  //     price: 19.54,
  //     wholesalePrice: 17.77,
  //     approvalStatus: 'APPROVED',
  //     vat: '20',
  //     rrp: '27.00',
  //   },
  // });

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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+2.png',
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
        'https://rabble-dev1.s3.us-east-2.amazonaws.com/products/Product+3.png',
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
