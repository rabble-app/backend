import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/auth/auth.service';
import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('PostalCodeController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let userId: string;
  let jwtToken: string;
  const testTime = 120000;
  const phone = faker.phone.number();
  let testAreaId: string;
  let testRegionId: string;
  let producerRecordRegionId: string;
  let producerRecordAreaId: string;
  let testAreaId2: string;
  let testRegionId2: string;
  let deliveryDayId: string;
  let producerId: string;

  const deliveryAreasInfo = {
    days: [{ name: 'TUESDAY', cutOffTime: '11:00', cutOffDay: 'SUNDAY' }],
    regions: [
      {
        regionId: testRegionId,
        minOrder: '23.00',
        areas: [{ areaId: testAreaId }],
      },
    ],
  };

  const newDeliveryRegionInfo = {
    deliveryDayId: '',
    regions: [
      {
        regionId: testRegionId2,
        minOrder: '23.00',
        areas: [{ areaId: testAreaId2 }],
      },
    ],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    await app.listen(process.env.PORT);

    // create dummy user for test
    const user = await prisma.user.create({
      data: {
        phone: `${phone}123`,
      },
    });
    userId = user.id;

    // create dummy producer for test
    const producer = await prisma.producer.create({
      data: {
        userId,
        businessName:
          faker.internet.userName() +'Postal code producer',
      },
    });
    producerId = producer.id;

    // create dummy region for test
    const { id: regionId } = await prisma.postalCodeRegion.create({
      data: {
        id: faker.internet.port().toString() + Math.floor(Math.random() * 32),
        name: faker.internet.domainName() + Math.floor(Math.random() * 10),
      },
    });
    testRegionId = regionId;

    // create dummy area for test
    const { id: areaId } = await prisma.postalCodeArea.create({
      data: {
        name: faker.internet.domainName() + Math.floor(Math.random() * 20),
        code: faker.internet.domainName() + Math.floor(Math.random() * 10),
        regionId: regionId,
      },
    });
    testAreaId = areaId;

    // create dummy region 2 for test
    const { id: regionId2 } = await prisma.postalCodeRegion.create({
      data: {
        id: `${faker.internet.port().toString()}2572`,
        name: `${faker.internet.domainName()}secondFifty`,
      },
    });
    testRegionId2 = regionId2;

    // create dummy area 2 for test
    const { id: areaId2 } = await prisma.postalCodeArea.create({
      data: {
        name: `${faker.internet.domainName()}name123`,
        code: `${faker.internet.domainName()}code456`,
        regionId: regionId2,
      },
    });
    testAreaId2 = areaId2;

    // create dummy token
    jwtToken = authService.generateToken({ userId, producerId: producer.id });
  }, testTime);

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    await prisma.postalCodeRegion.delete({
      where: {
        id: testRegionId,
      },
    });

    await prisma.postalCodeRegion.delete({
      where: {
        id: testRegionId2,
      },
    });
    await app.close();
  });

  describe('PostalCodeController (e2e)', () => {
    // search for postal code areas/regions
    it(
      '/postal-code/search/:keyword(GET) should return postal code region/areas',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/postal-code/search/mykeyword`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // add delivery days with region/areas
    it(
      '/postal-code/producer/delivery-days(POST) should add delivery day and areas',
      async () => {
        deliveryAreasInfo.regions[0].regionId = testRegionId;
        deliveryAreasInfo.regions[0].areas[0].areaId = testAreaId;
        const response = await request(app.getHttpServer())
          .post('/postal-code/producer/delivery-days')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            ...deliveryAreasInfo,
          })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('boolean');
      },
      testTime,
    );

    it(
      '/postal-code/producer/delivery-area(POST) should not add delivery day if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/postal-code/producer/delivery-days')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ days: [], regions: [] })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // return producer delivery areas
    it(
      '/postal-code/producer/delivery-days should return producer postal code region/areas',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/postal-code/producer/delivery-days`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        producerRecordRegionId = response.body.data[0].regions[0].id;
        producerRecordAreaId =
          response.body.data[0].regions[0].producerAreas[0].id;
        deliveryDayId = response.body.data[0].id;
      },
      testTime,
    );

    // return producer delivery days for a particular postal code
    it(
      '/postal-code/producer/days-of-delivery/:producerId/:postalCode should return producer delivery days for a postal code',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/postal-code/producer/days-of-delivery/${producerId}/SE154NX`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // add delivery region/areas to existing producer delivery day
    it(
      '/postal-code/producer/delivery-area(PUT) should add delivery region/areas to existing delivery day',
      async () => {
        newDeliveryRegionInfo.deliveryDayId = deliveryDayId;
        newDeliveryRegionInfo.regions[0].regionId = testRegionId2;
        newDeliveryRegionInfo.regions[0].areas[0].areaId = testAreaId2;
        const response = await request(app.getHttpServer())
          .put('/postal-code/producer/delivery-area')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            ...newDeliveryRegionInfo,
          })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('boolean');
      },
      testTime,
    );

    // update delivery day cut-off time and day
    it(
      '/postal-code/producer/delivery-day-info(patch) should update delivery day cut-off time and day',
      async () => {
        const response = await request(app.getHttpServer())
          .patch(`/postal-code/producer/delivery-day-info/${deliveryDayId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            cutOffTime: '11:00',
            cutOffDay: 'SUNDAY',
          })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // delete producer delivery area
    it(
      '/postal-code/producer/delivery-area(DELETE) should delete producer delivery areas',
      async () => {
        const response = await request(app.getHttpServer())
          .delete(`/postal-code/producer/delivery-area/${producerRecordAreaId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // delete producer delivery region
    it(
      '/postal-code/producer/delivery-region(DELETE) should delete producer delivery region/areas',
      async () => {
        const response = await request(app.getHttpServer())
          .delete(
            `/postal-code/producer/delivery-region/${producerRecordRegionId}`,
          )
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
  });
});
