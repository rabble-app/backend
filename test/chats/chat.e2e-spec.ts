import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { BuyingTeam, Producer, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('ChatsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const phone = faker.phone.number();
  let user: User;
  let producer: Producer;
  let team: BuyingTeam;
  let userId: string;
  let producerId: string;
  let teamId: string;
  const testTime = 120000;

  const chat = {
    teamId: faker.internet.userName(),
    userId: faker.lorem.paragraph(),
    text: 200,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
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

    // create dummy producer for test
    producer = await prisma.producer.create({
      data: {
        userId: user.id,
        businessAddress: faker.address.city(),
        businessName: faker.internet.userName(),
      },
    });
    producerId = producer.id;

    // create dummy team for test
    team = await prisma.buyingTeam.create({
      data: {
        producerId,
        hostId: user.id,
        name: faker.internet.userName(),
        frequency: 2342343,
        postalCode: 'erwerr',
      },
    });
    teamId = team.id;
  }, testTime);

  afterAll(async () => {
    await app.close();
  });

  describe('ChatsController (e2e)', () => {
    // create chat
    it(
      '/chats(POST) should record chat',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/chats')
          .send({ ...chat, teamId, userId })
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
    // retrieve chat
    it(
      '/chats(GET) should not create product if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .get('chats')
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // retrieve user's buying teams chat intro
    it(
      '/chats/teams(GET) should return user buying teams chat intro',
      async () => {
        const response = await request(app.getHttpServer())
          .get('chats/teams')
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
  });
});
