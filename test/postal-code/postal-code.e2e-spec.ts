import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../src/auth/auth.service';

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

  const deliveryAreasInfo = {
    days: [{ name: 'TUESDAY', cutOffTime: '11:00', cutOffDay: 'SUNDAY' }],
    regions: [
      {
        regionId: testAreaId,
        minOrder: '23.00',
        areas: [{ areaId: testAreaId }],
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
        phone,
      },
    });
    userId = user.id;

    // create dummy producer for test
    const producer = await prisma.producer.create({
      data: {
        userId,
        businessName:
          faker.internet.userName() + Math.floor(Math.random() * 30),
      },
    });

    // create dummy region for test
    const { id: regionId } = await prisma.postalCodeRegion.create({
      data: {
        id: faker.internet.port().toString(),
        name: faker.internet.domainName(),
      },
    });
    testRegionId = regionId;

    // create dummy area for test
    const { id: areaId } = await prisma.postalCodeArea.create({
      data: {
        name: faker.internet.domainName(),
        code: faker.internet.domainName(),
        regionId: regionId,
      },
    });
    testAreaId = areaId;

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
    // await app.close();
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

    // add delivery area
    it(
      '/postal-code/producer/delivery-area(POST) should add delivery day and areas',
      async () => {
        deliveryAreasInfo.regions[0].regionId = testRegionId;
        deliveryAreasInfo.regions[0].areas[0].areaId = testAreaId;
        const response = await request(app.getHttpServer())
          .post('/postal-code/producer/delivery-area')
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
          .post('/postal-code/producer/delivery-area')
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
      },
      testTime,
    );
  });
});
