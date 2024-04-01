import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../src/auth/auth.service';

describe('StoreController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  const phone = faker.phone.number();
  let user: User;
  let userId: string;
  const testTime = 120000;
  let jwtToken: string;
  let storeId: string;

  const store = {
    name: faker.internet.userName(),
    postalCode: faker.lorem.paragraph(),
    city: 'London',
    streetAddress: '32 Brooke Street',
    direction: 'Take cab from nelson to brooke street',
    storeType: 'Random',
    shelfSpace: 'Dummy',
    dryStorageSpace: 'Dummy',
  };

  const openHours = {
    storeId: '',
    type: 'MON_TO_FRI',
    customOpenHours: [
      {
        day: 'MONDAY',
        startTime: '08:00am',
        endTime: '10:00pm',
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
    user = await prisma.user.create({
      data: {
        phone,
      },
    });
    userId = user.id;

    // create dummy token
    jwtToken = authService.generateToken({ userId });
  }, testTime);

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    await app.close();
  });

  describe('StoreController (e2e)', () => {
    // partner store creation
    it(
      '/store/create(POST) should not create a new store if incomplete data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/store/create')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            direction: 'From district 1 enter ride to Washinton',
            storeType: '4Square',
          })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );
    it(
      '/store/create(POST) should create a new store if all required data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/store/create')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send(store)
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        storeId = response.body.data.id;
      },
      testTime,
    );
    it(
      '/store/create(POST) should not create a new store if the suplied name already exist',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/store/create')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send(store)
          .expect(409);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // store open hours
    it(
      '/store/open-hours(PATCH) should not add store open hours if incomplete data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .patch('/store/open-hours')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            customOpenHours: [],
          })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );
    it(
      '/store/open-hours(PATCH) should add store open hours if all required data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .patch('/store/open-hours')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ ...openHours, storeId })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
  });
});
